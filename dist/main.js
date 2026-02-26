var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/main.ts
import "reflect-metadata";

// src/shared/container/index.ts
import "reflect-metadata";
import { container } from "tsyringe";

// src/infrastructure/database/prisma/client.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? [
    "query",
    "error",
    "warn"
  ] : [
    "error"
  ]
});

// src/domain/enums/index.ts
var UserRole = /* @__PURE__ */ (function(UserRole2) {
  UserRole2["ADMIN"] = "ADMIN";
  UserRole2["CUSTOMER"] = "CUSTOMER";
  return UserRole2;
})({});
var OrderStatus = /* @__PURE__ */ (function(OrderStatus2) {
  OrderStatus2["PENDING"] = "PENDING";
  OrderStatus2["CONFIRMED"] = "CONFIRMED";
  OrderStatus2["PREPARING"] = "PREPARING";
  OrderStatus2["READY"] = "READY";
  OrderStatus2["DELIVERED"] = "DELIVERED";
  OrderStatus2["CANCELLED"] = "CANCELLED";
  return OrderStatus2;
})({});
var PaymentMethod = /* @__PURE__ */ (function(PaymentMethod2) {
  PaymentMethod2["PIX"] = "PIX";
  PaymentMethod2["CREDIT_CARD"] = "CREDIT_CARD";
  PaymentMethod2["DEBIT_CARD"] = "DEBIT_CARD";
  PaymentMethod2["CASH_ON_PICKUP"] = "CASH_ON_PICKUP";
  return PaymentMethod2;
})({});
var AnimalType = /* @__PURE__ */ (function(AnimalType2) {
  AnimalType2["GATO"] = "GATO";
  AnimalType2["CACHORRO"] = "CACHORRO";
  return AnimalType2;
})({});
var ReviewStatus = /* @__PURE__ */ (function(ReviewStatus2) {
  ReviewStatus2["PENDING"] = "PENDING";
  ReviewStatus2["APPROVED"] = "APPROVED";
  ReviewStatus2["REJECTED"] = "REJECTED";
  return ReviewStatus2;
})({});

