const eventSchema = new mongoose.Schema({
    name: String,
    date: Date,
    location: String,
    tickets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
});
const Event = mongoose.model('Event', eventSchema);

const ticketSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    price: Number,
    quantity: Number,
    isSoldOut: {
        type: Boolean,
        default: false
    }
});
const Ticket = mongoose.model('Ticket', ticketSchema);

const orderSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    tickets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }],
    totalPrice: Number,
    customer: {
        name: String,
        email: String
    }
});
const Order = mongoose.model('Order', orderSchema);


app.get('/events', (req, res) => {
    Event.find({}, (err, events) => {
        if (err) return res.status(500).send(err);
        return res.send(events);
    });
});

app.get('/events/:id', (req, res) => {
    Event.findById(req.params.id, (err, event) => {
        if (err) return res.status(500).send(err);
        if (!event) return res.status(404).send('Event not found.');
        return res.send(event);
    });
});

app.post('/events', (req, res) => {
    const event = new Event(req.body);
    event.save((err, savedEvent) => {
        if (err) return res.status(500).send(err);
        return res.send(savedEvent);
    });
});

app.put('/events/:id', (req, res) => {
    Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    }, (err, updatedEvent) => {
        if (err) return res.status(500).send(err);
        if (!updatedEvent) return res.status(404).send('Event not found.');
        return res.send(updatedEvent);
    });
});

app.delete('/events/:id', (req, res) => {
    Event.findByIdAndDelete(req.params.id, (err, deletedEvent) => {
        if (err) return res.status(500).send(err);
        if (!deletedEvent) return res.status(404).send('Event not found.');
        return res.send(deletedEvent);
    });
});

app.get('/tickets', (req, res) => {
    Ticket.find({}, (err, tickets) => {
        if (err) return res.status(500).send(err);
        return res.send(tickets);
    });
});

app.get('/tickets/:id', (req, res) => {
    Ticket.findById(req.params.id, (err, ticket) => {
        if (err) return res.status(500).send(err);
        if (!ticket) return res.status(404).send('Ticket not found.');
        return res.send(ticket);
    });
});

app.post('/tickets', (req, res) => {
    const ticket = new Ticket(req.body);
    ticket.save((err, savedTicket) => {
        if (err) return res.status(500).send(err);
        return res.send(savedTicket);
    });
});

app.put('/tickets/:id', (req, res) => {
    Ticket.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    }, (err, updatedTicket) => {
        if (err) return res.status(500).send(err);
        if (!updatedTicket) return res.status(404).send('Ticket not found.');
        return res.send(updatedTicket);
    });
});

app.delete('/tickets/:id', (req, res) => {
    Ticket.findByIdAndDelete(req.params.id, (err, deletedTicket) => {
        if (err) return res.status(500).send(err);
        if (!deletedTicket) return res.status(404).send('Ticket not found.');
        return res.send(deletedTicket);
    });
});

app.get('/orders', (req, res) => {
    Order.find({}, (err, orders) => {
        if (err) return res.status(500).send(err);
        return res.send(orders);
    });
});

app.get('/orders/:id', (req, res) => {
    Order.findById(req.params.id, (err, order) => {
        if (err) return res.status(500).send(err);
        if (!order) return res.status(404).send('Order not found.');
        return res.send(order);
    });
});

app.post('/orders', (req, res) => {
    const order = new Order(req.body);
    order.save((err, savedOrder) => {
        if (err) return res.status(500).send(err);
        return res.send(savedOrder);
    });
});

app.put('/orders/:id', (req, res) => {
    Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    }, (err, updatedOrder) => {
        if (err) return res.status(500).send(err);
        if (!updatedOrder) return res.status(404).send('Order not found.');
        return res.send(updatedOrder);
    });
});

app.delete('/orders/:id', (req, res) => {
    Order.findByIdAndDelete(req.params.id, (err, deletedOrder) => {
        if (err) return res.status(500).send(err);
        if (!deletedOrder) return res.status(404).send('Order not found.');
        return res.send(deletedOrder);
    });
});