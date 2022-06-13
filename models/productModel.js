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
    unique: true,
  },
  description: {
    type: String,
  },
  characteristics: [String],
  price: {
    type: Number,
    required: true,
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
