export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  PIX = "PIX",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  CASH_ON_PICKUP = "CASH_ON_PICKUP",
}

export enum AnimalType {
  GATO = "GATO",
  CACHORRO = "CACHORRO",
  AMBOS = "AMBOS",
}

export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum TicketSubject {
  PEDIDO = "PEDIDO",
  PRODUTO = "PRODUTO",
  TROCA = "TROCA",
  OUTRO = "OUTRO",
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum MarketplacePlatform {
  MERCADO_LIVRE = "MERCADO_LIVRE",
  SHOPEE = "SHOPEE",
  AMAZON = "AMAZON",
}

export enum MarketplaceListingStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  ERROR = "ERROR",
  CLOSED = "CLOSED",
}
