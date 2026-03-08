# Multi-Tenant SaaS E-commerce Platform Architecture

## 1. High-Level Architecture

The platform follows a **Monorepo** structure to manage multiple applications and shared libraries efficiently. It is designed as a **Multi-Tenant SaaS** system where a single instance serves multiple merchants (tenants), with data isolation achieved through a `tenant_id` column in the database (Shared Database, Shared Schema).

### Core Components:

*   **Backend API (`apps/api`)**:
    *   Built with **NestJS**.
    *   Exposes RESTful APIs.
    *   Modular architecture (Domain-Driven Design).
    *   Handles business logic, multi-tenancy enforcement, and integrations.
*   **Merchant Admin Dashboard (`apps/admin-dashboard`)**:
    *   Built with **Next.js** (React).
    *   Used by merchants to manage their store, products, orders, and settings.
*   **Customer Storefront (`apps/storefront`)**:
    *   Built with **Next.js** (React).
    *   Public-facing e-commerce site for customers.
    *   Supports custom domains or subdomains per tenant.
*   **Mobile Apps (`apps/mobile-customer`, `apps/mobile-merchant`)**:
    *   Built with **Flutter**.
    *   Single codebase for iOS and Android.
*   **Database**:
    *   **PostgreSQL** for relational data.
    *   **Redis** for caching and session management.
*   **Infrastructure**:
    *   Dockerized applications.
    *   Kubernetes-ready deployment.
    *   CI/CD pipelines.

## 2. Multi-Tenancy Strategy

*   **Tenant Identification**:
    *   Tenants are identified via subdomain (e.g., `tenant1.platform.com`) or custom domain (e.g., `www.mystore.com`).
    *   The backend middleware resolves the tenant from the `Host` header or `X-Tenant-ID` header.
*   **Data Isolation**:
    *   **Shared Database, Shared Schema**: All tenants share the same database and tables.
    *   **Row-Level Isolation**: Every tenant-specific table has a `tenant_id` column (Foreign Key to `tenants` table).
    *   **Query Scope**: A global interceptor/middleware or repository wrapper automatically appends `WHERE tenant_id = ?` to all queries based on the current context.

## 3. Technology Stack

*   **Backend**: Node.js, NestJS, TypeORM/Prisma (PostgreSQL), BullMQ (Queues), Redis.
*   **Frontend**: Next.js, React, TailwindCSS, React Query.
*   **Mobile**: Flutter.
*   **Search**: OpenSearch / Elasticsearch.
*   **Storage**: S3 Compatible (AWS S3, MinIO, etc.).

## 4. Project Folder Structure

```
/
├── apps/
│   ├── api/                  # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules (Auth, Products, Orders, etc.)
│   │   │   ├── common/       # Shared decorators, guards, filters
│   │   │   ├── config/       # Environment configuration
│   │   │   └── main.ts       # Entry point
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin-dashboard/      # Next.js Merchant Admin
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   ├── components/   # UI Components
│   │   │   ├── hooks/
│   │   │   └── lib/          # API clients, utils
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── storefront/           # Next.js Customer Storefront
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── mobile-customer/      # Flutter App for Customers
│   │   ├── lib/
│   │   └── pubspec.yaml
│   │
│   └── mobile-merchant/      # Flutter App for Merchants
│       ├── lib/
│       └── pubspec.yaml
│
├── packages/                 # Shared libraries (Optional, for monorepo tools like Turborepo)
│   ├── ui/                   # Shared UI components
│   ├── types/                # Shared TypeScript interfaces/types
│   └── utils/                # Shared utility functions
│
├── docker-compose.yml        # Local development infrastructure
├── README.md
└── package.json              # Root package.json (Workspaces)
```

## 5. Core Modules (Backend)

The `apps/api/src/modules` directory will contain:

*   `auth`: Authentication & Authorization (JWT, OAuth).
*   `tenants`: Tenant management and resolution.
*   `users`: User accounts (Merchants, Staff, Customers).
*   `stores`: Store configuration and settings.
*   `catalog`: Products, Categories, Variants, Brands.
*   `inventory`: Stock management, Warehouses.
*   `cart`: Shopping cart logic.
*   `orders`: Order processing, Statuses.
*   `payments`: Payment gateway integrations.
*   `shipping`: Shipping provider integrations.
*   `discounts`: Coupons, Promotions.
*   `notifications`: Email, SMS, Push.
*   `webhooks`: Event-based webhooks system.
*   `analytics`: Reporting and stats.
*   `marketplace`: App store for plugins.

## 6. Database Schema Design (Key Tables)

*   `tenants` (id, name, slug, domain, ...)
*   `users` (id, tenant_id, email, password_hash, role, ...)
*   `stores` (id, tenant_id, name, currency, locale, ...)
*   `products` (id, tenant_id, name, slug, price, ...)
*   `orders` (id, tenant_id, customer_id, total, status, ...)
*   `order_items` (id, order_id, product_id, quantity, price, ...)

## 7. Deployment Strategy

*   **Containerization**: All apps are Dockerized.
*   **Orchestration**: Kubernetes (K8s) or Docker Swarm.
*   **CI/CD**: GitHub Actions or GitLab CI to build images and deploy.
