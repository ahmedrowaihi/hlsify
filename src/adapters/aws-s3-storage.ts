import { sep } from "path";
import type { StorageAdapter } from "./interface";

export class AWSS3Adapter implements StorageAdapter {
  sep = sep as string;
  constructor(separator?: string) {
    if (separator) this.sep = separator;
  }

  async copyFile(sourcePath: string, destinationPath: string) {
    throw new Error("Method not implemented.");
  }

  async readFile(filePath: string) {
    throw new Error("Method not implemented.");
    return Buffer.from("");
  }

  async rm(filePath: string) {
    throw new Error("Method not implemented.");
  }

  async makeDir(dirPath: string) {
    throw new Error("Method not implemented.");
  }

  async writeFile(filePath: string, data: string) {
    throw new Error("Method not implemented.");
  }

  resolve(...paths: string[]) {
    throw new Error("Method not implemented.");
    return "";
  }
}
