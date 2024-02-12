require('dotenv').config();

// Establecer la zona horaria predeterminada a Colombia
process.env.TZ = 'America/Bogota';

const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const ApiRoutes = require('./routes/api');
const path = require('path');
const multer = require('multer');

// Importa startTokensVerification
const { startVerificationTokens } = require('./controllers/authController');

// Iniciar la verificación de tokens periódicamente al iniciar la aplicación
startVerificationTokens();

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
});

app.use(express.json());
app.use('/api', ApiRoutes);

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
