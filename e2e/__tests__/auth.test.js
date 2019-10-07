const request = require('../request');
const { dropCollection } = require('../db');
const jwt = require('jsonwebtoken');
const { signupUser } = require('../data-helpers');
const User = require('../../lib/models/user');

describe('Auth API', () => {

  beforeEach(() => dropCollection('users'));

  const testUser = {
    email: 'me@me.com',
    password: 'abc'
  };

  let user = null;

  beforeEach(() => {
    return signupUser(testUser)
      .then(newUser => user = newUser);
  });

  it('signs up a user', () => {
    expect(user.token).toBeDefined();
  });

  it('cannot sign up with same email', () => {
    return request
      .post('/api/auth/signup')
      .send(testUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe('Email me@me.com already in use');
      });
  });

  function testEmailAndPasswordRequired(route, testProperty, user) {
    it(`${route} requires ${testProperty}`, () => {
      return request
        .post(`/api/auth/${route}`)
        .send(user)
        .expect(400)
        .then(({ body }) => {
          expect(body.error).toBe('Email and password required');
        });
    });
  }

  testEmailAndPasswordRequired('signup', 'email', { password: 'I no like emails' });
  testEmailAndPasswordRequired('signup', 'password', { email: 'no@password.com' });
  testEmailAndPasswordRequired('signin', 'email', { password: 'I no like emails' });
  testEmailAndPasswordRequired('signin', 'password', { email: 'no@password.com' });

  it('signs in a user', () => {
    return request
      .post('/api/auth/signin')
      .send(testUser)
      .expect(200)
      .then(({ body }) => {
        expect(body.token).toBeDefined();
      });
  });

  function testBadSignup(testName, user) {
    it(testName, () => {
      return request
        .post('/api/auth/signin')
        .send(user)
        .expect(401)
        .then(({ body }) => {
          expect(body.error).toBe('Invalid email or password');
        });
    });
  }

  testBadSignup('rejects bad password', {
    email: testUser.email,
    password: 'bad password'
  });

  testBadSignup('rejects invalid email', {
    email: 'bad@email.com',
    password: testUser.password
  });

  it('verifies a good token', () => {
    return request
      .get('/api/auth/verify')
      .set('Authorization', user.token)
      .expect(200);
  });

  it('verifies a bad token', () => {
    return request
      .get('/api/auth/verify')
      .set('Authorization', jwt.sign({ foo: 'bar' }, 'shhhhh'))
      .expect(401);
  });


});

describe('Auth Admin Users', () => {
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
  it('allows admin to make changes to users', () => {
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
        return Promise.all([
          signinAdminUser(),
          signupUser(louslyOlUser)
        ])
          .then(([adminUser, user]) => {
            return request
              .put(`/api/auth/users/${user._id}/roles/admin`)
              .set('Authorization', adminUser.token)
              .expect(200)
              .then(({ body }) => {
                expect(body.roles[0]).toBe('admin');
              });
          });
      });
  });

  const newUser = {
    email: 'help@help.com',
    password: 'abc'
  };

  it('allows admin to delete role', () => {
    return Promise.all([
      signinAdminUser(),
      signupUser(newUser)
    ])
      .then(([adminUser, newUser]) => {
        return request
          .put(`/api/auth/users/${newUser._id}/roles/admin`)
          .set('Authorization', adminUser.token)
          .expect(200)
          .then(({ body }) => {
            return request
              .delete(`/api/auth/users/${body._id}/roles/admin`)
              .set('Authorization', adminUser.token)
              .expect(200)
              .then(({ body }) => {
                expect(body.roles).toEqual([]);
              });
          });
      });
  });

  it('gets all users', () => {
    return Promise.all([
      signinAdminUser(),
      signupUser({
        email: 'abbey@abbey.com',
        password: 'abc'
      }),
      signupUser({
        email: 'andy@andy.com',
        password: '123'
      })
    ])
      // eslint-disable-next-line no-unused-vars
      .then(([adminUser, userOne, userTwo]) => {
        return request
          .put(`/api/auth/users/${userTwo._id}/roles/admin`)
          .set('Authorization', adminUser.token)
          .expect(200)
          .then(() => {
            return request
              .get('/api/auth/users/')
              .set('Authorization', adminUser.token)
              .expect(200)
              .then(({ body }) => {
                expect(body.length).toEqual(6);
                expect(body[5]).toEqual({
                  email: 'andy@andy.com',
                  roles: ['admin'],
                  _id: expect.any(String)
                });
              });
          });

      });
  });
});