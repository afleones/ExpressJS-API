'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER
      },
      firstName: {
        type: Sequelize.DataTypes.STRING
      },
      lastName: {
        type: Sequelize.DataTypes.STRING
      },
      typeId: {
        type: Sequelize.DataTypes.INTEGER
      },
      numberId: {
        type: Sequelize.DataTypes.BIGINT
      },
      dateOfBirth: { 
        allowNull: true,
        type: Sequelize.DataTypes.DATEONLY
      },
      age: {
        type: Sequelize.DataTypes.INTEGER
      },
      email: {
        type: Sequelize.DataTypes.STRING
      },
      username: {
        type: Sequelize.DataTypes.STRING
      },
      password: {
        type: Sequelize.DataTypes.STRING
      },
      stateUser: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true, // Usar true para 1 o false para 0 como valor predeterminado
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
