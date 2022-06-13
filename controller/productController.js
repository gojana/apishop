const Product = require('./../models/productModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

//-------------PUBLICO---------------------------
exports.getAlltypes = catchAsync(async (req, res) => {
  const getProductType = await Product.distinct('type', { active: 1 });
  res.status(200).json({ status: 'success', data: { tipos: getProductType } });
});
exports.getProductByType = catchAsync(async (req, res) => {
  const productByType = await Product.find({ type: req.params.type, active: 1 });
  res
    .status(200)
    .json({ status: 'success', data: { productos: productByType } });
});
exports.getProductByName = catchAsync(async (req, res) => {
  const productByName = await Product.findOne({ name: req.params.name });
  res
    .status(200)
    .json({ status: 'success', data: { producto: productByName } });
});
exports.getAllProducts = factory.getAllDocs(Product);
exports.getProductById = factory.getDocById(Product);

//-----------ADMIN----------------------------

exports.addProduct = factory.addDoc(Product);
exports.updateProduct = factory.updateDoc(Product);
exports.deleteProduct = factory.deleteDoc(Product);
