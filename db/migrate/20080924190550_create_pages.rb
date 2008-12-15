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
    Page.create(:title => 'Inicio', :page_type_id => PageType.first.id, :body => '<h1>Inicio</h1><p><strong>enano</strong> es un proyecto de software libre creado con Ext JS y Ruby on Rails <img src="/images/rails.png"/><img src="/images/extjs2.png"/></p>')
  end

  def self.down
    drop_table :pages
  end
end
