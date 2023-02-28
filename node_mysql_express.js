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
const createTableIfNotExists = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS cookies(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, price DECIMAL(10, 2) NOT NULL, premium BOOLEAN NOT NULL DEFAULT FALSE, offer VARCHAR(255), UNIQUE KEY(name))`;
    try {
        const result = await db.promise().query(sql);
        console.log('Table created or already exists');
    } catch (err) {
        console.log(err);
        throw err;
    }
};

createTableIfNotExists();

// Routes

// GET all cookies
app.get('/cookies', async (req, res) => {
    const sql = 'SELECT * FROM cookies';
    try {
        const [result, _] = await db.promise().query(sql);
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

// GET a cookie by name
app.get('/cookies/:name', async (req, res) => {
    const name = req.params.name;
    const sql = 'SELECT * FROM cookies WHERE name = ?';
    try {
        const [result, _] = await db.promise().query(sql, [name]);
        if (result.length === 0) {
            res.status(404).send('Cookie not found');
        } else {
            res.json(result[0]);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

// POST a new cookie
app.post('/cookies', async (req, res) => {
    const {
        name,
        price,
        premium,
        offer
    } = req.body;
    const sql = 'INSERT INTO cookies (name, price, premium, offer) VALUES (?, ?, ?, ?)';
    try {
        const result = await db.promise().query(sql, [name, price, premium, offer]);
        res.status(201).send('Cookie created');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

// PUT (update) a cookie by name
app.put('/cookies/:name', async (req, res) => {
    const name = req.params.name;
    const {
        price,
        premium,
        offer
    } = req.body;
    const sql = 'UPDATE cookies SET price = ?, premium = ?, offer = ? WHERE name = ?';
    try {
        const result = await db.promise().query(sql, [price, premium, offer, name]);
        if (result[0].affectedRows === 0) {
            res.status(404).send('Cookie not found');
        } else {
            res.send('Cookie updated');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

// DELETE a cookie by name
app.delete('/cookies/:name', async (req, res) => {
    const name = req.params.name;
    const sql = 'DELETE FROM cookies WHERE name = ?';
    try {
        const

            result = await db.promise().query(sql, [name]);
        if (result[0].affectedRows === 0) {
            res.status(404).send('Cookie not found');
        } else {
            res.send('Cookie deleted');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
});

// Listen for incoming requests
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
