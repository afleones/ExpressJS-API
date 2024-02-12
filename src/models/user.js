'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relación muchos a muchos con EntityConnect a través de la tabla UsersEntities
      User.belongsToMany(models.Entity, { through: 'UsersEntities', foreignKey: 'userId', otherKey: 'entityId' });

      // Asociación muchos a muchos con Role a través de la tabla UsersRoles
      User.belongsToMany(models.Role, { through: 'UsersRoles', foreignKey: 'userId', otherKey: 'roleId' });
      
      // Define la relación con TypeId
      User.belongsTo(models.TypeId, { foreignKey: 'typeId' });

      // Asociación con los tokens de acceso personal
      User.hasMany(models.PersonalAccessToken, { foreignKey: 'tokenableId', constraints: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    typeId: DataTypes.INTEGER,
    numberId: {
      type: DataTypes.STRING,
      unique: true
    },
    dateOfBirth: { 
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    age: DataTypes.INTEGER,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    StateUser: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  });
  return User;
};
