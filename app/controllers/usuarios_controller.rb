class UsuariosController < ApplicationController

  before_filter :find_usuarios, :only => [ :show, :edit, :update, :destroy ]

  # GET /usuarios
  # GET /usuarios.ext_json
  def index
    respond_to do |format|
      format.html     # index.html.erb (no data required)
      format.ext_json { render :json => find_usuarios.to_ext_json(:class => Usuarios, :count => Usuarios.count(options_from_search(Usuarios))) }
    end
  end

  # GET /usuarios/1
  def show
    # show.html.erb
  end

  # GET /usuarios/new
  def new
    @usuarios = Usuarios.new(params[:usuarios])
    # new.html.erb
  end

  # GET /usuarios/1/edit
  def edit
    # edit.html.erb
  end

  # POST /usuarios
  def create
    @usuarios = Usuarios.new(params[:usuarios])

    respond_to do |format|
      if @usuarios.save
        flash[:notice] = 'Usuarios was successfully created.'
        format.ext_json { render(:update) {|page| page.redirect_to usuarios_path } }
      else
        format.ext_json { render :json => @usuarios.to_ext_json(:success => false) }
      end
    end
  end

  # PUT /usuarios/1
  def update
    respond_to do |format|
      if @usuarios.update_attributes(params[:usuarios])
        flash[:notice] = 'Usuarios was successfully updated.'
        format.ext_json { render(:update) {|page| page.redirect_to usuarios_path } }
      else
        format.ext_json { render :json => @usuarios.to_ext_json(:success => false) }
      end
    end
  end

  # DELETE /usuarios/1
  def destroy
    @usuarios.destroy

    respond_to do |format|
      format.js  { head :ok }
    end
  rescue
    respond_to do |format|
      format.js  { head :status => 500 }
    end
  end
  
  protected
  
    def find_usuarios
      @usuarios = Usuarios.find(params[:id])
    end
    
    def find_usuarios
      pagination_state = update_pagination_state_with_params!(Usuarios)
      @usuarios = Usuarios.find(:all, options_from_pagination_state(pagination_state).merge(options_from_search(Usuarios)))
    end

end
