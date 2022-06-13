const express = require('express');
const reviewController = require('../controller/reviewController');
const authcontroller = require('../controller/authController');

//mergeparams permite que tenga acceso a los params aunque esta ruta sea llamada en otro Route
const router = express.Router({ mergeParams: true });

//--------------PUBLIC-------------------------------
router
  .route('/')
  .get(reviewController.getAllReviews);

//-----------------USER----------------------------
router.use(authcontroller.protectRoutes);
router
  .route('/me')
  .get(authcontroller.roleValidator('user'), reviewController.getMyReviews)
  .post(authcontroller.roleValidator('user'), reviewController.addReview)
  .patch(authcontroller.roleValidator('user'), reviewController.updateMyReview)
  .delete(
    authcontroller.roleValidator('user'),
    reviewController.deleteMyReviews
  );
//---------------admin----------------------------------------------------------------
router
  .route('/:id')
  .get(authcontroller.roleValidator('admin'), reviewController.getReviewById)
  .delete(authcontroller.roleValidator('admin'), reviewController.deleteReview);

module.exports = router;
