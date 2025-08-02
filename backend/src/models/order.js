module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'cancelled', 'delivered'),
      defaultValue: 'pending',
    },
  });

  return Order;
};
