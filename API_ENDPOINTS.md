# API Olhos de Gato - Especificacao Completa dos Endpoints

## Stack
- **Framework**: Fastify 5 + TypeScript
- **ORM**: Prisma 5 + PostgreSQL 16
- **Cache**: Redis 7
- **Auth**: @fastify/jwt (JWT) + bcryptjs
- **Validation**: Zod 4
- **Arquitetura**: Clean Architecture (domain / application / infrastructure)

## Autenticacao

Todas as rotas `/api/v1/admin/*` exigem:
- Header: `Authorization: Bearer <token>`
- Role: `ADMIN`

Rotas de usuario autenticado (pedidos, carrinho, favoritos) exigem:
- Header: `Authorization: Bearer <token>`
- Role: `CUSTOMER` ou `ADMIN`

---

## 1. AUTH

### `POST /api/v1/public/auth/register` [EXISTE]
Cadastro de novo usuario (cria User + Customer).

**Body:**
```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "senha123",
  "phone": "(11) 99999-1234",
  "cpf": "123.456.789-00"
}
```
**Response 201:**
```json
{
  "user": { "id": "uuid", "name": "Maria Silva", "email": "maria@email.com", "role": "CUSTOMER" },
  "token": "jwt-token"
}
```

### `POST /api/v1/public/auth/login` [EXISTE]
Login com email e senha.

**Body:**
```json
{
  "email": "maria@email.com",
  "password": "senha123"
}
```
**Response 200:**
```json
{
  "user": { "id": "uuid", "name": "Maria Silva", "email": "maria@email.com", "role": "CUSTOMER" },
  "token": "jwt-token"
}
```

### `POST /api/v1/auth/logout` [NOVO]
Invalida o token atual.

**Auth:** Bearer token
**Response 204:** No content

### `GET /api/v1/auth/me` [NOVO]
Retorna dados do usuario logado.

**Auth:** Bearer token
**Response 200:**
```json
{
  "id": "uuid",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "role": "CUSTOMER",
  "phone": "(11) 99999-1234"
}
```

---

## 2. PRODUTOS - Publico

### `GET /api/v1/public/products` [EXISTE - AJUSTAR]
Lista produtos com filtros. Precisa suportar novos filtros do frontend.

**Query Params:**
| Param | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `search` | string | - | Busca por nome |
| `animalType` | `gato \| cachorro` | - | Filtro por animal |
| `subcategoryId` | string | - | Filtro por subcategoria (ex: `racao-seca`) |
| `minPrice` | number | - | Preco minimo |
| `maxPrice` | number | - | Preco maximo |
| `onlyOffers` | boolean | false | Apenas produtos com preco promocional |
| `onlyActive` | boolean | true | Apenas ativos |
| `sort` | `relevance \| price-asc \| price-desc \| name` | relevance | Ordenacao |
| `page` | number | 1 | Pagina |
| `limit` | number | 20 | Items por pagina (max 100) |

**Response 200:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Racao Premium Gatos 3kg",
      "slug": "racao-premium-gatos-3kg",
      "description": "Racao super premium...",
      "animalType": "gato",
      "subcategoryId": "racao-seca",
      "subcategoryName": "Racao Seca",
      "price": 129.90,
      "promoPrice": 109.90,
      "stock": 45,
      "images": [{ "url": "...", "alt": "...", "isMain": true }],
      "isFeatured": true,
      "isRecommended": false,
      "rating": 4.5,
      "reviewCount": 12
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

