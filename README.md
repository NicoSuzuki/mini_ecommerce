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

## 🔌 API Endpoints (current)

-   `GET /api/v1/health` -- Health check
-   `GET /api/v1/db-check` -- Database connection check

More endpoints (products, cart, orders, authentication) will be added
progressively.

------------------------------------------------------------------------

## 🎯 Project Status

🚧 Work in progress

Planned features: - Products API - Product listing in frontend -
Shopping cart - Checkout & orders - Authentication and admin panel

------------------------------------------------------------------------

## 📌 Notes

This project is being developed step by step, focusing on clean
architecture, best practices, and scalability.
