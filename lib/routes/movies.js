const router = require('express').Router();
const Movie = require('../models/movie');
const ensureRole = require('../middleware/ensure-role');


router
  .get('/', (req, res, next) => {
    Movie.find()
      .lean()
      .then(movies => res.json(movies))
      .catch(next);
  })

  .post('/', ensureRole('admin'), (req, res, next) => {
    Movie.create(req.body)
      .then(movie => res.json(movie))
      .catch(next);

  })

  .put('/:id', ensureRole('admin'), ({ params, body, user }, res, next) => {
    Movie.updateOne({
      _id: params.id,
    }, body)
      .then(movie => res.json(movie))
      .catch(next);
  })

  .delete('/:id', ensureRole('admin'), ({ params, user }, res, next) => {
    Movie.findByIdAndRemove({
      _id: params.id,
      owner: user.id
    })
      .then(movie => res.json(movie))
      .catch(next);
  });

module.exports = router;
