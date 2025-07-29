module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    total_price: DataTypes.FLOAT,
    status: DataTypes.STRING,
    address: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    date: DataTypes.DATE,
  });

  Order.associate = models => {
    Order.belongsTo(models.User, { foreignKey: 'userId' });

    Order.belongsToMany(models.Product, {
      through: models.OrderProduct,
      foreignKey: 'orderId',
    });
  };

  return Order;
};
