const AppError = require('./../utils/appError');

const handlerCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:  ${err.value}`;
  return new AppError(message, 400);
};

const handlerDuplicateIdsDB = (err) => {
  const value = Object.keys(err.keyValue);
  const message = `duplicated field value:${value} please use another value`;
  return new AppError(message, 400);
};
const handlerValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `invalid input data. ${errors.join('. ')} `;
  return new AppError(message, 400);
};
const handlerJWTError = () => {
  return new AppError('token invalido', 401);
};
const handlerExpiredError = () => {
  return new AppError('tu token expiro, loguea denuevo', 401);
};
//refactorizacion de codigo error de funcion exportada en module.export
const sendErroDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //error desconocido( no operacional) en el cual no se revelaran datos del error al cliente
  } else {
    //log el error en consola, pero sin que cliente lo vea como respuesta
    console.error('ERROR', err);
    //se genera mensaje generico al cliente
    res.status(500).json({ status: 'error', message: 'algo salio muy mal' });
  }
};
//implementacion de errores "custom"
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErroDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') error = handlerCastErrorDB(error);
    if (error.code === 11000) error = handlerDuplicateIdsDB(error);
    if (error.name === 'ValidationError')
      error = handlerValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handlerJWTError();
    if (error.name === 'TokenExpiredError') error = handlerExpiredError();

    sendErrorProd(error, res);
  }
};
