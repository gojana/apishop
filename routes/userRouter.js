const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const router = express.Router();

//-----------------------PUBLIC API------------------------
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//-----------------API USER-------------------------------
router.use(authController.protectRoutes);

router.patch('/updateMyPassword', authController.updatePassword);
router.get(
  '/me',
  authController.roleValidator('user'),
  userController.getMe,
  userController.getUserById
);
router.patch(
  '/updateMe',
  authController.roleValidator('user'),
  userController.uploadUserPhoto,
  userController.resizeImage,
  userController.updateMe
);
router.delete(
  '/deleteMe',
  authController.roleValidator('user'),
  userController.deleteMe
);
//-------------------API ADMIN------------------------
router
  .route('/')
  .get(authController.roleValidator('admin'), userController.getAllUsers)
  .post(userController.addUser);
router
  .route('/:id')
  .get(
    authController.roleValidator('user', 'admin'),
    userController.getUserById
  )
  .patch(authController.roleValidator('admin'), userController.updateUser)
  .delete(authController.roleValidator('admin'), userController.deleteUser);

module.exports = router;
