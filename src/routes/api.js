// src/routes/api.js
const express = require('express');
const route = express.Router();
const usersController = require('../controllers/usersController');

// Rutas para listar usuarios
route.get('/users', usersController.getAllUsers);

// Ruta para registrar un nuevo usuario
route.post('/register', usersController.createUser);

// Ruta para iniciar sesión
route.post('/login', usersController.loginUser);

// Ruta para iniciar sesión
// Ruta para validar el token
route.post('/validateToken', usersController.validateToken);

module.exports = route;
