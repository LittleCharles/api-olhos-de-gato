import "reflect-metadata";
import { container } from "tsyringe";

// Repositories
import { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/PrismaUserRepository.js";

import { IProductRepository } from "../../domain/repositories/IProductRepository.js";
import { PrismaProductRepository } from "../../infrastructure/database/repositories/PrismaProductRepository.js";

import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository.js";
import { PrismaCategoryRepository } from "../../infrastructure/database/repositories/PrismaCategoryRepository.js";

import { ISubcategoryRepository } from "../../domain/repositories/ISubcategoryRepository.js";
import { PrismaSubcategoryRepository } from "../../infrastructure/database/repositories/PrismaSubcategoryRepository.js";

import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository.js";
import { PrismaCustomerRepository } from "../../infrastructure/database/repositories/PrismaCustomerRepository.js";

import { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";
import { PrismaOrderRepository } from "../../infrastructure/database/repositories/PrismaOrderRepository.js";

import { IDashboardRepository } from "../../domain/repositories/IDashboardRepository.js";
import { PrismaDashboardRepository } from "../../infrastructure/database/repositories/PrismaDashboardRepository.js";

import { IStoreSettingsRepository } from "../../domain/repositories/IStoreSettingsRepository.js";
import { PrismaStoreSettingsRepository } from "../../infrastructure/database/repositories/PrismaStoreSettingsRepository.js";

import { IAbandonedCartRepository } from "../../domain/repositories/IAbandonedCartRepository.js";
import { PrismaAbandonedCartRepository } from "../../infrastructure/database/repositories/PrismaAbandonedCartRepository.js";

import { IReviewRepository } from "../../domain/repositories/IReviewRepository.js";
import { PrismaReviewRepository } from "../../infrastructure/database/repositories/PrismaReviewRepository.js";

import { IAddressRepository } from "../../domain/repositories/IAddressRepository.js";
import { PrismaAddressRepository } from "../../infrastructure/database/repositories/PrismaAddressRepository.js";

import { ICartRepository } from "../../domain/repositories/ICartRepository.js";
import { PrismaCartRepository } from "../../infrastructure/database/repositories/PrismaCartRepository.js";

import { IFavoriteRepository } from "../../domain/repositories/IFavoriteRepository.js";
import { PrismaFavoriteRepository } from "../../infrastructure/database/repositories/PrismaFavoriteRepository.js";

import { ISupportTicketRepository } from "../../domain/repositories/ISupportTicketRepository.js";
import { PrismaSupportTicketRepository } from "../../infrastructure/database/repositories/PrismaSupportTicketRepository.js";

import { IMarketplaceAccountRepository } from "../../domain/repositories/IMarketplaceAccountRepository.js";
import { PrismaMarketplaceAccountRepository } from "../../infrastructure/database/repositories/PrismaMarketplaceAccountRepository.js";

import { IMarketplaceListingRepository } from "../../domain/repositories/IMarketplaceListingRepository.js";
import { PrismaMarketplaceListingRepository } from "../../infrastructure/database/repositories/PrismaMarketplaceListingRepository.js";

import { IBrandRepository } from "../../domain/repositories/IBrandRepository.js";
import { PrismaBrandRepository } from "../../infrastructure/database/repositories/PrismaBrandRepository.js";

// Providers
import { IHashProvider } from "../../application/interfaces/IHashProvider.js";
import { BcryptHashProvider } from "../../infrastructure/providers/hash/BcryptHashProvider.js";

import { IStorageProvider } from "../../application/interfaces/IStorageProvider.js";
import { LocalStorageProvider } from "../../infrastructure/providers/storage/LocalStorageProvider.js";

import { IMailProvider } from "../../application/interfaces/IMailProvider.js";
import { NodemailerMailProvider } from "../../infrastructure/providers/mail/NodemailerMailProvider.js";

// Register Repositories
container.registerSingleton<IUserRepository>(
  "UserRepository",
  PrismaUserRepository,
);
container.registerSingleton<IProductRepository>(
  "ProductRepository",
  PrismaProductRepository,
);
container.registerSingleton<ICategoryRepository>(
  "CategoryRepository",
  PrismaCategoryRepository,
);
container.registerSingleton<ISubcategoryRepository>(
  "SubcategoryRepository",
  PrismaSubcategoryRepository,
);
container.registerSingleton<ICustomerRepository>(
  "CustomerRepository",
  PrismaCustomerRepository,
);
container.registerSingleton<IOrderRepository>(
  "OrderRepository",
  PrismaOrderRepository,
);
container.registerSingleton<IDashboardRepository>(
  "DashboardRepository",
  PrismaDashboardRepository,
);
container.registerSingleton<IStoreSettingsRepository>(
  "StoreSettingsRepository",
  PrismaStoreSettingsRepository,
);
container.registerSingleton<IAbandonedCartRepository>(
  "AbandonedCartRepository",
  PrismaAbandonedCartRepository,
);
container.registerSingleton<IReviewRepository>(
  "ReviewRepository",
  PrismaReviewRepository,
);
container.registerSingleton<IAddressRepository>(
  "AddressRepository",
  PrismaAddressRepository,
);
container.registerSingleton<ICartRepository>(
  "CartRepository",
  PrismaCartRepository,
);
container.registerSingleton<IFavoriteRepository>(
  "FavoriteRepository",
  PrismaFavoriteRepository,
);
container.registerSingleton<ISupportTicketRepository>(
  "SupportTicketRepository",
  PrismaSupportTicketRepository,
);
container.registerSingleton<IMarketplaceAccountRepository>(
  "MarketplaceAccountRepository",
  PrismaMarketplaceAccountRepository,
);
container.registerSingleton<IMarketplaceListingRepository>(
  "MarketplaceListingRepository",
  PrismaMarketplaceListingRepository,
);
container.registerSingleton<IBrandRepository>(
  "BrandRepository",
  PrismaBrandRepository,
);

// Register Providers
container.registerSingleton<IHashProvider>("HashProvider", BcryptHashProvider);
container.registerSingleton<IStorageProvider>("StorageProvider", LocalStorageProvider);
container.registerSingleton<IMailProvider>("MailProvider", NodemailerMailProvider);

export { container };
