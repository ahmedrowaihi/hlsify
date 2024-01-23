import {
  copyFile as copyfile,
  mkdir,
  readFile as readfile,
  rm,
  writeFile as writefile,
} from "node:fs/promises";
import { sep } from "node:path";
import type { StorageAdapter } from "./interface";

export class LocalFSAdapter implements StorageAdapter {
  sep = sep as string;
  constructor(separator?: string) {
    if (separator) this.sep = separator;
  }

  async copyFile(sourcePath: string, destinationPath: string) {
    await copyfile(sourcePath, destinationPath);
  }

  async readFile(filePath: string) {
    return await readfile(filePath);
  }

  async rm(filePath: string) {
    await rm(filePath, { recursive: true, force: true });
  }

  async makeDir(dirPath: string) {
    await mkdir(dirPath, { recursive: true });
  }

  async writeFile(
    filePath: Parameters<typeof writefile>[0],
    data: Parameters<typeof writefile>[1]
  ) {
    await writefile(filePath, data);
  }

  resolve(...paths: string[]) {
    return paths.join(this.sep);
  }
}
