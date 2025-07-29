const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/authController');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/profile', auth, controller.profile);
router.post('/charge-wallet', auth, controller.chargeWallet);

module.exports = router;
