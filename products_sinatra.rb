# source "https://rubygems.org"
# gem "sinatra"
# gem "sinatra-activerecord"
# gem "sqlite3"


# CREATE TABLE users (
#   id INTEGER PRIMARY KEY,
#   name TEXT,
#   email TEXT
# );

# CREATE TABLE products (
#   id INTEGER PRIMARY KEY,
#   name TEXT,
#   price REAL,
#   description TEXT
# );


require "sinatra"
require "sinatra/activerecord"

set :database, { adapter: "sqlite3", database: "db.sqlite3" }

class User < ActiveRecord::Base
end

class Product < ActiveRecord::Base
end

# Get all users
get "/users" do
  content_type :json
  User.all.to_json
end

# Create a new user
post "/users" do
  content_type :json
  user = User.new(name: params[:name], email: params[:email])
  if user.save
    status 201
    user.to_json
  else
    status 400
    { error: "Invalid user parameters" }.to_json
  end
end

# Get all products
get "/products" do
  content_type :json
  Product.all.to_json
end

# Create a new product
post "/products" do
  content_type :json
  product = Product.new(name: params[:name], price: params[:price], description: params[:description])
  if product.save
    status 201
    product.to_json
  else
    status 400
    { error: "Invalid product parameters" }.to_json
  end
end

# Get the most recent order
get "/recent_order" do
  content_type :json
  # Assuming that there is an orders table with a created_at timestamp column
  # This query retrieves the most recent order based on the created_at timestamp
  order = ActiveRecord::Base.connection.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 1").first
  if order
    order.to_json
  else
    status 404
    { error: "No recent order found" }.to_json
  end
end
