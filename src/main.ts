import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import ffmpeg from "fluent-ffmpeg";
import type { StorageAdapter } from "./adapters/interface";
import type { QualityProfile } from "./types";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const defaultQualities: QualityProfile[] = [
  { suffix: "1080p", resolution: "1920x1080", bitrate: "5000000" },
  { suffix: "720p", resolution: "1280x720", bitrate: "2800000" },
  { suffix: "480p", resolution: "842x480", bitrate: "1400000" },
  { suffix: "360p", resolution: "640x360", bitrate: "800000" },
];

const generateHLSQualityProfiles = (quality: QualityProfile): string =>
  `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bitrate},RESOLUTION=${quality.resolution}\n${quality.suffix}.m3u8`;

const generateMasterPlaylist = (qualities: QualityProfile[]): string =>
  ["#EXTM3U", "#EXT-X-VERSION:3", ""]
    .concat(qualities.map(generateHLSQualityProfiles))
    .join("\n");

function generateMainThumb(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg(inputPath)
        .thumbnails({
          count: 1,
          folder: outputPath,
          filename: "thumbnail.png",
          timemarks: ["50%"],
        })
        .on("error", (err) => reject(err))
        .on("end", () => resolve());
    } catch (err) {
      reject(err);
    }
  });
}

export function getMetaData(inputPath: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg.ffprobe(inputPath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function createHLSPlaylist(
  inputPath: string,
  outputPath: string,
  quality: QualityProfile
): Promise<{ success: boolean; path: string; err?: Error }> {
  return new Promise((resolve) => {
    try {
      const f = ffmpeg(inputPath)
        .videoBitrate(quality.bitrate)
        .addOptions([
          "-profile:v baseline",
          "-level 3.0",
          "-start_number 0",
          "-hls_time 10",
          "-hls_list_size 0",
          "-f hls",
        ])
        .output(outputPath)
        .on("end", () => resolve({ success: true, path: outputPath }))
        .on("error", (err) =>
          resolve({ success: false, path: outputPath, err })
        );
      f.run();
    } catch (err) {
      if (err instanceof Error)
        resolve({ success: false, path: outputPath, err });
      else
        resolve({
          success: false,
          path: outputPath,
          err: new Error("unknown error"),
        });
    }
  });
}

export async function encodeVideo({
  input,
  output,
  qualities = defaultQualities,
  adapter,
}: {
  input: string;
  output: string;
  qualities?: QualityProfile[];
  adapter: StorageAdapter;
}) {
  try {
    await adapter.makeDir(output);
    await adapter.writeFile(
      adapter.resolve(output, "master.m3u8"),
      generateMasterPlaylist(qualities)
    );

    await generateMainThumb(input, output);

    const results = [];
    for (const quality of qualities) {
      const outputPath = adapter.resolve(output, quality.suffix + ".m3u8");
      await createHLSPlaylist(input, outputPath, quality).then((result) => {
        if (!result.success) throw result.err;
        results.push(result);
      });
    }
    return true;
  } catch (err) {
    throw err;
  }
}
