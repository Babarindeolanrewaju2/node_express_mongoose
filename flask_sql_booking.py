from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'secret_key'
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    bookings = db.relationship('Booking', backref='user', lazy=True)


class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    bookings = db.relationship('Booking', backref='room', lazy=True)


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    check_in_date = db.Column(db.Date, nullable=False)
    check_out_date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)


@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        users = User.query.all()
        return jsonify([user.__dict__ for user in users])

    if request.method == 'POST':
        data = request.get_json()
        user = User(name=data['name'], email=data['email'],
                    password=data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify(user.__dict__)


@app.route('/rooms', methods=['GET', 'POST'])
def rooms():
    if request.method == 'GET':
        rooms = Room.query.all()
        return jsonify([room.__dict__ for room in rooms])

    if request.method == 'POST':
        data = request.get_json()
        room = Room(name=data['name'], price=data['price'])
        db.session.add(room)
        db.session.commit()
        return jsonify(room.__dict__)


# @app.route('/bookings', methods=['GET', 'POST'])
# def bookings():
#     if request.method == 'GET':
#         bookings = Booking.query.all()
#         return jsonify([booking.__dict__ for booking in bookings])

#     if request.method == 'POST':
#         data = request.get_json()
#         check_in_date = datetime.strptime(
#             data['check_in_date'], '%Y-%m-%d').date()
#         check_out_date = datetime.strptime(
#             data['check_out_date'], '%Y-%m-%d').date()
#         user_id = data['user_id']
#         room_id = data['room_id']
#         booking = Booking(check_in_date=check_in_date,
#                           check_out_date=check_out_date, user_id=user_id, room_id=room_id)
#         db.session.add(booking)
#         db.session.commit()
#         return jsonify(booking.__dict__)


@app.route('/bookings', methods=['GET', 'POST'])
def bookings():
    if request.method == 'GET':
        bookings = Booking.query.all()
        return jsonify([booking.__dict__ for booking in bookings])

    if request.method == 'POST':
        data = request.get_json()
        check_in_date = datetime.strptime(
            data['check_in_date'], '%Y-%m-%d').date()
        check_out_date = datetime.strptime(
            data['check_out_date'], '%Y-%m-%d').date()
        user_id = data['user_id']
        room_id = data['room_id']

        # Check if the room is available for the requested time period
        existing_bookings = Booking.query.filter_by(room_id=room_id).all()
        for booking in existing_bookings:
            if check_in_date < booking.check_out_date and check_out_date > booking.check_in_date:
                return jsonify({'error': 'Room not available during requested time period.'})

        # Create the booking
        booking = Booking(check_in_date=check_in_date,
                          check_out_date=check_out_date, user_id=user_id, room_id=room_id)
        db.session.add(booking)
        db.session.commit()

        return jsonify(booking.__dict__)


@app.route('/total_bookings_week')
def total_bookings_week():
    # Calculate the start and end dates for the current week
    today = datetime.now().date()
    start_date = today - timedelta(days=today.weekday())
    end_date = start_date + timedelta(days=7)

    # Use SQLAlchemy's func.sum to calculate the total price of all bookings within the week
    total_price = db.session.query(func.sum(Booking.price)).\
        filter(Booking.check_in_date >= start_date,
               Booking.check_out_date < end_date).scalar()

    return jsonify({'total_price': total_price})


@app.route('/total_bookings_month')
def total_bookings_month():
    # Calculate the start and end dates for the current month
    today = datetime.now().date()
    start_date = today.replace(day=1)
    end_date = start_date.replace(month=start_date.month+1) - timedelta(days=1)

    # Use SQLAlchemy's func.sum to calculate the total price of all bookings within the month
    total_price = db.session.query(func.sum(Booking.price)).\
        filter(Booking.check_in_date >= start_date,
               Booking.check_out_date < end_date).scalar()

    return jsonify({'total_price': total_price})


@app.route('/most_booked_room')
def most_booked_room():
    # Use SQLAlchemy's func.count to count the number of bookings for each room
    room_counts = db.session.query(Booking.room_id, func.count(
        Booking.id)).group_by(Booking.room_id).all()

    # Sort the room counts by the count in descending order
    sorted_counts = sorted(room_counts, key=lambda x: x[1], reverse=True)

    # The most booked room is the first room in the sorted counts
    most_booked_room_id = sorted_counts[0][0]

    # Retrieve the room object using the room ID
    most_booked_room = Room.query.get(most_booked_room_id)

    return jsonify(most_booked_room.__dict__)


@app.route('/most_booked_rooms/<int:year>/<int:month>')
def most_booked_rooms(year, month):
    # Calculate the first and last days of the month
    first_day = datetime(year, month, 1).date()
    last_day = datetime(year, month, 1).replace(
        month=month+1, day=1, hour=0, minute=0, second=0).date()

    # Use SQLAlchemy's func.count to count the number of bookings for each room within the specified month
    room_counts = db.session.query(Booking.room_id, func.count(Booking.id)).\
        filter(Booking.check_in_date >= first_day, Booking.check_out_date < last_day).\
        group_by(Booking.room_id).order_by(
            func.count(Booking.id).desc()).limit(10).all()

    # Retrieve the room objects using the room IDs
    most_booked_rooms = [Room.query.get(room_id)
                         for room_id, count in room_counts]

    return jsonify([room.__dict__ for room in most_booked_rooms])
