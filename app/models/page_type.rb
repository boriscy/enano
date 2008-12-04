class PageType < ActiveRecord::Base
  has_many :pages
  #translates :text
  validates_presence_of :title
end
