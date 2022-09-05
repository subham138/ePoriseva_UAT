const express = require('express');
const router = express.Router();
const request = require('request');
const xml2js = require('xml2js');
const tnx_controller = require('../controllers/tnx_controller');

router.get('/tnx_srch', tnx_controller.tnx_search_in);

router.post('/tnx_srch', tnx_controller.tnx_search_out);

module.exports = router;