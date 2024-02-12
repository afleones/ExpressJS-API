// src/routes/api.js
const express = require('express');
const authController = require('../controllers/authController');
const route = express.Router();
const usersController = require('../controllers/usersController');
const entitiesController = require('../controllers/entitiesController');
const rolesController = require('../controllers/rolesController');


// Ruta para registrar un nuevo usuario
route.post('/register', authController.createUser);

// Ruta para iniciar sesión
route.post('/login', authController.loginUser);

// Middleware de autenticación para rutas protegidas
route.use(authController.authenticateToken);

    // Ruta para iniciar sesión
    route.post('/logout', authController.logoutUser);

    // Ruta para verificar token
    route.post('/authenticateToken', authController.authenticateToken);

    // Rutas para listar usuarios
    route.get('/users', usersController.getAllUsers);

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
