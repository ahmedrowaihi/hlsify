import type { Buffer } from "node:buffer";
export interface StorageAdapter {
  sep: string;
  copyFile(sourcePath: string, destinationPath: string): Promise<void>;
  readFile(filePath: string): Promise<Buffer>;
  rm(filePath: string): Promise<void>;
  makeDir(dirPath: string): Promise<void>;
  writeFile(filePath: string, data: Buffer | string): Promise<void>;
  resolve(...paths: string[]): string;
}
