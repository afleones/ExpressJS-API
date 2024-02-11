'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Entities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER
      },
      nameEntity: {
        type: Sequelize.DataTypes.STRING
      },
      dbPrefix: {
        type: Sequelize.DataTypes.STRING
      },
      dbSufix: {
        type: Sequelize.DataTypes.STRING
      },
      tokenEntity: {
        type: Sequelize.DataTypes.STRING
      },
      VersionEntity: {
        type: Sequelize.DataTypes.STRING,
      },
      StateEntity: {
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
    await queryInterface.dropTable('Entities');
  }
};