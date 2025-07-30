const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const models = {
  User: require('./user')(sequelize, DataTypes),
  Product: require('./product')(sequelize, DataTypes),
  Order: require('./order')(sequelize, DataTypes),
};

// **دقت کن از داخل آبجکت models بگیر**
models.User.hasMany(models.Order, { foreignKey: 'user_id' });
models.Order.belongsTo(models.User, { foreignKey: 'user_id' });

// اگه تابع associate هم داری، اجراشون کن
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
