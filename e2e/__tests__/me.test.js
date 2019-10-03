const request = require('../request');
const { dropCollection } = require('../db');
const { signupUser } = require('../data-helpers');

describe('Books API', () => {
  beforeEach(() => dropCollection('users'));
  beforeEach(() => dropCollection('books'));
  beforeEach(() => dropCollection('favorites'));

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

  function putFavorite(book) {
    return postBook(book).then(book => {
      return request
        .put(`/api/me/favorites/${book._id}`)
        .set('Authorization', user.token)
        .expect(200)
        .then(({ body }) => body);
    });
  }

  it('puts my favorite books', () => {
    return postBook(book).then(book => {
      return request
        .put(`/api/me/favorites/${book._id}`)
        .set('Authorization', user.token)
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toBe(1);
          expect(body[0]).toBe(book._id);
        });
    });
  });

  it('gets my favorites', () => {
    return Promise.all([
      putFavorite(book),
      putFavorite({
        title: 'Educated',
        author: 'Tara Westover'
      })
    ]).then(() => {
      return request
        .get('/api/me/favorites')
        .set('Authorization', user.token)
        .expect(200)
        .then(({ body }) => {
          expect(body[0]).toMatchInlineSnapshot(
            {
              _id: expect.any(String)
            },
            `
            Object {
              "_id": Any<String>,
              "title": "Educated",
            }
          `
          );
        });
    });
  });

  it('deletes a book from my favorites', () => {
    return putFavorite(book)
      .then((favorites) => {
        console.log(favorites);
        return request
          .delete(`/api/me/favorites/${favorites[0]}`)
          .set('Authorization', user.token)
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toBe(0);
          });
      });
  });
});
