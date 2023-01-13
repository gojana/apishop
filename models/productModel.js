const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'el producto debe tener un nombre'],
    unique: true,
  },
  type: {
    type: String,
    required: [true, 'el producto debe tener un tipo'],
    enum: [
      'barbecho',
      'herramienta',
      'almacigo',
      'verdura',
      'fruta',
      'planta',
      'semilla',
    ],
    unique: false,
  },
  description: {
    type: String,
  },
  characteristics: [String],
  price: {
    type: Number,
  },
  stock: {
    type: Number,
  },
  itemsSold: {
    type: Number,
  },
  images: [String],
  active: {
    type: Number,
    default: 1,
  },
});

const Product = mongoose.model('Products', productSchema);
module.exports = Product;
