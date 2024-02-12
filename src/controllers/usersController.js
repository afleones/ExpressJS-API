// src/controllers/userController.js
const db = require('../models'); // Asume que tienes un archivo index.js en tu carpeta models que exporta tus modelos
const User = db.User;
const Role = db.Role;
const Entity = db.Entity;
const TypeId = db.TypeId;
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const { validationResult, body } = require('express-validator');

const usersController = {
    
    async getAllUsers(req, res)  {
        try {
          const users = await User.findAll();
          res.status(200).json({message:"Listado de usuarios del sistema", users});
        } catch (error) {
          console.error('Error al obtener usuarios:', error);
          res.status(500).send(error.message);
        }
  },

  async assignRoleToUser(req, res) {
    try {
      // Verificar si el usuario y el rol existen
      const { userId, roleId } = req.body;
  
      const user = await User.findByPk(userId);
      const role = await Role.findByPk(roleId);
  
      if (!user || !role) {
        return res.status(400).json({ error: 'El usuario o el rol especificado no existen' });
      }
  
      // Asociar el usuario al rol
      await user.addRole(role);

       // Obtener el nombre del rol
      const roleName = role.name;
  
      return res.status(200).json({ message: `Rol: ${roleName}, asignado correctamente` });
      } catch (error) {
      console.error('Error al asignar el rol al usuario:', error);
      return res.status(500).json({ error: `Error al asignar el rol al usuario: ${error.message}` });
    }
  },
  
  async assignEntityToUser(req, res) {
    try {
      // Verificar si el usuario y la entidad existen
      const { userId, entityId } = req.body;
  
      const user = await User.findByPk(userId);
      const entity = await Entity.findByPk(entityId);
  
      if (!user || !entity) {
        return res.status(400).json({ error: 'El usuario o la entidad especificada no existen' });
      }
  
      // Asociar el usuario a la entidad
      await user.addEntity(entity);
  
      // Obtener el nombre de la entidad
      const entityName = entity.nameEntity;
  
      return res.status(200).json({ message: `Acceso concedido a la entidad: ${entityName}` });
    } catch (error) {
      console.error('Error al asignar la entidad al usuario:', error);
      return res.status(500).json({ error: `Error al asignar la entidad al usuario: ${error.message}` });
    }
  },

  async createTypeId(req, res) {
    try {
      // Verificar si el usuario y la entidad existen
      const { name } = req.body;
  
      if (!name) {
        return res.status(400).json({ error: 'este campo no puede estar vacio' });
      }
  
      // Crea el usuario con la contraseña hasheada
      const typeId = await TypeId.create({ name });
      res.json({ message: 'tipo de identificacion creado exitosamente', typeId });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).send('Error al registrar usuario');
    }
  },
    
};

module.exports = usersController;