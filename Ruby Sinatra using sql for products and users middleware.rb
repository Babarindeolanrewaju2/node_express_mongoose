require 'sinatra'
require 'sinatra/contrib'
require 'sqlite3'
require 'json'
require 'sinatra/auth'

# Connect to the SQLite database
db = SQLite3::Database.new 'database.db'

# Define the middleware to check for a token
use Rack::Auth::Basic, "Protected Area" do |username, password|
  # Check if the token is valid
  token = db.execute('SELECT token FROM users WHERE username = ? AND password = ?', username, password).first
  token == 'valid'
end

# GET request to retrieve all products
get '/products' do
  # Check for the token before retrieving the products
  protected!

  # Retrieve all products from the database, including the user information, and return as JSON
  products = db.execute('SELECT p.id, p.name, p.price, u.id as user_id, u.name as user_name, u.email FROM products p JOIN users u ON p.user_id = u.id')
  products.map do |product|
    {id: product[0], name: product[1], price: product[2], user: {id: product[3], name: product[4], email: product[5]}}
  end.to_json
end

# GET request to retrieve a specific product
get '/products/:id' do
  # Check for the token before retrieving the product
  protected!

  # Retrieve the product by ID from the database, including the user information, and return as JSON
  id = params[:id].to_i
  product = db.execute('SELECT p.id, p.name, p.price, u.id as user_id, u.name as user_name, u.email FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = ?', id).first
  {id: product[0], name: product[1], price: product[2], user: {id: product[3], name: product[4], email: product[5]}}.to_json
end

# POST request to create a new product
post '/products' do
  # Check for the token before creating the product
  protected!

  # Retrieve the product data from the request body, insert into the database, and return as JSON
  data = JSON.parse(request.body.read)
  db.execute('INSERT INTO products (name, price, user_id) VALUES (?, ?, ?)', data['name'], data['price'], data['user_id'])
  {message: 'Product created'}.to_json
end

# PUT request to update an existing product
put '/products/:id' do
  # Check for the token before updating the product
  protected!

  # Retrieve the product by ID from the database, update the data, and return as JSON
  id = params[:id].to_i
  data = JSON.parse(request.body.read)
  db.execute('UPDATE products SET name = ?, price = ?, user_id = ? WHERE id = ?', data['name'], data['price'], data['user_id'], id)
  {message: 'Product updated'}.to_json
end

# Define a helper method to check for the token
helpers do
  def protected!
    # Check if the token is valid
    unless authorized?
      response['WWW-Authenticate'] = %(Basic realm="Restricted Area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def authorized?
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    if @auth.provided? && @auth.basic? && @auth.credentials
      username, password = @auth.credentials
      token = db.execute('SELECT token FROM users WHERE username = ? AND password = ?', username, password).first
      token == 'valid'
    else
      false
    end
  end
end

