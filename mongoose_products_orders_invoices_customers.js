const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Customers', customersSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Products', productsSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customers',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Orders', ordersSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoicesSchema = new Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders',
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoices', invoicesSchema);

app.get('/sales-statistics', (req, res) => {
    Orders.aggregate([{
            $group: {
                _id: null,
                totalSales: {
                    $sum: '$quantity'
                },
                totalRevenue: {
                    $sum: {
                        $multiply: ['$quantity', '$product.price']
                    }
                }
            }
        }])
        .then(stats => {
            res.json(stats);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});

app.get('/product-statistics', (req, res) => {
    Products.aggregate([{
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "product",
                    as: "order_docs"
                }
            },
            {
                $unwind: "$order_docs"
            },
            {
                $group: {
                    _id: "$name",
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$price", "$order_docs.quantity"]
                        }
                    },
                    totalQuantity: {
                        $sum: "$order_docs.quantity"
                    }
                }
            }
        ])
        .then(stats => {
            res.json(stats);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});

app.get('/revenue-statistics', (req, res) => {
    Orders.aggregate([{
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product_docs"
                }
            },
            {
                $unwind: "$product_docs"
            },
            {
                $group: {
                    _id: "$product",
                    productName: {
                        $first: "$product_docs.name"
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$product_docs.price", "$quantity"]
                        }
                    },
                    totalQuantity: {
                        $sum: "$quantity"
                    }
                }
            }
        ])
        .then(stats => {
            let totalRevenue = 0;
            stats.forEach(stat => {
                totalRevenue += stat.totalRevenue;
            });
            res.json({
                stats,
                totalRevenue
            });
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});

app.get('/profit-last-month', (req, res) => {
    var today = new Date();
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    Orders.aggregate([{
                $match: {
                    createdAt: {
                        $gte: lastMonth,
                        $lt: today
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product_docs"
                }
            },
            {
                $unwind: "$product_docs"
            },
            {
                $group: {
                    _id: "$product",
                    productName: {
                        $first: "$product_docs.name"
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$product_docs.price", "$quantity"]
                        }
                    },
                    totalCost: {
                        $sum: {
                            $multiply: ["$product_docs.cost", "$quantity"]
                        }
                    },
                    totalQuantity: {
                        $sum: "$quantity"
                    }
                }
            }
        ])
        .then(stats => {
            let totalProfit = 0;
            stats.forEach(stat => {
                totalProfit += stat.totalRevenue - stat.totalCost;
            });
            res.json({
                stats,
                totalProfit
            });
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});


app.get('/total-sales', (req, res) => {
    Orders.countDocuments({}, (err, count) => {
        if (err) {
            res.status(500).json({
                message: err.message
            });
        }
        res.json({
            totalSales: count
        });
    });
});

app.get('/total-products', (req, res) => {
    Products.countDocuments({}, (err, count) => {
        if (err) {
            res.status(500).json({
                message: err.message
            });
        }
        res.json({
            totalProducts: count
        });
    });
});

app.get('/total-customers', (req, res) => {
    Customers.countDocuments({}, (err, count) => {
        if (err) {
            res.status(500).json({
                message: err.message
            });
        }
        res.json({
            totalCustomers: count
        });
    });
});



const express = require('express');
const router = express.Router();
const Customers = require('../models/customers');

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customers.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Get a single customer
router.get('/:id', getCustomer, (req, res) => {
    res.json(res.customer);
});

// Create a new customer
router.post('/', async (req, res) => {
    const customer = new Customers({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    try {
        const newCustomer = await customer.save();
        res.status(201).json(newCustomer);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Update a customer
router.patch('/:id', getCustomer, async (req, res) => {
    if (req.body.name != null) {
        res.customer.name = req.body.name;
    }
    if (req.body.email != null) {
        res.customer.email = req.body.email;
    }
    if (req.body.password != null) {
        res.customer.password = req.body.password;
    }
    try {
        const updatedCustomer = await res.customer.save();
        res.json(updatedCustomer);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Delete a customer
router.delete('/:id', getCustomer, async (req, res) => {
    try {
        await res.customer.remove();
        res.json({
            message: 'Deleted This customer'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

async function getCustomer(req, res, next) {
    try {
        customer = await Customers.findById(req.params.id);
        if (customer == null) {
            return res.status(404).json({
                message: 'Cant find customer'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }

    res.customer = customer;
    next();
}

module.exports = router;

const express = require('express');
const router = express.Router();
const Products = require('../models/products');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Products.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Get a single product
router.get('/:id', getProduct, (req, res) => {
    res.json(res.product);
});

// Create a new product
router.post('/', async (req, res) => {
    const product = new Products({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Update a product
router.patch('/:id', getProduct, async (req, res) => {
    if (req.body.name != null) {
        res.product.name = req.body.name;
    }
    if (req.body.price != null) {
        res.product.price = req.body.price;
    }
    if (req.body.description != null) {
        res.product.description = req.body.description;
    }
    try {
        const updatedProduct = await res.product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Delete a product
router.delete('/:id', getProduct, async (req, res) => {
    try {
        await res.product.remove();
        res.json({
            message: 'Deleted This product'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

async function getProduct(req, res, next) {
    try {
        product = await Products.findById(req.params.id);
        if (product == null) {
            return res.status(404).json({
                message: 'Cant find product'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }

    res.product = product;
    next();
}

module.exports = router;

const express = require('express');
const router = express.Router();
const Orders = require('../models/orders');
const Customers = require('../models/customers');
const Products = require('../models/products');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Orders.find()
            .populate('customer')
            .populate('product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Get a single order
router.get('/:id', getOrder, (req, res) => {
    res.json(res.order);
});

// Create a new order
router.post('/', async (req, res) => {
    const customer = await Customers.findById(req.body.customerId);
    const product = await Products.findById(req.body.productId);

    if (!customer || !product) {
        return res.status(404).json({
            message: 'customer or product not found'
        });
    }

    const order = new Orders({
        customer: customer._id,
        product: product._id,
        quantity: req.body.quantity
    });

    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Update an order
router.patch('/:id', getOrder, async (req, res) => {
    if (req.body.quantity != null) {
        res.order.quantity = req.body.quantity;
    }
    try {
        const updatedOrder = await res.order.save();
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Delete an order
router.delete('/:id', getOrder, async (req, res) => {
    try {
        await res.order.remove();
        res.json({
            message: 'Deleted This order'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

async function getOrder(req, res, next) {
    try {
        order = await Orders.findById(req.params.id)
            .populate('customer')
            .populate('product');
        if (order == null) {
            return res.status(404).json({
                message: 'Cant find order'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }

    res.order = order;
    next();
}

module.exports = router;

const express = require('express');
const router = express.Router();
const Invoices = require('../models/invoices');
const Orders = require('../models/orders');

// Get all invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoices.find()
            .populate('order');
        res.json(invoices);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Get a single invoice
router.get('/:id', getInvoice, (req, res) => {
    res.json(res.invoice);
});

// Create a new invoice
router.post('/', async (req, res) => {
    const order = await Orders.findById(req.body.orderId);

    if (!order) {
        return res.status(404).json({
            message: 'order not found'
        });
    }
    const invoice = new Invoices({
        order: order._id,
        total: req.body.total
    });

    try {
        const newInvoice = await invoice.save();
        res.status(201).json(newInvoice);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Update an invoice
router.patch('/:id', getInvoice, async (req, res) => {
    if (req.body.total != null) {
        res.invoice.total = req.body.total;
    }
    try {
        const updatedInvoice = await res.invoice.save();
        res.json(updatedInvoice);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Delete an invoice
router.delete('/:id', getInvoice, async (req, res) => {
    try {
        await res.invoice.remove();
        res.json({
            message: 'Deleted This invoice'
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

async function getInvoice(req, res, next) {
    try {
        invoice = await Invoices.findById(req.params.id)
            .populate('order');
        if (invoice == null) {
            return res.status(404).json({
                message: 'Cant find invoice'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }

    res.invoice = invoice;
    next();
}

module.exports = router;

const customersRoutes = require('./routes/customers');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const invoicesRoutes = require('./routes/invoices');

app.use('/customers', customersRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);
app.use('/invoices', invoicesRoutes);