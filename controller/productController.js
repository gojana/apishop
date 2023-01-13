const Product = require('./../models/productModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

//-------------UTILITARIO------------------------
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new appError('no es una imagen,solo se aceptan archivos imagen', 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadProductImage = upload.fields([{ name: 'images', maxCount: 5 }]);

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.id}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 60 })
        .toFile(`public/img/products/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

//-------------PUBLICO---------------------------
exports.getAlltypes = catchAsync(async (req, res, next) => {
  const getProductType = await Product.distinct('type', { active: 1 });
  res.status(200).json({ status: 'success', data: { tipos: getProductType } });
});
exports.getProductByType = catchAsync(async (req, res, next) => {
  const productByType = await Product.find({
    type: req.params.type,
    active: 1,
  });
  res
    .status(200)
    .json({ status: 'success', data: { productos: productByType } });
});
exports.getProductByName = catchAsync(async (req, res, next) => {
  const productByName = await Product.findOne({ name: req.params.name });
  if (productByName === null) {
    res
      .status(404)
      .json({ status: 'fail', data: { message: 'producto no encontrado' } });
    return;
  }
  res.status(200).json({ status: 'success', data: { product: productByName } });
});
exports.getItemByQuery = catchAsync(async (req, res, next) => {
  let doc = {};
  if (req.query.type) {
    doc = await Product.find({
      type: req.query.type,
      active: 1,
    });
  }
  if (req.query.name) {
    doc = await Product.findOne({ name: req.query.name });
  }
  if (req.query.id) {
    doc = await Product.findOne({ id: req.query.id });
  }
  if (req.query === '') {
    doc = await Product.find({ active: 1 });
  }

  res
    .status(200)
    .json({ status: 'success', results: doc.length, data: { producto: doc } });
});
exports.getAllProducts = factory.getAllDocs(Product);
exports.getProductById = factory.getDocById(Product);

//-----------ADMIN----------------------------

exports.addProduct = factory.addDoc(Product);
exports.updateProduct = factory.updateDoc(Product);
exports.deleteProduct = factory.deleteDoc(Product);
