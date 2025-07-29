const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const models = {
  User: require('./user')(sequelize, DataTypes),
  Product: require('./product')(sequelize, DataTypes),
  Order: require('./order')(sequelize, DataTypes),
  OrderProduct: require('./orderProduct')(sequelize, DataTypes),
};

// Setup associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
