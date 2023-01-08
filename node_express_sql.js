// GET request to retrieve all products
app.get('/products', (req, res) => {
  // Connect to the database and retrieve all products
  pool.query('SELECT * FROM products', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

// POST request to create a new product
app.post('/products', (req, res) => {
  // Connect to the database and insert the new product
  const { name, price } = req.body;
  pool.query(
    'INSERT INTO products (name, price) VALUES ($1, $2)',
    [name, price],
    (error, result) => {
      if (error) {
        throw error;
      }
      res.status(201).send(`Product added with ID: ${result.insertId}`);
    }
  );
});

// PUT request to update an existing product
app.put('/products/:id', (req, res) => {
  // Connect to the database and update the product
  const id = req.params.id;
  const { name, price } = req.body;
  pool.query(
    'UPDATE products SET name = $1, price = $2 WHERE id = $3',
    [name, price, id],
    (error, result) => {
      if (error) {
        throw error;
      }
      res.status(200).send(`Product modified with ID: ${id}`);
    }
  );
});

// DELETE request to delete an existing product
app.delete('/products/:id', (req, res) => {
  // Connect to the database and delete the product
  const id = req.params.id;
  pool.query('DELETE FROM products WHERE id = $1', [id], (error, result) => {
    if (error) {
      throw error;
    }
    res.status(200).send(`Product deleted with ID: ${id}`);
  });
});
