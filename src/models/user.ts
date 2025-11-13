import { DefaultArgs } from "@prisma/client/runtime/library.js";
import {
  UserCreateArgs,
  UserUpdateInput,
  UserWhereUniqueInput,
} from "../generated/prisma/models.js";
import { db } from "../utils/db.js";

type UserUpdateParams = UserWhereUniqueInput & UserUpdateInput;

export class User {
  static #db = db.user;

  // Not selecting the password bc we don't need it
  static async findById({ id }: UserWhereUniqueInput) {
    return this.#db.findUnique({
      select: { username: true, id: true },
      where: { id },
    });
  }

  static async findByUsername({ username }: UserWhereUniqueInput) {
    return this.#db.findUnique({ where: { username } });
  }

  static async create(props: UserCreateArgs<DefaultArgs>) {
    return this.#db.create(props);
  }

  static async deleteById({ id }: UserWhereUniqueInput) {
    return this.#db.delete({ where: { id } });
  }

  static async deleteByUsername({ username }: UserWhereUniqueInput) {
    return this.#db.delete({ where: { username } });
  }

  static async updateById({ id, ...data }: UserUpdateParams) {
    return this.#db.update({ where: { id }, data });
  }

  static async updateByUsername({ username, ...data }: UserUpdateParams) {
    return this.#db.update({ where: { username }, data });
  }
}
