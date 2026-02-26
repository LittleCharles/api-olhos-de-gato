import bcrypt from "bcryptjs";
import { IHashProvider } from "../../../application/interfaces/IHashProvider.js";

export class BcryptHashProvider implements IHashProvider {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  async compare(value: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(value, hashed);
  }
}
