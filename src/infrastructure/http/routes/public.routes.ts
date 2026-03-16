import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/ProductController.js";
import { AuthController } from "../controllers/AuthController.js";
import { SubcategoryController } from "../controllers/SubcategoryController.js";
import { SettingsController } from "../controllers/SettingsController.js";
import { ReviewController } from "../controllers/ReviewController.js";
import { ProfileController } from "../controllers/ProfileController.js";
import { AddressController } from "../controllers/AddressController.js";
import { CartController } from "../controllers/CartController.js";
import { FavoriteController } from "../controllers/FavoriteController.js";
import { CustomerOrderController } from "../controllers/CustomerOrderController.js";
import { SupportTicketController } from "../controllers/SupportTicketController.js";
import { webhookController } from "../controllers/WebhookController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware.js";
import { UserRole } from "../../../domain/enums/index.js";

const productController = new ProductController();
const authController = new AuthController();
const subcategoryController = new SubcategoryController();
const settingsController = new SettingsController();
const reviewController = new ReviewController();
const profileController = new ProfileController();
const addressController = new AddressController();
const cartController = new CartController();
const favoriteController = new FavoriteController();
const customerOrderController = new CustomerOrderController();
const supportTicketController = new SupportTicketController();

export async function publicRoutes(app: FastifyInstance) {
  // Auth
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);

  // Products (public)
  app.get("/products", productController.list);
  app.get("/products/featured", productController.featured);
  app.get("/products/recommended", productController.recommended);
  app.get("/products/:id", productController.get);
  app.get("/products/:id/reviews", reviewController.listPublic);

  // Categories (public)
  app.get("/categories", subcategoryController.list);

  // Store settings (public)
  app.get("/settings", settingsController.get);

  // Support Tickets (auth optional - links customer if logged in)
  app.post("/tickets", { preHandler: optionalAuthMiddleware() }, supportTicketController.create);

  // === Rotas autenticadas (customer) ===
  const customerAuth = authMiddleware([UserRole.CUSTOMER, UserRole.ADMIN]);

  // Profile
  app.get("/me", { preHandler: customerAuth }, profileController.me);
  app.put("/me", { preHandler: customerAuth }, profileController.updateProfile);

  // Addresses
  app.get("/addresses", { preHandler: customerAuth }, addressController.list);
  app.post("/addresses", { preHandler: customerAuth }, addressController.create);
  app.put("/addresses/:id", { preHandler: customerAuth }, addressController.update);
  app.delete("/addresses/:id", { preHandler: customerAuth }, addressController.delete);

  // Cart
  app.get("/cart", { preHandler: customerAuth }, cartController.get);
  app.post("/cart/items", { preHandler: customerAuth }, cartController.addItem);
  app.put("/cart/items/:itemId", { preHandler: customerAuth }, cartController.updateItem);
  app.delete("/cart/items/:itemId", { preHandler: customerAuth }, cartController.removeItem);
  app.delete("/cart", { preHandler: customerAuth }, cartController.clear);

  // Favorites
  app.get("/favorites", { preHandler: customerAuth }, favoriteController.list);
  app.post("/favorites", { preHandler: customerAuth }, favoriteController.add);
  app.delete("/favorites/:productId", { preHandler: customerAuth }, favoriteController.remove);

  // Orders
  app.post("/orders", { preHandler: customerAuth }, customerOrderController.create);
  app.get("/orders", { preHandler: customerAuth }, customerOrderController.list);
  app.get("/orders/:id", { preHandler: customerAuth }, customerOrderController.get);

  // Reviews (submit)
  app.post("/products/:id/reviews", { preHandler: customerAuth }, customerOrderController.createReview);

  // Stripe Webhook (no auth, raw body)
  app.post("/webhooks/stripe", {
    config: { rawBody: true },
  }, webhookController.stripeWebhook);
}
