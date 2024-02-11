require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
  },
  test: {
    // Configuración para el entorno de prueba
  },
  production: {
    // Configuración para el entorno de producción
  },
};
