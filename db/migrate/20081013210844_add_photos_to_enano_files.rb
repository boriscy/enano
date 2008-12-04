class AddPhotosToEnanoFiles < ActiveRecord::Migration
   def self.up
    add_column :enano_files, :photo_file_name, :string
    add_column :enano_files, :photo_content_type, :string
    add_column :enano_files, :photo_file_size, :integer
  end

  def self.down
    remove_column :enano_files, :photo_file_name
    remove_column :enano_files, :photo_content_type
    remove_column :enano_files, :photo_file_size
  end

end
