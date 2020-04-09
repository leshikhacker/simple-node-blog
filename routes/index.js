const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  const db = req.db;
  const posts = db.get('posts');
  posts.find({}, {}, (err, posts) => {
    res.render('index', { posts: posts });
  });

});

module.exports = router;
