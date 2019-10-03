const router = require('express').Router();
const Book = require('../models/book');

router
  .post('/', (req, res, next) => {
    req.body.owner = req.user.id;

    Book.create(req.body)
      .then(book => res.json(book))
      .catch(next);

  })

  .get('/:id', (req, res, next) => {
    Book.findById(req.params.id)
      .lean()
      .then(book => res.json(book))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Book.find()
      .lean()
      .then(book => res.json(book))
      .catch(next);
  })

  .put('/:id', ({ params, body, user }, res, next) => {
    Book.updateOne({
      _id: params.id,
      owner: user.id
    }, body)
      .then(book => res.json(book))
      .catch(next);
  })

  .delete('/:id', ({ params, user }, res, next) => {
    Book.findByIdAndRemove({
      _id: params.id,
      owner: user.id
    })
      .then(book => res.json(book))
      .catch(next);
  });

module.exports = router;
