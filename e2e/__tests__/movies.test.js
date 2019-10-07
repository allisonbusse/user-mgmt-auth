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


  function signinAdminUser(admin) {
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

  it('does not let a non-admin post a movie', () => {
    return signupUser(testUser)
      .then(() => {
        return signinAdminUser(testUser)
          .then(adminUser => {
            return request
              .post('/api/movies')
              .set('Authorization', adminUser.token)
              .send(movie)
              .expect(403)
              .then(({ body }) => {
                expect(body.error).toEqual('User not authorized, must be "admin"');
              });
          });
      });
  });

  it('deletes a movie', () => {
    return signinAdminUser(adminTest)
      .then(adminUser => {
        return request
          .post('/api/movies')
          .set('Authorization', adminUser.token)
          .send(movie)
          .expect(200)
          .then(({ body }) => {
            return request
              .delete(`/api/movies/${body._id}`)
              .set('Authorization', adminUser.token)
              .expect(200)
              .then(() => {
                return request
                  .get('/api/movies')
                  .set('Authorization', adminUser.token)
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.length).toBe(0);
                  });
              });
          });
      });
  });

  it('gets all movies', () => {
    return signinAdminUser(adminTest)
      .then(adminUser => {
        return request
          .post('/api/movies')
          .set('Authorization', adminUser.token)
          .send(movie)
          .expect(200)
          .then(() => {
            return request
              .post('/api/movies')
              .set('Authorization', adminUser.token)
              .send({
                title: 'La La Land',
                yearReleased: 2016
              })
              .expect(200)
              .then(() => {

                return signinAdminUser(testUser)
                  .then(user => {
                    return request
                      .get('/api/movies')
                      .set('Authorization', user.token)
                      .expect(200)
                      .then(({ body }) => {
                        expect(body.length).toBe(2);
                      });
                  });
              });

          });
      });
  });
});