import {
    Sequelize
} from 'sequelize';

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

export default sequelize;

import {
    Sequelize,
    DataTypes
} from 'sequelize';
import sequelize from './db';

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

export default Product;

import {
    Sequelize,
    DataTypes
} from 'sequelize';
import sequelize from './db';
import Product from './product';

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customerAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

Order.belongsTo(Product);

export default Order;

import Product from './product';

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving products',
            error
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const product = await Product.findByPk(id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({
                message: 'Product not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving product',
            error
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            imageUrl
        } = req.body;
        const product = await Product.create({
            name,
            price,
            description,
            imageUrl
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating product',
            error
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            name,
            price,
            description,
            imageUrl
        } = req.body;
        const [updated] = await Product.update({
            name,
            price,
            description,
            imageUrl
        }, {
            where: {
                id
            }
        });
        if (updated) {
            const updatedProduct = await Product.findByPk(id);
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({
                message: 'Product not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error updating product',
            error
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const deleted = await Product.destroy({
            where: {
                id
            }
        });
        if (deleted) {
            res.status(200).json({
                message: 'Product deleted'
            });
        } else {
            res.status(404).json({
                message: 'Product not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting product',
            error
        });
    }
};

import Order from './order';

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [Product]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving orders',
            error
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const order = await Order.findByPk(id, {
            include: [Product]
        });
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({
                message: 'Order not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving order',
            error
        });
    }
};

export const createOrder = async (req, res) => {
    try {
        const {
            customerName,
            customerAddress,
            productId,
            total
        } = req.body;
        const order = await Order.create({
            customerName,
            customerAddress,
            productId,
            total
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating order',
            error
        });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            customerName,
            customerAddress,
            productId,
            total
        } = req.body;
        const [updated] = await Order.update({
            customerName,
            customerAddress,
            productId,
            total
        }, {
            where: {
                id
            }
        });
        if (updated) {
            const updatedOrder = await Order.findByPk(id, {
                include: [Product]
            });
            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({
                message: 'Order not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error updating order',
            error
        });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const deleted = await Order.destroy({
            where: {
                id
            }
        });
        if (deleted) {
            res.status(200).json({
                message: 'Order deleted'
            });
        } else {
            res.status(404).json({
                message: 'Order not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting order',
            error
        });
    }
};


import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from './products';
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} from './orders';

const router = express.Router();

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

export default router;


app.use('/api', routes)



import {
    Schema
} from 'mongoose';

const imageSchema = new Schema({
    filename: {
        type: String,
        required: true
    },
    filetype: {
        type: String,
        required: true
    },
    filesize: {
        type: Number,
        required: true
    }
});

export default mongoose.model('Image', imageSchema);

import multer from 'multer';
import multerS3 from 'multer-storage-engine-mongoose';

const storage = multerS3({
    model: Image,
    bucket: 'my-images',
    fileKeyMaker(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const upload = multer({
    storage
});

app.post('/upload', upload.array('images', 12), (req, res) => {
    const images = req.files;
    const imagePromises = images.map(image => {
        const imageBuffer = new Buffer.from(image.buffer, 'binary').toString('base64');
        const newImage = new Image({
            filename: image.originalname,
            imageString: imageBuffer
        });
        return newImage.save();
    });
    Promise.all(imagePromises)
        .then(() => {
            res.send('Images uploaded successfully');
        })
        .catch((error) => {
            res.status(500).json({
                message: 'Error uploading images',
                error
            });
        });
});


import request from 'supertest';
import app from '../app';
import db from '../models';

describe('Order routes', () => {
    afterAll(async () => {
        await db.sequelize.close();
    });

    test('should create an order', async () => {
        const product = await db.Product.create({
            name: 'Test Product',
            price: 10
        });
        const order = {
            customerName: 'John Doe',
            customerAddress: '123 Main St',
            productId: product.id,
            total: 10
        };

        const response = await request(app)
            .post('/api/orders')
            .send(order);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('customerName', order.customerName);
        expect(response.body).toHaveProperty('customerAddress', order.customerAddress);
        expect(response.body).toHaveProperty('productId', order.productId);
        expect(response.body).toHaveProperty('total', order.total);
    });

    test('should get all orders', async () => {
        const response = await request(app).get('/api/orders');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('should get an order by id', async () => {
        const product = await db.Product.create({
            name: 'Test Product',
            price: 10
        });
        const order = await db.Order.create({
            customerName: 'John Doe',
            customerAddress: '123 Main St',
            productId: product.id,
            total: 10
        });
        const response = await request(app).get(`/api/orders/${order.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('customerName', order.customerName);
        expect(response.body).toHaveProperty('customerAddress', order.customerAddress);
        expect(response.body).toHaveProperty('productId', order.productId);
        expect(response.body).toHaveProperty('total', order.total);
    });

    test('should update an order', async () => {
        const product = await db.Product.create({
            name: 'Test Product',
            price: 10
        });
        const order = await db.Order.create({
            customerName: 'John Doe',
            customerAddress: '123 Main St',
            productId: product.id,
            total: 10
        });
        const updatedOrder = {
            customerName: 'Jane Doe',
            customerAddress: '456 Elm St',
            productId: product.id,
            total: 15
        };
        const response = await request(app)
            .put(`/api/orders/${order.id}`)
            .send(updatedOrder);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('customerName', updatedOrder.customerName);
        expect(response.body).toHaveProperty('customerAddress', updatedOrder.customerAddress);
        expect(response.body).toHaveProperty('productId', updatedOrder.productId);
        expect(response.body).toHaveProperty('total', updatedOrder.total);

    });

    test('should delete an order', async () => {
        const product = await db.Product.create({
            name: 'Test Product',
            price: 10
        });
        const order = await db.Order.create({
            customerName: 'John Doe',
            customerAddress: '123 Main St',
            productId: product.id,
            total: 10
        });

        const response = await request(app).delete(`/api/orders/${order.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Order deleted');

    });
});