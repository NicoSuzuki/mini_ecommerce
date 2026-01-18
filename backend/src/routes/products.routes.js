const express = require('express');
const router = express.Router();

const productsController = require('../controllers/products.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// GET /api/v1/products
router.get('/', productsController.getAllProducts);

// GET /api/v1/products/deleted
router.get('/deleted', authenticateToken, authorizeRole('admin'), productsController.getDeletedProducts);

// GET /api/v1/products/:id
router.get('/:id', productsController.getProductById);


// POST /api/v1/products
router.post('/', authenticateToken, authorizeRole('admin'), productsController.createProduct);

// PUT /api/v1/products/:id/restore
router.put('/:id/restore', authenticateToken, authorizeRole('admin'), productsController.restoreProduct);

// PUT /api/v1/products/:id
router.put('/:id', authenticateToken, authorizeRole('admin'), productsController.updateProduct);

// DELETE /api/v1/products/:id
router.delete('/:id', authenticateToken, authorizeRole('admin'), productsController.deleteProduct);

module.exports = router;