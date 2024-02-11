// src/controllers/userController.js
const db = require('../models'); // Asume que tienes un archivo index.js en tu carpeta models que exporta tus modelos
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

const usersController = {

  async createUser(req, res) {
    try {
      const { firstName, lastName, age, email, username, password } = req.body;
      
      // Verifica si el campo de contraseña está presente en la solicitud
      if (!password) {
        return res.status(400).json({ error: 'La contraseña es requerida' });
      }
      
      // Genera el hash de la contraseña
      const saltRounds = 10; // Número de rounds de sal para bcrypt
      const hashedPassword = await bcrypt.hash(password, saltRounds);
    
      // Crea el usuario con la contraseña hasheada
      const user = await User.create({ firstName, lastName, age, email, username, password: hashedPassword });
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

  async validateToken(token) {
    try {
        // Verificar el token utilizando la clave secreta utilizada para firmar el token
        const decodedToken = jwt.verify(token, 'authToken');

        // Obtener el tiempo actual en segundos
        const currentTimestamp = Math.floor(Date.now() / 1000);

        // Verificar si el token ha expirado comparando con el tiempo de expiración del token (exp)
        return decodedToken.exp >= currentTimestamp;
    } catch (error) {
        // Si hay algún error al verificar el token, se considera inválido
        console.error('Error al verificar el token:', error);
        return false;
    }
  }
};

module.exports = usersController;