// src/domain/entities/User.ts
var User = class {
  static {
    __name(this, "User");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get name() {
    return this.props.name;
  }
  get role() {
    return this.props.role;
  }
  get phone() {
    return this.props.phone;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  isAdmin() {
    return this.props.role === UserRole.ADMIN;
  }
  isCustomer() {
    return this.props.role === UserRole.CUSTOMER;
  }
  updateName(name) {
    this.props.name = name;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  updatePhone(phone) {
    this.props.phone = phone;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/domain/errors/DomainError.ts
var DomainError = class extends Error {
  static {
    __name(this, "DomainError");
  }
  constructor(message) {
    super(message);
    this.name = "DomainError";
  }
};

// src/domain/value-objects/Email.ts
var Email = class _Email {
  static {
    __name(this, "Email");
  }
  value;
  constructor(email) {
    this.value = email.toLowerCase().trim();
  }
  static create(email) {
    if (!email) {
      throw new DomainError("Email \xE9 obrigat\xF3rio");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainError("Email inv\xE1lido");
    }
    return new _Email(email);
  }
  getValue() {
    return this.value;
  }
  equals(other) {
    return this.value === other.value;
  }
};

// src/infrastructure/database/repositories/PrismaUserRepository.ts
var PrismaUserRepository = class {
  static {
    __name(this, "PrismaUserRepository");
  }
  async findById(id) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    if (!user) return null;
    return this.mapToEntity(user);
  }
  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (!user) return null;
    return this.mapToEntity(user);
  }
  async create(user) {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
    if (user.role === UserRole.CUSTOMER) {
      await prisma.customer.create({
        data: {
          userId: created.id
        }
      });
    }
    return this.mapToEntity(created);
  }
  async update(user) {
    const updated = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        name: user.name,
        phone: user.phone
      }
    });
    return this.mapToEntity(updated);
  }
  async delete(id) {
    await prisma.user.delete({
      where: {
        id
      }
    });
  }
  mapToEntity(data) {
    return new User({
      id: data.id,
      email: Email.create(data.email),
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role,
      phone: data.phone,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
};

// src/domain/entities/Product.ts
var Product = class {
  static {
    __name(this, "Product");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get description() {
    return this.props.description;
  }
  get price() {
    return this.props.price;
  }
  get stock() {
    return this.props.stock;
  }
  get isActive() {
    return this.props.isActive;
  }
  get images() {
    return this.props.images;
  }
  get mainImage() {
    return this.props.images.find((img) => img.isMain) || this.props.images[0];
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get animalType() {
    return this.props.animalType;
  }
  get subcategoryId() {
    return this.props.subcategoryId;
  }
  get promoPrice() {
    return this.props.promoPrice;
  }
  get sku() {
    return this.props.sku;
  }
  get isFeatured() {
    return this.props.isFeatured;
  }
  get isRecommended() {
    return this.props.isRecommended;
  }
  isAvailable() {
    return this.props.isActive && this.props.stock > 0;
  }
  hasStock(quantity) {
    return this.props.stock >= quantity;
  }
  decreaseStock(quantity) {
    if (!this.hasStock(quantity)) {
      throw new Error("Estoque insuficiente");
    }
    this.props.stock -= quantity;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  increaseStock(quantity) {
    this.props.stock += quantity;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  updatePrice(price) {
    this.props.price = price;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  updatePromoPrice(promoPrice) {
    this.props.promoPrice = promoPrice;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  setFeatured(value) {
    this.props.isFeatured = value;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  setRecommended(value) {
    this.props.isRecommended = value;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  update(data) {
    if (data.name !== void 0) {
      this.props.name = data.name;
      this.props.slug = this.generateSlug(data.name);
    }
    if (data.description !== void 0) this.props.description = data.description;
    if (data.categoryId !== void 0) this.props.categoryId = data.categoryId;
    if (data.isActive !== void 0) this.props.isActive = data.isActive;
    if (data.animalType !== void 0) this.props.animalType = data.animalType;
    if (data.subcategoryId !== void 0) this.props.subcategoryId = data.subcategoryId;
    if (data.sku !== void 0) this.props.sku = data.sku;
    if (data.isFeatured !== void 0) this.props.isFeatured = data.isFeatured;
    if (data.isRecommended !== void 0) this.props.isRecommended = data.isRecommended;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  generateSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
};

// src/domain/value-objects/Money.ts
var Money = class _Money {
  static {
    __name(this, "Money");
  }
  value;
  constructor(value) {
    this.value = value;
  }
  static create(value) {
    if (value < 0) {
      throw new DomainError("Valor monet\xE1rio n\xE3o pode ser negativo");
    }
    return new _Money(Math.round(value * 100) / 100);
  }
  static zero() {
    return new _Money(0);
  }
  getValue() {
    return this.value;
  }
  add(other) {
    return _Money.create(this.value + other.getValue());
  }
  subtract(other) {
    return _Money.create(this.value - other.getValue());
  }
  multiply(quantity) {
    return _Money.create(this.value * quantity);
  }
  format() {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(this.value);
  }
  equals(other) {
    return this.value === other.value;
  }
  isGreaterThan(other) {
    return this.value > other.getValue();
  }
};

// src/infrastructure/database/repositories/PrismaProductRepository.ts
var PrismaProductRepository = class {
  static {
    __name(this, "PrismaProductRepository");
  }
  async findById(id) {
    const product = await prisma.product.findUnique({
      where: {
        id
      },
      include: {
        images: true
      }
    });
    if (!product) return null;
    return this.mapToEntity(product);
  }
  async findBySlug(slug) {
    const product = await prisma.product.findUnique({
      where: {
        slug
      },
      include: {
        images: true
      }
    });
    if (!product) return null;
    return this.mapToEntity(product);
  }
  async findAll(filters, pagination) {
    const where = {};
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: filters.search,
            mode: "insensitive"
          }
        }
      ];
    }
    if (filters?.minPrice !== void 0 || filters?.maxPrice !== void 0) {
      where.price = {};
      if (filters.minPrice !== void 0) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== void 0) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters?.onlyActive) {
      where.isActive = true;
    }
    if (filters?.onlyInStock) {
      where.stock = {
        gt: 0
      };
    }
    if (filters?.animalType) {
      where.animalType = filters.animalType;
    }
    if (filters?.subcategoryId) {
      where.subcategoryId = filters.subcategoryId;
    }
    if (filters?.onlyFeatured) {
      where.isFeatured = true;
    }
    if (filters?.onlyRecommended) {
      where.isRecommended = true;
    }
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: true
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.product.count({
        where
      })
    ]);
    return {
      data: products.map((p) => this.mapToEntity(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  async findByCategory(categoryId) {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true
      },
      include: {
        images: true
      }
    });
    return products.map((p) => this.mapToEntity(p));
  }
  async create(product) {
    const created = await prisma.product.create({
      data: {
        id: product.id,
        categoryId: product.categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.getValue(),
        stock: product.stock,
        isActive: product.isActive,
        animalType: product.animalType,
        subcategoryId: product.subcategoryId,
        promoPrice: product.promoPrice?.getValue() ?? null,
        sku: product.sku,
        isFeatured: product.isFeatured,
        isRecommended: product.isRecommended
      },
      include: {
        images: true
      }
    });
    return this.mapToEntity(created);
  }
  async update(product) {
    const updated = await prisma.product.update({
      where: {
        id: product.id
      },
      data: {
        categoryId: product.categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.getValue(),
        stock: product.stock,
        isActive: product.isActive,
        animalType: product.animalType,
        subcategoryId: product.subcategoryId,
        promoPrice: product.promoPrice?.getValue() ?? null,
        sku: product.sku,
        isFeatured: product.isFeatured,
        isRecommended: product.isRecommended
      },
      include: {
        images: true
      }
    });
    return this.mapToEntity(updated);
  }
  async updateStock(id, quantity) {
    await prisma.product.update({
      where: {
        id
      },
      data: {
        stock: quantity
      }
    });
  }
  async delete(id) {
    await prisma.product.delete({
      where: {
        id
      }
    });
  }
  async findFeatured(limit) {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true
      },
      include: {
        images: true
      },
      orderBy: {
        name: "asc"
      },
      take: limit ?? 10
    });
    return products.map((p) => this.mapToEntity(p));
  }
  async findRecommended(limit) {
    const products = await prisma.product.findMany({
      where: {
        isRecommended: true,
        isActive: true
      },
      include: {
        images: true
      },
      orderBy: {
        name: "asc"
      },
      take: limit ?? 10
    });
    return products.map((p) => this.mapToEntity(p));
  }
  async updateFeatured(id, isFeatured) {
    await prisma.product.update({
      where: {
        id
      },
      data: {
        isFeatured
      }
    });
  }
  async updateRecommended(id, isRecommended) {
    await prisma.product.update({
      where: {
        id
      },
      data: {
        isRecommended
      }
    });
  }
  async bulkUpdateFeatured(featuredIds) {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: {},
        data: {
          isFeatured: false
        }
      }),
      prisma.product.updateMany({
        where: {
          id: {
            in: featuredIds
          }
        },
        data: {
          isFeatured: true
        }
      })
    ]);
  }
  async bulkUpdateRecommended(recommendedIds) {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: {},
        data: {
          isRecommended: false
        }
      }),
      prisma.product.updateMany({
        where: {
          id: {
            in: recommendedIds
          }
        },
        data: {
          isRecommended: true
        }
      })
    ]);
  }
  mapToEntity(data) {
    const images = (data.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.order,
      isMain: img.isMain
    }));
    return new Product({
      id: data.id,
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Money.create(Number(data.price)),
      stock: data.stock,
      isActive: data.isActive,
      images,
      animalType: data.animalType,
      subcategoryId: data.subcategoryId ?? null,
      promoPrice: data.promoPrice != null ? Money.create(Number(data.promoPrice)) : null,
      sku: data.sku,
      isFeatured: data.isFeatured,
      isRecommended: data.isRecommended,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
};

// src/domain/entities/Category.ts
var Category = class {
  static {
    __name(this, "Category");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get description() {
    return this.props.description;
  }
  get imageUrl() {
    return this.props.imageUrl;
  }
  get isActive() {
    return this.props.isActive;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  update(data) {
    if (data.name !== void 0) {
      this.props.name = data.name;
      this.props.slug = this.generateSlug(data.name);
    }
    if (data.description !== void 0) this.props.description = data.description;
    if (data.imageUrl !== void 0) this.props.imageUrl = data.imageUrl;
    if (data.isActive !== void 0) this.props.isActive = data.isActive;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  generateSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  activate() {
    this.props.isActive = true;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  deactivate() {
    this.props.isActive = false;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/infrastructure/database/repositories/PrismaCategoryRepository.ts
var PrismaCategoryRepository = class {
  static {
    __name(this, "PrismaCategoryRepository");
  }
  async findById(id) {
    const category = await prisma.category.findUnique({
      where: {
        id
      }
    });
    if (!category) return null;
    return this.mapToEntity(category);
  }
  async findBySlug(slug) {
    const category = await prisma.category.findUnique({
      where: {
        slug
      }
    });
    if (!category) return null;
    return this.mapToEntity(category);
  }
  async findAll(onlyActive) {
    const where = onlyActive ? {
      isActive: true
    } : {};
    const categories = await prisma.category.findMany({
      where
    });
    return categories.map((c) => this.mapToEntity(c));
  }
  async create(category) {
    const created = await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive
      }
    });
    return this.mapToEntity(created);
  }
  async update(category) {
    const updated = await prisma.category.update({
      where: {
        id: category.id
      },
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive
      }
    });
    return this.mapToEntity(updated);
  }
  async delete(id) {
    await prisma.category.delete({
      where: {
        id
      }
    });
  }
  mapToEntity(data) {
    return new Category({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
};

// src/domain/entities/Subcategory.ts
var Subcategory = class {
  static {
    __name(this, "Subcategory");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get animalType() {
    return this.props.animalType;
  }
  get name() {
    return this.props.name;
  }
  get icon() {
    return this.props.icon;
  }
  get isActive() {
    return this.props.isActive;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  update(data) {
    if (data.name !== void 0) this.props.name = data.name;
    if (data.icon !== void 0) this.props.icon = data.icon;
    if (data.isActive !== void 0) this.props.isActive = data.isActive;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/infrastructure/database/repositories/PrismaSubcategoryRepository.ts
var PrismaSubcategoryRepository = class {
  static {
    __name(this, "PrismaSubcategoryRepository");
  }
  async findById(id) {
    const subcategory = await prisma.subcategory.findUnique({
      where: {
        id
      }
    });
    if (!subcategory) return null;
    return this.mapToEntity(subcategory);
  }
  async findAll(onlyActive) {
    const where = onlyActive ? {
      isActive: true
    } : {};
    const subcategories = await prisma.subcategory.findMany({
      where,
      orderBy: {
        name: "asc"
      }
    });
    return subcategories.map((s) => this.mapToEntity(s));
  }
  async findByAnimalType(animalType) {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        animalType
      },
      orderBy: {
        name: "asc"
      }
    });
    return subcategories.map((s) => this.mapToEntity(s));
  }
  async findAllWithCounts() {
    const data = await prisma.subcategory.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
    return data.map((d) => ({
      subcategory: this.mapToEntity(d),
      productCount: d._count.products
    }));
  }
  async create(subcategory) {
    const created = await prisma.subcategory.create({
      data: {
        id: subcategory.id,
        animalType: subcategory.animalType,
        name: subcategory.name,
        icon: subcategory.icon,
        isActive: subcategory.isActive,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt
      }
    });
    return this.mapToEntity(created);
  }
  async update(subcategory) {
    const updated = await prisma.subcategory.update({
      where: {
        id: subcategory.id
      },
      data: {
        name: subcategory.name,
        icon: subcategory.icon,
        isActive: subcategory.isActive,
        updatedAt: subcategory.updatedAt
      }
    });
    return this.mapToEntity(updated);
  }
  async delete(id) {
    await prisma.subcategory.delete({
      where: {
        id
      }
    });
  }
  async countProducts(id) {
    return prisma.product.count({
      where: {
        subcategoryId: id
      }
    });
  }
  mapToEntity(data) {
    return new Subcategory({
      id: data.id,
      animalType: data.animalType,
      name: data.name,
      icon: data.icon,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
};

// src/domain/entities/Customer.ts
var Customer = class {
  static {
    __name(this, "Customer");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get phone() {
    return this.props.phone;
  }
  get cpf() {
    return this.props.cpf;
  }
  get birthDate() {
    return this.props.birthDate;
  }
  get isActive() {
    return this.props.isActive;
  }
  get totalOrders() {
    return this.props.totalOrders;
  }
  get totalSpent() {
    return this.props.totalSpent;
  }
  get lastOrderDate() {
    return this.props.lastOrderDate;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
};

// src/infrastructure/database/repositories/PrismaCustomerRepository.ts
var PrismaCustomerRepository = class {
  static {
    __name(this, "PrismaCustomerRepository");
  }
  async findById(id) {
    const customer = await prisma.customer.findUnique({
      where: {
        id
      },
      include: {
        user: true,
        orders: {
          select: {
            total: true,
            createdAt: true
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        addresses: true
      }
    });
    if (!customer) return null;
    return this.mapToEntity(customer);
  }
  async findAll(filters, pagination) {
    const where = {};
    if (filters?.search) {
      where.user = {
        OR: [
          {
            name: {
              contains: filters.search,
              mode: "insensitive"
            }
          },
          {
            email: {
              contains: filters.search,
              mode: "insensitive"
            }
          }
        ]
      };
    }
    if (filters?.isActive !== void 0) {
      where.user = {
        ...where.user,
        isActive: filters.isActive
      };
    }
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: true,
          orders: {
            select: {
              total: true,
              createdAt: true
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.customer.count({
        where
      })
    ]);
    return {
      data: customers.map((c) => this.mapToEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  async updateStatus(userId, isActive) {
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isActive
      }
    });
  }
  async getStats() {
    const now = /* @__PURE__ */ new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalCustomers, activeCustomers, newThisMonth, avgResult] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: {
          user: {
            isActive: true
          }
        }
      }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: firstOfMonth
          }
        }
      }),
      prisma.order.aggregate({
        _avg: {
          total: true
        }
      })
    ]);
    return {
      totalCustomers,
      activeCustomers,
      avgTicket: avgResult._avg.total ? Number(avgResult._avg.total) : 0,
      newThisMonth
    };
  }
  mapToEntity(data) {
    const orders = data.orders || [];
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
    return new Customer({
      id: data.id,
      userId: data.userId,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      cpf: data.cpf,
      birthDate: data.birthDate,
      isActive: data.user.isActive,
      totalOrders: orders.length,
      totalSpent,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
};

// src/infrastructure/database/repositories/PrismaOrderRepository.ts
import { injectable } from "tsyringe";

// src/domain/entities/Order.ts
var Order = class {
  static {
    __name(this, "Order");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get customerId() {
    return this.props.customerId;
  }
  get adminId() {
    return this.props.adminId;
  }
  get status() {
    return this.props.status;
  }
  get paymentStatus() {
    return this.props.paymentStatus;
  }
  get paymentMethod() {
    return this.props.paymentMethod;
  }
  get subtotal() {
    return this.props.subtotal;
  }
  get discount() {
    return this.props.discount;
  }
  get total() {
    return this.props.total;
  }
  get notes() {
    return this.props.notes;
  }
  get trackingCode() {
    return this.props.trackingCode;
  }
  get pickupLocation() {
    return this.props.pickupLocation;
  }
  get items() {
    return this.props.items;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  canBeCancelled() {
    return [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED
    ].includes(this.props.status);
  }
  updateStatus(status, adminId) {
    this.props.status = status;
    if (adminId) {
      this.props.adminId = adminId;
    }
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  updatePaymentStatus(status) {
    this.props.paymentStatus = status;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  cancel() {
    if (!this.canBeCancelled()) {
      throw new Error("Pedido n\xE3o pode ser cancelado neste status");
    }
    this.props.status = OrderStatus.CANCELLED;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  confirm() {
    this.props.status = OrderStatus.CONFIRMED;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  markAsPreparing() {
    this.props.status = OrderStatus.PREPARING;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  markAsReady() {
    this.props.status = OrderStatus.READY;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  markAsDelivered() {
    this.props.status = OrderStatus.DELIVERED;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  updateTrackingCode(code) {
    this.props.trackingCode = code;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/infrastructure/database/repositories/PrismaOrderRepository.ts
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
var PrismaOrderRepository = class {
  static {
    __name(this, "PrismaOrderRepository");
  }
  async findById(id) {
    const order = await prisma.order.findUnique({
      where: {
        id
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: {
          include: {
            user: true
          }
        },
        history: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
    if (!order) return null;
    return this.mapToEntity(order);
  }
  async findByIdWithDetails(id) {
    const order = await prisma.order.findUnique({
      where: {
        id
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: {
          include: {
            user: true,
            addresses: true
          }
        },
        history: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
    return order;
  }
  async findByCustomer(customerId, pagination) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      customerId
    };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: {
            include: {
              user: true
            }
          },
          history: {
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.order.count({
        where
      })
    ]);
    return {
      data: orders.map((o) => this.mapToEntity(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  async findAll(filters, pagination) {
    const where = {};
    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        {
          customer: {
            user: {
              name: {
                contains: filters.search,
                mode: "insensitive"
              }
            }
          }
        },
        {
          customer: {
            user: {
              email: {
                contains: filters.search,
                mode: "insensitive"
              }
            }
          }
        }
      ];
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: {
            include: {
              user: true
            }
          },
          history: {
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.order.count({
        where
      })
    ]);
    return {
      data: orders.map((o) => this.mapToEntity(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  async create(order) {
    const created = await prisma.order.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        adminId: order.adminId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal.getValue(),
        discount: order.discount.getValue(),
        total: order.total.getValue(),
        notes: order.notes,
        trackingCode: order.trackingCode,
        pickupLocation: order.pickupLocation,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.getValue(),
            total: item.total.getValue()
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: {
          include: {
            user: true
          }
        },
        history: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
    return this.mapToEntity(created);
  }
  async update(order) {
    const updated = await prisma.order.update({
      where: {
        id: order.id
      },
      data: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        adminId: order.adminId,
        trackingCode: order.trackingCode,
        notes: order.notes
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: {
          include: {
            user: true
          }
        },
        history: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
    return this.mapToEntity(updated);
  }
  async addStatusHistory(orderId, status, notes) {
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        notes
      }
    });
  }
  async updateTrackingCode(id, trackingCode) {
    await prisma.order.update({
      where: {
        id
      },
      data: {
        trackingCode
      }
    });
  }
  mapToEntity(data) {
    const items = (data.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? "",
      quantity: item.quantity,
      unitPrice: Money.create(Number(item.unitPrice)),
      total: Money.create(Number(item.total))
    }));
    return new Order({
      id: data.id,
      customerId: data.customerId,
      adminId: data.adminId,
      status: data.status,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      subtotal: Money.create(Number(data.subtotal)),
      discount: Money.create(Number(data.discount)),
      total: Money.create(Number(data.total)),
      notes: data.notes,
      trackingCode: data.trackingCode,
      pickupLocation: data.pickupLocation,
      items,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
};
PrismaOrderRepository = _ts_decorate([
  injectable()
], PrismaOrderRepository);

// src/infrastructure/database/repositories/PrismaDashboardRepository.ts
import { injectable as injectable2 } from "tsyringe";
function _ts_decorate2(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate2, "_ts_decorate");
var PrismaDashboardRepository = class {
  static {
    __name(this, "PrismaDashboardRepository");
  }
  getPeriodDates(period) {
    const now = /* @__PURE__ */ new Date();
    let start;
    let previousStart;
    switch (period) {
      case "7d":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
        previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1e3);
        break;
      case "6m":
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      case "30d":
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        previousStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1e3);
        break;
    }
    return {
      start,
      previousStart
    };
  }
  async getStats(period) {
    const { start, previousStart } = this.getPeriodDates(period);
    const [currentSales, previousSales, currentOrders, previousOrders, activeProducts, activeCustomers, ordersByStatus] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: start
          },
          status: {
            not: "CANCELLED"
          }
        },
        _sum: {
          total: true
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousStart,
            lt: start
          },
          status: {
            not: "CANCELLED"
          }
        },
        _sum: {
          total: true
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: start
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousStart,
            lt: start
          }
        }
      }),
      prisma.product.count({
        where: {
          isActive: true
        }
      }),
      prisma.customer.count({
        where: {
          user: {
            isActive: true
          }
        }
      }),
      prisma.order.groupBy({
        by: [
          "status"
        ],
        _count: true
      })
    ]);
    const totalSales = Number(currentSales._sum.total ?? 0);
    const prevSales = Number(previousSales._sum.total ?? 0);
    const salesTrend = prevSales > 0 ? `${((totalSales - prevSales) / prevSales * 100).toFixed(1)}%` : "+0%";
    const ordersTrend = previousOrders > 0 ? `${((currentOrders - previousOrders) / previousOrders * 100).toFixed(1)}%` : "+0%";
    const statusMap = {};
    for (const item of ordersByStatus) {
      statusMap[item.status] = item._count;
    }
    return {
      totalSales,
      totalOrders: currentOrders,
      activeProducts,
      activeCustomers,
      salesTrend: totalSales >= prevSales ? `+${salesTrend}` : salesTrend,
      ordersTrend: currentOrders >= previousOrders ? `+${ordersTrend}` : ordersTrend,
      ordersByStatus: statusMap
    };
  }
  async getSalesChart(period) {
    const { start } = this.getPeriodDates(period);
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start
        },
        status: {
          not: "CANCELLED"
        }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    const grouped = /* @__PURE__ */ new Map();
    for (const order of orders) {
      let label;
      const date = order.createdAt;
      if (period === "7d") {
        const days = [
          "Dom",
          "Seg",
          "Ter",
          "Qua",
          "Qui",
          "Sex",
          "S\xE1b"
        ];
        label = days[date.getDay()];
      } else if (period === "6m") {
        const months = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez"
        ];
        label = months[date.getMonth()];
      } else {
        const weekNum = Math.ceil((date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1e3));
        label = `Sem ${Math.max(1, weekNum)}`;
      }
      grouped.set(label, (grouped.get(label) ?? 0) + Number(order.total));
    }
    return Array.from(grouped.entries()).map(([label, value]) => ({
      label,
      value: Math.round(value * 100) / 100
    }));
  }
  async getTopProducts(limit) {
    const results = await prisma.orderItem.groupBy({
      by: [
        "productId"
      ],
      _sum: {
        quantity: true,
        total: true
      },
      orderBy: {
        _sum: {
          total: "desc"
        }
      },
      take: limit
    });
    if (results.length === 0) return [];
    const productIds = results.map((r) => r.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      include: {
        subcategory: true
      }
    });
    const productMap = new Map(products.map((p) => [
      p.id,
      p
    ]));
    return results.map((r) => {
      const product = productMap.get(r.productId);
      return {
        id: r.productId,
        name: product?.name ?? "Produto removido",
        category: product?.subcategory?.name ?? "",
        animalType: product?.animalType ?? "",
        sales: r._sum.quantity ?? 0,
        revenue: Number(r._sum.total ?? 0)
      };
    });
  }
  async getRecentOrders(limit) {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    return orders.map((order) => ({
      id: order.id,
      customerName: order.customer.user.name,
      status: order.status,
      total: Number(order.total),
      totalFormatted: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(Number(order.total)),
      createdAt: order.createdAt.toISOString()
    }));
  }
};
PrismaDashboardRepository = _ts_decorate2([
  injectable2()
], PrismaDashboardRepository);

// src/infrastructure/database/repositories/PrismaStoreSettingsRepository.ts
import { injectable as injectable3 } from "tsyringe";

// src/domain/entities/StoreSettings.ts
var StoreSettings = class {
  static {
    __name(this, "StoreSettings");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get storeName() {
    return this.props.storeName;
  }
  get email() {
    return this.props.email;
  }
  get phone() {
    return this.props.phone;
  }
  get whatsapp() {
    return this.props.whatsapp;
  }
  get address() {
    return this.props.address;
  }
  get shippingFreeAbove() {
    return this.props.shippingFreeAbove;
  }
  get shippingBasePrice() {
    return this.props.shippingBasePrice;
  }
  get estimatedDelivery() {
    return this.props.estimatedDelivery;
  }
  get pixEnabled() {
    return this.props.pixEnabled;
  }
  get creditCardEnabled() {
    return this.props.creditCardEnabled;
  }
  get creditCardMaxInstallments() {
    return this.props.creditCardMaxInstallments;
  }
  get boletoEnabled() {
    return this.props.boletoEnabled;
  }
  get socialInstagram() {
    return this.props.socialInstagram;
  }
  get socialFacebook() {
    return this.props.socialFacebook;
  }
  get socialTiktok() {
    return this.props.socialTiktok;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  update(data) {
    if (data.storeName !== void 0) this.props.storeName = data.storeName;
    if (data.email !== void 0) this.props.email = data.email;
    if (data.phone !== void 0) this.props.phone = data.phone;
    if (data.whatsapp !== void 0) this.props.whatsapp = data.whatsapp;
    if (data.address !== void 0) this.props.address = data.address;
    if (data.shippingFreeAbove !== void 0) this.props.shippingFreeAbove = Money.create(data.shippingFreeAbove);
    if (data.shippingBasePrice !== void 0) this.props.shippingBasePrice = Money.create(data.shippingBasePrice);
    if (data.estimatedDelivery !== void 0) this.props.estimatedDelivery = data.estimatedDelivery;
    if (data.pixEnabled !== void 0) this.props.pixEnabled = data.pixEnabled;
    if (data.creditCardEnabled !== void 0) this.props.creditCardEnabled = data.creditCardEnabled;
    if (data.creditCardMaxInstallments !== void 0) this.props.creditCardMaxInstallments = data.creditCardMaxInstallments;
    if (data.boletoEnabled !== void 0) this.props.boletoEnabled = data.boletoEnabled;
    if (data.socialInstagram !== void 0) this.props.socialInstagram = data.socialInstagram;
    if (data.socialFacebook !== void 0) this.props.socialFacebook = data.socialFacebook;
    if (data.socialTiktok !== void 0) this.props.socialTiktok = data.socialTiktok;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/infrastructure/database/repositories/PrismaStoreSettingsRepository.ts
function _ts_decorate3(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate3, "_ts_decorate");
var PrismaStoreSettingsRepository = class {
  static {
    __name(this, "PrismaStoreSettingsRepository");
  }
  async get() {
    let data = await prisma.storeSettings.findUnique({
      where: {
        id: "default"
      }
    });
    if (!data) {
      data = await prisma.storeSettings.create({
        data: {
          id: "default",
          storeName: "Olhos de Gato",
          email: "contato@olhosdegato.com.br",
          phone: "(11) 3456-7890",
          whatsapp: "(11) 99999-0000",
          address: "Rua dos Gatos, 123 - S\xE3o Paulo, SP",
          shippingFreeAbove: 199.9,
          shippingBasePrice: 15.9,
          estimatedDelivery: "3 a 7 dias \xFAteis",
          pixEnabled: true,
          creditCardEnabled: true,
          creditCardMaxInstallments: 12,
          boletoEnabled: true,
          socialInstagram: "",
          socialFacebook: "",
          socialTiktok: ""
        }
      });
    }
    return this.mapToEntity(data);
  }
  async update(settings) {
    const data = await prisma.storeSettings.update({
      where: {
        id: "default"
      },
      data: {
        storeName: settings.storeName,
        email: settings.email,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        address: settings.address,
        shippingFreeAbove: settings.shippingFreeAbove.getValue(),
        shippingBasePrice: settings.shippingBasePrice.getValue(),
        estimatedDelivery: settings.estimatedDelivery,
        pixEnabled: settings.pixEnabled,
        creditCardEnabled: settings.creditCardEnabled,
        creditCardMaxInstallments: settings.creditCardMaxInstallments,
        boletoEnabled: settings.boletoEnabled,
        socialInstagram: settings.socialInstagram,
        socialFacebook: settings.socialFacebook,
        socialTiktok: settings.socialTiktok
      }
    });
    return this.mapToEntity(data);
  }
  mapToEntity(data) {
    return new StoreSettings({
      id: data.id,
      storeName: data.storeName,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      address: data.address,
      shippingFreeAbove: Money.create(Number(data.shippingFreeAbove)),
      shippingBasePrice: Money.create(Number(data.shippingBasePrice)),
      estimatedDelivery: data.estimatedDelivery,
      pixEnabled: data.pixEnabled,
      creditCardEnabled: data.creditCardEnabled,
      creditCardMaxInstallments: data.creditCardMaxInstallments,
      boletoEnabled: data.boletoEnabled,
      socialInstagram: data.socialInstagram,
      socialFacebook: data.socialFacebook,
      socialTiktok: data.socialTiktok,
      updatedAt: data.updatedAt
    });
  }
};
PrismaStoreSettingsRepository = _ts_decorate3([
  injectable3()
], PrismaStoreSettingsRepository);

// src/infrastructure/database/repositories/PrismaAbandonedCartRepository.ts
import { injectable as injectable4 } from "tsyringe";
function _ts_decorate4(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate4, "_ts_decorate");
var PrismaAbandonedCartRepository = class {
  static {
    __name(this, "PrismaAbandonedCartRepository");
  }
  async findAbandoned(pagination) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const where = {
      updatedAt: {
        lt: twentyFourHoursAgo
      },
      items: {
        some: {}
      }
    };
    const [carts, total] = await Promise.all([
      prisma.cart.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                  promoPrice: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          updatedAt: "desc"
        }
      }),
      prisma.cart.count({
        where
      })
    ]);
    let totalValue = 0;
    const data = carts.map((cart) => {
      const items = cart.items.map((item) => {
        const price = item.product.promoPrice ? Number(item.product.promoPrice) : Number(item.product.price);
        return {
          productName: item.product.name,
          quantity: item.quantity,
          price
        };
      });
      const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      totalValue += cartTotal;
      return {
        id: cart.id,
        customerName: cart.customer.user.name,
        customerEmail: cart.customer.user.email,
        items,
        total: Math.round(cartTotal * 100) / 100,
        lastActivity: cart.updatedAt
      };
    });
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalValue: Math.round(totalValue * 100) / 100
    };
  }
};
PrismaAbandonedCartRepository = _ts_decorate4([
  injectable4()
], PrismaAbandonedCartRepository);

// src/domain/entities/Review.ts
var Review = class {
  static {
    __name(this, "Review");
  }
  props;
  constructor(props) {
    this.props = props;
  }
  get id() {
    return this.props.id;
  }
  get productId() {
    return this.props.productId;
  }
  get productName() {
    return this.props.productName;
  }
  get authorId() {
    return this.props.authorId;
  }
  get authorName() {
    return this.props.authorName;
  }
  get rating() {
    return this.props.rating;
  }
  get comment() {
    return this.props.comment;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  approve() {
    this.props.status = ReviewStatus.APPROVED;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
  reject() {
    this.props.status = ReviewStatus.REJECTED;
    this.props.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/infrastructure/database/repositories/PrismaReviewRepository.ts
var PrismaReviewRepository = class {
  static {
    __name(this, "PrismaReviewRepository");
  }
  async findById(id) {
    const review = await prisma.review.findUnique({
      where: {
        id
      },
      include: {
        product: {
          select: {
            name: true
          }
        },
        author: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    if (!review) return null;
    return this.mapToEntity(review);
  }
  async findAll(filters, pagination) {
    const where = {};
    if (filters?.search) {
      where.OR = [
        {
          product: {
            name: {
              contains: filters.search,
              mode: "insensitive"
            }
          }
        },
        {
          comment: {
            contains: filters.search,
            mode: "insensitive"
          }
        }
      ];
    }
    if (filters?.productId) {
      where.productId = filters.productId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          },
          author: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.review.count({
        where
      })
    ]);
    return {
      data: reviews.map((r) => this.mapToEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  async update(review) {
    await prisma.review.update({
      where: {
        id: review.id
      },
      data: {
        status: review.status,
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
    const updated = await this.findById(review.id);
    return updated;
  }
  async delete(id) {
    await prisma.review.delete({
      where: {
        id
      }
    });
  }
  async getStats() {
    const [total, avgResult, pendingCount] = await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      }),
      prisma.review.count({
        where: {
          status: "PENDING"
        }
      })
    ]);
    return {
      totalReviews: total,
      avgRating: avgResult._avg.rating ?? 0,
      pendingCount
    };
  }
  mapToEntity(data) {
    return new Review({
      id: data.id,
      productId: data.productId,
      productName: data.product?.name ?? null,
      authorId: data.authorId,
      authorName: data.author?.user?.name ?? null,
      rating: data.rating,
      comment: data.comment,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
};

// src/infrastructure/providers/hash/BcryptHashProvider.ts
import bcrypt from "bcryptjs";
var BcryptHashProvider = class {
  static {
    __name(this, "BcryptHashProvider");
  }
  async hash(value) {
    return bcrypt.hash(value, 10);
  }
  async compare(value, hashed) {
    return bcrypt.compare(value, hashed);
  }
};

// src/infrastructure/providers/storage/LocalStorageProvider.ts
import { injectable as injectable5 } from "tsyringe";
import { randomUUID } from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
function _ts_decorate5(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate5, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
var ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];
var LocalStorageProvider = class {
  static {
    __name(this, "LocalStorageProvider");
  }
  uploadsDir;
  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), "uploads");
  }
  async upload(params) {
    const { file, fileName, mimeType, folder = "products" } = params;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Mime type "${mimeType}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`);
    }
    const extension = path.extname(fileName);
    const uniqueFilename = `${Date.now()}-${randomUUID()}${extension}`;
    const folderPath = path.join(this.uploadsDir, folder);
    await fs.mkdir(folderPath, {
      recursive: true
    });
    const filePath = path.join(folderPath, uniqueFilename);
    await fs.writeFile(filePath, file);
    return `/uploads/${folder}/${uniqueFilename}`;
  }
  async delete(fileUrl) {
    const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const filePath = path.resolve(process.cwd(), relativePath);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return;
      }
      throw error;
    }
  }
};
LocalStorageProvider = _ts_decorate5([
  injectable5(),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", [])
], LocalStorageProvider);

// src/shared/container/index.ts
container.registerSingleton("UserRepository", PrismaUserRepository);
container.registerSingleton("ProductRepository", PrismaProductRepository);
container.registerSingleton("CategoryRepository", PrismaCategoryRepository);
container.registerSingleton("SubcategoryRepository", PrismaSubcategoryRepository);
container.registerSingleton("CustomerRepository", PrismaCustomerRepository);
container.registerSingleton("OrderRepository", PrismaOrderRepository);
container.registerSingleton("DashboardRepository", PrismaDashboardRepository);
container.registerSingleton("StoreSettingsRepository", PrismaStoreSettingsRepository);
container.registerSingleton("AbandonedCartRepository", PrismaAbandonedCartRepository);
container.registerSingleton("ReviewRepository", PrismaReviewRepository);
container.registerSingleton("HashProvider", BcryptHashProvider);
container.registerSingleton("StorageProvider", LocalStorageProvider);

// src/infrastructure/http/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import * as path2 from "path";
import { fileURLToPath } from "url";

// src/infrastructure/http/controllers/ProductController.ts
import { container as container2 } from "tsyringe";

// src/application/use-cases/product/CreateProductUseCase.ts
import { inject, injectable as injectable6 } from "tsyringe";

// src/shared/errors/AppError.ts
var AppError = class extends Error {
  static {
    __name(this, "AppError");
  }
  statusCode;
  constructor(message, statusCode = 400) {
    super(message), this.statusCode = statusCode;
    this.name = "AppError";
  }
};

// src/application/use-cases/product/CreateProductUseCase.ts
import { randomUUID as randomUUID2 } from "crypto";
function _ts_decorate6(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate6, "_ts_decorate");
function _ts_metadata2(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata2, "_ts_metadata");
function _ts_param(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param, "_ts_param");
var CreateProductUseCase = class {
  static {
    __name(this, "CreateProductUseCase");
  }
  productRepository;
  categoryRepository;
  constructor(productRepository, categoryRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }
  async execute(data) {
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError("Categoria n\xE3o encontrada", 404);
    }
    const slug = this.generateSlug(data.name);
    const existingProduct = await this.productRepository.findBySlug(slug);
    if (existingProduct) {
      throw new AppError("J\xE1 existe um produto com este nome", 409);
    }
    const product = new Product({
      id: randomUUID2(),
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      price: Money.create(data.price),
      stock: data.stock ?? 0,
      isActive: data.isActive ?? true,
      images: [],
      animalType: data.animalType,
      subcategoryId: data.subcategoryId ?? null,
      promoPrice: data.promoPrice ? Money.create(data.promoPrice) : null,
      sku: data.sku,
      isFeatured: data.isFeatured ?? false,
      isRecommended: data.isRecommended ?? false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return this.productRepository.create(product);
  }
  generateSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
};
CreateProductUseCase = _ts_decorate6([
  injectable6(),
  _ts_param(0, inject("ProductRepository")),
  _ts_param(1, inject("CategoryRepository")),
  _ts_metadata2("design:type", Function),
  _ts_metadata2("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository,
    typeof ICategoryRepository === "undefined" ? Object : ICategoryRepository
  ])
], CreateProductUseCase);

// src/application/use-cases/product/ListProductsUseCase.ts
import { inject as inject2, injectable as injectable7 } from "tsyringe";
function _ts_decorate7(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate7, "_ts_decorate");
function _ts_metadata3(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata3, "_ts_metadata");
function _ts_param2(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param2, "_ts_param");
var ListProductsUseCase = class {
  static {
    __name(this, "ListProductsUseCase");
  }
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(filters) {
    const { page, limit, ...productFilters } = filters;
    return this.productRepository.findAll(productFilters, {
      page,
      limit
    });
  }
};
ListProductsUseCase = _ts_decorate7([
  injectable7(),
  _ts_param2(0, inject2("ProductRepository")),
  _ts_metadata3("design:type", Function),
  _ts_metadata3("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository
  ])
], ListProductsUseCase);

// src/application/use-cases/product/GetProductUseCase.ts
import { inject as inject3, injectable as injectable8 } from "tsyringe";
function _ts_decorate8(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate8, "_ts_decorate");
function _ts_metadata4(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata4, "_ts_metadata");
function _ts_param3(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param3, "_ts_param");
var GetProductUseCase = class {
  static {
    __name(this, "GetProductUseCase");
  }
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(idOrSlug) {
    let product = null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    if (isUUID) {
      product = await this.productRepository.findById(idOrSlug);
    } else {
      product = await this.productRepository.findBySlug(idOrSlug);
    }
    if (!product) {
      throw new AppError("Produto n\xE3o encontrado", 404);
    }
    return product;
  }
};
GetProductUseCase = _ts_decorate8([
  injectable8(),
  _ts_param3(0, inject3("ProductRepository")),
  _ts_metadata4("design:type", Function),
  _ts_metadata4("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository
  ])
], GetProductUseCase);

// src/application/use-cases/product/UpdateProductUseCase.ts
import { inject as inject4, injectable as injectable9 } from "tsyringe";
function _ts_decorate9(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate9, "_ts_decorate");
function _ts_metadata5(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata5, "_ts_metadata");
function _ts_param4(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param4, "_ts_param");
var UpdateProductUseCase = class {
  static {
    __name(this, "UpdateProductUseCase");
  }
  productRepository;
  categoryRepository;
  constructor(productRepository, categoryRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }
  async execute(id, data) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto n\xE3o encontrado", 404);
    }
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError("Categoria n\xE3o encontrada", 404);
      }
    }
    if (data.price !== void 0) {
      product.updatePrice(Money.create(data.price));
    }
    if (data.promoPrice !== void 0) {
      product.updatePromoPrice(data.promoPrice !== null ? Money.create(data.promoPrice) : null);
    }
    if (data.stock !== void 0) {
      const stockDiff = data.stock - product.stock;
      if (stockDiff > 0) {
        product.increaseStock(stockDiff);
      } else if (stockDiff < 0) {
        product.decreaseStock(Math.abs(stockDiff));
      }
    }
    product.update({
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      isActive: data.isActive,
      animalType: data.animalType,
      subcategoryId: data.subcategoryId,
      sku: data.sku,
      isFeatured: data.isFeatured,
      isRecommended: data.isRecommended
    });
    return this.productRepository.update(product);
  }
};
UpdateProductUseCase = _ts_decorate9([
  injectable9(),
  _ts_param4(0, inject4("ProductRepository")),
  _ts_param4(1, inject4("CategoryRepository")),
  _ts_metadata5("design:type", Function),
  _ts_metadata5("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository,
    typeof ICategoryRepository === "undefined" ? Object : ICategoryRepository
  ])
], UpdateProductUseCase);

// src/application/use-cases/product/DeleteProductUseCase.ts
import { inject as inject5, injectable as injectable10 } from "tsyringe";
function _ts_decorate10(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate10, "_ts_decorate");
function _ts_metadata6(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata6, "_ts_metadata");
function _ts_param5(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param5, "_ts_param");
var DeleteProductUseCase = class {
  static {
    __name(this, "DeleteProductUseCase");
  }
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(id) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto n\xE3o encontrado", 404);
    }
    await this.productRepository.delete(id);
  }
};
DeleteProductUseCase = _ts_decorate10([
  injectable10(),
  _ts_param5(0, inject5("ProductRepository")),
  _ts_metadata6("design:type", Function),
  _ts_metadata6("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository
  ])
], DeleteProductUseCase);

// src/application/dtos/ProductDTO.ts
import { z } from "zod";
var CreateProductSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  animalType: z.nativeEnum(AnimalType),
  subcategoryId: z.string().min(1).nullable().optional(),
  promoPrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).max(50),
  isFeatured: z.boolean().default(false),
  isRecommended: z.boolean().default(false)
});
var UpdateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  animalType: z.nativeEnum(AnimalType).optional(),
  subcategoryId: z.string().min(1).optional(),
  promoPrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).max(50).optional(),
  isFeatured: z.boolean().optional(),
  isRecommended: z.boolean().optional()
});
var ProductFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  onlyActive: z.coerce.boolean().optional().default(true),
  onlyInStock: z.coerce.boolean().optional(),
  animalType: z.nativeEnum(AnimalType).optional(),
  subcategoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
var ToggleFeaturedSchema = z.object({
  isFeatured: z.boolean()
});
var ToggleRecommendedSchema = z.object({
  isRecommended: z.boolean()
});

// src/application/use-cases/product/ToggleFeaturedUseCase.ts
import { inject as inject6, injectable as injectable11 } from "tsyringe";
function _ts_decorate11(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate11, "_ts_decorate");
function _ts_metadata7(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata7, "_ts_metadata");
function _ts_param6(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param6, "_ts_param");
var ToggleFeaturedUseCase = class {
  static {
    __name(this, "ToggleFeaturedUseCase");
  }
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(id, isFeatured) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto n\xE3o encontrado", 404);
    }
    await this.productRepository.updateFeatured(id, isFeatured);
  }
};
ToggleFeaturedUseCase = _ts_decorate11([
  injectable11(),
  _ts_param6(0, inject6("ProductRepository")),
  _ts_metadata7("design:type", Function),
  _ts_metadata7("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository
  ])
], ToggleFeaturedUseCase);

