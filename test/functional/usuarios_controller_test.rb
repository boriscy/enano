require File.dirname(__FILE__) + '/../test_helper'

# make sure the secret for request forgery protection is set (views will
# explicitly use the form_authenticity_token method which will fail otherwise)
UsuariosController.request_forgery_protection_options[:secret] = 'test_secret'

class UsuariosControllerTest < ActionController::TestCase

  def test_should_get_index
    get :index
    assert_response :success
    get :index, :format => 'ext_json'
    assert_response :success
    assert_not_nil assigns(:usuarios)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end

  def test_should_create_usuarios
    assert_difference('Usuarios.count') do
      xhr :post, :create, :format => 'ext_json', :usuarios => { }
    end

    assert_not_nil flash[:notice]
    assert_response :success
  end

  def test_should_show_usuarios
    get :show, :id => usuarios(:one).id
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => usuarios(:one).id
    assert_response :success
  end

  def test_should_update_usuarios
    xhr :put, :update, :format => 'ext_json', :id => usuarios(:one).id, :usuarios => { }
    assert_not_nil flash[:notice]
    assert_response :success
  end

  def test_should_destroy_usuarios
    assert_difference('Usuarios.count', -1) do
      xhr :delete, :destroy, :id => usuarios(:one).id
    end

    assert_response :success
  end
end
