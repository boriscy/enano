class PagesController < ApplicationController

  skip_before_filter :login_required, :only => [:index, :show]
  before_filter :menu # Neededto create the menu
  #Index Present the Home, Home must be the First Item
  def index
    if params[:id]
      @page = Page.find(params[:id])
    else
      @page = Page.first(:order => 'lft ASC')
    end
#    respond_to do |format|
#      format.html
#    end
  end

  #Presents the selected story
  def show
    @category = Page.find(params[:id])
  end

  #Creates a new page
  def create
    params[:page].delete(:id)
    p = Page.new(params[:page])
    if p.save
      p.move_to_child_of params[:page][:parent_id] if params[:page][:parent_id] != 'root'
      res = {:success => true, :id => p.id, :iconCls => p.send(:page_type).send(:icon_cls), :title => p.title }
    else
#      err = {}
#      p.errors.each{|k,v| err["#{p.class.to_s.demodulize.underscore}[#{k}]"] = v.join(',')  }
#      res = {:success => false, :errors =>err}
      res = p.to_ext_json(:success => false)
    end
      
    render :json => res
  end

  #Sends the data for an edit page
  def edit
    #a = File.extname(path)
    render :json => Page.find(params[:id])
  end

  #Updates
  def update
    
    params[:page].delete(:parent_id)
    p = Page.find(params[:page][:id])
    if p
#      p.title = params[:page][:title]
#      p.body = params[:page][:body]
      p.update_attributes(params[:page])
      if p.save
        render :json => {:success => true, :iconCls => p.send(:page_type).send(:icon_cls), :title => p.title }
      else
        render :json => p.to_ext_json(:success => false)
      end
    else
      render :json => {:success => false, :error => 'Error'}
    end
  end

  #Deletes
  def destroy
    if Page.destroy params[:id]
      render :json => {:success => true, :id => params[:id]}
    else
      render :json => {:success => false, :error => 'Existio un error al Borrar'}
    end
  end

  #To reorder or reparent new nodes
  def move
    msg = ''
    node = Page.find(params[:node])
    sibling = params[:sibling].to_i
    begin
      #Select movement
      case params[:move]
        when 'left'
          node.move_to_left_of sibling
        when 'right'
          node.move_to_right_of sibling
        else
          node.move_to_child_of sibling
      end
      save = true
    rescue ActiveRecord::RecordNotSaved
        save = false
        msg = 'No se pudo salvar los datos'
    end
    
    render :json => {:success => save, :prev => node.self_and_siblings, :msg => msg }
  end

  #Creates a preview
  def preview
    @page = Page.new(params[:page])
  end

  private
  # Calls the menu creation
  def menu
    #@pages = Page.active :conditions => {:parent_id => nil} #
    @pages = Page.find(:all, :conditions => {:parent_id => nil, :publish => true}, :order => "lft ASC")
  end
end
