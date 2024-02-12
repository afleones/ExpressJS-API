// src/controllers/userController.js
const db = require('../models'); // Asume que tienes un archivo index.js en tu carpeta models que exporta tus modelos
const User = db.User;
const Role = db.Role;
const Entity = db.Entity;
const PersonalAccessToken = db.PersonalAccessToken;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const { validationResult, body } = require('express-validator');
const { Op } = require('sequelize');
const cron = require('node-cron');



const authController = {

  // Funcion para iniciar sesion /login
  async  loginUser(req, res) {
    try {
        const { emailOrUsername, password } = req.body;

        // Validar los campos dentro de la función del controlador
        await Promise.all([
            body('emailOrUsername').notEmpty().withMessage('Debe digitar su username o email').run(req),
            body('password').notEmpty().withMessage('La contraseña es requerida').run(req),
        ]);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
        const cookieName = 'authToken'; // Nombre de la cookie que se establece en Express

        const token = jwt.sign({ userId: user.id }, cookieName, { expiresIn: '10s' });

        const pathModel = "src\\models\\user.js";

        // Aquí se inserta los datos del token en la tabla personal_access_tokens
        const newAccessToken = await PersonalAccessToken.create({
            tokenableType: pathModel, // Ruta del modelo User
            tokenableId: user.id, // ID del usuario asociado
            name: cookieName, // Utiliza el nombre de la cookie para el campo name
            token: token, // Token generado
            lastUsedAt: null, // Puede ser nulo por defecto
            expiresAt: new Date(Date.now() + 3600000), // Fecha de expiración del token (1 hora desde ahora)
            stateSession: true, // Estado de la sesion
            createdAt: new Date(), // Fecha de creación del token
        });
      
        // Configurar la cookie con el token y la información del usuario
        res.cookie(cookieName, token, {
            expiresAt: new Date(Date.now() + 3600000), // Expira en 1 hora (3600000 milisegundos)
            httpOnly: true, // La cookie solo es accesible mediante HTTP
            secure: true // La cookie solo se envía a través de HTTPS en producción
        });

        res.json({ user, token });
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión');
    }
},

  async updateStateSession(token){

    try{
      // Encuentra y actualiza el registro PersonalAccessToken por token
      const personalAccessToken = await PersonalAccessToken.findOne({ where: { token: token } });
      
      if (personalAccessToken) {
          personalAccessToken.stateSession = 0; // Marca la sesión como no válida
          await personalAccessToken.save(); // Guarda los cambios en la base de datos
          return personalAccessToken.stateSession; // Devuelve un objeto indicando el éxito de la actualización
        } else {
        return { success: false, message: 'no se actualizo el estado' }; // Devuelve un objeto indicando que el token no se encontró
      }
    }catch (error) {
        console.error('Error al actualizar lastUsedAt:', error);
        throw new Error('Error interno del servidor');
    }
    
  },

  // Funcion para cerrar sesion /logout
  async logoutUser(req, res) {
    try {
        // Eliminar la cookie del token de autenticación
        res.clearCookie('authToken');

        // Actualizar el campo stateSession en PersonalAccessToken
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7); // Elimina la palabra "Bearer " del encabezado

          await authController.updateStateSession(token);
        }

        // Respondemos con un mensaje de éxito
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
},

  //Funcion para crear usuario /register
  async createUser(req, res) {
    try {
      const userData = req.body;

      // Validar los datos del usuario
      const validationErrors = await authController.validateUserData(userData);

      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }

      // Verificar si hay datos duplicados
      const uniqueDataError = await authController.verifyUniqueData(userData);
      if (uniqueDataError) {
        return res.status(400).json({ error: uniqueDataError });
      }

      // Calcular la edad del usuario
      const age = await authController.calculateAge(userData.dateOfBirth);

      // Asignar la edad al objeto userData
      userData.age = age;

      // Generar el hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Asignar la contraseña al objeto userData
      userData.password = hashedPassword;

      // Crear el usuario en la base de datos
      const user = await User.create(userData);        
      res.json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).send('Error al registrar usuario');
    }
  },

  // funcion para calcular edad con la fecha de nacimiento, se llama en createUser
  async calculateAge(dateOfBirth) {
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

    return age;
  },
  
  // funcion para validar los datos de usuario antes de registrar, se llama en createUser
  async validateUserData(userData) {
      const { firstName, lastName, typeId, numberId, dateOfBirth, email, username, password } = userData;
      const errors = [];

      if (!firstName) {
          errors.push('Nombres requeridos');
      }

      if (!lastName) {
        errors.push('apellidos requeridos');
      }

      if (!typeId) {
        errors.push('seleccione tipo de documento');
      }

      if (!numberId) {
        errors.push('digite su numero de documento');
      }

      if (!dateOfBirth) {
        errors.push('Seleccione su fecha de nacimiento');
      }

      if (!email) {
        errors.push('debe proporcionar una direccion de correo electronico');
      }

      if (!username) {
        errors.push('digite su nombre de usuario');
      }

      if (!password) {
        errors.push('proporcione una contraseña');
      }

      return errors;
  },

  // funcion para verificar que correo, cedula y nombre de usuario sean unicos, se llama en createUser
  async verifyUniqueData(userData) {
      const { numberId, email, username } = userData;

      const existingUser = await User.findOne({ where: { username: username } });
      if (existingUser) {
          return 'El nombre de usuario ya está en uso';
      }

      const existingEmail = await User.findOne({ where: { email: email } });
      if (existingEmail) {
          return 'El correo electrónico ya está registrado';
      }

      const existingNumberId = await User.findOne({ where: { numberId: numberId } });
      if (existingNumberId) {
          return 'El documento ya está registrado';
      }

      return null; // No hay errores de datos duplicados
  },

  //funcion para actualizar cada vez que se use el token en un request
  async updateLastUsedToken(token){
    try {
      const personalAccessToken = await PersonalAccessToken.findOne({ where: { token: token } });
      if (personalAccessToken) {
          personalAccessToken.lastUsedAt = new Date();
          await personalAccessToken.save();
          return { success: true }; // Devuelve un objeto indicando el éxito de la actualización
      } else {
          return { success: false, message: 'Token no encontrado' }; // Devuelve un objeto indicando que el token no se encontró
      }
    } catch (error) {
      console.error('Error al actualizar lastUsedAt:', error);
      throw new Error('Error interno del servidor');
    }
  },

  async authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Elimina la palabra "Bearer " del encabezado

      jwt.verify(token, 'authToken', async (err, decodedToken) => {
        if (err) {
          return res.status(401).json({ error: 'Unauthorized' });
        } else {
          req.user = decodedToken; // Adjunta el usuario decodificado al objeto de solicitud

          // Verifica el estado de la sesión en PersonalAccessToken
          try {
            const personalAccessToken = await PersonalAccessToken.findOne({ where: { token: token } });

            if (personalAccessToken && !personalAccessToken.stateSession) {
              return res.status(401).json({ error: 'Session Expired' });
            }
          } catch (error) {
            console.error('Error al verificar el estado de la sesión:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Se llama la función para actualizar fecha y hora del último uso del token
          await authController.updateLastUsedToken(token);

          // Obtiene la fecha y hora en formato ISO
          const emitido = new Date(req.user.iat * 1000).toISOString();
          const expirara = new Date(req.user.exp * 1000).toISOString();

          // Formatea la fecha y hora eliminando los ceros y la "Z"
          const emitidoFormateado = emitido.replace('T', ' ').replace(/\.\d+Z$/, '');
          const expiraraFormateado = expirara.replace('T', ' ').replace(/\.\d+Z$/, '');

          // Imprime la información del usuario autorizado y la fecha de emisión y expiración del token
          console.log('Usuario autorizado:', req.user);
          console.log('El token fue emitido el:', emitidoFormateado);
          console.log('El token expirará el:', expiraraFormateado);
          next(); // Permite que la solicitud continúe hacia las rutas protegidas
        }
      });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

  // Función para actualizar el estado de la sesión de los tokens expirados
  async expireTokens(res) {
    try {
        console.log('Verificando tokens...'); // Mensaje de registro
        const tokensExpirados = await PersonalAccessToken.findAll({
            where: {
                expiresAt: { [db.Sequelize.Op.lt]: new Date() }, // Encuentra tokens cuya fecha de expiración sea menor que la fecha actual
                stateSession: true
            }
        });

        tokensExpirados.forEach(async (token) => {
          token.stateSession = false; // Actualiza el estado de la sesión a false
          await token.save(); // Guarda los cambios en la base de datos
          console.log(`Token expirado: ${token.token}. Estado de la sesión actualizado a false.`);
          // Aquí puedes incluir la información del usuario asociada al token
          const user = await User.findByPk(token.tokenableId); // Suponiendo que tienes un modelo User
                
          // Imprime por console.log() la información del usuario asociada al token expirado
          console.log('Información del usuario asociada al token expirado:', user);
            
          // Imprime un mensaje indicando que la sesión ha expirado
          console.log('Sesión expirada. Debe iniciar sesión nuevamente.');
        });
    } catch (error) {
        console.error('Error al actualizar estados de sesión:', error);
    }
  },

  // Inicia el proceso de verificación de tokens periódicamente
  async startVerificationTokens() {
      // Programa la verificación de tokens cada 15 segundos
      cron.schedule('0 * * * *', () => {
        authController.expireTokens();
      });
  }

};

module.exports = authController;