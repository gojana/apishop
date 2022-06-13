//recibe una funcion como argumento, esto ahorra el uso del bloque try catch al llamar este metodo
module.exports = catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
