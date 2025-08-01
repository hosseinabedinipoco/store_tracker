const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // ✅ اصلاح شد
// require('dotenv').config();

exports.register = async (req, res) => {
  const { username, password, is_admin } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username:username, password: hashed, is_admin :is_admin});
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Username already taken' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.json({ token, is_admin: user.is_admin });
};

exports.profile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'wallet', 'is_admin']
  });

  res.json(user);
};

exports.chargeWallet = async (req, res) => {
  const { amount } = req.body;

  if (amount < 0){
    return res.status(404).json({ message: 'amount can not negative' });
  }
  const user = await User.findByPk(req.user.id);
  user.wallet += parseInt(amount);
  await user.save();

  res.json({ wallet: user.wallet });
};
