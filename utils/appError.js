//construye formato del error a mostrar en consola del cliente al ser llamado
class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'Error';
    //se usara para crear errores customizados y darle la categeria de operacional
    this.isOperational = true;

    //evita que aparesca todo el resumen de error en la consola
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = appError;
