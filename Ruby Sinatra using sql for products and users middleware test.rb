require 'minitest/autorun'
require 'rack/test'
require_relative '../app'

class AppTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  def test_products_endpoint_protected_by_token
    # Make a request to the /products endpoint without a valid token
    get '/products'
    assert last_response.status == 401

    # Make a request to the /products endpoint with a valid token
    authorize 'testuser', 'testpassword'
    get '/products'
    assert last_response.status == 200
  end
end
