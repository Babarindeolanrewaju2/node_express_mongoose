require 'sinatra'
require 'json'
require 'mysql2'
require 'securerandom'
require 'fileutils'
require 'mini_magick'

# Initialize MySQL client
$db = Mysql2::Client.new(
  host: 'localhost',
  username: 'root',
  password: 'password',
  database: 'test'
)

# Create a directory to store product images
PRODUCT_IMAGE_DIR = File.join(Dir.pwd, 'product_images')
FileUtils.mkdir_p(PRODUCT_IMAGE_DIR) unless File.directory?(PRODUCT_IMAGE_DIR)

# Define routes for CRUD operations on products
get '/products' do
  # Retrieve all products from the database
  result = $db.query('SELECT * FROM products')

  # Convert result to an array of products
  products = result.map do |row|
    { id: row['id'], name: row['name'], price: row['price'], image_url: row['image_url'] }
  end

  # Return the array of products as JSON
  products.to_json
end

get '/products/:id' do |id|
  # Retrieve the product with the specified ID from the database
  result = $db.query("SELECT * FROM products WHERE id = '#{id}'")

  # If no product was found, return a 404 error
  if result.count == 0
    halt 404, 'Product not found'
  end

  # Convert the result to a product object
  row = result.first
  product = { id: row['id'], name: row['name'], price: row['price'], image_url: row['image_url'] }

  # Return the product object as JSON
  product.to_json
end

post '/products' do
  # Parse the request body as JSON
  body = JSON.parse(request.body.read)

  # Generate a unique ID for the new product
  id = SecureRandom.uuid

  # Save the product image to the file system
  image_path = save_product_image(id, body['image'])

  # Insert the new product into the database
  $db.query("INSERT INTO products (id, name, price, image_url) VALUES ('#{id}', '#{body['name']}', #{body['price']}, '#{image_path}')")

  # Return the new product as JSON
  { id: id, name: body['name'], price: body['price'], image_url: image_path }.to_json
end

put '/products/:id' do |id|
  # Parse the request body as JSON
  body = JSON.parse(request.body.read)

  # If the image was provided, save it to the file system
  if body.has_key?('image')
    image_path = save_product_image(id, body['image'])
    image_url = ", image_url = '#{image_path}'"
  else
    image_url = ''
  end

  # Update the product in the database
  $db.query("UPDATE products SET name = '#{body['name']}', price = #{body['price']}#{image_url} WHERE id = '#{id}'")

  # Return the updated product as JSON
  { id: id, name: body['name'], price: body['price'], image_url: image_path }.to_json
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

