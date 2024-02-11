// src/controllers/rolesController.js
const db = require('../models'); // Asume que tienes un archivo index.js en tu carpeta models que exporta tus modelos
const Role = db.Role;
const { Sequelize } = require('sequelize');
const { validationResult, body } = require('express-validator');

const rolesController = {

  async createRole(req, res) {
    try {
      // Validar los campos dentro de la función del controlador
      await Promise.all([
        body('name').notEmpty().withMessage('name es requerido').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name } = req.body;
      
      // Crear el rol con name
      const role = await Role.create({ 
        name
      });
      
      res.json({ message: 'rol creado exitosamente', role });
    } catch (error) {
      console.error('Error al crear el rol', error);
      res.status(500).send('Error al crear el rol');
    }
  },
};

module.exports = rolesController;