### `GET /api/v1/public/products/:slug` [EXISTE - AJUSTAR]
Detalhes de um produto com reviews aprovadas e produtos relacionados.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Racao Premium Gatos 3kg",
  "slug": "racao-premium-gatos-3kg",
  "description": "Racao super premium para gatos adultos...",
  "animalType": "gato",
  "subcategoryId": "racao-seca",
  "subcategoryName": "Racao Seca",
  "price": 129.90,
  "promoPrice": 109.90,
  "stock": 45,
  "sku": "RAC-001",
  "images": [{ "url": "...", "alt": "...", "isMain": true, "order": 0 }],
  "specifications": [
    { "label": "Peso", "value": "3kg" },
    { "label": "Sabor", "value": "Salmao" }
  ],
  "rating": 4.5,
  "reviewCount": 12,
  "reviews": [
    {
      "id": "uuid",
      "author": "Maria Silva",
      "rating": 5,
      "date": "2026-01-28",
      "comment": "Meu gato amou!"
    }
  ],
  "relatedProducts": [
    { "id": "uuid", "name": "...", "slug": "...", "price": 99.90, "promoPrice": 79.90, "image": "..." }
  ]
}
```

### `GET /api/v1/public/products/featured` [NOVO]
Retorna produtos em destaque (isFeatured = true).

**Query:** `limit=4`
**Response 200:** Array de produtos resumidos

### `GET /api/v1/public/products/recommended` [NOVO]
Retorna produtos recomendados (isRecommended = true).

**Query:** `limit=4`
**Response 200:** Array de produtos resumidos

---

## 3. CATEGORIAS - Publico

### `GET /api/v1/public/categories` [NOVO]
Lista todas as categorias agrupadas por animal.

**Response 200:**
```json
{
  "gato": [
    { "id": "racao-seca", "name": "Racao Seca", "icon": "Package" },
    { "id": "racao-umida", "name": "Racao Umida", "icon": "Drumstick" },
    { "id": "areia", "name": "Areia", "icon": "Sparkles" },
    { "id": "brinquedos", "name": "Brinquedos", "icon": "Puzzle" },
    { "id": "arranhadores", "name": "Arranhadores", "icon": "TreePine" },
    { "id": "farmacia", "name": "Farmacia", "icon": "Pill" }
  ],
  "cachorro": [
    { "id": "racao-seca", "name": "Racao Seca", "icon": "Package" },
    { "id": "racao-umida", "name": "Racao Umida", "icon": "Drumstick" },
    { "id": "brinquedos", "name": "Brinquedos", "icon": "Puzzle" },
    { "id": "coleiras", "name": "Coleiras", "icon": "Circle" },
    { "id": "petiscos", "name": "Petiscos", "icon": "Cookie" },
    { "id": "farmacia", "name": "Farmacia", "icon": "Pill" }
  ]
}
```

---

## 4. REVIEWS - Publico

### `GET /api/v1/public/products/:productId/reviews` [NOVO]
Reviews aprovadas de um produto.

**Query:** `page=1&limit=10`
**Response 200:**
```json
{
  "reviews": [
    { "id": "uuid", "author": "Maria Silva", "rating": 5, "date": "2026-01-28", "comment": "Excelente!" }
  ],
  "avgRating": 4.5,
  "total": 12,
  "ratingDistribution": { "5": 8, "4": 2, "3": 1, "2": 0, "1": 1 }
}
```

### `POST /api/v1/reviews` [NOVO]
Cliente envia uma avaliacao (status inicial: PENDING).

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Meu gato amou!"
}
```
**Response 201:**
```json
{ "id": "uuid", "status": "PENDING", "message": "Avaliacao enviada para aprovacao" }
```

---

## 5. CARRINHO

### `GET /api/v1/cart` [NOVO]
Retorna carrinho do usuario autenticado.

**Auth:** Bearer (CUSTOMER)
**Response 200:**
```json
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "name": "Racao Premium Gatos 3kg",
      "price": 109.90,
      "image": "...",
      "category": "Racao Seca",
      "quantity": 2
    }
  ],
  "total": 219.80,
  "itemCount": 2
}
```

### `POST /api/v1/cart/items` [NOVO]
Adiciona item ao carrinho.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{ "productId": "uuid", "quantity": 1 }
```
**Response 201:** Carrinho atualizado

### `PATCH /api/v1/cart/items/:itemId` [NOVO]
Atualiza quantidade de um item.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{ "quantity": 3 }
```
**Response 200:** Carrinho atualizado

### `DELETE /api/v1/cart/items/:itemId` [NOVO]
Remove item do carrinho.

**Auth:** Bearer (CUSTOMER)
**Response 200:** Carrinho atualizado

### `DELETE /api/v1/cart` [NOVO]
Limpa o carrinho inteiro.

**Auth:** Bearer (CUSTOMER)
**Response 204:** No content

