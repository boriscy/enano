require "ftools"
class EnanoFilesController < ApplicationController
  before_filter :init, :check_method

  # Action to browse files
  def browse
    b = params[:browse] || 'all'
    
    if params[:node] && params[:node] != 'filesRoot'
      ret = @file.browse params[:node], b
    else
      ret = @file.browse
    end
    # Return for Tree or for view
    if params[:root] && b == 'all'
      ret = {:success => true, params[:root] => ret[:files], :dir => ret[:dir]}
    elsif b == 'dir'
      ret = ret[:files]
    end
    render :json => ret
  end

  #Makes a copy paste action or move
  def move
    #stores moved files
    files = {:success => true, :files => []}
    action = (params[:action] =~ /^(cut|copy|move)$/) ? params[:action] : 'cut'
    params[:files].each do |k, v|
      if action == 'copy'
        file = @file.copy(v, params[:target])
      else
        file = @file.move(v, params[:target])
      end
      files[:files].push( file )
    end

    render :json => files
  end

  #Makes uploads of files
  def upload
    filename = params[:file].original_filename
    @res = @file.upload params[:file], params[:directory]
    render :layout => false
  end

  # Downlad files
  def download
    @file = params[:file]
    render :layout => false
  end

  #creates a directory
  def make_directory
    params[:directory] = params[:directory] || ''
    params[:path] = params[:path] || ''
    res = {:success => false}
    res = @file.create_directory params[:path], params[:directory]
    render :json => res
  end

  #delete files or directories
  def delete
    files = {:files => [] }
    params[:files].each do |k, v|
      file = @file.delete_file(v)
      files[:files].push(file) if file[:deleted]
    end
    render :json => files
  end
  
  private
  def init
    @file = FileBrowser.new
  end

  def check_method
    methods = ["make_directory", "move", "upload", "delete"]
    if request.get? && (methods.find {|v| v == params[:action]})
      logger.info("Possible attact from #{params.to_json}") #Must be implemened a method to log possible threads
      render :json => {:success => false}
      return false
    end
  end
end
