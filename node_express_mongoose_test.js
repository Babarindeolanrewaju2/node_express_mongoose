import request from 'request';
import { expect } from 'chai';

describe('API', () => {
  describe('/register', () => {
    it('creates a new user and returns a JWT', (done) => {
      request.post(
        'http://localhost:3000/register',
        {
          json: {
            email: 'user@example.com',
            password: 'password',
          },
        },
        (error, res, body) => {
          expect(res.statusCode).to.equal(200);
          expect(body).to.have.property('token');
          done();
        }
      );
    });
  });

  describe('/login', () => {
    it('returns a JWT for a valid email and password', (done) => {
      request.post(
        'http://localhost:3000/login',
        {
          json: {
            email: 'user@example.com',
            password: 'password',
          },
        },
        (error, res, body) => {
          expect(res.statusCode).to.equal(200);
          expect(body).to.have.property('token');
          done();
        }
      );
    });
  });

  it('returns an error for an invalid email or password', (done) => {
    request.post(
      'http://localhost:3000/login',
      {
        json: {
          email: 'user@example.com',
          password: 'incorrect',
        },
      },
      (error, res, body) => {
        expect(res.statusCode).to.equal(422);
        expect(body).to.have.property('error');
        done();
      }
    );
  });
});
