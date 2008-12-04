class CreatePages < ActiveRecord::Migration
  def self.up
    create_table :pages do |t|
      t.integer :parent_id
      t.string :title
      t.integer :lft
      t.integer :rgt
      t.integer :page_type_id, :null => false
      t.boolean :publish, :default => false
      t.text :body

      t.timestamps
    end
  end

  def self.down
    drop_table :pages
  end
end
