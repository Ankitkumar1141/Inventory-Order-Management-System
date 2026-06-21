# Inventory & Order Management System

A full-stack Inventory and Order Management System built with FastAPI, React, and PostgreSQL — fully containerized with Docker.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python + FastAPI |
| Frontend | React + Vite |
| Database | PostgreSQL 16 |
| Container | Docker + Docker Compose |

## Features

- **Product Management** — CRUD operations, SKU uniqueness, stock tracking
- **Customer Management** — Add/view/delete customers with email uniqueness
- **Order Management** — Create orders with automatic stock deduction, order detail view
- **Dashboard** — Summary stats: total products, customers, orders, and low-stock alerts
- **Business Logic** — Inventory validation before order creation, automatic total calculation, stock restore on order cancellation

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone <repo-url>
cd inventory-order-management

# 2. Copy env file and configure
cp .env.example .env

# 3. Start all services
docker-compose up --build

# App:     http://localhost:80
# API:     http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products/ | List all products |
| POST | /products/ | Create product |
| GET | /products/{id} | Get product |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /customers/ | List all customers |
| POST | /customers/ | Create customer |
| GET | /customers/{id} | Get customer |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /orders/ | List all orders |
| POST | /orders/ | Create order |
| GET | /orders/{id} | Get order |
| DELETE | /orders/{id} | Cancel order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/stats | Summary statistics |

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Set DATABASE_URL in .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
# Set VITE_API_URL in .env.local
npm run dev
```

## Deployment

### Backend → Render / Railway / Fly.io
- Set `DATABASE_URL` environment variable pointing to hosted PostgreSQL
- Deploy the `backend/` directory

### Frontend → Vercel / Netlify
- Set `VITE_API_URL` to the deployed backend URL
- Deploy the `frontend/` directory (build command: `npm run build`, output: `dist/`)
