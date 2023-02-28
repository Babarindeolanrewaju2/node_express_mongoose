const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'cookies_db'
});

db.connect((err) => {
    if (err) {
        console.log(err);
        throw err;
    }
    console.log('Connected to database');
});

// Create table if it does not exist
const createTableIfNotExists = () => {
    const sql = `CREATE TABLE IF NOT EXISTS cookies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    premium BOOLEAN NOT NULL DEFAULT FALSE,
    offer VARCHAR(255),
    UNIQUE KEY (name)
  )`;
    db.query(sql, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log('Table created or already exists');
    });
};

createTableIfNotExists();

// Routes

// GET all cookies
app.get('/cookies', (req, res) => {
    const sql = 'SELECT * FROM cookies';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            res.json(result);
        }
    });
});

// GET a cookie by name
app.get('/cookies/:name', (req, res) => {
    const name = req.params.name;
    const sql = 'SELECT * FROM cookies WHERE name = ?';
    db.query(sql, [name], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else if (result.length === 0) {
            res.status(404).send('Cookie not found');
        } else {
            res.json(result[0]);
        }
    });
});

// POST a new cookie
app.post('/cookies', (req, res) => {
    const {
        name,
        price,
        premium,
        offer
    } = req.body;
    const sql = 'INSERT INTO cookies (name, price, premium, offer) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, price, premium, offer], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            res.status(201).send('Cookie created');
        }
    });
});

// PUT (update) a cookie by name
app.put('/cookies/:name', (req, res) => {
    const name = req.params.name;
    const {
        price,
        premium,
        offer
    } = req.body;
    const sql = 'UPDATE cookies SET price = ?, premium = ?, offer = ? WHERE name = ?';
    db.query(sql, [price, premium, offer, name], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Cookie not found');
        } else {
            res.send('Cookie updated');
        }
    });
})

// DELETE a cookie by name
app.delete('/cookies/:name', (req, res) => {
    const name = req.params.name;
    const sql = 'DELETE FROM cookies WHERE name = ?';
    db.query(sql, [name], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Cookie not found');
        } else {
            res.send('Cookie deleted');
        }
    });
});

// Listen for incoming requests
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
