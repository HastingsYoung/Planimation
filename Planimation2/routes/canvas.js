/**
 * Created by hastings on 29/01/2017.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('canvas');
});

module.exports = router;
