class CreatePageTypes < ActiveRecord::Migration
  def self.up
    create_table :page_types do |t|
      t.string :text, :limit => 20
      t.string :icon_cls, :default => 'rails-page-blank', :limit =>20

      t.timestamps
    end
    PageType.create :text => 'Página', :icon_cls => 'rails-page-white'
    PageType.create :text => 'Vinculo', :icon_cls => 'rails-page-link'
  end

  def self.down
    drop_table :page_types
  end
end
