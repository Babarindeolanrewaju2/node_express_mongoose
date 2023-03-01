const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'yourusername',
    password: 'yourpassword',
    database: 'yourdatabase'
})

connection.connect(error => {
    if (error) throw error
    console.log('Connected to MySQL server.')
    const sql = `CREATE TABLE flash_sales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    start_date_time DATETIME(5) NOT NULL,
    end_date_time DATETIME(5) NOT NULL,
    price DECIMAL(16,8) NOT NULL,
    quantity DECIMAL(16,8) NOT NULL,
    vendor_id BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX campaign_name_index (campaign_name),
    INDEX flash_sales_product_id_foreign_idx (product_id),
    INDEX flash_sales_vendor_id_foreign_idx (vendor_id)
  )`
    connection.query(sql, (error, result) => {
        if (error) throw error
        console.log('flash_sales table created successfully.')
    })

    const sql2 = `CREATE TABLE favourites (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(16) NOT NULL,
    browser_agent VARCHAR(12),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX favourites_product_id_foreign_idx (product_id),
    INDEX favourites_user_id_foreign_idx (user_id),
    INDEX favourites_ip_address_index (ip_address),
    INDEX favourites_browser_agent_index (browser_agent)
  )`
    connection.query(sql2, (error, result) => {
        if (error) throw error
        console.log('favourites table created successfully.')
    })

    const sql3 = `CREATE TABLE product_tags (
    product_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT NOT NULL,
    INDEX product_tags_product_id_foreign_idx (product_id),
    INDEX product_tags_tag_id_foreign_idx (tag_id)
  )`
    connection.query(sql3, (error, result) => {
        if (error) throw error
        console.log('product_tags table created successfully.')
    })

    const sql4 = `CREATE TABLE brands (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT UNSIGNED,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(10) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX brands_vendor_id_foreign_idx (vendor_id)
  )`
    connection.query(sql4, (error, result) => {
        if (error) throw error
        console.log('brands table created successfully.')
    })

    const sql5 = `CREATE TABLE vendors (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(100),
    phone VARCHAR(45) NOT NULL,
    formal_name VARCHAR(255),
    status VARCHAR(15) DEFAULT 'Pending',
    website VARCHAR(255),
    sell_commissions DECIMAL(16,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`
    connection.query(sql5, (error, result) => {
        if (error) throw error
        console.log('vendors table created successfully.')
    })

    const sql6 = `CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    VARCHAR(120) NOT NULL,
       sku VARCHAR(45),
       parent_id BIGINT UNSIGNED,
       slug VARCHAR(255),
       name VARCHAR(255) NOT NULL,
       description TEXT,
       summary VARCHAR(255),
       vendor_id BIGINT UNSIGNED,
       shop_id BIGINT UNSIGNED,
       brand_id INT UNSIGNED,
       status ENUM('Draft', 'Pending', 'Published', 'Archived') DEFAULT 'Draft',
       total_wish INT UNSIGNED DEFAULT 0,
       total_sales INT UNSIGNED DEFAULT 0,
       regular_price DECIMAL(16, 8),
       sale_price DECIMAL(16, 8),
       sale_from TIMESTAMP,
       sale_to TIMESTAMP,
       available_from TIMESTAMP,
       available_to TIMESTAMP,
       featured TIMESTAMP,
       manage_stocks BOOLEAN DEFAULT false,
       total_stocks INT UNSIGNED DEFAULT 0,
       review_count SMALLINT UNSIGNED DEFAULT 0,
       review_average DECIMAL(6, 2),
       total_views INT UNSIGNED DEFAULT 0,
       type ENUM('Simple', 'Variable') DEFAULT 'Simple',
       menu_order SMALLINT UNSIGNED DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       deleted_at TIMESTAMP NULL
)
`
    connection.query(sql6, function (error, results, fields) {
        if (error) throw error
        console.log('Table products created successfully')
    })

    const sql7 = `CREATE TABLE favourites(id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                product_id BIGINT UNSIGNED NOT NULL,
                user_id BIGINT UNSIGNED NOT NULL,
                ip_address VARCHAR(16),
                browser_agent VARCHAR(12),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_favourites_products FOREIGN KEY(product_id) REFERENCES products(id),
                CONSTRAINT fk_favourites_users FOREIGN KEY(user_id) REFERENCES users(id))`

    connection.query(sql7, function (error, results, fields) {
        if (error) throw error
        console.log('Table favourites created successfully')
    })

    const sql8 = `CREATE TABLE product_tags(product_id BIGINT UNSIGNED NOT NULL,
                tag_id BIGINT UNSIGNED NOT NULL,
                CONSTRAINT fk_product_tags_products FOREIGN KEY(product_id) REFERENCES products(id),
                CONSTRAINT fk_product_tags_tags FOREIGN KEY(tag_id) REFERENCES tags(id),
                PRIMARY KEY(product_id, tag_id))`

    connection.query(sql8, function (error, results, fields) {
        if (error) throw error
        console.log('Table product_tags created successfully')
    })

    const sql9 = `CREATE TABLE brands(id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                vendor_id BIGINT UNSIGNED,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_brands_vendors FOREIGN KEY(vendor_id) REFERENCES vendors(id))`

    connection.query(sql9, function (error, results, fields) {
        if (error) throw error
        console.log('Table brands created successfully')
    })

    const sql10 = `CREATE TABLE vendors(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(100), phone VARCHAR(45),
                formal_name VARCHAR(255),
                status ENUM('Pending', 'Active', 'Inactive', 'Banned') DEFAULT 'Pending',
                website VARCHAR(255), sell_commissions DECIMAL(16, 8),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`

    connection.query(sql10, function (error, results, fields) {
        if (error) throw error
        console.log('Successfully created tables.')
    })
})

