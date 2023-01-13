const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

const hostname = '0.0.0.0';

//se atrapa excepciones y reject de promises
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION, shutting down....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

const port = process.env.PORT;

//se reemplaza la palabra password en el string de conexion con la variable de enviroment
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//conexion a DB con libreria mongoose
mongoose.connect(DB, {}).then((con) => {
  console.log('connected to DB');
});

const server = app.listen(port, hostname, () => {
  console.log(`listening on port ${port}...`);
});
//se atrapa excepciones y reject de promises
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION, shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
