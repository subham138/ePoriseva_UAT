const express = require('express');
const router = express.Router();
const pay_controller = require('../controllers/pay_controller');
// const fs = require('fs');
// const { userInfo } = require('os');

// FETCH BILL INDEX
router.get('/fetch_bill', pay_controller.index);

module.exports = router;