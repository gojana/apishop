class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //armado de Query para filtro
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    //filtro avanzado usando regex
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    // se realiza consulta
    // let query = User.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // el if verifica si la propiedad sort existe en el objeto query
    if (this.queryString.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-rut');
    }
    return this;
  }

  limitFields() {
    //seleccion de campos de la tabla
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    //PAGINACION de datos segun parametros
    //el metodo skip es para ver cuantos resultados se salta para llegar a la sig pag
    //el metodo limit establece el limite de resultados en la query
    const page = this.queryString.page + 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIfeatures;