---

## 6. FAVORITOS

### `GET /api/v1/favorites` [NOVO]
Lista produtos favoritos do usuario.

**Auth:** Bearer (CUSTOMER)
**Response 200:**
```json
{
  "favorites": [
    { "id": "uuid", "name": "Racao Premium...", "price": 129.90, "promoPrice": 109.90, "image": "...", "category": "Racao Seca" }
  ]
}
```

### `POST /api/v1/favorites` [NOVO]
Adiciona produto aos favoritos.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{ "productId": "uuid" }
```
**Response 201:** `{ "message": "Adicionado aos favoritos" }`

### `DELETE /api/v1/favorites/:productId` [NOVO]
Remove produto dos favoritos.

**Auth:** Bearer (CUSTOMER)
**Response 204:** No content

---

## 7. PEDIDOS - Cliente

### `POST /api/v1/orders` [NOVO]
Cria um novo pedido a partir do carrinho.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{
  "addressId": "uuid",
  "paymentMethod": "PIX",
  "notes": "Entregar no portao"
}
```
**Response 201:**
```json
{
  "orderId": "PED-001",
  "status": "PENDING",
  "total": 269.70,
  "paymentMethod": "PIX",
  "createdAt": "2026-01-28T10:30:00Z"
}
```

### `GET /api/v1/orders` [NOVO]
Lista pedidos do usuario autenticado.

**Auth:** Bearer (CUSTOMER)
**Query:** `page=1&limit=10`
**Response 200:**
```json
{
  "orders": [
    {
      "id": "PED-001",
      "date": "2026-01-28",
      "status": "DELIVERED",
      "total": 269.70,
      "itemCount": 3,
      "items": [
        { "productName": "Racao Premium 3kg", "quantity": 2, "unitPrice": 109.90 }
      ]
    }
  ],
  "total": 12
}
```

### `GET /api/v1/orders/:id` [NOVO]
Detalhes de um pedido do usuario.

**Auth:** Bearer (CUSTOMER) - apenas pedidos proprios
**Response 200:**
```json
{
  "id": "PED-001",
  "date": "2026-01-28",
  "status": "DELIVERED",
  "paymentMethod": "PIX",
  "paymentStatus": "PAID",
  "trackingCode": "BR123456789",
  "items": [
    { "productId": "uuid", "productName": "...", "quantity": 2, "unitPrice": 109.90, "total": 219.80 }
  ],
  "subtotal": 269.70,
  "discount": 0,
  "shippingCost": 0,
  "total": 269.70,
  "shippingAddress": { "street": "...", "number": "123", "city": "Sao Paulo", "state": "SP", "zipCode": "01234-567" },
  "statusHistory": [
    { "status": "PENDING", "date": "2026-01-28T10:30:00Z" },
    { "status": "CONFIRMED", "date": "2026-01-28T10:35:00Z" },
    { "status": "DELIVERED", "date": "2026-01-31T14:00:00Z" }
  ]
}
```

---

## 8. ENDERECOS - Cliente

### `GET /api/v1/addresses` [NOVO]
Lista enderecos do cliente.

**Auth:** Bearer (CUSTOMER)
**Response 200:**
```json
{
  "addresses": [
    { "id": "uuid", "street": "Rua das Flores", "number": "123", "complement": "Apto 42", "neighborhood": "Centro", "city": "Sao Paulo", "state": "SP", "zipCode": "01234-567", "isDefault": true }
  ]
}
```

### `POST /api/v1/addresses` [NOVO]
Adiciona novo endereco.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 42",
  "neighborhood": "Centro",
  "city": "Sao Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "isDefault": true
}
```
**Response 201:** Endereco criado

### `PUT /api/v1/addresses/:id` [NOVO]
Atualiza um endereco.

**Auth:** Bearer (CUSTOMER)
**Response 200:** Endereco atualizado

### `DELETE /api/v1/addresses/:id` [NOVO]
Remove um endereco.

**Auth:** Bearer (CUSTOMER)
**Response 204:** No content

---

## 9. PAGAMENTOS

### `POST /api/v1/payments/pix` [NOVO]
Gera QR Code PIX para um pedido.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{ "orderId": "PED-001" }
```
**Response 200:**
```json
{
  "qrCode": "00020101021226870...",
  "qrCodeImage": "data:image/png;base64,...",
  "expiresAt": "2026-01-28T11:00:00Z",
  "amount": 269.70
}
```