// promisify MySQL queries
const query = util.promisify(connection.query).bind(connection);

// GET all flash sales
router.get('/flash-sales', async (req, res) => {
    try {
        const results = await query('SELECT * FROM flash_sales');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// GET a specific flash sale by ID
router.get('/flash-sales/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const results = await query('SELECT * FROM flash_sales WHERE id = ?', [id]);
        if (results.length === 0) {
            res.status(404).json({
                error: 'Flash sale not found'
            });
        } else {
            res.status(200).json(results[0]);
        }
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// POST a new flash sale
router.post('/flash-sales', async (req, res) => {
    const {
        campaign_name,
        product_id,
        start_date_time,
        end_date_time,
        price,
        quantity,
        vendor_id
    } = req.body;
    try {
        const results = await query('INSERT INTO flash_sales (campaign_name, product_id, start_date_time, end_date_time, price, quantity, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [campaign_name, product_id, start_date_time, end_date_time, price, quantity, vendor_id]);
        const id = results.insertId;
        const flashSale = await query('SELECT * FROM flash_sales WHERE id = ?', [id]);
        res.status(201).json(flashSale[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// PUT update an existing flash sale
router.put('/flash-sales/:id', async (req, res) => {
    const id = req.params.id;
    const {
        campaign_name,
        product_id,
        start_date_time,
        end_date_time,
        price,
        quantity,
        vendor_id
    } = req.body;
    try {
        const results = await query('UPDATE flash_sales SET campaign_name = ?, product_id = ?, start_date_time = ?, end_date_time = ?, price = ?, quantity = ?, vendor_id = ? WHERE id = ?', [campaign_name, product_id, start_date_time, end_date_time, price, quantity, vendor_id, id]);
        if (results.affectedRows === 0) {
            res.status(404).json({
                error: 'Flash sale not found'
            });
        } else {
            const flashSale = await query('SELECT * FROM flash_sales WHERE id = ?', [id]);
            res.status(200).json(flashSale[0]);
        }
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// DELETE an existing flash sale
router.delete('/flash-sales/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const results = await query('DELETE FROM flash_sales WHERE id = ?', [id]);
        if (results.affectedRows === 0) {
            res.status(404).json({
                message: `Flash sale with id $ {id} not found.`
            });
        } else {
            res.json({
                message: `Flash sale with id $ {id} successfully deleted.`
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error.'
        });
    }
});
