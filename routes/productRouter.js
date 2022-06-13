const express = require('express');
const productController = require('./../controller/productController');
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRouter');

const router = express.Router();

router.use('/:prodId/reviews', reviewRouter);

router.route('/type').get(productController.getAlltypes);
router.route('/:type').get(productController.getProductByType);
router.route('/:name').get(productController.getProductByName);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protectRoutes,
    authController.roleValidator('admin'),
    productController.addProduct
  );
router
  .route('/:id')
  .get(productController.getProductById)
  .patch(
    authController.protectRoutes,
    authController.roleValidator('admin'),
    productController.updateProduct
  )
  .delete(
    authController.protectRoutes,
    authController.roleValidator('admin'),
    productController.deleteProduct
  );

module.exports = router;
