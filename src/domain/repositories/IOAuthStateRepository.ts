import { MarketplacePlatform } from "../enums/index.js";

export interface OAuthStateData {
  state: string;
  platform: MarketplacePlatform;
  adminUserId: string;
  expiresAt: Date;
}

export interface IOAuthStateRepository {
  /** Persiste um state recém-gerado (vinculado ao admin que iniciou o fluxo). */
  create(data: OAuthStateData): Promise<void>;
  /**
   * Consome o state de forma atômica (single-use): remove e devolve o registro,
   * ou null se não existir (já usado / inválido). O chamador valida a expiração.
   */
  consume(state: string): Promise<OAuthStateData | null>;
}
