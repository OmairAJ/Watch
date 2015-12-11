var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'The Watch' });
});

exports.contact = function(req, res){
    res.render('contact', { title: 'The Watch'})
};

module.exports = router;