### `POST /api/v1/payments/credit-card` [NOVO]
Processa pagamento via cartao de credito.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{
  "orderId": "PED-001",
  "cardNumber": "4111111111111111",
  "cardHolder": "MARIA SILVA",
  "expiryMonth": "12",
  "expiryYear": "2028",
  "cvv": "123",
  "installments": 3
}
```
**Response 200:**
```json
{ "transactionId": "txn_123", "status": "PAID", "installments": 3, "installmentValue": 89.90 }
```

### `POST /api/v1/payments/boleto` [NOVO]
Gera boleto para um pedido.

**Auth:** Bearer (CUSTOMER)
**Body:**
```json
{ "orderId": "PED-001" }
```
**Response 200:**
```json
{ "boletoUrl": "https://...", "barCode": "23793.38128...", "expiresAt": "2026-02-04" }
```

---

## 10. ADMIN - Produtos

### `GET /api/v1/admin/products` [EXISTE - AJUSTAR]
Lista todos os produtos (incluindo inativos/rascunho).

**Auth:** Bearer (ADMIN)
**Query:** `search, animalType, status, page, limit`
**Response 200:** Lista com paginacao + total

### `POST /api/v1/admin/products` [EXISTE - AJUSTAR]
Cria produto. Precisa suportar novos campos.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{
  "name": "Racao Premium Gatos 3kg",
  "description": "Racao super premium...",
  "animalType": "gato",
  "subcategoryId": "racao-seca",
  "price": 129.90,
  "promoPrice": 109.90,
  "stock": 45,
  "sku": "RAC-001",
  "status": "active",
  "isFeatured": true,
  "isRecommended": false
}
```
**Response 201:** Produto criado

### `PUT /api/v1/admin/products/:id` [EXISTE]
Atualiza produto.

**Auth:** Bearer (ADMIN)
**Body:** Mesmos campos do POST
**Response 200:** Produto atualizado

### `DELETE /api/v1/admin/products/:id` [EXISTE]
Remove produto (soft delete: status = archived).

**Auth:** Bearer (ADMIN)
**Response 204:** No content

### `PATCH /api/v1/admin/products/:id/featured` [NOVO]
Alterna destaque do produto.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{ "isFeatured": true }
```
**Response 200:** `{ "isFeatured": true }`

### `PATCH /api/v1/admin/products/:id/recommended` [NOVO]
Alterna recomendacao do produto.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{ "isRecommended": true }
```
**Response 200:** `{ "isRecommended": true }`

---

## 11. ADMIN - Categorias

### `GET /api/v1/admin/categories` [NOVO]
Lista todas as categorias por animal com contagem de produtos.

**Auth:** Bearer (ADMIN)
**Response 200:**
```json
{
  "gato": [
    { "id": "racao-seca", "name": "Racao Seca", "icon": "Package", "productCount": 15 }
  ],
  "cachorro": [
    { "id": "racao-seca", "name": "Racao Seca", "icon": "Package", "productCount": 8 }
  ]
}
```

### `POST /api/v1/admin/categories` [NOVO]
Cria nova subcategoria.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{ "animalType": "gato", "name": "Camas", "icon": "Bed" }
```
**Response 201:** Subcategoria criada

### `PUT /api/v1/admin/categories/:id` [NOVO]
Atualiza subcategoria.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{ "name": "Camas e Tocas", "icon": "Bed" }
```
**Response 200:** Subcategoria atualizada

### `DELETE /api/v1/admin/categories/:id` [NOVO]
Remove subcategoria (apenas se nao tiver produtos vinculados).

**Auth:** Bearer (ADMIN)
**Response 204:** No content
**Response 409:** `{ "error": "Categoria possui produtos vinculados" }`

---

## 12. ADMIN - Pedidos

### `GET /api/v1/admin/orders` [NOVO]
Lista todos os pedidos com filtros.

