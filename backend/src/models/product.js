module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    amount: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    type: DataTypes.STRING,
  });

  Product.associate = models => {
    Product.belongsToMany(models.Order, {
      through: models.OrderProduct,
      foreignKey: 'productId',
    });
  };

  return Product;
};
