import { prisma } from "../prisma/client.js";
import {
  IOAuthStateRepository,
  OAuthStateData,
} from "../../../domain/repositories/IOAuthStateRepository.js";
import { MarketplacePlatform } from "../../../domain/enums/index.js";
import { Prisma } from "@prisma/client";

export class PrismaOAuthStateRepository implements IOAuthStateRepository {
  async create(data: OAuthStateData): Promise<void> {
    await prisma.oAuthState.create({
      data: {
        state: data.state,
        platform: data.platform,
        adminUserId: data.adminUserId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async consume(state: string): Promise<OAuthStateData | null> {
    try {
      // delete-on-unique é atômico → garante single-use mesmo com callbacks concorrentes
      const deleted = await prisma.oAuthState.delete({ where: { state } });
      return {
        state: deleted.state,
        platform: deleted.platform as MarketplacePlatform,
        adminUserId: deleted.adminUserId,
        expiresAt: deleted.expiresAt,
      };
    } catch (err) {
      // P2025 = registro não encontrado (state inválido ou já consumido)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return null;
      }
      throw err;
    }
  }
}