**Auth:** Bearer (ADMIN)
**Query:** `search, status, dateFrom, dateTo, page, limit`
**Response 200:**
```json
{
  "orders": [
    {
      "id": "PED-001",
      "customerName": "Maria Silva",
      "customerEmail": "maria@email.com",
      "date": "2026-01-28",
      "status": "DELIVERED",
      "total": 269.70,
      "paymentMethod": "PIX",
      "itemCount": 3,
      "trackingCode": "BR123456789"
    }
  ],
  "total": 156,
  "page": 1,
  "totalPages": 16
}
```

### `GET /api/v1/admin/orders/:id` [NOVO]
Detalhes completos de um pedido.

**Auth:** Bearer (ADMIN)
**Response 200:** Pedido completo com itens, endereco, historico de status, dados do cliente

### `PATCH /api/v1/admin/orders/:id/status` [NOVO]
Atualiza status do pedido (cria entrada no historico).

**Auth:** Bearer (ADMIN)
**Body:**
```json
{ "status": "SHIPPED", "notes": "Enviado via Correios" }
```
**Response 200:**
```json
{ "id": "PED-001", "status": "SHIPPED", "updatedAt": "2026-01-29T10:00:00Z" }
```

### `PATCH /api/v1/admin/orders/:id/tracking` [NOVO]
Adiciona/atualiza codigo de rastreio.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{ "trackingCode": "BR123456789" }
```
**Response 200:** Pedido atualizado

---

## 13. ADMIN - Clientes

### `GET /api/v1/admin/customers` [NOVO]
Lista todos os clientes.

**Auth:** Bearer (ADMIN)
**Query:** `search, status, page, limit`
**Response 200:**
```json
{
  "customers": [
    {
      "id": "uuid",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "(11) 99999-1234",
      "cpf": "123.456.789-00",
      "totalOrders": 12,
      "totalSpent": 2450.80,
      "lastOrder": "2026-01-28",
      "registeredAt": "2025-06-15",
      "status": "active"
    }
  ],
  "total": 89,
  "stats": {
    "totalCustomers": 89,
    "activeCustomers": 72,
    "avgTicket": 145.60,
    "newThisMonth": 5
  }
}
```

### `GET /api/v1/admin/customers/:id` [NOVO]
Detalhes do cliente com historico de pedidos.

**Auth:** Bearer (ADMIN)
**Response 200:** Cliente completo + lista de pedidos + enderecos

### `PATCH /api/v1/admin/customers/:id/status` [NOVO]
Ativa/desativa cliente.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{ "status": "inactive" }
```
**Response 200:** Cliente atualizado

---

## 14. ADMIN - Avaliacoes

### `GET /api/v1/admin/reviews` [NOVO]
Lista todas as avaliacoes com filtros.