// src/application/use-cases/product/ToggleRecommendedUseCase.ts
import { inject as inject7, injectable as injectable12 } from "tsyringe";
function _ts_decorate12(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate12, "_ts_decorate");
function _ts_metadata8(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata8, "_ts_metadata");
function _ts_param7(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param7, "_ts_param");
var ToggleRecommendedUseCase = class {
  static {
    __name(this, "ToggleRecommendedUseCase");
  }
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(id, isRecommended) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Produto n\xE3o encontrado", 404);
    }
    await this.productRepository.updateRecommended(id, isRecommended);
  }
};
ToggleRecommendedUseCase = _ts_decorate12([
  injectable12(),
  _ts_param7(0, inject7("ProductRepository")),
  _ts_metadata8("design:type", Function),
  _ts_metadata8("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository
  ])
], ToggleRecommendedUseCase);

// src/infrastructure/http/presenters/ProductPresenter.ts
var ProductPresenter = class {
  static {
    __name(this, "ProductPresenter");
  }
  static toHTTP(product) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.getValue(),
      priceFormatted: product.price.format(),
      animalType: product.animalType,
      subcategoryId: product.subcategoryId,
      promoPrice: product.promoPrice?.getValue() ?? null,
      promoPriceFormatted: product.promoPrice?.format() ?? null,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isRecommended: product.isRecommended,
      isAvailable: product.isAvailable(),
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isMain: img.isMain
      })),
      mainImage: product.mainImage?.url ?? null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  }
};

