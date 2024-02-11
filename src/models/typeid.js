const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TypeId extends Model {
    static associate(models) {
      // Define la relación uno a muchos con User
      TypeId.hasMany(models.User, { foreignKey: 'typeId' });
    }
  }
  TypeId.init({
    // Define los campos de tu modelo TypeId aquí
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TypeId',
  });
  return TypeId;
};