**Auth:** Bearer (ADMIN)
**Query:** `search, productId, status, page, limit`
**Response 200:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Racao Premium Gatos 3kg",
      "author": "Maria Silva",
      "rating": 5,
      "date": "2026-01-28",
      "comment": "Meu gato amou!",
      "status": "approved"
    }
  ],
  "total": 45,
  "stats": {
    "totalReviews": 45,
    "avgRating": 4.2,
    "pendingCount": 5
  }
}
```

### `PATCH /api/v1/admin/reviews/:id/approve` [NOVO]
Aprova uma avaliacao.

**Auth:** Bearer (ADMIN)
**Response 200:** `{ "id": "uuid", "status": "approved" }`

### `PATCH /api/v1/admin/reviews/:id/reject` [NOVO]
Rejeita uma avaliacao.

**Auth:** Bearer (ADMIN)
**Response 200:** `{ "id": "uuid", "status": "rejected" }`

### `DELETE /api/v1/admin/reviews/:id` [NOVO]
Remove uma avaliacao permanentemente.

**Auth:** Bearer (ADMIN)
**Response 204:** No content

---

## 15. ADMIN - Dashboard

### `GET /api/v1/admin/dashboard/stats` [NOVO]
Estatisticas gerais da loja.

**Auth:** Bearer (ADMIN)
**Query:** `period=7d|30d|6m`
**Response 200:**
```json
{
  "totalSales": 12450.00,
  "totalOrders": 156,
  "activeProducts": 11,
  "activeCustomers": 8,
  "salesTrend": "+12.5%",
  "ordersTrend": "+8.2%",
  "ordersByStatus": {
    "pending": 1,
    "processing": 2,
    "shipped": 1,
    "delivered": 3,
    "cancelled": 1
  }
}
```

### `GET /api/v1/admin/dashboard/sales-chart` [NOVO]
Dados do grafico de vendas.

**Auth:** Bearer (ADMIN)
**Query:** `period=7d|30d|6m`
**Response 200:**
```json
{
  "data": [
    { "label": "Seg", "value": 1240.00 },
    { "label": "Ter", "value": 890.00 }
  ]
}
```

### `GET /api/v1/admin/dashboard/top-products` [NOVO]
Produtos mais vendidos.

**Auth:** Bearer (ADMIN)
**Query:** `limit=6`
**Response 200:**
```json
{
  "products": [
    { "id": "uuid", "name": "Racao Premium...", "category": "Racao Seca", "animalType": "gato", "sales": 87, "revenue": 9561.30 }
  ]
}
```

### `GET /api/v1/admin/dashboard/recent-orders` [NOVO]
Pedidos recentes.

**Auth:** Bearer (ADMIN)
**Query:** `limit=6`
**Response 200:** Array dos ultimos pedidos

---

## 16. ADMIN - Destaques

### `GET /api/v1/admin/highlights` [NOVO]
Lista produtos em destaque e recomendados.

**Auth:** Bearer (ADMIN)
**Response 200:**
```json
{
  "featured": [{ "id": "uuid", "name": "...", "isFeatured": true }],
  "recommended": [{ "id": "uuid", "name": "...", "isRecommended": true }]
}
```

### `PUT /api/v1/admin/highlights` [NOVO]
Atualiza a lista de destaques em lote.

**Auth:** Bearer (ADMIN)
**Body:**
```json
{
  "featuredIds": ["uuid1", "uuid2", "uuid3", "uuid4"],
  "recommendedIds": ["uuid5", "uuid6", "uuid7", "uuid8"]
}
```
**Response 200:** Listas atualizadas

---

## 17. ADMIN - Configuracoes da Loja

### `GET /api/v1/admin/settings` [NOVO]
Retorna configuracoes da loja.

**Auth:** Bearer (ADMIN)
**Response 200:**
```json
{
  "storeName": "Olhos de Gato",
  "email": "contato@olhosdegato.com.br",
  "phone": "(11) 3456-7890",
  "whatsapp": "(11) 99999-0000",
  "address": "Rua dos Gatos, 123 - Sao Paulo, SP",
  "shippingFreeAbove": 199.90,
  "shippingBasePrice": 15.90,
  "estimatedDelivery": "3 a 7 dias uteis",
  "pixEnabled": true,
  "creditCardEnabled": true,
  "creditCardMaxInstallments": 12,
  "boletoEnabled": true,
  "socialInstagram": "https://instagram.com/olhosdegato",
  "socialFacebook": "https://facebook.com/olhosdegato",
  "socialTiktok": "https://tiktok.com/@olhosdegato"
}
```

### `PUT /api/v1/admin/settings` [NOVO]
Atualiza configuracoes da loja.

**Auth:** Bearer (ADMIN)
**Body:** Mesmo formato do GET
**Response 200:** Configuracoes atualizadas

---

## 18. ADMIN - Carrinhos Abandonados

### `GET /api/v1/admin/abandoned-carts` [NOVO]
Lista carrinhos abandonados (sem pedido ha mais de 24h).

**Auth:** Bearer (ADMIN)
**Query:** `page, limit`
**Response 200:**
```json
{
  "carts": [
    {
      "id": "uuid",
      "customerName": "Maria Silva",
      "customerEmail": "maria@email.com",
      "items": [{ "productName": "...", "quantity": 2, "price": 109.90 }],
      "total": 219.80,
      "lastActivity": "2026-01-27T15:30:00Z"
    }
  ],
  "total": 15,
  "totalValue": 3450.80
}
```

---

## ALTERACOES NECESSARIAS NO PRISMA SCHEMA

### Novos models:

```prisma
model Subcategory {
  id         String      @id
  animalType AnimalType
  name       String
  icon       String
  isActive   Boolean     @default(true)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  products   Product[]

  @@unique([animalType, id])
}