// src/infrastructure/http/controllers/ProductController.ts
var ProductController = class {
  static {
    __name(this, "ProductController");
  }
  async create(request, reply) {
    const data = CreateProductSchema.parse(request.body);
    const createProductUseCase = container2.resolve(CreateProductUseCase);
    const product = await createProductUseCase.execute(data);
    return reply.status(201).send(ProductPresenter.toHTTP(product));
  }
  async list(request, reply) {
    const filters = ProductFiltersSchema.parse(request.query);
    const listProductsUseCase = container2.resolve(ListProductsUseCase);
    const result = await listProductsUseCase.execute(filters);
    return reply.send({
      data: result.data.map(ProductPresenter.toHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  }
  async get(request, reply) {
    const { id } = request.params;
    const getProductUseCase = container2.resolve(GetProductUseCase);
    const product = await getProductUseCase.execute(id);
    return reply.send(ProductPresenter.toHTTP(product));
  }
  async update(request, reply) {
    const { id } = request.params;
    const data = UpdateProductSchema.parse(request.body);
    const updateProductUseCase = container2.resolve(UpdateProductUseCase);
    const product = await updateProductUseCase.execute(id, data);
    return reply.send(ProductPresenter.toHTTP(product));
  }
  async delete(request, reply) {
    const { id } = request.params;
    const deleteProductUseCase = container2.resolve(DeleteProductUseCase);
    await deleteProductUseCase.execute(id);
    return reply.status(204).send();
  }
  async toggleFeatured(request, reply) {
    const { id } = request.params;
    const { isFeatured } = ToggleFeaturedSchema.parse(request.body);
    const useCase = container2.resolve(ToggleFeaturedUseCase);
    await useCase.execute(id, isFeatured);
    return reply.send({
      isFeatured
    });
  }
  async toggleRecommended(request, reply) {
    const { id } = request.params;
    const { isRecommended } = ToggleRecommendedSchema.parse(request.body);
    const useCase = container2.resolve(ToggleRecommendedUseCase);
    await useCase.execute(id, isRecommended);
    return reply.send({
      isRecommended
    });
  }
};

// src/infrastructure/http/controllers/AuthController.ts
import { container as container3 } from "tsyringe";

// src/application/use-cases/auth/RegisterUseCase.ts
import { inject as inject8, injectable as injectable13 } from "tsyringe";
import { randomUUID as randomUUID3 } from "crypto";
function _ts_decorate13(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate13, "_ts_decorate");
function _ts_metadata9(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata9, "_ts_metadata");
function _ts_param8(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param8, "_ts_param");
var RegisterUseCase = class {
  static {
    __name(this, "RegisterUseCase");
  }
  userRepository;
  hashProvider;
  constructor(userRepository, hashProvider) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }
  async execute(data) {
    const email = Email.create(data.email);
    const existingUser = await this.userRepository.findByEmail(email.getValue());
    if (existingUser) {
      throw new AppError("Email j\xE1 cadastrado", 409);
    }
    const passwordHash = await this.hashProvider.hash(data.password);
    const user = new User({
      id: randomUUID3(),
      email,
      passwordHash,
      name: data.name,
      role: UserRole.CUSTOMER,
      phone: data.phone,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const createdUser = await this.userRepository.create(user);
    return {
      user: {
        id: createdUser.id,
        email: createdUser.email.getValue(),
        name: createdUser.name,
        role: createdUser.role
      }
    };
  }
};
RegisterUseCase = _ts_decorate13([
  injectable13(),
  _ts_param8(0, inject8("UserRepository")),
  _ts_param8(1, inject8("HashProvider")),
  _ts_metadata9("design:type", Function),
  _ts_metadata9("design:paramtypes", [
    typeof IUserRepository === "undefined" ? Object : IUserRepository,
    typeof IHashProvider === "undefined" ? Object : IHashProvider
  ])
], RegisterUseCase);

// src/application/use-cases/auth/LoginUseCase.ts
import { inject as inject9, injectable as injectable14 } from "tsyringe";
function _ts_decorate14(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate14, "_ts_decorate");
function _ts_metadata10(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata10, "_ts_metadata");
function _ts_param9(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param9, "_ts_param");
var LoginUseCase = class {
  static {
    __name(this, "LoginUseCase");
  }
  userRepository;
  hashProvider;
  constructor(userRepository, hashProvider) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }
  async execute(data) {
    const user = await this.userRepository.findByEmail(data.email.toLowerCase());
    if (!user) {
      throw new AppError("Email ou senha inv\xE1lidos", 401);
    }
    const passwordMatch = await this.hashProvider.compare(data.password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError("Email ou senha inv\xE1lidos", 401);
    }
    return {
      user: {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role
      }
    };
  }
};
LoginUseCase = _ts_decorate14([
  injectable14(),
  _ts_param9(0, inject9("UserRepository")),
  _ts_param9(1, inject9("HashProvider")),
  _ts_metadata10("design:type", Function),
  _ts_metadata10("design:paramtypes", [
    typeof IUserRepository === "undefined" ? Object : IUserRepository,
    typeof IHashProvider === "undefined" ? Object : IHashProvider
  ])
], LoginUseCase);

// src/application/dtos/AuthDTO.ts
import { z as z2 } from "zod";
var RegisterSchema = z2.object({
  email: z2.string().email(),
  password: z2.string().min(6),
  name: z2.string().min(2).max(100),
  phone: z2.string().optional()
});
var LoginSchema = z2.object({
  email: z2.string().email(),
  password: z2.string()
});

// src/infrastructure/http/controllers/AuthController.ts
var AuthController = class {
  static {
    __name(this, "AuthController");
  }
  async register(request, reply) {
    const data = RegisterSchema.parse(request.body);
    const registerUseCase = container3.resolve(RegisterUseCase);
    const result = await registerUseCase.execute(data);
    const token = await reply.jwtSign({
      id: result.user.id,
      role: result.user.role
    }, {
      expiresIn: "7d"
    });
    return reply.status(201).send({
      user: result.user,
      token
    });
  }
  async login(request, reply) {
    const data = LoginSchema.parse(request.body);
    const loginUseCase = container3.resolve(LoginUseCase);
    const result = await loginUseCase.execute(data);
    const token = await reply.jwtSign({
      id: result.user.id,
      role: result.user.role
    }, {
      expiresIn: "7d"
    });
    return reply.send({
      user: result.user,
      token
    });
  }
};

// src/infrastructure/http/routes/public.routes.ts
var productController = new ProductController();
var authController = new AuthController();
async function publicRoutes(app) {
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
  app.get("/products", productController.list);
  app.get("/products/:id", productController.get);
}
__name(publicRoutes, "publicRoutes");

// src/infrastructure/http/controllers/SubcategoryController.ts
import { container as container4 } from "tsyringe";

// src/application/use-cases/subcategory/CreateSubcategoryUseCase.ts
import { inject as inject10, injectable as injectable15 } from "tsyringe";
function _ts_decorate15(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate15, "_ts_decorate");
function _ts_metadata11(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata11, "_ts_metadata");
function _ts_param10(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param10, "_ts_param");
var CreateSubcategoryUseCase = class {
  static {
    __name(this, "CreateSubcategoryUseCase");
  }
  subcategoryRepository;
  constructor(subcategoryRepository) {
    this.subcategoryRepository = subcategoryRepository;
  }
  async execute(data) {
    const existing = await this.subcategoryRepository.findById(data.id);
    if (existing) {
      throw new AppError("J\xE1 existe uma subcategoria com este ID", 409);
    }
    const now = /* @__PURE__ */ new Date();
    const subcategory = new Subcategory({
      id: data.id,
      animalType: data.animalType,
      name: data.name,
      icon: data.icon,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });
    return this.subcategoryRepository.create(subcategory);
  }
};
CreateSubcategoryUseCase = _ts_decorate15([
  injectable15(),
  _ts_param10(0, inject10("SubcategoryRepository")),
  _ts_metadata11("design:type", Function),
  _ts_metadata11("design:paramtypes", [
    typeof ISubcategoryRepository === "undefined" ? Object : ISubcategoryRepository
  ])
], CreateSubcategoryUseCase);

// src/application/use-cases/subcategory/ListSubcategoriesUseCase.ts
import { inject as inject11, injectable as injectable16 } from "tsyringe";
function _ts_decorate16(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate16, "_ts_decorate");
function _ts_metadata12(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata12, "_ts_metadata");
function _ts_param11(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param11, "_ts_param");
var ListSubcategoriesUseCase = class {
  static {
    __name(this, "ListSubcategoriesUseCase");
  }
  subcategoryRepository;
  constructor(subcategoryRepository) {
    this.subcategoryRepository = subcategoryRepository;
  }
  async execute() {
    return this.subcategoryRepository.findAllWithCounts();
  }
};
ListSubcategoriesUseCase = _ts_decorate16([
  injectable16(),
  _ts_param11(0, inject11("SubcategoryRepository")),
  _ts_metadata12("design:type", Function),
  _ts_metadata12("design:paramtypes", [
    typeof ISubcategoryRepository === "undefined" ? Object : ISubcategoryRepository
  ])
], ListSubcategoriesUseCase);

// src/application/use-cases/subcategory/UpdateSubcategoryUseCase.ts
import { inject as inject12, injectable as injectable17 } from "tsyringe";
function _ts_decorate17(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate17, "_ts_decorate");
function _ts_metadata13(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata13, "_ts_metadata");
function _ts_param12(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param12, "_ts_param");
var UpdateSubcategoryUseCase = class {
  static {
    __name(this, "UpdateSubcategoryUseCase");
  }
  subcategoryRepository;
  constructor(subcategoryRepository) {
    this.subcategoryRepository = subcategoryRepository;
  }
  async execute(id, data) {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new AppError("Subcategoria n\xE3o encontrada", 404);
    }
    subcategory.update({
      name: data.name,
      icon: data.icon,
      isActive: data.isActive
    });
    return this.subcategoryRepository.update(subcategory);
  }
};
UpdateSubcategoryUseCase = _ts_decorate17([
  injectable17(),
  _ts_param12(0, inject12("SubcategoryRepository")),
  _ts_metadata13("design:type", Function),
  _ts_metadata13("design:paramtypes", [
    typeof ISubcategoryRepository === "undefined" ? Object : ISubcategoryRepository
  ])
], UpdateSubcategoryUseCase);

// src/application/use-cases/subcategory/DeleteSubcategoryUseCase.ts
import { inject as inject13, injectable as injectable18 } from "tsyringe";
function _ts_decorate18(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate18, "_ts_decorate");
function _ts_metadata14(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata14, "_ts_metadata");
function _ts_param13(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param13, "_ts_param");
var DeleteSubcategoryUseCase = class {
  static {
    __name(this, "DeleteSubcategoryUseCase");
  }
  subcategoryRepository;
  constructor(subcategoryRepository) {
    this.subcategoryRepository = subcategoryRepository;
  }
  async execute(id) {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new AppError("Subcategoria n\xE3o encontrada", 404);
    }
    const productCount = await this.subcategoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new AppError("Categoria possui produtos vinculados", 409);
    }
    await this.subcategoryRepository.delete(id);
  }
};
DeleteSubcategoryUseCase = _ts_decorate18([
  injectable18(),
  _ts_param13(0, inject13("SubcategoryRepository")),
  _ts_metadata14("design:type", Function),
  _ts_metadata14("design:paramtypes", [
    typeof ISubcategoryRepository === "undefined" ? Object : ISubcategoryRepository
  ])
], DeleteSubcategoryUseCase);

