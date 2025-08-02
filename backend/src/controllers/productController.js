const { Product, User } = require('../models');
const { Op } = require('sequelize');

// GET /products?search=کلمه&category=کتگوری
exports.getProducts = async (req, res) => {
  const { search, category } = req.query;
  const where = {};

  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (category) {
    where.category = category;
  }

  const products = await Product.findAll({ where });
  res.json(products);
};

// GET /products/:id
exports.getProductById = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// POST /products
exports.createProduct = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'wallet', 'is_admin']
  });

  if (!user.is_admin) return res.status(403).json({ message: 'Forbidden' });

  const { name, description, price, stock, category, image } = req.body;
  const product = await Product.create({ name, description, price, stock, category, image });
  res.status(201).json(product);
};

// PUT /products/:id
exports.updateProduct = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'wallet', 'is_admin']
  });
  if (!user.is_admin) return res.status(403).json({ message: 'Forbidden' });

  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { name, description, price, stock, category } = req.body;
  await product.update({ name, description, price, stock, category });

  res.json(product);
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'wallet', 'is_admin']
  });
  if (!user.is_admin) return res.status(403).json({ message: 'Forbidden' });

  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await product.destroy();
  res.json({ message: 'Product deleted' });
};
