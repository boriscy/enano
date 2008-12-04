class CreateEnanoFiles < ActiveRecord::Migration
  def self.up
    create_table :enano_files do |t|
      t.string :path
      t.string :name
      
      t.timestamps
    end
    add_index :enano_files, :path, :unique => true
    add_index :enano_files, :name
  end

  def self.down
    drop_table :enano_files
  end
end