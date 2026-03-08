# E-Comm SaaS Platform

A production-ready multi-tenant SaaS e-commerce platform similar to Salla, supporting Web + Mobile applications.

## Project Structure

This is a monorepo containing the following applications:

*   **`apps/api`**: NestJS Backend API.
*   **`apps/admin-dashboard`**: Next.js Merchant Admin Dashboard.
*   **`apps/storefront`**: Next.js Customer Storefront.
*   **`apps/mobile-customer`**: Flutter Customer Mobile App.
*   **`apps/mobile-merchant`**: Flutter Merchant Mobile App.
*   **`database`**: Database schema and migration scripts.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design, multi-tenancy strategy, and technology stack.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   Docker & Docker Compose
*   Flutter SDK (for mobile apps)

### Installation

1.  Install dependencies (root):
    ```bash
    npm install
    ```

2.  Start the database:
    ```bash
    docker-compose up -d
    ```

3.  Run the backend:
    ```bash
    cd apps/api
    npm run start:dev
    ```

4.  Run the admin dashboard:
    ```bash
    cd apps/admin-dashboard
    npm run dev
    ```

5.  Run the storefront:
    ```bash
    cd apps/storefront
    npm run dev
    ```

## Database Schema

The database schema is located in `database/schema.sql`. It uses a shared database with `tenant_id` isolation.
