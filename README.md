# Mini E-commerce

A mini e-commerce project built with **Node.js**, **Express**, **React (Vite)**, and **MySQL**.

The goal of this project is to practice building a clean and scalable full-stack application, with a well-structured backend API, authentication + authorization, and an admin dashboard.

---

## 🚀 Tech Stack

### Backend

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- CORS
- JWT (jsonwebtoken)
- bcryptjs

### Frontend

- React
- Vite
- JavaScript
- React Router
- ESLint

---

## ✅ Features

### Public / User

- Products list + product detail (API consumption)
- Register / Login (JWT)
- Cart stored in `localStorage`
- Checkout → creates an order and decreases stock (transaction)
- My Orders (order history)
- Order detail page

### Admin Dashboard (JWT + role = `admin`)

- **Admin Products**: Create / Edit / Soft delete / Restore + Deleted products list
- **Admin Orders**: List + Order detail + Update status (button-based update)
- **Admin Users**: List + Update role + Enable/Disable users

> UI is intentionally simple for now (focus on functionality). Styling improvements will come later.

---

## 📁 Project Structure

```
mini-ecommerce/
├─ backend/    # Express REST API
├─ frontend/   # React application (Vite)
└─ database/   # SQL schema and seed files
```

---

## ⚙️ Setup

### 1) Database

Run the SQL files inside the `database/` folder in order:

- `schema.sql`
- `seed.sql`

---

### 2) Backend

1. Go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (example):

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=mini_ecommerce

JWT_SECRET=your_super_secret
JWT_EXPIRES_IN=1h

PORT=4000
```

4. Start the server:

```bash
npm run dev
```

The backend runs on: `http://localhost:4000`

---

### 3) Frontend

1. Go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

---

## 🔌 API Endpoints (current)

### Health

- `GET /api/v1/health`
- `GET /api/v1/db-check`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Products (public)

- `GET /api/v1/products`
- `GET /api/v1/products/:id`

### Products (admin)

- `POST /api/v1/products`
- `PUT /api/v1/products/:id`
- `DELETE /api/v1/products/:id`
- `PUT /api/v1/products/:id/restore`
- `GET /api/v1/products/deleted`

### Orders (authenticated)

- `POST /api/v1/orders` (checkout)
- `GET /api/v1/orders` (my orders)
- `GET /api/v1/orders/:id` (my order detail)

### Admin Orders (admin)

- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/orders/:id`
- `PUT /api/v1/admin/orders/:id/status`

### Admin Users (admin)

- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id`

---

## 🧭 Frontend Routes (current)

### Public / User

- `/products` – Products list
- `/products/:id` – Product detail
- `/cart` – Cart
- `/login` – Login
- `/register` – Register
- `/orders` – My orders
- `/orders/:id` – Order detail

### Admin

- `/admin` – Admin dashboard home
- `/admin/products` – Manage products
- `/admin/orders` – Manage orders
- `/admin/orders/:id` – Admin order detail + update status
- `/admin/users` – Manage users

---

## 🗺 Roadmap

Next improvements:

- Pagination + search for admin lists (orders/users/products)
- Better UI/UX styling (layout, reusable components)
- Tests (backend + frontend)
- Payment integration (future)

---

## 📌 Notes

This project is being developed step by step, focusing on clean architecture, best practices, and scalability.
