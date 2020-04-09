const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './public/images/'});
const db = require('monk')('localhost/nodeblog');

const { check, validationResult } = require('express-validator');

router.get('/show/:id', (req, res, next) => {
  const posts = db.get('posts');

  posts.findOne({_id: req.params.id}, (err, post) => {
    res.render('show', {
      post: post
    });
  });
});

router.get('/add', (req, res, next) => {
  const categories = db.get('categories');
  categories.find({}, {}, (err, categories) => {
    res.render('addpost', {
      title: 'Add post',
      categories: categories
    });
  });
});

router.post(
  '/add',
  upload.single('mainimage'),
  [
    check('title').notEmpty().withMessage('Title is required'),
    check('body').notEmpty().withMessage('Body is required')
  ],
  (req, res, next) => {
    // get the form values
    let title = req.body.title;
    let category = req.body.category;
    let body = req.body.body;
    let author = req.body.author;
    let date = new Date();

    let mainImage = 'noimage.jpg';
    if(req.file) {
      mainImage = req.file.filename;
    }

    // check errors
    const errors = validationResult(req).errors;

    if(errors.length > 0) {
      res.render('addpost', {
        errors: errors
      });
    }
    else {
      let posts = db.get('posts');
      posts.insert({
        title: title,
        body: body,
        category: category,
        date: date,
        author: author,
        mainimage: mainImage
      }, (err, post) => {
        if(err) {
          res.send(err);
        }
        else {
          req.flash('success', 'Post added');
          res.location('/');
          res.redirect('/');
        }
      });
    }
});

router.post(
  '/addcomment',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('body').notEmpty().withMessage('Body is required')
  ],
  (req, res, next) => {
    // get the form values
    let name = req.body.name;
    let email = req.body.email;
    let body = req.body.body;
    let commentDate = new Date();
    let postId = req.body.postid;

    // check errors
    const errors = validationResult(req).errors;

    if(errors.length > 0) {
      let posts = db.get('posts');
      posts.findOne({id: postId}, (err, post) => {
        res.render('show', {
          errors: errors,
          post: post
        })
      });
    }
    else {
      let comment = {
        name: name,
        email: email,
        body: body,
        commentdate: commentDate
      };

      let posts = db.get('posts');

      posts.update(
        {_id: postId},
        {
          $push: {
            comments: comment
          }
        },
        (err, doc) => {
          if(err) {
            throw err;
          }
          else {
            req.flash('success', 'Comment Added');
            res.location('/posts/show/' + postId);
            res.redirect('/posts/show/' + postId);
          }

        }
      );

      // , (err, post) => {
      //   if(err) {
      //     res.send(err);
      //   }
      //   else {
      //     req.flash('success', 'Post added');
      //     res.location('/');
      //     res.redirect('/');
      //   }
      // });
    }
});

module.exports = router;