// src/application/dtos/SubcategoryDTO.ts
import { z as z3 } from "zod";
var CreateSubcategorySchema = z3.object({
  id: z3.string().min(1).max(50),
  animalType: z3.nativeEnum(AnimalType),
  name: z3.string().min(2).max(100),
  icon: z3.string().min(1).max(50)
});
var UpdateSubcategorySchema = z3.object({
  name: z3.string().min(2).max(100).optional(),
  icon: z3.string().min(1).max(50).optional(),
  isActive: z3.boolean().optional()
});

// src/infrastructure/http/presenters/SubcategoryPresenter.ts
var SubcategoryPresenter = class _SubcategoryPresenter {
  static {
    __name(this, "SubcategoryPresenter");
  }
  static toHTTP(subcategory) {
    return {
      id: subcategory.id,
      animalType: subcategory.animalType,
      name: subcategory.name,
      icon: subcategory.icon,
      isActive: subcategory.isActive,
      createdAt: subcategory.createdAt.toISOString(),
      updatedAt: subcategory.updatedAt.toISOString()
    };
  }
  static toHTTPWithCount(item) {
    return {
      ..._SubcategoryPresenter.toHTTP(item.subcategory),
      productCount: item.productCount
    };
  }
  static toGroupedHTTP(items) {
    const grouped = {
      [AnimalType.GATO]: [],
      [AnimalType.CACHORRO]: []
    };
    for (const item of items) {
      grouped[item.subcategory.animalType]?.push(_SubcategoryPresenter.toHTTPWithCount(item));
    }
    return grouped;
  }
};

// src/infrastructure/http/controllers/SubcategoryController.ts
var SubcategoryController = class {
  static {
    __name(this, "SubcategoryController");
  }
  async list(request, reply) {
    const listSubcategoriesUseCase = container4.resolve(ListSubcategoriesUseCase);
    const result = await listSubcategoriesUseCase.execute();
    return reply.send(SubcategoryPresenter.toGroupedHTTP(result));
  }
  async create(request, reply) {
    const data = CreateSubcategorySchema.parse(request.body);
    const createSubcategoryUseCase = container4.resolve(CreateSubcategoryUseCase);
    const subcategory = await createSubcategoryUseCase.execute(data);
    return reply.status(201).send(SubcategoryPresenter.toHTTP(subcategory));
  }
  async update(request, reply) {
    const { id } = request.params;
    const data = UpdateSubcategorySchema.parse(request.body);
    const updateSubcategoryUseCase = container4.resolve(UpdateSubcategoryUseCase);
    const subcategory = await updateSubcategoryUseCase.execute(id, data);
    return reply.send(SubcategoryPresenter.toHTTP(subcategory));
  }
  async delete(request, reply) {
    const { id } = request.params;
    const deleteSubcategoryUseCase = container4.resolve(DeleteSubcategoryUseCase);
    await deleteSubcategoryUseCase.execute(id);
    return reply.status(204).send();
  }
};

// src/infrastructure/http/controllers/OrderController.ts
import { container as container5 } from "tsyringe";

// src/application/use-cases/order/ListOrdersUseCase.ts
import { inject as inject14, injectable as injectable19 } from "tsyringe";
function _ts_decorate19(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate19, "_ts_decorate");
function _ts_metadata15(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata15, "_ts_metadata");
function _ts_param14(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param14, "_ts_param");
var ListOrdersUseCase = class {
  static {
    __name(this, "ListOrdersUseCase");
  }
  orderRepository;
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }
  async execute(filters) {
    const { page, limit, dateFrom, dateTo, ...rest } = filters;
    return this.orderRepository.findAll({
      ...rest,
      startDate: dateFrom,
      endDate: dateTo
    }, {
      page,
      limit
    });
  }
};
ListOrdersUseCase = _ts_decorate19([
  injectable19(),
  _ts_param14(0, inject14("OrderRepository")),
  _ts_metadata15("design:type", Function),
  _ts_metadata15("design:paramtypes", [
    typeof IOrderRepository === "undefined" ? Object : IOrderRepository
  ])
], ListOrdersUseCase);

// src/application/use-cases/order/GetOrderUseCase.ts
import { inject as inject15, injectable as injectable20 } from "tsyringe";
function _ts_decorate20(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate20, "_ts_decorate");
function _ts_metadata16(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata16, "_ts_metadata");
function _ts_param15(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param15, "_ts_param");
var GetOrderUseCase = class {
  static {
    __name(this, "GetOrderUseCase");
  }
  orderRepository;
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }
  async execute(id) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new AppError("Pedido n\xE3o encontrado", 404);
    }
    return order;
  }
};
GetOrderUseCase = _ts_decorate20([
  injectable20(),
  _ts_param15(0, inject15("OrderRepository")),
  _ts_metadata16("design:type", Function),
  _ts_metadata16("design:paramtypes", [
    typeof IOrderRepository === "undefined" ? Object : IOrderRepository
  ])
], GetOrderUseCase);

// src/application/use-cases/order/UpdateOrderStatusUseCase.ts
import { inject as inject16, injectable as injectable21 } from "tsyringe";
function _ts_decorate21(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate21, "_ts_decorate");
function _ts_metadata17(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata17, "_ts_metadata");
function _ts_param16(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param16, "_ts_param");
var UpdateOrderStatusUseCase = class {
  static {
    __name(this, "UpdateOrderStatusUseCase");
  }
  orderRepository;
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }
  async execute(id, status, notes) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new AppError("Pedido n\xE3o encontrado", 404);
    }
    order.updateStatus(status);
    const updated = await this.orderRepository.update(order);
    await this.orderRepository.addStatusHistory(id, status, notes);
    return updated;
  }
};
UpdateOrderStatusUseCase = _ts_decorate21([
  injectable21(),
  _ts_param16(0, inject16("OrderRepository")),
  _ts_metadata17("design:type", Function),
  _ts_metadata17("design:paramtypes", [
    typeof IOrderRepository === "undefined" ? Object : IOrderRepository
  ])
], UpdateOrderStatusUseCase);

// src/application/use-cases/order/UpdateTrackingCodeUseCase.ts
import { inject as inject17, injectable as injectable22 } from "tsyringe";
function _ts_decorate22(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate22, "_ts_decorate");
function _ts_metadata18(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata18, "_ts_metadata");
function _ts_param17(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param17, "_ts_param");
var UpdateTrackingCodeUseCase = class {
  static {
    __name(this, "UpdateTrackingCodeUseCase");
  }
  orderRepository;
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }
  async execute(id, trackingCode) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new AppError("Pedido n\xE3o encontrado", 404);
    }
    await this.orderRepository.updateTrackingCode(id, trackingCode);
  }
};
UpdateTrackingCodeUseCase = _ts_decorate22([
  injectable22(),
  _ts_param17(0, inject17("OrderRepository")),
  _ts_metadata18("design:type", Function),
  _ts_metadata18("design:paramtypes", [
    typeof IOrderRepository === "undefined" ? Object : IOrderRepository
  ])
], UpdateTrackingCodeUseCase);

