class PageType < ActiveRecord::Base
  has_many :pages
  validates_presence_of :text
end
