import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/ProductController.js";
import { SubcategoryController } from "../controllers/SubcategoryController.js";
import { OrderController } from "../controllers/OrderController.js";
import { CustomerController } from "../controllers/CustomerController.js";
import { ReviewController } from "../controllers/ReviewController.js";
import { DashboardController } from "../controllers/DashboardController.js";
import { HighlightController } from "../controllers/HighlightController.js";
import { SettingsController } from "../controllers/SettingsController.js";
import { AbandonedCartController } from "../controllers/AbandonedCartController.js";
import { ProductImageController } from "../controllers/ProductImageController.js";
import { SupportTicketController } from "../controllers/SupportTicketController.js";
import { MarketplaceController } from "../controllers/MarketplaceController.js";
import { BrandController } from "../controllers/BrandController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { UserRole } from "../../../domain/enums/index.js";

const productController = new ProductController();
const subcategoryController = new SubcategoryController();
const orderController = new OrderController();
const customerController = new CustomerController();
const reviewController = new ReviewController();
const dashboardController = new DashboardController();
const highlightController = new HighlightController();
const settingsController = new SettingsController();
const abandonedCartController = new AbandonedCartController();
const productImageController = new ProductImageController();
const supportTicketController = new SupportTicketController();
const marketplaceController = new MarketplaceController();
const brandController = new BrandController();

export async function adminRoutes(app: FastifyInstance) {
  // Protege todas as rotas admin
  app.addHook("onRequest", authMiddleware([UserRole.ADMIN]));

  // Products (7 endpoints)
  app.get("/products", productController.list);
  app.get("/products/:id", productController.get);
  app.post("/products", productController.create);
  app.put("/products/:id", productController.update);
  app.delete("/products/:id", productController.delete);
  app.patch("/products/:id/featured", productController.toggleFeatured);
  app.patch("/products/:id/recommended", productController.toggleRecommended);

  // Product Images (4 endpoints)
  app.post("/products/:id/images", productImageController.upload);
  app.patch("/products/:id/images/reorder", productImageController.reorder);
  app.delete("/products/:id/images/:imageId", productImageController.delete);
  app.patch("/products/:id/images/:imageId/main", productImageController.setMain);

  // Brands (4 endpoints)
  app.get("/brands", brandController.list);
  app.post("/brands", brandController.create);
  app.put("/brands/:id", brandController.update);
  app.delete("/brands/:id", brandController.delete);

  // Categories / Subcategories (4 endpoints)
  app.get("/categories", subcategoryController.list);
  app.post("/categories", subcategoryController.create);
  app.put("/categories/:id", subcategoryController.update);
  app.delete("/categories/:id", subcategoryController.delete);

  // Orders (4 endpoints)
  app.get("/orders", orderController.list);
  app.get("/orders/:id", orderController.get);
  app.patch("/orders/:id/status", orderController.updateStatus);
  app.patch("/orders/:id/tracking", orderController.updateTracking);

  // Customers (3 endpoints)
  app.get("/customers", customerController.list);
  app.get("/customers/:id", customerController.get);
  app.patch("/customers/:id/status", customerController.updateStatus);

  // Reviews (4 endpoints)
  app.get("/reviews", reviewController.list);
  app.patch("/reviews/:id/approve", reviewController.approve);
  app.patch("/reviews/:id/reject", reviewController.reject);
  app.delete("/reviews/:id", reviewController.delete);

  // Dashboard (4 endpoints)
  app.get("/dashboard/stats", dashboardController.getStats);
  app.get("/dashboard/sales-chart", dashboardController.getSalesChart);
  app.get("/dashboard/top-products", dashboardController.getTopProducts);
  app.get("/dashboard/recent-orders", dashboardController.getRecentOrders);

  // Highlights (2 endpoints)
  app.get("/highlights", highlightController.get);
  app.put("/highlights", highlightController.update);

  // Settings (2 endpoints)
  app.get("/settings", settingsController.get);
  app.put("/settings", settingsController.update);

  // Abandoned Carts (1 endpoint)
  app.get("/abandoned-carts", abandonedCartController.list);

  // Support Tickets (4 endpoints)
  app.get("/tickets", supportTicketController.list);
  app.get("/tickets/:id", supportTicketController.get);
  app.patch("/tickets/:id/status", supportTicketController.updateStatus);
  app.post("/tickets/:id/replies", supportTicketController.reply);

  // Marketplace Accounts (4 endpoints)
  app.get("/marketplace/accounts", marketplaceController.listAccounts);
  app.get("/marketplace/accounts/:platform/auth-url", marketplaceController.getAuthUrl);
  app.post("/marketplace/accounts/:platform/callback", marketplaceController.oauthCallback);
  app.delete("/marketplace/accounts/:platform", marketplaceController.disconnect);

  // Marketplace Listings (6 endpoints)
  app.get("/marketplace/listings", marketplaceController.listListings);
  app.post("/marketplace/listings", marketplaceController.createListing);
  app.put("/marketplace/listings/:id", marketplaceController.updateListing);
  app.patch("/marketplace/listings/:id/publish", marketplaceController.publishListing);
  app.patch("/marketplace/listings/:id/pause", marketplaceController.pauseListing);
  app.delete("/marketplace/listings/:id", marketplaceController.deleteListing);

  // Marketplace Sync & Categories (2 endpoints)
  app.post("/marketplace/sync/stock", marketplaceController.syncStock);
  app.get("/marketplace/categories/:platform", marketplaceController.getCategories);
}
