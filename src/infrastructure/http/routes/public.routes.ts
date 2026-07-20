import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/ProductController.js";
import { AuthController } from "../controllers/AuthController.js";
import { SubcategoryController } from "../controllers/SubcategoryController.js";
import { BrandController } from "../controllers/BrandController.js";
import { SettingsController } from "../controllers/SettingsController.js";
import { ReviewController } from "../controllers/ReviewController.js";
import { ProfileController } from "../controllers/ProfileController.js";
import { AddressController } from "../controllers/AddressController.js";
import { CartController } from "../controllers/CartController.js";
import { FavoriteController } from "../controllers/FavoriteController.js";
import { CustomerOrderController } from "../controllers/CustomerOrderController.js";
import { CouponController } from "../controllers/CouponController.js";
import { SupportTicketController } from "../controllers/SupportTicketController.js";
import { ShippingController } from "../controllers/ShippingController.js";
import { webhookController } from "../controllers/WebhookController.js";
import { MarketplaceWebhookController } from "../controllers/MarketplaceWebhookController.js";

const marketplaceWebhookController = new MarketplaceWebhookController();
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware.js";
import { UserRole } from "../../../domain/enums/index.js";

const productController = new ProductController();
const authController = new AuthController();
const subcategoryController = new SubcategoryController();
const brandController = new BrandController();
const settingsController = new SettingsController();
const reviewController = new ReviewController();
const profileController = new ProfileController();
const addressController = new AddressController();
const cartController = new CartController();
const favoriteController = new FavoriteController();
const customerOrderController = new CustomerOrderController();
const couponController = new CouponController();
const supportTicketController = new SupportTicketController();
const shippingController = new ShippingController();

export async function publicRoutes(app: FastifyInstance) {
  // Auth (stricter rate limiting)
  const authRateLimit = {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
  };
  app.post("/auth/register", authRateLimit, authController.register);
  app.post("/auth/login", authRateLimit, authController.login);
  app.post("/auth/logout", authController.logout);
  app.post("/auth/forgot-password", authRateLimit, authController.forgotPassword);
  app.post("/auth/reset-password", authRateLimit, authController.resetPassword);
  app.get("/auth/verify-email", authController.verifyEmail);

  // Products (public)
  app.get("/products", productController.list);
  app.get("/products/featured", productController.featured);
  app.get("/products/recommended", productController.recommended);
  app.get("/products/:id", productController.get);
  app.get("/products/:id/related", productController.related);
  app.get("/products/:id/reviews", reviewController.listPublic);

  // Categories (public)
  app.get("/categories", subcategoryController.list);

  // Brands (public)
  app.get("/brands", brandController.list);

  // Store settings (public)
  app.get("/settings", settingsController.get);

  // Shipping
  app.post("/shipping/calculate", shippingController.calculate);

  // Support Tickets (auth optional - links customer if logged in)
  app.post("/tickets", { preHandler: optionalAuthMiddleware() }, supportTicketController.create);

  // === Rotas autenticadas (customer) ===
  const customerAuth = authMiddleware([UserRole.CUSTOMER, UserRole.ADMIN]);

  // Refresh: cookie atual valida (preHandler), backend renova silenciosamente
  app.post("/auth/refresh", { preHandler: customerAuth }, authController.refresh);
  // Resend de email: rate limit pra evitar spam (3 emails/min/IP)
  app.post(
    "/auth/resend-verification",
    {
      preHandler: customerAuth,
      config: { rateLimit: { max: 3, timeWindow: "1 minute" } },
    },
    authController.resendVerification,
  );

  // Profile
  app.get("/me", { preHandler: customerAuth }, profileController.me);
  app.put("/me", { preHandler: customerAuth }, profileController.updateProfile);
  app.post("/me/change-password", { preHandler: customerAuth }, profileController.changePassword);
  app.post("/me/accept-terms", { preHandler: customerAuth }, profileController.acceptTerms);
  app.delete("/me", { preHandler: customerAuth }, profileController.deleteAccount);
  app.get("/me/export", { preHandler: customerAuth }, profileController.exportData);

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

  // Cupom: validação contra o carrinho do cliente. Rate limit dedicado — códigos
  // são adivinháveis; sem isso o endpoint vira oráculo de brute-force (auditoria B5).
  app.post(
    "/coupons/validate",
    {
      preHandler: customerAuth,
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    couponController.validate,
  );

  // Orders
  app.post("/orders", { preHandler: customerAuth }, customerOrderController.create);
  app.get("/orders", { preHandler: customerAuth }, customerOrderController.list);
  app.get("/orders/:id", { preHandler: customerAuth }, customerOrderController.get);
  app.post("/orders/:id/retry-payment", { preHandler: customerAuth }, customerOrderController.retryPayment);

  // Reviews (submit)
  app.post("/products/:id/reviews", { preHandler: customerAuth }, customerOrderController.createReview);

  // Stripe Webhook (no auth, raw body)
  app.post("/webhooks/stripe", {
    config: { rawBody: true },
  }, webhookController.stripeWebhook);

  // Mercado Livre Webhook (no auth — ML sends notifications here)
  app.post("/webhooks/mercado-livre", marketplaceWebhookController.handleNotification);
}
