class CreatePageTypes < ActiveRecord::Migration
  def self.up
    create_table :page_types do |t|
      t.string :text, :limit => 20
      t.string :icon_cls, :default => 'rails-page-blank', :limit =>20

      t.timestamps
    end
  end

  def self.down
    drop_table :page_types
  end
end
