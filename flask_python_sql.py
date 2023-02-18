from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'super-secret'
app.config['JWT_SECRET_KEY'] = 'jwt-secret'

db = SQLAlchemy(app)
jwt = JWTManager(app)

# CREATE TABLE users(
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name VARCHAR(50) NOT NULL,
#     email VARCHAR(50) NOT NULL UNIQUE,
#     password VARCHAR(100) NOT NULL
# )

# CREATE TABLE products(
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name VARCHAR(50) NOT NULL,
#     price FLOAT NOT NULL,
#     user_id INTEGER NOT NULL,
#     FOREIGN KEY(user_id) REFERENCES users(id)
# )


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    products = db.relationship('Product', backref='user', lazy=True)

    def __repr__(self):
        return f"User(id={self.id}, name='{self.name}', email='{self.email}')"


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"Product(id={self.id}, name='{self.name}', price={self.price})"

# User endpoints


@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    user = User.query.filter_by(email=email).first()
    if user is None or user.password != password:
        return jsonify({'error': 'Invalid email or password'}), 401
    else:
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token}), 200


@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({'email': user.email}), 200


@app.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'name': u.name, 'email': u.email} for u in users])


@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is not None:
        return jsonify({'id': user.id, 'name': user.name, 'email': user.email})
    else:
        return jsonify({'error': 'User not found'}), 404


@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User(name=data['name'], email=data['email'],
                password=data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id, 'name': user.name, 'email': user.email}), 201


@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if user is not None:
        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        user.password = data.get('password', user.password)
        db.session.commit()
        return jsonify({'id': user.id, 'name': user.name, 'email': user.email})
    else:
        return jsonify({'error': 'User not found'}), 404


@app.route('/users/int:user_id', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user is not None:
        db.session.delete(user)
        db.session.commit()
        return '', 204
    else:
        return jsonify({'error': 'User not found'}), 404


@app.route('/products', methods=['GET'])
def get_all_products():
    products = Product.query.all()
    return jsonify([{'id': p.id, 'name': p.name, 'price': p.price, 'user_id': p.user_id} for p in products])


@app.route('/products/int:product_id', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if product is not None:
        return jsonify({'id': product.id, 'name': product.name, 'price': product.price, 'user_id': product.user_id})
    else:
        return jsonify({'error': 'Product not found'}), 404


@app.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()
    user = User.query.get(data['user_id'])
    if user is not None:
        product = Product(name=data['name'], price=data['price'], user=user)
        db.session.add(product)
        db.session.commit()
        return jsonify({'id': product.id, 'name': product.name, 'price': product.price, 'user_id': product.user_id}), 201
    else:
        return jsonify({'error': 'User not found'}), 404


@app.route('/products/int:product_id', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    product = Product.query.get(product_id)
    if product is not None:
        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
        user_id = data.get('user_id', product.user_id)
        user = User.query.get(user_id)
        if user is not None:
            product.user = user
            db.session.commit()
            return jsonify({'id': product.id, 'name': product.name, 'price': product.price, 'user_id': product.user_id})
        else:
            return jsonify({'error': 'User not found'}), 404
    else:
        return jsonify({'error': 'Product not found'}), 404


@app.route('/products/int:product_id', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if product is not None:
        db.session.delete(product)
        db.session.commit()
        return '', 204
    else:
        return jsonify({'error': 'Product not found'}), 404


if __name__ == '__main__':
    app.run(debug=True)
