const assert = require('assert');
const request = require('supertest');
const app = require('../server');

describe('API tests', () => {
  // Test the GET /products route
  it('GET /products should return all products', (done) => {
    request(app)
      .get('/products')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // Check that the response body is an array of products
        assert(Array.isArray(res.body));
        done();
      });
  });

  // Test the POST /products route
  it('POST /products should add a new product', (done) => {
    const newProduct = { name: 'Test Product', price: 19.99 };
    request(app)
      .post('/products')
      .send(newProduct)
      .expect(201)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // Check that the response body contains the ID of the new product
        assert(res.body.includes('ID'));
        done();
      });
  });

  // Test the PUT /products/:id route
  it('PUT /products/:id should update an existing product', (done) => {
    const updatedProduct = { name: 'Updated Product', price: 29.99 };
    request(app)
      .put('/products/1')
      .send(updatedProduct)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // Check that the response body contains the ID of the updated product
        assert(res.body.includes('ID'));
        done();
      });
  });

  // Test the DELETE /products/:id route
  it('DELETE /products/:id should delete an existing product', (done) => {
    request(app)
      .delete('/products/1')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // Check that the response body contains the ID of the deleted product
        assert(res.body.includes('ID'));
        done();
      });
  });
});
