const request = require('../request');
const { dropCollection } = require('../db');
const jwt = require('jsonwebtoken');
const { signupUser } = require('../data-helpers');

describe('Books API', () => {
  beforeEach(() => dropCollection('users'));
  beforeEach(() => dropCollection('books'));

  const testUser = {
    email: 'me@me.com',
    password: 'abc'
  };

  let user = null;

  beforeEach(() => {
    return signupUser(testUser).then(newUser => (user = newUser));
  });

  const book = {
    title: 'Normal People',
    author: 'Salley Rooney'
  };

  function postBook(book) {
    return request
      .post('/api/books')
      .set('Authorization', user.token)
      .send(book)
      .expect(200)
      .then(({ body }) => body);
  }

  it('posts a book for this user', () => {
    return request
      .post('/api/books')
      .set('Authorization', user.token)
      .send(book)
      .expect(200)
      .then(({ body }) => {
        expect(body.owner).toBe(user._id);
        expect(body).toMatchInlineSnapshot(
          {
            _id: expect.any(String),
            owner: expect.any(String)
          },
          `
          Object {
            "__v": 0,
            "_id": Any<String>,
            "author": "Salley Rooney",
            "owner": Any<String>,
            "title": "Normal People",
          }
        `
        );
      });
  });


  it('gets all books', () => {
    return Promise.all([
      postBook(book),
      postBook({
        title: 'Educated',
        author: 'Tara Westover'
      })
    ])
      .then(() => {
        return request
          .get('/api/books')
          .set('Authorization', user.token)
          .expect(200)

          .then(({ body }) => {
            console.log(body);
            expect(body.length).toBe(2);
            expect(body[0].owner).toBe(user._id);

          });
      });

  });
});
