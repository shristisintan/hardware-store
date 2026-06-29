const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth.verifyToken, productController.createProduct);
router.get('/', auth.verifyToken, productController.getAllProducts); 

module.exports = router;
