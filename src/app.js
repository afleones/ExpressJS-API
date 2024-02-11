const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const ApiRoutes = require('./routes/api');
const path = require('path');
require('dotenv').config();
const multer = require('multer');

// Configuración de multer para manejar formularios
const upload = multer();

// Middleware para procesar los datos de formulario
app.use(upload.none());

const PORT = process.env.PORT || 3001;

// Configura el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Ruta para renderizar la vista welcome
app.get('/', (req, res) => {
  res.render('welcome');
  console.log(process.env.DB_HOST); // Debería imprimir 'root'
});

app.use(express.json());
app.use('/api', ApiRoutes);

// Configuración de conexión a la base de datos
const dbConfig = {

  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

};
// Definir ruta para manejar la solicitud
app.post('/verifyToken', (req, res) => {
  // Obtener el token del cuerpo de la solicitud
  const token = req.body.token;
  
  // Hacer algo con el token
});
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
