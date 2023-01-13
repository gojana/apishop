const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  mail: {
    type: String,
    required: true,
    lowercase: true,
    validate: [validator.isEmail, 'usa un email valido'],
    unique: true,
  },
  username: {
    type: String,
    required: [true, 'el campo usuario es obligatorio'],
  },
  password: {
    type: String,
    required: [true, 'el usuario debe tener password'],
    minLength: [8, 'el largo de la Password es menor a lo permitido (8)'],
    select: false,
  },
  repeatPassword: {
    type: String,
    required: true,
    validate: {
      //esto solo funciona con el metodo mongoose SAVE()
      validator: function (el) {
        return el === this.password;
      },
      message: 'las password no son iguales',
    },
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
  },
  photo: { type: String },
  active: {
    type: Number,
    required: true,
    select: false,
  },
});

//encriptacion de pass
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.repeatPassword = undefined;
});
//verificacion de pass y su repeticion al momento de hacer signUp
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//comparacion fecha creacion token con la ultima vez que se cambio pass
userSchema.methods.changedPassword = function (JWTtimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTtimeStamp < changedTimeStamp;
  }
  return false;
};
//fija changePassword en la DB al usar la funcion resetPassword
userSchema.pre('save', function (next) {
  if (this.isNew) return next();
  //se le resta un segundo para asegurar que el token siempre se crea primero que esta propiedad
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//crea y encripta token para reset de password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
userSchema.pre(/^find/, function (next) {
  this.find({ active: 1 });
  next();
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
