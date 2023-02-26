require 'sinatra'
require 'mysql2'
require 'json'
require 'jwt'

# Set up MySQL client
db = Mysql2::Client.new(
  host: 'localhost',
  username: 'root',
  password: 'password',
  database: 'myapp'
)

# Set up JWT secret key
JWT_SECRET_KEY = 'mysecretkey'

# Define User model
class User
  attr_accessor :id, :name, :email, :created_at

  def initialize(id, name, email, created_at)
    @id = id
    @name = name
    @email = email
    @created_at = created_at
  end
end

# Helper method to extract JWT token from Authorization header
def extract_token(header)
  header.match(/^Bearer (.*)/)[1]
end

# Helper method to validate JWT token
def validate_token(token)
  begin
    JWT.decode(token, JWT_SECRET_KEY)
  rescue JWT::DecodeError
    false
  end
end

# Helper method to generate JWT token
def generate_token(user_id)
  JWT.encode({ user_id: user_id }, JWT_SECRET_KEY, 'HS256')
end

# Define root route
get '/' do
  'Hello world!'
end

# Define login route
post '/login' do
  # Parse request body
  body = JSON.parse(request.body.read)

  # Query database for user with matching email and password
  result = db.query("SELECT id, name, email, created_at FROM users WHERE email = '#{body['email']}' AND password = '#{body['password']}'")

  # Check if user exists
  if result.count == 1
    user = User.new(result.first['id'], result.first['name'], result.first['email'], result.first['created_at'])
    token = generate_token(user.id)
    { token: token }.to_json
  else
    status 401
  end
end

# Define index route for users
get '/users' do
  # Parse Authorization header
  token = extract_token(request.env['HTTP_AUTHORIZATION'])

  # Validate token
  if validate_token(token)
    # Query database for all users
    result = db.query('SELECT id, name, email, created_at FROM users')

    # Create array of User objects
    users = []
    result.each do |row|
      users << User.new(row['id'], row['name'], row['email'], row['created_at'])
    end

    # Return JSON response
    users.to_json
  else
    status 401
  end
end

# Define show route for user
get '/users/:id' do
  # Parse Authorization header
  token = extract_token(request.env['HTTP_AUTHORIZATION'])

  # Validate token
  if validate_token(token)
    # Query database for user with matching ID
    result = db.query("SELECT id, name, email, created_at FROM users WHERE id = #{params[:id]}")

    # Check if user exists
    if result.count == 1
      user = User.new(result.first['id'], result.first['name'], result.first['email'], result.first['created_at'])
      user.to_json
    else
      status 404
    end
  else
    status 401
  end
end

# Define create route for users
post '/users' do
  # Parse Authorization header
  token = extract_token(request.env['HTTP_AUTHORIZATION'])

  # Validate token
  if validate_token(token)
    # Parse request body
    body = JSON.parse(request.body.read)
    # Insert new user into database
    result = db.execute("INSERT INTO users (name, email) VALUES (?, ?)", body['name'], body['email'])
    # Get ID of newly created user
    id = db.last_insert_row_id
    # Build response object
    { 'id' => id }.to_json
  else
    # Invalid token, return error
    halt 401, { 'error' => 'Invalid token' }.to_json
  end
end


get '/products' do
  token = extract_token(request.env['HTTP_AUTHORIZATION'])
  if validate_token(token)
    # Query database for all products
    products = db.execute("SELECT * FROM products")
    # Build response object
    products.to_json
  else
    # Invalid token, return error
    halt 401, { 'error' => 'Invalid token' }.to_json
  end
end

get '/products/:id' do
  token = extract_token(request.env['HTTP_AUTHORIZATION'])
  if validate_token(token)
      # Query database for product with specified ID
      product = db.execute("SELECT * FROM products WHERE id = ?", params[:id]).first
      # Check if product was found
      if product
        # Build response object
        product.to_json
      else
        # Product not found, return error
        halt 404, { 'error' => 'Product not found' }.to_json
      end
  else
    # Invalid token, return error
    halt 401, { 'error' => 'Invalid token' }.to_json
  end
end

post '/products' do
  token = extract_token(request.env['HTTP_AUTHORIZATION'])
  if validate_token(token)
    # Parse request body
    body = JSON.parse(request.body.read)
    # Insert new product into database
    result = db.execute("INSERT INTO products (name, description, price) VALUES (?, ?, ?)", body['name'], body['description'], body['price'])

    # Get ID of newly created product
    id = db.last_insert_row_id

    # Build response object
    { 'id' => id }.to_json
  else
    # Invalid token, return error
    halt 401, { 'error' => 'Invalid token' }.to_json
  end
end

put '/products/:id' do
token = extract_token(request.env['HTTP_AUTHORIZATION'])

  if validate_token(token)
    # Parse request body
    body = JSON.parse(request.body.read)
    # Update product in database
    result = db.execute("UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?", body['name'], body['description'], body['price'], params[:id])

    # Build response object
    { 'message' => 'Product updated successfully' }.to_json
  else
    # Invalid token, return error
    halt 401, { 'error' => 'Invalid token' }.to_json
  end
end

# DELETE route for deleting a product by ID
delete '/products/:id' do |id|
  # Delete the product with the specified ID from the database
  result = db.query("DELETE FROM products WHERE id = '#{id}'")

  # If no product was found, return a 404 error
  if result.affected_rows == 0
    halt 404, { message: "Product not found" }.to_json
  end

  # Return a success message
  { message: "Product deleted successfully" }.to_json
end

def extract_token(header)
  header.scan(/Bearer (.*)$/).flatten.last
end

def validate_token(token)
  begin
    decoded = JWT.decode(token, 'your_secret_key', true, algorithm: 'HS256')
    return true
  rescue JWT::DecodeError
    return false
  end
end


delete '/products/:id' do |id|
  # Retrieve the token from the Authorization header
  token = extract_token(request.env['HTTP_AUTHORIZATION'])

  # Validate the token
  if validate_token(token)

    # Delete the product with the specified ID from the database
    result = db.query("DELETE FROM products WHERE id = '#{id}'")

    # If no product was found, return a 404 error
    if result.affected_rows == 0
      halt 404, { message: "Product not found" }.to_json
    end

    # Return a success message
    { message: "Product deleted successfully" }.to_json
  else
    # Return a 401 error if the token is invalid
    halt 401, { message: "Unauthorized" }.to_json
  end
end

