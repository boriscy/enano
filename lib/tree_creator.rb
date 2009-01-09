# Generates a Tree
# @author Boris Barroso boriscyber@gmail.com
# Recives a result from a query when using betternestedset plugin
# and creates a Hash with all children
class TreeCreator

  #default values
  def initialize(params = {})
    @node = params.length > 0 ? params : {:id => :id, :text => :text, :iconCls => :icon_cls, :include => []}
  end

  # Creates the Tree
  # @param Array arr
  def create_tree(arr)

    tree = []
    arr.each do |v|
      if v.parent.nil?
        tree.push( set_node(v))
      else
        parent_in_array(tree, v.parent_id)
        @search_node[:children].push(set_node v)
      end
    end
    tree
  end

  protected

  # Creates a node for Ext Tree
  def set_node(v)
    node = {:children => []}
    @node[:include].each do |model|
      modelPar = v.send(model[:model])
      node.merge!( set_params( modelPar, model[:attributes]) )
    end if @node[:include]
    node.merge!(set_params(v))
    node
  end

  # Finds the parent node in array
  def parent_in_array(arr, id)
    arr.each do |val|
      if val[:id] == id
        @search_node = val
        return true
      elsif val[:children].length > 0
        parent_in_array val[:children], id
      end
    end
  end

  # Set the params
  def set_params(vals, keys = @node)
    node = {}
    keys.each {|key, val| node[key] = vals.send(val) if key && key != :include}
    node
  end
end