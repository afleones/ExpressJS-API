// src/controllers/entitiesController.js
const db = require('../models'); // Asume que tienes un archivo index.js en tu carpeta models que exporta tus modelos
const Entity = db.Entity;
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const { validationResult, body } = require('express-validator');

const entitiesController = {

  async createEntity(req, res) {
    try {

      const { nameEntity, dbPrefix, dbSufix, VersionEntity } = req.body;

      // Validar los campos dentro de la función del controlador
      await Promise.all([
        body('nameEntity').notEmpty().withMessage('nameEntity es requerido').run(req),
        body('dbPrefix').notEmpty().withMessage('dbPrefix es requerido').run(req),
        body('dbSufix').notEmpty().withMessage('dbSufix es requerido').run(req),
        body('VersionEntity').notEmpty().withMessage('VersionEntity es requerido').run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verificar si el email ya está en uso
      const existingEntity = await Entity.findOne({ where: { nameEntity } });
      if (existingEntity) {
        return res.status(400).json({ error: 'ya existe una entidad con este nombre' });
      }


      const saltRounds = 10;
      
      // Crear el hash de tokenEntity
      const hashTokenEntity = await bcrypt.hash(nameEntity, saltRounds);
      
      // Crear la entidad con nameEntity y los demás campos
      const entity = await Entity.create({ 
        nameEntity,
        dbPrefix,
        dbSufix,
        tokenEntity: hashTokenEntity, // Usar el hash de nameEntity como tokenEntity
        VersionEntity
      });
      
      res.json({ message: 'Entidad creada exitosamente', entity });
    } catch (error) {
      console.error('Error al crear la entidad:', error);
      res.status(500).send('Error al crear la entidad');
    }
  },
};

module.exports = entitiesController;