// src/application/dtos/OrderDTO.ts
import { z as z4 } from "zod";
var CreateOrderSchema = z4.object({
  paymentMethod: z4.nativeEnum(PaymentMethod),
  notes: z4.string().optional(),
  pickupLocation: z4.string().optional()
});
var UpdateOrderStatusSchema = z4.object({
  status: z4.nativeEnum(OrderStatus),
  notes: z4.string().optional()
});
var AdminOrderFiltersSchema = z4.object({
  search: z4.string().optional(),
  status: z4.nativeEnum(OrderStatus).optional(),
  dateFrom: z4.coerce.date().optional(),
  dateTo: z4.coerce.date().optional(),
  page: z4.coerce.number().int().min(1).default(1),
  limit: z4.coerce.number().int().min(1).max(100).default(20)
});
var UpdateTrackingSchema = z4.object({
  trackingCode: z4.string().min(1)
});

// src/infrastructure/http/presenters/OrderPresenter.ts
var OrderPresenter = class {
  static {
    __name(this, "OrderPresenter");
  }
  static toHTTP(order) {
    return {
      id: order.id,
      customerId: order.customerId,
      adminId: order.adminId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal.getValue(),
      subtotalFormatted: order.subtotal.format(),
      discount: order.discount.getValue(),
      discountFormatted: order.discount.format(),
      total: order.total.getValue(),
      totalFormatted: order.total.format(),
      notes: order.notes,
      trackingCode: order.trackingCode,
      pickupLocation: order.pickupLocation,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.getValue(),
        unitPriceFormatted: item.unitPrice.format(),
        total: item.total.getValue(),
        totalFormatted: item.total.format()
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }
  static toListHTTP(order) {
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      total: order.total.getValue(),
      totalFormatted: order.total.format(),
      trackingCode: order.trackingCode,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString()
    };
  }
};

// src/infrastructure/http/controllers/OrderController.ts
var OrderController = class {
  static {
    __name(this, "OrderController");
  }
  async list(request, reply) {
    const filters = AdminOrderFiltersSchema.parse(request.query);
    const listOrdersUseCase = container5.resolve(ListOrdersUseCase);
    const result = await listOrdersUseCase.execute(filters);
    return reply.send({
      data: result.data.map(OrderPresenter.toListHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  }
  async get(request, reply) {
    const { id } = request.params;
    const getOrderUseCase = container5.resolve(GetOrderUseCase);
    const order = await getOrderUseCase.execute(id);
    return reply.send(OrderPresenter.toHTTP(order));
  }
  async updateStatus(request, reply) {
    const { id } = request.params;
    const { status, notes } = UpdateOrderStatusSchema.parse(request.body);
    const updateOrderStatusUseCase = container5.resolve(UpdateOrderStatusUseCase);
    const order = await updateOrderStatusUseCase.execute(id, status, notes);
    return reply.send(OrderPresenter.toHTTP(order));
  }
  async updateTracking(request, reply) {
    const { id } = request.params;
    const { trackingCode } = UpdateTrackingSchema.parse(request.body);
    const updateTrackingCodeUseCase = container5.resolve(UpdateTrackingCodeUseCase);
    await updateTrackingCodeUseCase.execute(id, trackingCode);
    return reply.status(200).send({
      message: "C\xF3digo de rastreio atualizado com sucesso"
    });
  }
};

// src/infrastructure/http/controllers/CustomerController.ts
import { container as container6 } from "tsyringe";

// src/application/use-cases/customer/ListCustomersUseCase.ts
import { inject as inject18, injectable as injectable23 } from "tsyringe";
function _ts_decorate23(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate23, "_ts_decorate");
function _ts_metadata19(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata19, "_ts_metadata");
function _ts_param18(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param18, "_ts_param");
var ListCustomersUseCase = class {
  static {
    __name(this, "ListCustomersUseCase");
  }
  customerRepository;
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }
  async execute(filters) {
    const { page, limit, status, ...rest } = filters;
    const customerFilters = {};
    if (rest.search) {
      customerFilters.search = rest.search;
    }
    if (status !== void 0) {
      customerFilters.isActive = status === "active";
    }
    const [paginatedResult, stats] = await Promise.all([
      this.customerRepository.findAll(customerFilters, {
        page,
        limit
      }),
      this.customerRepository.getStats()
    ]);
    return {
      ...paginatedResult,
      stats
    };
  }
};
ListCustomersUseCase = _ts_decorate23([
  injectable23(),
  _ts_param18(0, inject18("CustomerRepository")),
  _ts_metadata19("design:type", Function),
  _ts_metadata19("design:paramtypes", [
    typeof ICustomerRepository === "undefined" ? Object : ICustomerRepository
  ])
], ListCustomersUseCase);

// src/application/use-cases/customer/GetCustomerUseCase.ts
import { inject as inject19, injectable as injectable24 } from "tsyringe";
function _ts_decorate24(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate24, "_ts_decorate");
function _ts_metadata20(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata20, "_ts_metadata");
function _ts_param19(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param19, "_ts_param");
var GetCustomerUseCase = class {
  static {
    __name(this, "GetCustomerUseCase");
  }
  customerRepository;
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }
  async execute(id) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new AppError("Cliente n\xE3o encontrado", 404);
    }
    return customer;
  }
};
GetCustomerUseCase = _ts_decorate24([
  injectable24(),
  _ts_param19(0, inject19("CustomerRepository")),
  _ts_metadata20("design:type", Function),
  _ts_metadata20("design:paramtypes", [
    typeof ICustomerRepository === "undefined" ? Object : ICustomerRepository
  ])
], GetCustomerUseCase);

// src/application/use-cases/customer/UpdateCustomerStatusUseCase.ts
import { inject as inject20, injectable as injectable25 } from "tsyringe";
function _ts_decorate25(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate25, "_ts_decorate");
function _ts_metadata21(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata21, "_ts_metadata");
function _ts_param20(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param20, "_ts_param");
var UpdateCustomerStatusUseCase = class {
  static {
    __name(this, "UpdateCustomerStatusUseCase");
  }
  customerRepository;
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }
  async execute(id, status) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new AppError("Cliente n\xE3o encontrado", 404);
    }
    const isActive = status === "active";
    await this.customerRepository.updateStatus(customer.userId, isActive);
  }
};
UpdateCustomerStatusUseCase = _ts_decorate25([
  injectable25(),
  _ts_param20(0, inject20("CustomerRepository")),
  _ts_metadata21("design:type", Function),
  _ts_metadata21("design:paramtypes", [
    typeof ICustomerRepository === "undefined" ? Object : ICustomerRepository
  ])
], UpdateCustomerStatusUseCase);

// src/application/dtos/CustomerDTO.ts
import { z as z5 } from "zod";
var CustomerFiltersSchema = z5.object({
  search: z5.string().optional(),
  status: z5.enum([
    "active",
    "inactive"
  ]).optional(),
  page: z5.coerce.number().int().min(1).default(1),
  limit: z5.coerce.number().int().min(1).max(100).default(20)
});
var UpdateCustomerStatusSchema = z5.object({
  status: z5.enum([
    "active",
    "inactive"
  ])
});

// src/infrastructure/http/presenters/CustomerPresenter.ts
var CustomerPresenter = class {
  static {
    __name(this, "CustomerPresenter");
  }
  static toHTTP(customer) {
    return {
      id: customer.id,
      userId: customer.userId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cpf: customer.cpf,
      birthDate: customer.birthDate?.toISOString() ?? null,
      isActive: customer.isActive,
      status: customer.isActive ? "active" : "inactive",
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      lastOrderDate: customer.lastOrderDate?.toISOString() ?? null,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString()
    };
  }
};

// src/infrastructure/http/controllers/CustomerController.ts
var CustomerController = class {
  static {
    __name(this, "CustomerController");
  }
  async list(request, reply) {
    const filters = CustomerFiltersSchema.parse(request.query);
    const listCustomersUseCase = container6.resolve(ListCustomersUseCase);
    const result = await listCustomersUseCase.execute(filters);
    return reply.send({
      data: result.data.map(CustomerPresenter.toHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      stats: result.stats
    });
  }
  async get(request, reply) {
    const { id } = request.params;
    const getCustomerUseCase = container6.resolve(GetCustomerUseCase);
    const customer = await getCustomerUseCase.execute(id);
    return reply.send(CustomerPresenter.toHTTP(customer));
  }
  async updateStatus(request, reply) {
    const { id } = request.params;
    const { status } = UpdateCustomerStatusSchema.parse(request.body);
    const updateCustomerStatusUseCase = container6.resolve(UpdateCustomerStatusUseCase);
    await updateCustomerStatusUseCase.execute(id, status);
    return reply.status(200).send({
      message: status === "active" ? "Cliente ativado com sucesso" : "Cliente desativado com sucesso"
    });
  }
};

// src/infrastructure/http/controllers/ReviewController.ts
import { container as container7 } from "tsyringe";

// src/application/use-cases/review/ListReviewsUseCase.ts
import { inject as inject21, injectable as injectable26 } from "tsyringe";
function _ts_decorate26(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate26, "_ts_decorate");
function _ts_metadata22(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata22, "_ts_metadata");
function _ts_param21(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param21, "_ts_param");
var ListReviewsUseCase = class {
  static {
    __name(this, "ListReviewsUseCase");
  }
  reviewRepository;
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }
  async execute(filters) {
    const { page, limit, ...reviewFilters } = filters;
    const [paginatedResult, stats] = await Promise.all([
      this.reviewRepository.findAll(reviewFilters, {
        page,
        limit
      }),
      this.reviewRepository.getStats()
    ]);
    return {
      ...paginatedResult,
      stats
    };
  }
};
ListReviewsUseCase = _ts_decorate26([
  injectable26(),
  _ts_param21(0, inject21("ReviewRepository")),
  _ts_metadata22("design:type", Function),
  _ts_metadata22("design:paramtypes", [
    typeof IReviewRepository === "undefined" ? Object : IReviewRepository
  ])
], ListReviewsUseCase);

// src/application/use-cases/review/ApproveReviewUseCase.ts
import { inject as inject22, injectable as injectable27 } from "tsyringe";
function _ts_decorate27(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate27, "_ts_decorate");
function _ts_metadata23(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata23, "_ts_metadata");
function _ts_param22(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param22, "_ts_param");
var ApproveReviewUseCase = class {
  static {
    __name(this, "ApproveReviewUseCase");
  }
  reviewRepository;
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }
  async execute(id) {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new AppError("Avalia\xE7\xE3o n\xE3o encontrada", 404);
    }
    review.approve();
    return this.reviewRepository.update(review);
  }
};
ApproveReviewUseCase = _ts_decorate27([
  injectable27(),
  _ts_param22(0, inject22("ReviewRepository")),
  _ts_metadata23("design:type", Function),
  _ts_metadata23("design:paramtypes", [
    typeof IReviewRepository === "undefined" ? Object : IReviewRepository
  ])
], ApproveReviewUseCase);

// src/application/use-cases/review/RejectReviewUseCase.ts
import { inject as inject23, injectable as injectable28 } from "tsyringe";
function _ts_decorate28(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate28, "_ts_decorate");
function _ts_metadata24(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata24, "_ts_metadata");
function _ts_param23(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param23, "_ts_param");
var RejectReviewUseCase = class {
  static {
    __name(this, "RejectReviewUseCase");
  }
  reviewRepository;
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }
  async execute(id) {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new AppError("Avalia\xE7\xE3o n\xE3o encontrada", 404);
    }
    review.reject();
    return this.reviewRepository.update(review);
  }
};
RejectReviewUseCase = _ts_decorate28([
  injectable28(),
  _ts_param23(0, inject23("ReviewRepository")),
  _ts_metadata24("design:type", Function),
  _ts_metadata24("design:paramtypes", [
    typeof IReviewRepository === "undefined" ? Object : IReviewRepository
  ])
], RejectReviewUseCase);

// src/application/use-cases/review/DeleteReviewUseCase.ts
import { inject as inject24, injectable as injectable29 } from "tsyringe";
function _ts_decorate29(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate29, "_ts_decorate");
function _ts_metadata25(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata25, "_ts_metadata");
function _ts_param24(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param24, "_ts_param");
var DeleteReviewUseCase = class {
  static {
    __name(this, "DeleteReviewUseCase");
  }
  reviewRepository;
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }
  async execute(id) {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new AppError("Avalia\xE7\xE3o n\xE3o encontrada", 404);
    }
    await this.reviewRepository.delete(id);
  }
};
DeleteReviewUseCase = _ts_decorate29([
  injectable29(),
  _ts_param24(0, inject24("ReviewRepository")),
  _ts_metadata25("design:type", Function),
  _ts_metadata25("design:paramtypes", [
    typeof IReviewRepository === "undefined" ? Object : IReviewRepository
  ])
], DeleteReviewUseCase);

// src/application/dtos/ReviewDTO.ts
import { z as z6 } from "zod";
var ReviewFiltersSchema = z6.object({
  search: z6.string().optional(),
  productId: z6.string().uuid().optional(),
  status: z6.nativeEnum(ReviewStatus).optional(),
  page: z6.coerce.number().int().min(1).default(1),
  limit: z6.coerce.number().int().min(1).max(100).default(20)
});

// src/infrastructure/http/presenters/ReviewPresenter.ts
var ReviewPresenter = class {
  static {
    __name(this, "ReviewPresenter");
  }
  static toHTTP(review) {
    return {
      id: review.id,
      productId: review.productId,
      productName: review.productName ?? null,
      authorId: review.authorId,
      authorName: review.authorName ?? null,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString()
    };
  }
};

