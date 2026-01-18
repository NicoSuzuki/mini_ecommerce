# Mini E-commerce

A mini e-commerce project built with **Node.js**, **Express**, **React
(Vite)**, and **MySQL**.

The goal of this project is to practice building a clean and scalable
full-stack application, with a well-structured backend API and a modern
frontend.

------------------------------------------------------------------------

## 🚀 Tech Stack

### Backend

-   Node.js
-   Express
-   MySQL
-   mysql2
-   dotenv
-   CORS

### Frontend

-   React
-   Vite
-   JavaScript
-   ESLint

------------------------------------------------------------------------

## 📁 Project Structure

mini-ecommerce/ ├─ backend/ \# Express REST API ├─ frontend/ \# React
application (Vite) └─ database/ \# SQL schema and seed files

------------------------------------------------------------------------

## ⚙️ Setup

### Backend

1.  Go to the backend folder:

        cd backend

2.  Install dependencies:

        npm install

3.  Create a `.env` file based on `.env.example` and configure your
    database credentials.

4.  Start the server:

        npm run dev

------------------------------------------------------------------------

### Database

Run the SQL files inside the `database/` folder in order:

-   `schema.sql`
-   `seed.sql`

These files will create the database schema and insert sample data.

------------------------------------------------------------------------

### Frontend

1.  Go to the frontend folder:

        cd frontend

2.  Install dependencies:

        npm install

3.  Start the development server:

        npm run dev

------------------------------------------------------------------------

## 🔌 API Endpoints

### Public
- `GET /api/v1/health`
- `GET /api/v1/db-check`
- `GET /api/v1/products`
- `GET /api/v1/products/:id`

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Admin (JWT + role = admin)
- `POST /api/v1/products`
- `PUT /api/v1/products/:id`
- `DELETE /api/v1/products/:id`
- `PUT /api/v1/products/:id/restore`
- `GET /api/v1/products/deleted` (trash list)


More endpoints (cart, orders) will be added
progressively.

------------------------------------------------------------------------

## 🧭 Frontend Routes (current)

- `/products` – Products list
- `/products/:id` – Product detail
- `/cart` – Cart (localStorage)
- `/login` – Login
- `/register` – Register

------------------------------------------------------------------------

## 🖥 Frontend (current)

Implemented:
- Register / Login pages
- Products listing (consumes the API)
- Admin-only Create Product page (JWT + role-based access)
- Product detail page
- Shopping cart (localStorage)

Next:
- Checkout & orders

------------------------------------------------------------------------

## 🎯 Project Status

🚧 Work in progress

------------------------------------------------------------------------

## 🗺 Roadmap

Next features:
- Checkout flow
- Create orders from cart
- Order history (user)
- Improve UI/UX styling


------------------------------------------------------------------------

## 📌 Notes

This project is being developed step by step, focusing on clean
architecture, best practices, and scalability.
