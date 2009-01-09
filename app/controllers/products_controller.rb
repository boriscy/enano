class ProductsController < ApplicationController

  before_filter :find_product, :only => [ :show, :edit, :update, :destroy ]

  # GET /products
  # GET /products.ext_json
  def index
    respond_to do |format|
      format.html     # index.html.erb (no data required)
      format.ext_json { render :json => find_products.to_ext_json(:class => Product, :count => Product.count(options_from_search(Product))) }
    end
  end

  # GET /products/1
  def show
    # show.html.erb
  end

  # GET /products/new
  def new
    @product = Product.new(params[:product])
    # new.html.erb
  end

  # GET /products/1/edit
  def edit
    # edit.html.erb
  end

  # POST /products
  def create
    @product = Product.new(params[:product])

    respond_to do |format|
      if @product.save
        flash[:notice] = 'Product was successfully created.'
        format.ext_json { render(:update) {|page| page.redirect_to products_path } }
      else
        format.ext_json { render :json => @product.to_ext_json(:success => false) }
      end
    end
  end

  # PUT /products/1
  def update
    respond_to do |format|
      if @product.update_attributes(params[:product])
        flash[:notice] = 'Product was successfully updated.'
        format.ext_json { render(:update) {|page| page.redirect_to products_path } }
      else
        format.ext_json { render :json => @product.to_ext_json(:success => false) }
      end
    end
  end

  # DELETE /products/1
  def destroy
    @product.destroy

    respond_to do |format|
      format.js  { head :ok }
    end
  rescue
    respond_to do |format|
      format.js  { head :status => 500 }
    end
  end
  
  protected
  
    def find_product
      @product = Product.find(params[:id])
    end
    
    def find_products
      pagination_state = update_pagination_state_with_params!(Product)
      @products = Product.find(:all, options_from_pagination_state(pagination_state).merge(options_from_search(Product)))
    end

end
