const request = require('../request');
const { dropCollection } = require('../db');
const { signupUser } = require('../data-helpers');
const User = require('../../lib/models/user');


describe('Movies API', () => {
  beforeEach(() => dropCollection('movies'));

  const adminTest = {
    email: 'alex@hellohello.com',
    password: 'abc123'
  };
  const louslyOlUser = {
    email: 'wassup@hellohello.com',
    password: 'abc123'
  };


  function signinAdminUser(admin = adminTest) {
    return request
      .post('/api/auth/signin')
      .send(admin)
      .expect(200)
      .then(({ body }) => body);
  }

  const testUser = {
    email: 'me@me.com',
    password: 'abc'
  };

  const movie = {
    title: 'Call Me By Your Name',
    yearReleased: 2017
  };

  function postMovie(movie) {
    return request
      .post('/api/movies')
      .set('Authorization', adminUser.token)
      .send(movie)
      .expect(200)
      .then(({ body }) => body);
  }

  it('posts a movie', () => {
    return signupUser(adminTest)
      .then(user => {
        return User.updateById(user._id,
          {
            $addToSet: {
              roles: 'admin'
            }
          }
        );
      })
      .then(() => {
        return signinAdminUser(adminTest)
          .then(adminUser => {
            return request
              .post('/api/movies')
              .set('Authorization', adminUser.token)
              .send(movie)
              .expect(200)
              .then(({ body }) => {
                expect(body).toEqual({
                  ...movie,
                  __v: 0,
                  _id: expect.any(String)
                });
              });
          });
      });
  });




  it('updates a movie', () => {
    return signinAdminUser(adminTest)
      .then(adminUser => {
        return request
          .post('/api/movies')
          .set('Authorization', adminUser.token)
          .send(movie)
          .expect(200)
          .then(({ body }) => {
            console.log(body);
            return request
              .put(`/api/movies/${body._id}`)
              .set('Authorization', adminUser.token)
              .send({ yearReleased: 1997 })
              .expect(200)
              .then(({ body }) => {
                expect(body.yearReleased).toBe(1997);
              });
          });
      });
  });

  it.skip('deletes a movie', () => {
    return postMovie(movie)
      .then(movie => {
        return request
          .delete(`/api/movies/${movie._id}`)
          .set('Authorization', user.token)
          .expect(200)
          .then(() => {
            return request
              .get('/api/movies')
              .set('Authorization', user.token)
              .expect(200)
              .then(({ body }) => {
                expect(body.length).toBe(0);
              });
          });
      });

    it.skip('gets all movies', () => {
      return Promise.all([
        postMovie(movie),
        postMovie({
          title: 'Educated',
          author: 'Tara Westover'
        })
      ])
        .then(() => {
          return request
            .get('/api/movies')
            .set('Authorization', user.token)
            .expect(200)

            .then(({ body }) => {
              expect(body.length).toBe(2);
              expect(body[0].owner).toBe(user._id);

            });
        });

    });
  });
});