model Review {
  id        String       @id @default(uuid())
  productId String
  product   Product      @relation(fields: [productId], references: [id])
  authorId  String
  author    Customer     @relation(fields: [authorId], references: [id])
  rating    Int
  comment   String
  status    ReviewStatus @default(PENDING)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model Favorite {
  id         String   @id @default(uuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  createdAt  DateTime @default(now())

  @@unique([customerId, productId])
}

model StoreSettings {
  id                       String  @id @default("default")
  storeName                String
  email                    String
  phone                    String
  whatsapp                 String
  address                  String
  shippingFreeAbove        Decimal
  shippingBasePrice        Decimal
  estimatedDelivery        String
  pixEnabled               Boolean @default(true)
  creditCardEnabled        Boolean @default(true)
  creditCardMaxInstallments Int    @default(12)
  boletoEnabled            Boolean @default(true)
  socialInstagram          String  @default("")
  socialFacebook           String  @default("")
  socialTiktok             String  @default("")
  updatedAt                DateTime @updatedAt
}

model ProductSpecification {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id])
  label     String
  value     String
  order     Int     @default(0)
}
```

### Novos enums:

```prisma
enum AnimalType {
  GATO
  CACHORRO
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Campos a adicionar no Product:

```prisma
model Product {
  // ... campos existentes ...
  animalType      AnimalType
  subcategoryId   String
  subcategory     Subcategory   @relation(fields: [subcategoryId], references: [id])
  promoPrice      Decimal?
  sku             String        @unique
  isFeatured      Boolean       @default(false)
  isRecommended   Boolean       @default(false)
  specifications  ProductSpecification[]
  reviews         Review[]
  favorites       Favorite[]
}
```

### Campos a adicionar no Customer:

```prisma
model Customer {
  // ... campos existentes ...
  reviews   Review[]
  favorites Favorite[]
}
```

---

## RESUMO DE ENDPOINTS

| Grupo | GET | POST | PUT/PATCH | DELETE | Total |
|-------|-----|------|-----------|--------|-------|
| Auth | 1 | 3 | - | - | 4 |
| Produtos (publico) | 4 | - | - | - | 4 |
| Categorias (publico) | 1 | - | - | - | 1 |
| Reviews (publico) | 1 | 1 | - | - | 2 |
| Carrinho | 1 | 1 | 1 | 2 | 5 |
| Favoritos | 1 | 1 | - | 1 | 3 |
| Pedidos (cliente) | 2 | 1 | - | - | 3 |
| Enderecos | 1 | 1 | 1 | 1 | 4 |
| Pagamentos | - | 3 | - | - | 3 |
| Admin Produtos | 1 | 1 | 3 | 1 | 6 |
| Admin Categorias | 1 | 1 | 1 | 1 | 4 |
| Admin Pedidos | 2 | - | 2 | - | 4 |
| Admin Clientes | 2 | - | 1 | - | 3 |
| Admin Avaliacoes | 1 | - | 2 | 1 | 4 |
| Admin Dashboard | 4 | - | - | - | 4 |
| Admin Destaques | 1 | - | 1 | - | 2 |
| Admin Config | 1 | - | 1 | - | 2 |
| Admin Abandonos | 1 | - | - | - | 1 |
| **TOTAL** | **26** | **13** | **13** | **7** | **59** |

---

## CODIGOS DE ERRO PADRAO

| Codigo | Descricao |
|--------|-----------|
| 400 | Dados invalidos (validacao Zod) |
| 401 | Nao autenticado (token ausente ou invalido) |
| 403 | Sem permissao (role insuficiente) |
| 404 | Recurso nao encontrado |
| 409 | Conflito (email duplicado, categoria com produtos) |
| 422 | Erro de regra de negocio (estoque insuficiente) |
| 500 | Erro interno do servidor |

**Formato de erro:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Descricao do erro",
  "details": [
    { "field": "email", "message": "Email invalido" }
  ]
}
```
