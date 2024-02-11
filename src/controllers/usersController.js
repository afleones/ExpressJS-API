// src/controllers/userController.js
const db = require('../models'); // Asume que tienes un archivo index.js en tu carpeta models que exporta tus modelos
const User = db.User;
const Role = db.Role;
const Entity = db.Entity;
const TypeId = db.TypeId;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const { validationResult, body } = require('express-validator');

const usersController = {

  async createUser(req, res) {
    try {
      const { firstName, lastName, typeId, numberId, dateOfBirth, email, username, password } = req.body;
  
      // Validar los campos dentro de la función del controlador
      await Promise.all([
        body('firstName').notEmpty().withMessage('nombres requeridos').run(req),
        body('lastName').notEmpty().withMessage('apellidos requeridos').run(req),
        body('typeId').notEmpty().withMessage('debe seleccionar un tipo de documento').run(req),
        body('numberId').notEmpty().withMessage('digite su numero de documento').run(req),
        body('dateOfBirth').notEmpty().withMessage('debe insertar su fecha de nacimiento').run(req),
        body('email').notEmpty().withMessage('debe proporcionar un correo electronico').run(req),
        body('username').notEmpty().withMessage('escriba su nombre de usuario o nickname').run(req),
      ]);
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
  
      // Verifica si el campo de contraseña está presente en la solicitud
      if (!password) {
        return res.status(400).json({ error: 'La contraseña es requerida' });
      }
  
      // Verificar si el username ya está en uso
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
  
      // Verificar si el email ya está en uso
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }
  
      // Verificar si el typeId ya está en uso
      const existingNumberId = await User.findOne({ where: { numberId } });
      if (existingNumberId) {
        return res.status(400).json({ error: 'El el documento ya está registrado' });
      }
  
      // Calcular la fecha de nacimiento
      const birthDate = new Date(dateOfBirth);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const birthYear = birthDate.getFullYear();
      let age = currentYear - birthYear;
  
      // Verificar si el cumpleaños ya pasó en el año actual
      const currentMonth = currentDate.getMonth();
      const birthMonth = birthDate.getMonth();
      const currentDay = currentDate.getDate();
      const birthDay = birthDate.getDate();
  
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        age--; // Restar 1 si aún no ha pasado el cumpleaños en el año actual
      }
  
      // Genera el hash de la contraseña
      const saltRounds = 10; // Número de rounds de sal para bcrypt
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Crea el usuario con la contraseña hasheada
      const user = await User.create({ firstName, lastName, typeId, numberId, dateOfBirth, age, email, username, password: hashedPassword });
      res.json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).send('Error al registrar usuario');
    }
  },
    
  async loginUser(req, res) {
    try {
        const { emailOrUsername, password } = req.body;

        let user;
        if (emailOrUsername.includes('@')) {
            // Si el valor es un correo electrónico, busca por correo electrónico
            user = await User.findOne({ where: { email: emailOrUsername } });
        } else {
            // Si el valor no es un correo electrónico, busca por nombre de usuario
            user = await User.findOne({ where: { username: emailOrUsername } });
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ userId: user.id }, 'authToken', { expiresIn: '1h' });
        
        // Configurar la cookie con el token y la información del usuario
        res.cookie('authToken', token, {
            expires: new Date(Date.now() + 3600000), // Expira en 1 hora (3600000 milisegundos)
            httpOnly: true, // La cookie solo es accesible mediante HTTP
            secure: true // La cookie solo se envía a través de HTTPS en producción
        });

        res.json({ user, token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión');
    }
  },

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