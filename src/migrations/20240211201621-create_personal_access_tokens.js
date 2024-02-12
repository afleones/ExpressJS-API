'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('personal_access_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tokenableType: { // Nuevo campo para guardar la ruta del modelo User
        type: Sequelize.STRING,
        allowNull: false
      },
      tokenableId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Nombre de la tabla de usuarios
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastUsedAt: { // Nuevo campo para almacenar el último uso del token
        allowNull: true,
        type: Sequelize.DATE
      },
      expiresAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      stateSession: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true, // Usar true para 1 o false para 0 como valor predeterminado
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('personal_access_tokens');
  }
};
