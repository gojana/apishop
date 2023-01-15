const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const sendMail = require('./../utils/email');
const crypto = require('crypto');

//funciones utilitarias o refactorizadas
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (user, rememberMe = false, statusCode, res) => {
  const token = signToken(user._id);
  let cookieExpiresIn = 0;
  if (rememberMe) {
    cookieExpiresIn = 1;
  } else {
    cookieExpiresIn = process.env.JWT_COOKIE_EXPIRES_IN;
  }
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    secure: true, //opcion para solo permitir request desde protocolo https (en vez de htttp)
    httpOnly: true, //opcion para que cookie no pueda ser accedida ni modificada por el browser
    sameSite: 'None',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; //remover el password desde consola del cliente
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findOne({ mail: req.body.mail });

    if (user) {
      return next(new AppError('ya existe un usuario con ese email', 404));
    }

    const newUser = await User.create({
      mail: req.body.mail,
      username: req.body.username,
      password: req.body.password,
      repeatPassword: req.body.repeatPassword,
      photo: 'newUserAvatar.jpeg',
      role: 'user',
      active: 1,
    });
    //createSendToken(newUser, 201, res);

    res.status(200).json({
      status: 'success',
      data: {
        message: 'usuario creado',
      },
    });
  } catch (err) {
    return next(new AppError(err, 404));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { mail, password, rememberMe } = req.body;
  // se verifica que  el pass y email existan
  if (!mail || !password) {
    return next(new AppError('por favor ingrese password o email', 401));
  }
  //verificar si el mail y la pass son correctas
  const user = await User.findOne({ mail }).select('+password');
  if (!user) {
    return next(new AppError('password o email incorrecto', 401));
  }
  const correct = await user.correctPassword(password, user.password);
  if (!correct) {
    return next(new AppError('password o email incorrecto', 401));
  }

  //si todo esta bien  enviar token al cliente
  createSendToken(user, rememberMe, 201, res);
});
exports.logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    secure: true, //opcion para solo permitir request desde protocolo https (en vez de htttp)
    httpOnly: true, //opcion para que cookie no pueda ser accedida ni modificada por el browser
    sameSite: 'None',
  };
  res.cookie('jwt', '', cookieOptions);
  res.status(200).json({
    status: 'success',
    data: {
      message: 'deslogueado con exito',
    },
  });
});

exports.protectRoutes = catchAsync(async (req, res, next) => {
  //verificar si el token existe
  let token;
  //if (
  //req.headers.authorization &&
  //req.headers.authorization.startsWith('Bearer')
  // ) {
  token = req.cookies.jwt;
  // }
  if (!token) {
    return next(new AppError('no estas logueado, acceso denegado', 401));
  }
  //verificar si el token corresponde
  //el metodo verify retorna 3 variables, id del usuario, iat: issued at y la fecha de expiracion exp
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //verificar si el usuario aun existe
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) return next(new AppError('el usuario ya no existe', 401));

  //verificar si la password cambio despues de asignarle el token
  if (freshUser.changedPassword(decoded.iat)) {
    return next(new AppError('el usuario cambio su pass recientemente', 401));
  }
  //se concede acceso a a la ruta si todo sale bien
  req.user = freshUser;
  next();
});

exports.isLogged = catchAsync(async (req, res, next) => {
  //verificar si el token existe
  if (req.cookies.jwt) {
    //verificar si el token corresponde
    //el metodo verify retorna 3 variables, id del usuario, iat: issued at y la fecha de expiracion exp
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    //verificar si el usuario aun existe
    const userStillExist = await User.findById(decoded.id);
    if (!userStillExist)
      return next(new AppError('el usuario ya no existe', 401));
    //verificar si la password cambio despues de asignarle el token
    if (userStillExist.changedPassword(decoded.iat)) {
      return next(new AppError('el usuario cambio su pass recientemente', 401));
    }
    //se entrega datos de usuario para uso en el frontend
    res.status(200).json({
      status: 'success',
      data: {
        user: userStillExist,
      },
    });
  } else {
    return next(new AppError('no existe cookie', 401));
  }
});

// EL VALIDADOR DEPENDE DEL RETURN DE PROTECT ROUTES, por ende debe ir despues al ser middleware
exports.roleValidator = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('tu rol no tiene permiso para esta ruta'));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ mail: req.body.mail });
  //verifica si existe usuario (email)
  if (!user) {
    return next(new AppError('no existe usuario con ese email', 404));
  }
  //se genera el random token anexado al email
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //enviar token a correo para reset de password funcional en clientes tipo POSTMAN
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetPassword/${resetToken} `;
  //enviar token a correo para reset de password funcional con frontEND
  const ResetURLFront = `${req.protocol}://${process.env.REACT_APP_URL_PROD}/resetPassword/${resetToken}`;

  const message = `olvidaste tu pass? crea una nueva siguiendo este link ${ResetURLFront}`;
  try {
    await sendMail({
      email: user.mail,
      subject: 'tu token para resetar pass es valido por 10 mins',
      message,
    });
    res
      .status(200)
      .json({ status: 'success', message: 'token enviado al mail' });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`${err}`, 500));
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  //obtener usuario desde el token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //si el token no ha expirado y existe el usuario, modificar passwordReset values y tokens
  if (!user) {
    return next(new AppError('token invalido o usuario no existe'), 404);
  }
  //se actualiza pass del usuario
  user.password = req.body.password;
  user.repeatPassword = req.body.repeatPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //update de pass se aplica en modelo del usuario "userSchema.save()"
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //conseguir el usuario
  const user = await User.findById(req.user.id).select('+password');
  //checkear si el POST password es correctas
  const correct = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!correct) {
    return next(new AppError('tu contraseña actual es erronea', 401));
  }
  if (await user.correctPassword(req.body.password, user.password)) {
    return next(
      new AppError('la contraseña actual no puede ser igual a la anterior', 400)
    );
  }
  if (req.body.password !== req.body.repeatPassword) {
    return next(new AppError('las contraseñas nuevas no coinciden'), 400);
  }
  //si el password es correcto, updatear el password
  user.password = req.body.password;
  user.repeatPassword = req.body.repeatPassword;
  await user.save();
  //loguear al usuario, enviar y JWT
  createSendToken(user, 201, res);
});
