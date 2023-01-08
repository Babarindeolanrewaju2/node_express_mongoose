const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);

const Router = require('koa-router');
const Product = require('./product-model');

const router = new Router();

router.post('/', async (ctx) => {
  const product = new Product({
    name: ctx.request.body.name,
    description: ctx.request.body.description,
    price: ctx.request.body.price,
  });
  try {
    await product.save();
    ctx.body = product;
  } catch (err) {
    ctx.status = 400;
    ctx.body = err;
  }
});

module.exports = router;
