from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurants.db'
db = SQLAlchemy(app)

# Models


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)


class Restaurant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship(
        'Category', backref=db.backref('restaurants', lazy=True))
    address = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    reviews = db.relationship('Review', backref='restaurant', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'category': self.category.name,
                'address': self.address, 'latitude': self.latitude, 'longitude': self.longitude}


class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey(
        'restaurant.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'restaurant_id': self.restaurant_id
        }

# Routes


@app.route('/restaurants/most-reviewed')
def most_reviewed():
    restaurants = Restaurant.query.join(Review).group_by(
        Restaurant.id).order_by(desc(db.func.count(Review.id))).limit(10).all()
    return jsonify([r.to_dict() for r in restaurants])


@app.route('/categories', methods=['GET', 'POST'])
def categories():
    if request.method == 'GET':
        categories = Category.query.all()
        return jsonify([{'id': c.id, 'name': c.name} for c in categories])
    elif request.method == 'POST':
        name = request.json.get('name')
        category = Category(name=name)
        db.session.add(category)
        db.session.commit()
        return jsonify(category.to_dict()), 201


@app.route('/restaurants', methods=['GET', 'POST'])
def restaurants():
    if request.method == 'GET':
        restaurants = Restaurant.query.all()
        return jsonify([r.to_dict() for r in restaurants])
    elif request.method == 'POST':
        name = request.json.get('name')
        category_id = request.json.get('category_id')
        address = request.json.get('address')
        latitude = request.json.get('latitude')
        longitude = request.json.get('longitude')
        restaurant = Restaurant(name=name, category_id=category_id, address=address,
                                latitude=latitude, longitude=longitude)
        db.session.add(restaurant)
        db.session.commit()
        return jsonify(restaurant.to_dict()), 201


@app.route('/restaurants/<int:restaurant_id>', methods=['GET', 'PUT', 'DELETE'])
def restaurant(restaurant_id):
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    if request.method == 'GET':
        return jsonify(restaurant.to_dict())
    elif request.method == 'PUT':
        name = request.json.get('name')
        category_id = request.json.get('category_id')
        address = request.json.get('address')
        latitude = request.json.get('latitude')
        longitude = request.json.get('longitude')
        restaurant.name = name
        restaurant.category_id = category_id
        restaurant.address = address
        restaurant.latitude = latitude
        restaurant.longitude = longitude
        db.session.commit()
        return jsonify(restaurant.to_dict())
    elif request.method == 'DELETE':
        db.session.delete(restaurant)
        db.session.commit()
        return '', 204


@app.route('/restaurants/nearby', methods=['GET'])
def nearby():
    latitude = request.args.get('latitude', type=float)
    longitude = request.args.get('longitude', type=float)
    radius = request.args.get('radius', type=float)
    restaurants = Restaurant.query.filter(
        Restaurant.latitude >= latitude - radius,
        Restaurant.latitude <= latitude + radius,
        Restaurant.longitude >= longitude - radius,
        Restaurant.longitude <= longitude + radius
    ).order_by(desc((Restaurant.latitude - latitude) ** 2 + (Restaurant.longitude - longitude) ** 2)).all()
    return jsonify([r.to_dict() for r in restaurants])


if name == 'main':
    app.run(debug=True)
