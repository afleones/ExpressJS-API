'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Entity extends Model {
    static associate(models) {
      // Relación muchos a muchos con User a través de la tabla UsersEntities
      EntityConnect.belongsToMany(models.User, { through: 'UsersEntities', foreignKey: 'entityId', otherKey: 'userId' });    
    }
  }

  Entity.init({
    nameEntity: DataTypes.STRING,
    dbPrefix: DataTypes.STRING,
    dbSufix: DataTypes.STRING,
    tokenEntity: DataTypes.STRING,
    StateEntity: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true, // Usar true para 1 o false para 0 como valor predeterminado
    },
    VersionEntity: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Entity',
  });

  return Entity;
};
