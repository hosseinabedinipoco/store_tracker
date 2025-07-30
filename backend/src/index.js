const express = require('express');
const models = require('./models');
const cors = require('cors'); // ✅ CORS imported

// require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors()); // ✅ CORS enabled globally

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);

app.use('/account', authRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);

models.sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced');
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});
