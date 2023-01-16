const User = require('./../models/userModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./../utils/appError');

//UTILITARIOS
const filteredRequestBody = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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
exports.uploadUserPhoto = upload.single('photo');
exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 70 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

//--------------API USER------------------------------------------
//se usa middleware para asignar datos a params para luego ser usados por la funcion getUserbyId
exports.getMe = catchAsync(async (req, res, next) => {
  let idUser = req.user.id;
  req.params.id = idUser;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  try {
    //si el usuario intenta cambiar la password desde este metodo
    if (req.body.password || req.body.repeatPassword) {
      return next(
        new appError('esta ruta no es para cambio de passwords', 400)
      );
    }
    if (!req.body.username && !req.file) {
      return next(new appError('no has cambiado ningun dato!', 400));
    }

    //se filtran campos deseados de la request
    const filteredRequest = filteredRequestBody(req.body, 'username', 'photo');
    if (req.body.username === '') {
      delete filteredRequest.username;
    }
    if (req.file) filteredRequest.photo = req.file.filename;

    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredRequest,
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', data: { user: updateUser } });
  } catch (err) {
    return next(new AppError(err, 404));
  }
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: 0 });
  res.status(204).json({ status: 'success', data: null });
});

//--------------ADMIN-------------------------------------------
exports.getUserById = catchAsync(async (req, res, next) => {
  const userById = await User.findById(req.params.id);
  if (!userById) {
    return next(
      new appError(`no se encontro el usuario con el ID: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ status: 'success', data: { userById } });
});
exports.getAllUsers = catchAsync(async (req, res) => {
  //se llama clase APIfeatures para ejecutar las funcionalidades refactorizadas.
  const features = new APIfeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  //se separa el await de la query para poder encadenar mas funciones de ser requerido
  const getUsers = await features.query;

  res.status(200).json({ status: 'success', data: { getUsers } });
});
exports.addUser = catchAsync(async (req, res) => {
  const newUser = await User.create({
    mail: req.body.mail,
    username: req.body.username,
    password: req.body.password,
    repeatPassword: req.body.repeatPassword,
    role: 'user',
    photo: 'newUserAvatar.jpeg',
    active: 1,
  });
  res.status(200).json({ status: 'success', data: { newUser } });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.repeatPassword) {
    return next(new appError('esta ruta no es para cambio de passwords', 400));
  }
  const userUpdate = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!userUpdate) {
    return next(
      new appError(`no se encontro el usuario con el ID: ${req.params.id}`, 404)
    );
  }
  res.status(204).json({ status: 'success', data: { userUpdate } });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const userDelete = await User.findByIdAndDelete(req.params.id);

  if (!userDelete) {
    return next(
      new appError(
        `no se encontro el producto con el ID: ${req.params.id}`,
        404
      )
    );
  }
  res.status(204).json({ status: 'success' });
});
