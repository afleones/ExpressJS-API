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
      User.belongsToMany(models.entity, { through: 'UsersEntities', foreignKey: 'userId', otherKey: 'entityId' });

      // Asociación muchos a muchos con Role a través de la tabla UsersRoles
      User.belongsToMany(models.Role, { through: 'UsersRoles', foreignKey: 'userId', otherKey: 'roleId' });
    
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    age: DataTypes.INTEGER,
    Role: DataTypes.INTEGER,
    StateUser: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true, // Usar true para 1 o false para 0 como valor predeterminado
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
