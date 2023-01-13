const express = require('express');
const app = express();

//----------librerias externas
const bodyParser = require('body-parser');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const reviewRouter = require('./routes/reviewRouter');

//MIDDLEWARE

app.use(bodyParser.json({ limit: '10kb' }));
app.use(cookieParser());

//**********SEGURIDAD*****************/
//seguridad para los HEADERS HTTP

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({origin: 'http://localhost:3000',
credentials:  true} ));

const limiter = rateLimit({
  max: 5000,
  windowMs: 60 * 60 * 1000,
  message: 'muchas request desde esta IP, intente nuevamente en 1 hora',
});
app.use('/api', limiter);
// sanitizacion de datos contra ataques NOSQL (inyeccion NOSQL)
app.use(mongoSanatize());
//sanitizacion de datos contra XSS cross-side-scripting ( inyecciones HTML y JS)
app.use(xss());
//prevenir polucion de parametros ( duplicados )
app.use(hpp({ whitelist: [''] }));

//********RUTAS***************
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);

//*******RUTAS PUBLICAS*********
app.use('/api/v1/productResources', express.static('public/img/products'));
app.use('/api/v1/userResources', express.static('public/img/users'));

//************MANEJO DE ERRORES****************/
//atrapa todos los request de rutas erroneas
app.all('*', (req, res, next) => {
  next(new appError(`cant find the source ${req.originalUrl}`, 404));
});

// maneja todos los errores mediante la clase nativa Error,dandoles formato ordenado.
app.use(globalErrorHandler);

module.exports = app;
