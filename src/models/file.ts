import {
  FileWhereInput,
  FileWhereUniqueInput,
} from "../generated/prisma/models.js";
import { db } from "../utils/db.js";

interface FileCreateArgs {
  name: string;
  ownerId: number;
  parentId?: string;
}

export class File {
  static #db = db.file;

  // Getters
  static async getFileById({ id }: FileWhereUniqueInput) {
    return this.#db.findUnique({ where: { id } });
  }

  static async getChildrenByParentId({ parentId, ownerId }: FileWhereInput) {
    return this.#db.findMany({ where: { parentId, ownerId} });
  }

  static async getFileMimeType({ id }: FileWhereUniqueInput) {
    return this.#db.findUnique({ select: { type: true }, where: { id } });
  }

  // Folders
  static async createFolder({ name, parentId, ownerId }: FileCreateArgs) {
    return this.#db.create({ data: { name, type: "DIR", ownerId, parentId } });
  }

  static async updateFolderById({
    id,
    ownerId,
    newName,
  }: {
    id: string;
    ownerId: number;
    newName: string;
  }) {
    return this.#db.update({ where: { id, ownerId }, data: { name: newName } });
  }

  // Files
  static async createFile({ name, parentId, ownerId }: FileCreateArgs) {
    return this.#db.create({ data: { name, type: "FILE", ownerId, parentId } });
  }

  static async deleteFileById({
    id,
    ownerId,
  }: {
    id: string;
    ownerId: number;
  }) {
    return this.#db.delete({ where: { id, ownerId } });
  }
}