// src/infrastructure/http/controllers/ReviewController.ts
var ReviewController = class {
  static {
    __name(this, "ReviewController");
  }
  async list(request, reply) {
    const filters = ReviewFiltersSchema.parse(request.query);
    const listReviewsUseCase = container7.resolve(ListReviewsUseCase);
    const result = await listReviewsUseCase.execute(filters);
    return reply.send({
      data: result.data.map(ReviewPresenter.toHTTP),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      stats: result.stats
    });
  }
  async approve(request, reply) {
    const { id } = request.params;
    const approveReviewUseCase = container7.resolve(ApproveReviewUseCase);
    const review = await approveReviewUseCase.execute(id);
    return reply.send(ReviewPresenter.toHTTP(review));
  }
  async reject(request, reply) {
    const { id } = request.params;
    const rejectReviewUseCase = container7.resolve(RejectReviewUseCase);
    const review = await rejectReviewUseCase.execute(id);
    return reply.send(ReviewPresenter.toHTTP(review));
  }
  async delete(request, reply) {
    const { id } = request.params;
    const deleteReviewUseCase = container7.resolve(DeleteReviewUseCase);
    await deleteReviewUseCase.execute(id);
    return reply.status(204).send();
  }
};

// src/infrastructure/http/controllers/DashboardController.ts
import { container as container8 } from "tsyringe";

// src/application/use-cases/dashboard/GetDashboardStatsUseCase.ts
import { inject as inject25, injectable as injectable30 } from "tsyringe";
function _ts_decorate30(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate30, "_ts_decorate");
function _ts_metadata26(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata26, "_ts_metadata");
function _ts_param25(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param25, "_ts_param");
var GetDashboardStatsUseCase = class {
  static {
    __name(this, "GetDashboardStatsUseCase");
  }
  dashboardRepository;
  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }
  async execute(period) {
    return this.dashboardRepository.getStats(period);
  }
};
GetDashboardStatsUseCase = _ts_decorate30([
  injectable30(),
  _ts_param25(0, inject25("DashboardRepository")),
  _ts_metadata26("design:type", Function),
  _ts_metadata26("design:paramtypes", [
    typeof IDashboardRepository === "undefined" ? Object : IDashboardRepository
  ])
], GetDashboardStatsUseCase);

// src/application/use-cases/dashboard/GetSalesChartUseCase.ts
import { inject as inject26, injectable as injectable31 } from "tsyringe";
function _ts_decorate31(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate31, "_ts_decorate");
function _ts_metadata27(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata27, "_ts_metadata");
function _ts_param26(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param26, "_ts_param");
var GetSalesChartUseCase = class {
  static {
    __name(this, "GetSalesChartUseCase");
  }
  dashboardRepository;
  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }
  async execute(period) {
    return this.dashboardRepository.getSalesChart(period);
  }
};
GetSalesChartUseCase = _ts_decorate31([
  injectable31(),
  _ts_param26(0, inject26("DashboardRepository")),
  _ts_metadata27("design:type", Function),
  _ts_metadata27("design:paramtypes", [
    typeof IDashboardRepository === "undefined" ? Object : IDashboardRepository
  ])
], GetSalesChartUseCase);

// src/application/use-cases/dashboard/GetTopProductsUseCase.ts
import { inject as inject27, injectable as injectable32 } from "tsyringe";
function _ts_decorate32(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate32, "_ts_decorate");
function _ts_metadata28(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata28, "_ts_metadata");
function _ts_param27(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param27, "_ts_param");
var GetTopProductsUseCase = class {
  static {
    __name(this, "GetTopProductsUseCase");
  }
  dashboardRepository;
  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }
  async execute(limit) {
    return this.dashboardRepository.getTopProducts(limit);
  }
};
GetTopProductsUseCase = _ts_decorate32([
  injectable32(),
  _ts_param27(0, inject27("DashboardRepository")),
  _ts_metadata28("design:type", Function),
  _ts_metadata28("design:paramtypes", [
    typeof IDashboardRepository === "undefined" ? Object : IDashboardRepository
  ])
], GetTopProductsUseCase);

// src/application/use-cases/dashboard/GetRecentOrdersUseCase.ts
import { inject as inject28, injectable as injectable33 } from "tsyringe";
function _ts_decorate33(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate33, "_ts_decorate");
function _ts_metadata29(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata29, "_ts_metadata");
function _ts_param28(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param28, "_ts_param");
var GetRecentOrdersUseCase = class {
  static {
    __name(this, "GetRecentOrdersUseCase");
  }
  dashboardRepository;
  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }
  async execute(limit) {
    return this.dashboardRepository.getRecentOrders(limit);
  }
};
GetRecentOrdersUseCase = _ts_decorate33([
  injectable33(),
  _ts_param28(0, inject28("DashboardRepository")),
  _ts_metadata29("design:type", Function),
  _ts_metadata29("design:paramtypes", [
    typeof IDashboardRepository === "undefined" ? Object : IDashboardRepository
  ])
], GetRecentOrdersUseCase);

// src/application/dtos/DashboardDTO.ts
import { z as z7 } from "zod";
var DashboardStatsQuerySchema = z7.object({
  period: z7.enum([
    "7d",
    "30d",
    "6m"
  ]).default("30d")
});
var DashboardChartQuerySchema = z7.object({
  period: z7.enum([
    "7d",
    "30d",
    "6m"
  ]).default("30d")
});
var DashboardTopProductsQuerySchema = z7.object({
  limit: z7.coerce.number().int().min(1).max(20).default(6)
});
var DashboardRecentOrdersQuerySchema = z7.object({
  limit: z7.coerce.number().int().min(1).max(20).default(6)
});

// src/infrastructure/http/controllers/DashboardController.ts
var DashboardController = class {
  static {
    __name(this, "DashboardController");
  }
  async getStats(request, reply) {
    const { period } = DashboardStatsQuerySchema.parse(request.query);
    const getStatsUseCase = container8.resolve(GetDashboardStatsUseCase);
    const stats = await getStatsUseCase.execute(period);
    return reply.send(stats);
  }
  async getSalesChart(request, reply) {
    const { period } = DashboardChartQuerySchema.parse(request.query);
    const getSalesChartUseCase = container8.resolve(GetSalesChartUseCase);
    const data = await getSalesChartUseCase.execute(period);
    return reply.send(data);
  }
  async getTopProducts(request, reply) {
    const { limit } = DashboardTopProductsQuerySchema.parse(request.query);
    const getTopProductsUseCase = container8.resolve(GetTopProductsUseCase);
    const data = await getTopProductsUseCase.execute(limit);
    return reply.send(data);
  }
  async getRecentOrders(request, reply) {
    const { limit } = DashboardRecentOrdersQuerySchema.parse(request.query);
    const getRecentOrdersUseCase = container8.resolve(GetRecentOrdersUseCase);
    const data = await getRecentOrdersUseCase.execute(limit);
    return reply.send(data);
  }
};

// src/infrastructure/http/controllers/HighlightController.ts
import { container as container9 } from "tsyringe";

// src/application/use-cases/highlight/GetHighlightsUseCase.ts
import { inject as inject29, injectable as injectable34 } from "tsyringe";
function _ts_decorate34(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate34, "_ts_decorate");
function _ts_metadata30(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata30, "_ts_metadata");
function _ts_param29(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param29, "_ts_param");
var GetHighlightsUseCase = class {
  static {
    __name(this, "GetHighlightsUseCase");
  }
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute() {
    const [featured, recommended] = await Promise.all([
      this.productRepository.findFeatured(),
      this.productRepository.findRecommended()
    ]);
    return {
      featured,
      recommended
    };
  }
};
GetHighlightsUseCase = _ts_decorate34([
  injectable34(),
  _ts_param29(0, inject29("ProductRepository")),
  _ts_metadata30("design:type", Function),
  _ts_metadata30("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository
  ])
], GetHighlightsUseCase);

// src/application/use-cases/highlight/UpdateHighlightsUseCase.ts
import { inject as inject30, injectable as injectable35 } from "tsyringe";
function _ts_decorate35(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate35, "_ts_decorate");
function _ts_metadata31(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata31, "_ts_metadata");
function _ts_param30(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param30, "_ts_param");
var UpdateHighlightsUseCase = class {
  static {
    __name(this, "UpdateHighlightsUseCase");
  }
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(dto) {
    await Promise.all([
      this.productRepository.bulkUpdateFeatured(dto.featuredIds),
      this.productRepository.bulkUpdateRecommended(dto.recommendedIds)
    ]);
    const [featured, recommended] = await Promise.all([
      this.productRepository.findFeatured(),
      this.productRepository.findRecommended()
    ]);
    return {
      featured,
      recommended
    };
  }
};
UpdateHighlightsUseCase = _ts_decorate35([
  injectable35(),
  _ts_param30(0, inject30("ProductRepository")),
  _ts_metadata31("design:type", Function),
  _ts_metadata31("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository
  ])
], UpdateHighlightsUseCase);

// src/application/dtos/HighlightDTO.ts
import { z as z8 } from "zod";
var UpdateHighlightsSchema = z8.object({
  featuredIds: z8.array(z8.string().uuid()),
  recommendedIds: z8.array(z8.string().uuid())
});

// src/infrastructure/http/controllers/HighlightController.ts
var HighlightController = class {
  static {
    __name(this, "HighlightController");
  }
  async get(_request, reply) {
    const useCase = container9.resolve(GetHighlightsUseCase);
    const { featured, recommended } = await useCase.execute();
    return reply.send({
      featured: featured.map(ProductPresenter.toHTTP),
      recommended: recommended.map(ProductPresenter.toHTTP)
    });
  }
  async update(request, reply) {
    const data = UpdateHighlightsSchema.parse(request.body);
    const useCase = container9.resolve(UpdateHighlightsUseCase);
    const { featured, recommended } = await useCase.execute(data);
    return reply.send({
      featured: featured.map(ProductPresenter.toHTTP),
      recommended: recommended.map(ProductPresenter.toHTTP)
    });
  }
};

// src/infrastructure/http/controllers/SettingsController.ts
import { container as container10 } from "tsyringe";

// src/application/use-cases/settings/GetStoreSettingsUseCase.ts
import { inject as inject31, injectable as injectable36 } from "tsyringe";
function _ts_decorate36(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate36, "_ts_decorate");
function _ts_metadata32(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata32, "_ts_metadata");
function _ts_param31(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param31, "_ts_param");
var GetStoreSettingsUseCase = class {
  static {
    __name(this, "GetStoreSettingsUseCase");
  }
  storeSettingsRepository;
  constructor(storeSettingsRepository) {
    this.storeSettingsRepository = storeSettingsRepository;
  }
  async execute() {
    return this.storeSettingsRepository.get();
  }
};
GetStoreSettingsUseCase = _ts_decorate36([
  injectable36(),
  _ts_param31(0, inject31("StoreSettingsRepository")),
  _ts_metadata32("design:type", Function),
  _ts_metadata32("design:paramtypes", [
    typeof IStoreSettingsRepository === "undefined" ? Object : IStoreSettingsRepository
  ])
], GetStoreSettingsUseCase);

// src/application/use-cases/settings/UpdateStoreSettingsUseCase.ts
import { inject as inject32, injectable as injectable37 } from "tsyringe";
function _ts_decorate37(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate37, "_ts_decorate");
function _ts_metadata33(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata33, "_ts_metadata");
function _ts_param32(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param32, "_ts_param");
var UpdateStoreSettingsUseCase = class {
  static {
    __name(this, "UpdateStoreSettingsUseCase");
  }
  storeSettingsRepository;
  constructor(storeSettingsRepository) {
    this.storeSettingsRepository = storeSettingsRepository;
  }
  async execute(dto) {
    const settings = await this.storeSettingsRepository.get();
    settings.update(dto);
    return this.storeSettingsRepository.update(settings);
  }
};
UpdateStoreSettingsUseCase = _ts_decorate37([
  injectable37(),
  _ts_param32(0, inject32("StoreSettingsRepository")),
  _ts_metadata33("design:type", Function),
  _ts_metadata33("design:paramtypes", [
    typeof IStoreSettingsRepository === "undefined" ? Object : IStoreSettingsRepository
  ])
], UpdateStoreSettingsUseCase);

// src/application/dtos/StoreSettingsDTO.ts
import { z as z9 } from "zod";
var UpdateStoreSettingsSchema = z9.object({
  storeName: z9.string().min(1).optional(),
  email: z9.string().email().optional(),
  phone: z9.string().optional(),
  whatsapp: z9.string().optional(),
  address: z9.string().optional(),
  shippingFreeAbove: z9.number().min(0).optional(),
  shippingBasePrice: z9.number().min(0).optional(),
  estimatedDelivery: z9.string().optional(),
  pixEnabled: z9.boolean().optional(),
  creditCardEnabled: z9.boolean().optional(),
  creditCardMaxInstallments: z9.number().int().min(1).max(24).optional(),
  boletoEnabled: z9.boolean().optional(),
  socialInstagram: z9.string().optional(),
  socialFacebook: z9.string().optional(),
  socialTiktok: z9.string().optional()
});

// src/infrastructure/http/presenters/StoreSettingsPresenter.ts
var StoreSettingsPresenter = class {
  static {
    __name(this, "StoreSettingsPresenter");
  }
  static toHTTP(settings) {
    return {
      storeName: settings.storeName,
      email: settings.email,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      address: settings.address,
      shippingFreeAbove: settings.shippingFreeAbove.getValue(),
      shippingBasePrice: settings.shippingBasePrice.getValue(),
      estimatedDelivery: settings.estimatedDelivery,
      pixEnabled: settings.pixEnabled,
      creditCardEnabled: settings.creditCardEnabled,
      creditCardMaxInstallments: settings.creditCardMaxInstallments,
      boletoEnabled: settings.boletoEnabled,
      socialInstagram: settings.socialInstagram,
      socialFacebook: settings.socialFacebook,
      socialTiktok: settings.socialTiktok,
      updatedAt: settings.updatedAt.toISOString()
    };
  }
};

