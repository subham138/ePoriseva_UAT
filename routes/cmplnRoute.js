const express = require('express');
const { get_disposition, complaint, submit_complaint, search_complain_in, search_complain_out } = require('../controllers/cmpln_controller');
const { route } = require('./tnxRoute');
const router = express.Router();

router.get('/complaint', complaint);

router.post('/complaint', submit_complaint);

router.get('/search_complain', search_complain_in);

router.post('/search_complain', search_complain_out);

router.get('/get_disposition', get_disposition);

module.exports = router;