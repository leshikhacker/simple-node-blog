const express = require('express');
const router = express.Router();
const db = require('monk')('localhost/nodeblog');

const { check, validationResult } = require('express-validator');

router.get('/show/:category', (req, res) => {
  const posts = db.get('posts');
  posts.find({category: req.params.category}, {}, (err, posts) => {
    res.render('index', {
      title: req.params.category,
      posts: posts
    });
  });
});

router.get('/add', (req, res) => {
  res.render('addcategory', {
    title: 'Add category',
  });
});

router.post(
  '/add',
  [
    check('name').notEmpty().withMessage('Name is required')
  ],
  (req, res, next) => {
    // get the form values
    let name = req.body.name;

    // check errors
    const errors = validationResult(req).errors;

    if(errors.length > 0) {
      res.render('addcategory', {
        errors: errors
      });
    }
    else {
      let categories = db.get('categories');
      categories.insert({
        name: name
      }, (err, post) => {
        if(err) {
          res.send(err);
        }
        else {
          req.flash('success', 'Category added');
          res.location('/');
          res.redirect('/');
        }
      });
    }
});

module.exports = router;
