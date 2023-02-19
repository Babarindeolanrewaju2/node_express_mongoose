from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import backref
from flask_bcrypt import Bcrypt
from flask_uploads import UploadSet, IMAGES, configure_uploads

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///example.db'
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['UPLOADED_IMAGES_DEST'] = 'uploads/images'
app.config['UPLOADED_IMAGES_ALLOW'] = IMAGES
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
images = UploadSet('images', IMAGES)
configure_uploads(app, images)

# User model


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(60), nullable=False)
    products = db.relationship('Product', backref='user', lazy=True)

    def __repr__(self):
        return f"User(id={self.id}, username='{self.username}', email='{self.email}')"

# Product model


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=False)
    rating = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    images = db.relationship('Image', backref='product', lazy=True)

    def __repr__(self):
        return f"Product(id={self.id}, name='{self.name}', price={self.price}, rating={self.rating})"

# Image model


class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey(
        'product.id'), nullable=False)

    def __repr__(self):
        return f"Image(id={self.id}, filename='{self.filename}')"


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey(
        'product.id'), nullable=False)


# Routes

# @app.route('/products', methods=['GET'])
# def get_products():
#     products = Product.query.all()
#     return jsonify([product.__dict__ for product in products])


# @app.route('/products', methods=['POST'])
# def create_product():
#     data = request.json
#     product = Product(name=data['name'], description=data.get(
#         'description'), price=data['price'], rating=data.get('rating'), user_id=data['user_id'])
#     db.session.add(product)
#     db.session.commit()
#     return jsonify(product.__dict__)


# @app.route('/products/<int:product_id>', methods=['GET'])
# def get_product(product_id):
#     product = Product.query.get_or_404(product_id)
#     return jsonify(product.__dict__)


# @app.route('/products/<int:product_id>', methods=['PUT'])
# def update_product(product_id):
#     data = request.json
#     product = Product.query.get_or_404(product_id)
#     product.name = data.get('name', product.name)
#     product.description = data.get('description', product.description)
#     product.price = data.get('price', product.price)
#     product.rating = data.get('rating', product.rating)
#     db.session.commit()
#     return jsonify(product.__dict__)


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(
        data['password']).decode('utf-8')
    user = User(username=data['username'],
                email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.__dict__)


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login successful!'})
    else:
        return jsonify({'message': 'Invalid email or password.'}), 401


@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        users = User.query.all()
        return jsonify([user.__dict__ for user in users])
    elif request.method == 'POST':
        data = request.json
        user = User(name=data['name'], email=data['email'])
        db.session.add(user)
        db.session.commit()
        return jsonify(user.__dict__)


# @app.route('/products', methods=['GET', 'POST'])
# def products():
#     if request.method == 'GET':
#         products = Product.query.all()
#         return jsonify([product.__dict__ for product in products])
#     elif request.method == 'POST':
#         data = request.json
#         product = Product(name=data['name'], description=data['description'],
#                           price=data['price'], rating=data['rating'])
#         db.session.add(product)
#         db.session.commit()
#         return jsonify(product.__dict__)


@app.route('/orders', methods=['GET', 'POST'])
def orders():
    if request.method == 'GET':
        orders = Order.query.all()
        return jsonify([order.__dict__ for order in orders])
    elif request.method == 'POST':
        data = request.json
        order = Order(user_id=data['user_id'], product_id=data['product_id'])
        db.session.add(order)
        db.session.commit()
        return jsonify(order.__dict__)


# @app.route('/products/int:product_id', methods=['DELETE'])
# def delete_product(product_id):
#     product = Product.query.get_or_404(product_id)
#     db.session.delete(product)
#     db.session.commit()
#     return '', 204


# @app.route('/images', methods=['POST'])
# def upload_image():
#     data = request.files['image']
#     filename = images.save(data)
#     image = Image(filename=filename, product_id=request.form['product_id'])
#     db.session.add(image)
#     db.session.commit()
#     return jsonify(image.dict)


# @app.route('/images/int:image_id', methods=['GET'])
# def get_image(image_id):
#     image = Image.query.get_or_404(image_id)
#     return jsonify(image.dict)


# @app.route('/images/int:image_id', methods=['DELETE'])
# def delete_image(image_id):
#     image = Image.query.get_or_404(image_id)
#     images.delete(image.filename)
#     db.session.delete(image)
#     db.session.commit()
#     return '', 204

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.__dict__ for product in products])


# @app.route('/products/<int:product_id>', methods=['GET'])
# def get_product(product_id):
#     product = Product.query.get_or_404(product_id)
#     return jsonify(product.__dict__)


@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    images = [img.__dict__ for img in product.images]
    product_dict = product.__dict__
    product_dict['images'] = images
    return jsonify(product_dict)


@app.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()
    name = data['name']
    description = data.get('description')
    price = data['price']
    user_id = data['user_id']
    user = User.query.get_or_404(user_id)
    product = Product(name=name, description=description,
                      price=price, user=user)
    db.session.add(product)

    # Upload images
    if 'images' in request.files:
        for image in request.files.getlist('images'):
            filename = images.save(image)
            img = Image(filename=filename, product=product)
            db.session.add(img)

    db.session.commit()
    return jsonify(product.__dict__)


@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    user_id = data.get('user_id')
    if user_id:
        user = User.query.get_or_404(user_id)
        product.user = user

    # Update images
    if 'images' in request.files:
        for image in request.files.getlist('images'):
            filename = images.save(image)
            img = Image(filename=filename, product=product)
            db.session.add(img)

    db.session.commit()
    return jsonify(product.__dict__)


@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return '', 204


@app.route('/images/<int:image_id>', methods=['GET'])
def get_image(image_id):
    img = Image.query.get_or_404(image_id)
    return jsonify(img.__dict__)


@app.route('/images/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    img = Image.query.get_or_404(image_id)
    db.session.delete(img)
    db.session.commit()
    return '', 204


# Run the app
if __name__ == '__main__':
    app.run(debug=True)
