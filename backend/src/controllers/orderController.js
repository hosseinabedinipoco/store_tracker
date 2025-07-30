const { Order, Product, User } = require('../models');

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const user = await User.findByPk(req.user.id);
    let total = 0;

    const productUpdates = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'product'}` });
      }

      total += product.price * item.quantity;
      product.stock -= item.quantity;
      productUpdates.push(product.save());
    }

    if (user.wallet < total) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    user.wallet -= total;
    await user.save();
    await Promise.all(productUpdates);

    const order = await Order.create({
      user_id: req.user.id,
      items: JSON.stringify(items),
      total,
      status: 'pending'
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listOrders = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'wallet', 'is_admin']
  });
  try {
    const condition = user.is_admin ? {} : { user_id: user.id };
    const orders = await Order.findAll({ where: condition });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'wallet', 'is_admin']
  });
  try {
    if (!user.is_admin) return res.status(403).json({ message: 'Forbidden' });

    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status === 'cancelled' && order.status !== 'cancelled') {
      const user = await User.findByPk(order.user_id);
      user.wallet += order.total;
      await user.save();
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
