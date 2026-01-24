-- 1) DB
CREATE DATABASE IF NOT EXISTS mini_ecommerce
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE mini_ecommerce;

-- 2) Products
CREATE TABLE IF NOT EXISTS products (
  id_product INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'JPY',
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3) Users

CREATE TABLE IF NOT EXISTS users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,

  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,

  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
);


-- Index
CREATE INDEX idx_products_active ON products (is_active);
CREATE INDEX idx_products_name ON products (name);

-- 4) Orders
CREATE TABLE IF NOT EXISTS orders (
  id_order INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,

  total_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'JPY',
  status ENUM('created', 'paid', 'cancelled') NOT NULL DEFAULT 'created',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_orders_user (id_user),
  CONSTRAINT fk_orders_user FOREIGN KEY (id_user) REFERENCES users(id_user)
);

CREATE TABLE IF NOT EXISTS order_items (
  id_order_item INT AUTO_INCREMENT PRIMARY KEY,
  id_order INT NOT NULL,
  id_product INT NOT NULL,

  product_name VARCHAR(255) NOT NULL,
  price_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'JPY',
  quantity INT NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_order_items_order (id_order),
  CONSTRAINT fk_order_items_order FOREIGN KEY (id_order) REFERENCES orders(id_order),
  CONSTRAINT fk_order_items_product FOREIGN KEY (id_product) REFERENCES products(id_product)
);