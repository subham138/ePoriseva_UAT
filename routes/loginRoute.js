const express = require('express');
const router = express.Router();
const login_controller = require('../controllers/login_controller');
const { route } = require('./payRouter');
// const fs = require('fs');
// const { userInfo } = require('os');

// LOGIN INDEX
router.get('/login', login_controller.login);

// LOGIN POST
router.post('/login', login_controller.login_post);

// FORGOT PASSWORD
router.get('/forgot_password', login_controller.forgot_password);

// SEND MAIL FOR FORGET PASSWORD
router.post('/forgot_password', login_controller.post_mail);

// REGISTRATION
router.get('/register', login_controller.registration);

// REGISTRATION POST
router.post('/register', login_controller.register_save);

// SIGN OUT
router.get('/sign_out', login_controller.sign_out);

module.exports = router;