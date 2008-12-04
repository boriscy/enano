require File.dirname(__FILE__) + '/../test_helper'

# make sure the secret for request forgery protection is set (views will
# explicitly use the form_authenticity_token method which will fail otherwise)
ProductsController.request_forgery_protection_options[:secret] = 'test_secret'

class ProductsControllerTest < ActionController::TestCase

  def test_should_get_index
    get :index
    assert_response :success
    get :index, :format => 'ext_json'
    assert_response :success
    assert_not_nil assigns(:products)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end

  def test_should_create_product
    assert_difference('Product.count') do
      xhr :post, :create, :format => 'ext_json', :product => { }
    end

    assert_not_nil flash[:notice]
    assert_response :success
  end

  def test_should_show_product
    get :show, :id => products(:one).id
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => products(:one).id
    assert_response :success
  end

  def test_should_update_product
    xhr :put, :update, :format => 'ext_json', :id => products(:one).id, :product => { }
    assert_not_nil flash[:notice]
    assert_response :success
  end

  def test_should_destroy_product
    assert_difference('Product.count', -1) do
      xhr :delete, :destroy, :id => products(:one).id
    end

    assert_response :success
  end
end
