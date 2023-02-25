gem install sinatra
gem install sinatra-contrib
gem install sqlite3


CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price REAL,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

require 'sinatra'
require 'sinatra/contrib'
require 'sqlite3'
require 'json'


# Connect to the SQLite database
db = SQLite3::Database.new 'database.db'


# GET request to retrieve all products
get '/products' do
  # Retrieve all products from the database, including the user information, and return as JSON
  products = db.execute('SELECT p.id, p.name, p.price, u.id as user_id, u.name as user_name, u.email FROM products p JOIN users u ON p.user_id = u.id')
  products.map do |product|
    {id: product[0], name: product[1], price: product[2], user: {id: product[3], name: product[4], email: product[5]}}
  end.to_json
end

# GET request to retrieve a specific product
get '/products/:id' do
  # Retrieve the product by ID from the database, including the user information, and return as JSON
  id = params[:id].to_i
  product = db.execute('SELECT p.id, p.name, p.price, u.id as user_id, u.name as user_name, u.email FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = ?', id).first
  {id: product[0], name: product[1], price: product[2], user: {id: product[3], name: product[4], email: product[5]}}.to_json
end

# POST request to create a new product
post '/products' do
  # Retrieve the product data from the request body, insert into the database, and return as JSON
  data = JSON.parse(request.body.read)
  db.execute('INSERT INTO products (name, price, user_id) VALUES (?, ?, ?)', data['name'], data['price'], data['user_id'])
  {message: 'Product created'}.to_json
end

# PUT request to update an existing product
put '/products/:id' do
  # Retrieve the product by ID from the database, update the data, and return as JSON
  id = params[:id].to_i
  data = JSON.parse(request.body.read)
  db.execute('UPDATE products SET name = ?, price = ?, user_id = ? WHERE id = ?', data['name'], data['price'], data['user_id'], id)
  {message: 'Product updated'}.to_json
end 

# Run the application
run Sinatra::Application
