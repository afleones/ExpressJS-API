// src/routes/api.js
const express = require('express');
const route = express.Router();
const usersController = require('../controllers/usersController');
const entitiesController = require('../controllers/entitiesController');
const rolesController = require('../controllers/rolesController');


// Rutas para listar usuarios
route.get('/users', usersController.getAllUsers);

// Ruta para registrar un nuevo usuario
route.post('/register', usersController.createUser);

// Ruta para iniciar sesión
route.post('/login', usersController.loginUser);

// Ruta para registrar entidad
route.post('/createentity', entitiesController.createEntity);

// Ruta para crear roles
route.post('/createrole', rolesController.createRole);

// Ruta para asignar roles
route.post('/assignRoleToUser', usersController.assignRoleToUser);

// Ruta para dar acceso a entidad a usuario
route.post('/assignEntityToUser', usersController.assignEntityToUser);

// Ruta para crear tipos de identificacion
route.post('/createTypeId', usersController.createTypeId);



module.exports = route;
