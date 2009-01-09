class Page < ActiveRecord::Base
  #translates :title, :body
  acts_as_nested_set
  validates_presence_of :title, :body
  validates_length_of :title, :within => 3..255
  #before_save :set_locale
  named_scope :active, :conditions => {:publish => true}, :order => 'lft ASC'

  belongs_to :page_type
  
  def self.root_nodes
    find(:all, :conditions => 'parent_id IS NULL')
  end
  
  def self.find_children(start_id = nil)
    start_id.to_i == 0 ? root_nodes : find(start_id).children
  end
  
  def leaf
    unknown? || children_count == 0
  end
  
  def to_json_with_leaf
    self.to_json_without_leaf(options.merge(:methods => :leaf))
  end

  def to_param
    "#{id}-#{title.gsub(/\s/, '_').downcase}"
  end

#  def uno
#    self.title+= 'jejej'
#  end
end