// src/infrastructure/http/controllers/SettingsController.ts
var SettingsController = class {
  static {
    __name(this, "SettingsController");
  }
  async get(_request, reply) {
    const useCase = container10.resolve(GetStoreSettingsUseCase);
    const settings = await useCase.execute();
    return reply.send(StoreSettingsPresenter.toHTTP(settings));
  }
  async update(request, reply) {
    const data = UpdateStoreSettingsSchema.parse(request.body);
    const useCase = container10.resolve(UpdateStoreSettingsUseCase);
    const settings = await useCase.execute(data);
    return reply.send(StoreSettingsPresenter.toHTTP(settings));
  }
};

// src/infrastructure/http/controllers/AbandonedCartController.ts
import { container as container11 } from "tsyringe";

// src/application/use-cases/cart/ListAbandonedCartsUseCase.ts
import { inject as inject33, injectable as injectable38 } from "tsyringe";
function _ts_decorate38(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate38, "_ts_decorate");
function _ts_metadata34(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata34, "_ts_metadata");
function _ts_param33(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param33, "_ts_param");
var ListAbandonedCartsUseCase = class {
  static {
    __name(this, "ListAbandonedCartsUseCase");
  }
  abandonedCartRepository;
  constructor(abandonedCartRepository) {
    this.abandonedCartRepository = abandonedCartRepository;
  }
  async execute(page, limit) {
    return this.abandonedCartRepository.findAbandoned({
      page,
      limit
    });
  }
};
ListAbandonedCartsUseCase = _ts_decorate38([
  injectable38(),
  _ts_param33(0, inject33("AbandonedCartRepository")),
  _ts_metadata34("design:type", Function),
  _ts_metadata34("design:paramtypes", [
    typeof IAbandonedCartRepository === "undefined" ? Object : IAbandonedCartRepository
  ])
], ListAbandonedCartsUseCase);

// src/application/dtos/AbandonedCartDTO.ts
import { z as z10 } from "zod";
var AbandonedCartFiltersSchema = z10.object({
  page: z10.coerce.number().int().min(1).default(1),
  limit: z10.coerce.number().int().min(1).max(100).default(20)
});

// src/infrastructure/http/controllers/AbandonedCartController.ts
var AbandonedCartController = class {
  static {
    __name(this, "AbandonedCartController");
  }
  async list(request, reply) {
    const { page, limit } = AbandonedCartFiltersSchema.parse(request.query);
    const useCase = container11.resolve(ListAbandonedCartsUseCase);
    const result = await useCase.execute(page, limit);
    return reply.send({
      carts: result.data.map((cart) => ({
        ...cart,
        lastActivity: cart.lastActivity.toISOString()
      })),
      total: result.total,
      totalValue: result.totalValue,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  }
};

// src/infrastructure/http/controllers/ProductImageController.ts
import { container as container12 } from "tsyringe";

// src/application/use-cases/product/UploadProductImagesUseCase.ts
import { inject as inject34, injectable as injectable39 } from "tsyringe";
function _ts_decorate39(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate39, "_ts_decorate");
function _ts_metadata35(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata35, "_ts_metadata");
function _ts_param34(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param34, "_ts_param");
var UploadProductImagesUseCase = class {
  static {
    __name(this, "UploadProductImagesUseCase");
  }
  productRepository;
  storageProvider;
  constructor(productRepository, storageProvider) {
    this.productRepository = productRepository;
    this.storageProvider = storageProvider;
  }
  async execute(productId, files) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError("Produto n\xE3o encontrado", 404);
    }
    const existingImages = await prisma.productImage.count({
      where: {
        productId
      }
    });
    if (existingImages + files.length > 5) {
      throw new AppError("Produto pode ter no m\xE1ximo 5 imagens", 400);
    }
    const isFirstImage = existingImages === 0;
    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await this.storageProvider.upload({
        file: file.buffer,
        fileName: file.filename,
        mimeType: file.mimetype,
        folder: "products"
      });
      const image = await prisma.productImage.create({
        data: {
          productId,
          url,
          alt: product.name,
          order: existingImages + i,
          isMain: isFirstImage && i === 0
        }
      });
      uploadedImages.push(image);
    }
    return uploadedImages;
  }
};
UploadProductImagesUseCase = _ts_decorate39([
  injectable39(),
  _ts_param34(0, inject34("ProductRepository")),
  _ts_param34(1, inject34("StorageProvider")),
  _ts_metadata35("design:type", Function),
  _ts_metadata35("design:paramtypes", [
    typeof IProductRepository === "undefined" ? Object : IProductRepository,
    typeof IStorageProvider === "undefined" ? Object : IStorageProvider
  ])
], UploadProductImagesUseCase);

// src/application/use-cases/product/DeleteProductImageUseCase.ts
import { inject as inject35, injectable as injectable40 } from "tsyringe";
function _ts_decorate40(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate40, "_ts_decorate");
function _ts_metadata36(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata36, "_ts_metadata");
function _ts_param35(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param35, "_ts_param");
var DeleteProductImageUseCase = class {
  static {
    __name(this, "DeleteProductImageUseCase");
  }
  storageProvider;
  constructor(storageProvider) {
    this.storageProvider = storageProvider;
  }
  async execute(productId, imageId) {
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId
      }
    });
    if (!image) {
      throw new AppError("Imagem n\xE3o encontrada", 404);
    }
    await this.storageProvider.delete(image.url);
    await prisma.productImage.delete({
      where: {
        id: imageId
      }
    });
    if (image.isMain) {
      const firstRemaining = await prisma.productImage.findFirst({
        where: {
          productId
        },
        orderBy: {
          order: "asc"
        }
      });
      if (firstRemaining) {
        await prisma.productImage.update({
          where: {
            id: firstRemaining.id
          },
          data: {
            isMain: true
          }
        });
      }
    }
    return {
      deleted: true
    };
  }
};
DeleteProductImageUseCase = _ts_decorate40([
  injectable40(),
  _ts_param35(0, inject35("StorageProvider")),
  _ts_metadata36("design:type", Function),
  _ts_metadata36("design:paramtypes", [
    typeof IStorageProvider === "undefined" ? Object : IStorageProvider
  ])
], DeleteProductImageUseCase);

// src/application/use-cases/product/SetMainImageUseCase.ts
import { injectable as injectable41 } from "tsyringe";
function _ts_decorate41(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate41, "_ts_decorate");
function _ts_metadata37(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata37, "_ts_metadata");
var SetMainImageUseCase = class {
  static {
    __name(this, "SetMainImageUseCase");
  }
  constructor() {
  }
  async execute(productId, imageId) {
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId
      }
    });
    if (!image) {
      throw new AppError("Imagem n\xE3o encontrada", 404);
    }
    await prisma.productImage.updateMany({
      where: {
        productId
      },
      data: {
        isMain: false
      }
    });
    await prisma.productImage.update({
      where: {
        id: imageId
      },
      data: {
        isMain: true
      }
    });
    return {
      imageId,
      isMain: true
    };
  }
};
SetMainImageUseCase = _ts_decorate41([
  injectable41(),
  _ts_metadata37("design:type", Function),
  _ts_metadata37("design:paramtypes", [])
], SetMainImageUseCase);

// src/infrastructure/http/controllers/ProductImageController.ts
var ProductImageController = class {
  static {
    __name(this, "ProductImageController");
  }
  async upload(request, reply) {
    const { id: productId } = request.params;
    const parts = request.files();
    const files = [];
    for await (const part of parts) {
      const buffer = await part.toBuffer();
      files.push({
        buffer,
        filename: part.filename,
        mimetype: part.mimetype
      });
    }
    if (files.length === 0) {
      throw new AppError("Nenhuma imagem enviada", 400);
    }
    const useCase = container12.resolve(UploadProductImagesUseCase);
    const images = await useCase.execute(productId, files);
    return reply.status(201).send({
      message: `${images.length} imagem(ns) enviada(s) com sucesso`,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
        isMain: img.isMain
      }))
    });
  }
  async delete(request, reply) {
    const { id: productId, imageId } = request.params;
    const useCase = container12.resolve(DeleteProductImageUseCase);
    await useCase.execute(productId, imageId);
    return reply.status(204).send();
  }
  async setMain(request, reply) {
    const { id: productId, imageId } = request.params;
    const useCase = container12.resolve(SetMainImageUseCase);
    const result = await useCase.execute(productId, imageId);
    return reply.send(result);
  }
};

// src/infrastructure/http/middlewares/authMiddleware.ts
import "@fastify/jwt";
function authMiddleware(allowedRoles) {
  return async (request, reply) => {
    try {
      await request.jwtVerify();
      const { role } = request.user;
      if (allowedRoles && !allowedRoles.includes(role)) {
        return reply.status(403).send({
          error: "Acesso negado"
        });
      }
    } catch (_error) {
      return reply.status(401).send({
        error: "Token inv\xE1lido ou expirado"
      });
    }
  };
}
__name(authMiddleware, "authMiddleware");

// src/infrastructure/http/routes/admin.routes.ts
var productController2 = new ProductController();
var subcategoryController = new SubcategoryController();
var orderController = new OrderController();
var customerController = new CustomerController();
var reviewController = new ReviewController();
var dashboardController = new DashboardController();
var highlightController = new HighlightController();
var settingsController = new SettingsController();
var abandonedCartController = new AbandonedCartController();
var productImageController = new ProductImageController();
async function adminRoutes(app) {
  app.addHook("onRequest", authMiddleware([
    UserRole.ADMIN
  ]));
  app.get("/products", productController2.list);
  app.post("/products", productController2.create);
  app.put("/products/:id", productController2.update);
  app.delete("/products/:id", productController2.delete);
  app.patch("/products/:id/featured", productController2.toggleFeatured);
  app.patch("/products/:id/recommended", productController2.toggleRecommended);
  app.post("/products/:id/images", productImageController.upload);
  app.delete("/products/:id/images/:imageId", productImageController.delete);
  app.patch("/products/:id/images/:imageId/main", productImageController.setMain);
  app.get("/categories", subcategoryController.list);
  app.post("/categories", subcategoryController.create);
  app.put("/categories/:id", subcategoryController.update);
  app.delete("/categories/:id", subcategoryController.delete);
  app.get("/orders", orderController.list);
  app.get("/orders/:id", orderController.get);
  app.patch("/orders/:id/status", orderController.updateStatus);
  app.patch("/orders/:id/tracking", orderController.updateTracking);
  app.get("/customers", customerController.list);
  app.get("/customers/:id", customerController.get);
  app.patch("/customers/:id/status", customerController.updateStatus);
  app.get("/reviews", reviewController.list);
  app.patch("/reviews/:id/approve", reviewController.approve);
  app.patch("/reviews/:id/reject", reviewController.reject);
  app.delete("/reviews/:id", reviewController.delete);
  app.get("/dashboard/stats", dashboardController.getStats);
  app.get("/dashboard/sales-chart", dashboardController.getSalesChart);
  app.get("/dashboard/top-products", dashboardController.getTopProducts);
  app.get("/dashboard/recent-orders", dashboardController.getRecentOrders);
  app.get("/highlights", highlightController.get);
  app.put("/highlights", highlightController.update);
  app.get("/settings", settingsController.get);
  app.put("/settings", settingsController.update);
  app.get("/abandoned-carts", abandonedCartController.list);
}
__name(adminRoutes, "adminRoutes");

// src/infrastructure/http/routes/index.ts
async function routes(app) {
  app.register(publicRoutes, {
    prefix: "/api/v1/public"
  });
  app.register(adminRoutes, {
    prefix: "/api/v1/admin"
  });
  app.get("/health", async () => ({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }));
}
__name(routes, "routes");

// src/infrastructure/http/middlewares/errorHandler.ts
import { ZodError } from "zod";
function errorHandler(error, request, reply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message
    });
  }
  if (error instanceof DomainError) {
    return reply.status(400).send({
      error: error.message
    });
  }
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Dados inv\xE1lidos",
      details: error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }))
    });
  }
  console.error("Unexpected error:", error);
  return reply.status(500).send({
    error: "Erro interno do servidor"
  });
}
__name(errorHandler, "errorHandler");

// src/infrastructure/http/server.ts
async function buildServer() {
  const app = Fastify({
    logger: process.env.NODE_ENV === "development"
  });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Petshop API",
        description: "API RESTful para sistema de Petshop",
        version: "1.0.0"
      },
      servers: [
        {
          url: "http://localhost:3333",
          description: "Desenvolvimento"
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    },
    transform: jsonSchemaTransform
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false
    }
  });
  await app.register(cors, {
    origin: true,
    credentials: true
  });
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 5
    }
  });
  const __dirname = path2.dirname(fileURLToPath(import.meta.url));
  const uploadsPath = path2.resolve(__dirname, "../../../uploads");
  await app.register(fastifyStatic, {
    root: uploadsPath,
    prefix: "/uploads/",
    decorateReply: false
  });
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "default-secret"
  });
  app.setErrorHandler(errorHandler);
  await app.register(routes);
  return app;
}
__name(buildServer, "buildServer");

// src/main.ts
async function main() {
  const app = await buildServer();
  const port = Number(process.env.PORT) || 3333;
  const host = "0.0.0.0";
  try {
    await app.listen({
      port,
      host
    });
    console.log(`\u{1F680} Server running on http://localhost:${port}`);
    console.log(`\u{1F4DA} Health check: http://localhost:${port}/health`);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
__name(main, "main");
main();
