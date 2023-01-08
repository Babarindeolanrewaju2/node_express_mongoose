router.post('/', async (req, res) => {
  // Upload the image file to S3
  const s3Response = await s3
    .upload({
      Bucket: 'my-bucket',
      Key: req.body.name,
      Body: req.body.image,
      ContentType: 'image/jpeg',
    })
    .promise();

  // Create a new product image using the S3 URL
  const productImage = new ProductImage({
    name: req.body.name,
    description: req.body.description,
    image: s3Response.Location,
  });

  // Save the product image to the database
  try {
    await productImage.save();
    res.send(productImage);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/:id', async (req, res) => {
  // Find the product by ID
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Product not found');

  // Upload the image file to S3
  const s3Response = await s3
    .upload({
      Bucket: 'my-bucket',
      Key: req.body.name,
      Body: req.body.image,
      ContentType: 'image/jpeg',
    })
    .promise();

  // Update the product with the new image
  product.image = s3Response.Location;
  try {
    await product.save();
    res.send(product);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/:id', async (req, res) => {
  // Find the product by ID
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Product not found');

  // Upload the image files to S3 and store the URLs in an array
  const s3Urls = [];
  for (const image of req.body.images) {
    const s3Response = await s3
      .upload({
        Bucket: 'my-bucket',
        Key: image.name,
        Body: image.data,
        ContentType: 'image/jpeg',
      })
      .promise();
    s3Urls.push(s3Response.Location);
  }

  // Update the product with the new images
  product.images = s3Urls;
  try {
    await product.save();
    res.send(product);
  } catch (err) {
    res.status(400).send(err);
  }
});
