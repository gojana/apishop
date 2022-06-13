const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
    },
    comment: {
      type: String,
    },
    userFK: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'la review debe tener un usuario'],
    },
    ProdFK: {
      type: mongoose.Schema.ObjectId,
      ref: 'products',
      required: [true, 'la review debe ser asignada a un producto'],
    },
    active: {
      type: Number,
      default: 1,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); //previene duplicado de reviews

//creacion de modelo
// MOONGOSE TOMA EL PRIMER VALUE Y BUSCA SU EQUIVALENTE LOWERCASED, EN PLURAL EN LA DB DE MONGO
const Reviews = mongoose.model('reviews', reviewSchema);

module.exports = Reviews;
