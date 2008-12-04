class AdminController < ApplicationController

  def index
    pt = PageType.find(:all, :select => 'page_types.id, page_types.text')
    @page_type = Array.new

    tree = TreeCreator.new({:id => :id, :text=>:title,
        :include => [{:model => :page_type, :attributes => {:iconCls => :icon_cls } } ] })
    @pages = tree.create_tree Page.find(:all, :order => 'lft ASC' )
    #:include => [:page_type], It won't work with :include if you are using Globalize plugin
    
    #Prepare the JSON to create teh type we need
    pt.each_index do |i|
      if i == 0
        label = 'Tipo'
      end
      @page_type[i] = {:xtype => 'radio', :name => 'page[page_type_id]',
      :inputValue => pt[i][:id], :boxLabel => pt[i][:text],
      :checked=>  false, :fieldLabel => label}
    end
    render :layout => false
  end

   #Prepares a token to use in the forms against CSFR
  def token
    #Dir.
    render :json => {:AUHT_TOKEN => form_authenticity_token }
  end

end
