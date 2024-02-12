'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PersonalAccessToken extends Model {
      static associate(models) {
        // Asociación con el modelo User
        PersonalAccessToken.belongsTo(models.User, {
          foreignKey: 'tokenableId',
          constraints: true,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    }
    PersonalAccessToken.init({
      tokenableType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tokenableId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      stateSession: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'PersonalAccessToken',
      tableName: 'personal_access_tokens',
      // Configuración adicional del modelo
      createdAt: true, // Conserva la columna createdAt
      updatedAt: false // Omite la columna updatedAt
    });
    return PersonalAccessToken;
  };