require 'fileutils'
include FileUtils
require "ftools"

# Helps to browse files and directories
# there are many initialized variables in intialize+
# @prohibited_extensions = [".rb", ".erb", ".py", ".php", ".cgi", ".pl"] Not alowed extension to upload
# @image_extensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"] Image extensions so it creates thumbnails
class FileBrowser

  # Constructor for the class
  # @param string dirname Path of the file directory
  # @param string thumbs Directory for thumbs
  # @param string size Size for the thumbnails
  # @param string action
  def initialize(dirname = 'files', thumbs = 'thumbs', size = '128x128', action = 'resize')
    #Initial directory
    @dirname = "#{RAILS_ROOT}/public/files"
    @dirlocal = 'files'
    if dirname =~ /^[a-z]$/i
      @dirlocal = dirname
      @dirname = "#{RAILS_ROOT}/public/#{dirname}"
    end
    #thumbs directory
    @thumbs = "#{RAILS_ROOT}/public/thumbs"
    @thumbslocal = 'thumbs'
    if thumbs =~ /^[a-z]$/i
      @thumbslocal = thumbs
      @thumbs = "#{RAILS_ROOT}/public/#{thumbs}"
    end
    @size = size =~ /^[1-9]+[0-9]*x[1-9]+[0-9]*$/ ? size : '128x128'
    @action = (action == 'resize' || action == 'crop') ? action : 'resize'
    @thumbext = ".jpg"
    
    #Not allowed extensions
    @prohibited_extensions = [".rb", ".erb", ".py", ".php", ".cgi", ".pl"]
    #Image Extensions
    @image_extensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"]

  end

  # Browse  files
  # @param string dirname Directory for browsing
  # @param string dir Tells to browse dirs or all files values are (all, dir, files)
  # @return array hash returns an array with hashes obtained from self.file_details
  def browse(dirname = '', dir = 'all')
    files = [];
    dirname = dirname == '' ? @dirname : dirname

    #Check if the directory exists
    begin
      Dir.chdir dirname
    rescue
      return {:success => false, :error=> 'No existe el directorio seleccionado'}
    end
    
    #Check if the directory is inside our @directory
    if ! ( Dir.pwd =~ /^#{@dirname}/o)
      dirname = @dirname
      Dir.chdir(@dirname)
    else
      dirname = Dir.pwd
    end
    
    files = []
    #Iterate trougth files and directories
    Dir["*"].each do |filename|
      icon = get_icon "#{dirname}/#{filename}"

      date = File.ctime(filename).strftime(DATE_FORMAT)
      if dir == 'all'
        files.push( file_details "#{dirname}/#{filename}", filename)
      elsif dir == 'dir' && icon[:dir]
        files.push( {:text => filename, :date => date, :id => "#{dirname}/#{filename}" , :leaf => !icon[:dir]} )
      end
    end
    
    {:files => files, :dir => dirname}
  end
  
  # Moves files from one dir to other
  # @param string from
  # @param string to
  # @return hash self.file_details And also :success => boolean
  def move(from, to)
    #Check to see if the move is from a correct directory
    if !(check_valid_file from) && ! (check_valid_file to)
      return {:id => from, :moved => false}
    end
    
    name = get_name from
    res = {:id => from, :success => false}
    begin
      #move file
      mv from, to
      #Move thumb if it is an image
      ext = get_extension from
      if (@image_extensions.find{|v| v == ext} != nil ? true : false)
        thumb_from = (from.gsub /^#{@dirname}/, @thumbs) + @thumbext
        thumb_to = to.gsub /^#{@dirname}/, @thumbs
        mv thumb_from, thumb_to
      end
      #return data of the file
      filename = "#{to}/#{name}"
      res = file_details(filename)
      res[:success] = true
    rescue
      return res
    end
    
    res
  end

  # Makes a copy of a file
  # @param string from
  # @param string to
  def copy(from, to)
    
  end

  # Create directory
  # @param string path
  # @param string name
  # @return @boolean || hash self.file_details 
  def create_directory(path, name)
    res = {:id => "#{path}/#{name}"}
    if (check_valid_file path) && name =~ /^[a-z0-9-_]+$/i
      begin
        mkdir "#{path}/#{name}"
        mkdir "#{path.gsub(/^#{@dirname}/, @thumbs)}/#{name}"
        res = file_details "#{path}/#{name}"
      rescue
        res[:failed]= true
      end
    end
    res
  end

  # Delete files or directories
  # @param string file
  # @return hash {:id => string, :deleted => boolean}
  def delete_file(file)
    res = {:id => file, :deleted => false}
    if ! check_valid_file file
      return res
    end
    begin
      ext = get_extension file
      #Delete thumb
      if (@image_extensions.find{|v| v == ext} != nil ? true : false)
        thumb = file.gsub(/^#{@dirname}/, @thumbs) + @thumbext
        rm_rf thumb
      end
      #Delete the thumbnail Dir in case that it is a directory
      if File.directory?(file)
        thumb = file.gsub(/^#{@dirname}/, @thumbs)
        rm_rf thumb
      end
      rm_rf file
      res[:deleted] = true
    rescue
      return res
    end
    res
  end

  # Uploads a file
  # @param binary file File to be uploaded
  # @param string path Path where to store the file
  # @return hash {:success => false, :error => string} || self.file_details path (Call function file_details)
  def upload(file, path)
    ret = {:success => true, :error => ''}
    # Check if it is a valid directory
    if ! check_valid_file path
      return {:success => false, :error => 'El directorio destino no existe'}
    end
    # Check if the extension is allowed
    ext = get_extension file.original_filename
    if (@prohibited_extensions.find{|v| v == ext})
      return {:success => false, :error => 'No se permite guardar este tipo de archivos'}
    end

    path = File.join(path, file.original_filename)
    if ! File.exists? path
      File.open(path, "wb") { |f| f.write(file.read) }
    else
      ret[:success] = false
      ret[:error] = 'Existe un archivo con el mismo nombre'
      return ret
    end
    #Create a thumbnail
    if file.content_type =~ /^image/
      created = create_thumbnail path
    end
    ret[:file] = file_details path
    ret
  end


  protected

  # Returns an image icon for a file
  # @param string filename
  # @return hash {:imgsrc => string, :smallicon => string, :dir => boolean}
  def get_icon(filename)
    ext = File.extname(filename)
    img = {:imgsrc => '', :smallicon=> ''}
    ext.downcase!
     case true
       when (@image_extensions.find{|v| v == ext} != nil ? true : false)
         icon = get_thumbnail filename
         img = {:imgsrc => icon, :smallicon => '../images/icons/eye.png', :dir => false}
       when ext == '.doc' || ext == '.docx'# Word
         img = {:imgsrc => '../images/bigicons/word.jpg', :smallicon => '../images/icons/page_white_word.png', :dir => false}
       when ext == '.xls' || ext == '.xlsx'# Excel
         img = {:imgsrc => '../images/bigicons/excel.jpg', :smallicon => '../images/icons/page_excel.png', :dir => false}
       when ext == '.ppt' || ext == '.pps' || ext == '.pptx' # Power Point
         img = {:imgsrc => '../images/bigicons/powerpoint.jpg', :smallicon => '../images/icons/page_white_powerpoint.png', :dir => false}
       when ext == '.odt' # OpenOffice writer
         img = {:imgsrc => '../images/bigicons/oo_writer_v2.jpg', :smallicon => '../images/icons/oo_writer.png', :dir => false}
       when ext == '.ods' # OpenOffice calc
         img = {:imgsrc => '../images/bigicons/oo_calc_v2.jpg', :smallicon => '../images/icons/oo_calc.png', :dir => false}
       when ext == '.odg' # OpenOffice draw
         img = {:imgsrc => '../images/bigicons/oo_draw_v2.jpg', :smallicon => '../images/icons/oo_draw.png', :dir => false}
       when ext == '.odp' # OpenOffice impress
         img = {:imgsrc => '../images/bigicons/oo_impress_v2.jpg', :smallicon => '../images/icons/oo_impress.png', :dir => false}
       when ext == '.pdf' # PDF
         img = {:imgsrc => '../images/bigicons/pdf.jpg', :smallicon => '../images/icons/page_white_acrobat.png', :dir => false}
       when ext == '.html' || ext == '.htm'# HTML
         img = {:imgsrc => '../images/bigicons/firefox.jpg', :smallicon => '../images/icons/firefox.png', :dir => false}
       when ext == '.mov'# Quicktime
         img = {:imgsrc => '../images/bigicons/quicktime.jpg', :smallicon => '../images/icons/quicktime.png', :dir => false}
       when ext == 'mpg' || ext == 'mpeg' || ext == '.asf'
         img = {:imgsrc => '../images/icons/windowsmedia.jpg', :smallicon => '../images/icons/windowsmedia.png', :dir => false}
       when ext == '.txt'# TXT
         img = {:imgsrc => '../images/bigicons/page.jpg', :smallicon => '../images/icons/page_white.png', :dir => false}
       when ext == '.wav' || ext == '.mp3' || ext == '.ogg' || ext == '.wma'#Sound
         img = {:imgsrc => '../images/bigicons/sound.jpg', :smallicon => '../images/icons/sound.png', :dir => false}
       when ext == '.swf' || ext == '.fla' || ext == '.flv'# Flash
         img = {:imgsrc => '../images/bigicons/flash.jpg', :smallicon => '../images/icons/page_white_actionscript.png', :dir => false}
       when ext == ''
          if File.directory?(filename)
            img = {:imgsrc => '../images/bigicons/folder.jpg', :smallicon => '../images/icons/folder.gif', :dir => true}
          else
            img = {:imgsrc => '../images/bigicons/window.jpg', :smallicon => '../images/icons/application.png', :dir => false}
          end
       else
         img = {:imgsrc => '../images/bigicons/exec.jpg', :smallicon => '../images/icons/application.png', :dir => false}
    end
    
    return img
  end

  # Returns the file details of a file
  # @param string filename
  # @param string name
  # @return hash {:text => string, :date => string(format'%d-%m-%Y'), :imgsrc => string,
  # :smallicon => string, :id => string , :leaf => boolean,
  # :size => string (Readable formar of size) )}
  def file_details(filename, name='')
    name = (name != '') ? name : get_name(filename)
    icon = get_icon filename
    return {:text => name, :date => File.ctime(filename).strftime(DATE_FORMAT), :imgsrc => icon[:imgsrc],
    :smallicon => icon[:smallicon], :id => filename , :leaf => !icon[:dir],
    :size => readable_file_size( File.size(filename) )}
  end

  # Creates a thumbnail image
  # @param string path
  # @return boolean
  # More information on how to manage images can be found at http://www.imagemagick.org/script/index.php
  def create_thumbnail(image)
    thumb = ( image.gsub /^#{@dirname}/, "#{@thumbs}" ) + @thumbext
    system("convert #{image} -thumbnail '#{@size}>' -#{@action} '#{@size}' -background white -quality 60 -gravity center -extent #{@size} #{thumb}")
  end

  # Returns the thumbnail of an image in case that it exists
  # @param string image
  # @return string
  def get_thumbnail(image)
    if File.exist? ( ( image.gsub /^#{@dirname}/, "#{@thumbs}" ) + @thumbext)
      image = ( image.gsub /^#{@dirname}/, "#{@thumbslocal}" ) + @thumbext
    else
      image = '../images/bigicons/image.jpg'
    end
    image
  end

  # Checks if the file is valid
  # @param string filename
  # @return boolean
  def check_valid_file filename
    #check if it has parents
    if filename =~ /(\.){2}/
      return false
    end
    #Check root folder
    if !(filename =~ /^#{@dirname}/o)
      return false
    end

    File.exist?(filename)
  end

  # Presents in a readable size format of a file
  # @param integer size
  # @param integer precision
  # @return string
  def readable_file_size(size, precision = 1)
    case
      when size == 1 : "1 Byte"
      when size < KILO_SIZE : "%d Bytes" % size
      when size < MEGA_SIZE : "%.#{precision}f KB" % (size / KILO_SIZE)
      when size < GIGA_SIZE : "%.#{precision}f MB" % (size / MEGA_SIZE)
      else "%.#{precision}f GB" % (size / GIGA_SIZE)
    end
  end

  # Obtains the name from a path
  # @param string path
  # @return string
  def get_name(path)
    return path[/^.*\/(.+?)\/?$/, 1]
  end

  # Obtains the extension from a path or name
  # @param string path
  # @return string
  def get_extension(path)
    return path[/^.+(\.[a-z0-9]+)$/i, 1]
  end

end