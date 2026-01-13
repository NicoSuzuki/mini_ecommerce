const pool = require("../../db/pool")

// GET /api/v1/products
exports.getAllProducts = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : null;

    let query = `SELECT id_product, name, description, price_cents, currency, stock, image_url 
                FROM products 
                WHERE is_active = 1`;
    const params = [];

    if (limit !== null && (!Number.isInteger(limit) || limit <= 0 || limit > 100)) {
        return res.status(400).json({ error: "limit must be 1..100" });
    }
    if (offset !== null && (!Number.isInteger(offset) || offset < 0)) {
        return res.status(400).json({ error: "offset must be >= 0" });
    }


    if (limit !== null) {
        query += ' LIMIT ?';
        params.push(limit);
        if (offset !== null) {
            query += ' OFFSET ?';
            params.push(offset);
        }
    }

    const [rows] = await pool.query(query, params);
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/v1/products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);
    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ error: "Invalid product id" });
    }


    const [rows] = await pool.query(
        `SELECT id_product, name, description, price_cents, currency, stock, image_url, is_active
        FROM products
        WHERE id_product = ? AND is_active = 1
        LIMIT 1`,
        [productId]
    );


    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/v1/products
exports.createProduct = async (req, res) => {
  try {
    const { name, description = null, price_cents, currency = "JPY", stock, image_url = null } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const priceNum = parseInt(price_cents, 10);
    const stockNum = stock === undefined ? 0 : parseInt(stock, 10);

    if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    const cur = (currency || "JPY").trim().toUpperCase();
    if (typeof cur !== "string" || cur.length !== 3) {
        return res.status(400).json({ error: "Currency must be a 3-letter code (e.g., JPY)" });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, description, price_cents, currency, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), description, priceNum, cur, stockNum, image_url]
    );

    res.status(201).json({
      message: 'Product created',
      data: { id_product: result.insertId, name: name.trim(), description, price_cents: priceNum, currency: cur, stock: stockNum, image_url }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/v1/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const {
      name,
      description,
      price_cents,
      currency,
      stock,
      image_url,
      is_active
    } = req.body;

    const [exists] = await pool.query(
      "SELECT id_product FROM products WHERE id_product = ? AND is_active = 1 LIMIT 1",
      [productId]
    );
    if (exists.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const fields = [];
    const params = [];

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
      }
      fields.push('name = ?');
      params.push(name.trim());
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        return res.status(400).json({ error: "Description must be a string or null" });
      }
      fields.push('description = ?');
      params.push(description);
    }

    if (price_cents !== undefined) {
      const priceNum = parseInt(price_cents, 10);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number' });
      }
      fields.push('price_cents = ?');
      params.push(priceNum);
    }

    if (currency !== undefined) {
      if (typeof currency !== "string" || currency.trim().length !== 3) {
        return res.status(400).json({ error: "Currency must be a 3-letter code (e.g., JPY)" });
      }
      fields.push("currency = ?");
      params.push(currency.trim().toUpperCase());
    }
    
    if (stock !== undefined) {
      const stockNum = parseInt(stock, 10);
      if (Number.isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative number' });
      }
      fields.push('stock = ?');
      params.push(stockNum);
    }

    if (image_url !== undefined) {
      if (image_url !== null && typeof image_url !== "string") {
        return res.status(400).json({ error: "image_url must be a string or null" });
      }
      fields.push("image_url = ?");
      params.push(image_url);
    }

    if (is_active !== undefined) {
      const activeNum = Number(is_active);
      if (![0, 1].includes(activeNum)) {
        return res.status(400).json({ error: "is_active must be 0 or 1" });
      }
      fields.push("is_active = ?");
      params.push(activeNum);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id_product = ? AND is_active = 1`;
    params.push(productId);

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found (or already deleted)" });
    }

    const [rows] = await pool.query(
      `SELECT id_product, name, description, price_cents, currency, stock, image_url, is_active
       FROM products
       WHERE id_product = ?`,
      [productId]
    );

    res.status(200).json({
      message: 'Product updated',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const [result] = await pool.query(
      'UPDATE products SET is_active = 0, updated_at = NOW() WHERE id_product = ? AND is_active = 1',
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found (or already deleted)' });
    }

    res.status(200).json({ message: 'Product soft deleted' });
  } catch (error) {
    console.error('Error soft deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/v1/products/:id/restore
exports.restoreProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (Number.isNaN(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const [result] = await pool.query(
      `UPDATE products
       SET is_active = 1
       WHERE id_product = ? AND is_active = 0`,
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found (or not deleted)' });
    }

    return res.status(200).json({ message: 'Product restored' });
  } catch (error) {
    console.error('Error restoring product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};