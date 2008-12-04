class CreateProducts < ActiveRecord::Migration
  def self.up
    create_table :products do |t|
      t.string :title
      t.string :law_number
      t.text :lead
      t.text :body

      t.timestamps
    end
  end

  def self.down
    drop_table :products
  end
end
