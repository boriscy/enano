/**
 *This class helps to creates trees for Rails it has build in methods that help to edit create or delete
 *that fire events addNode, editNode and deleteNode
 *but the methods for reorder and reparent don't need to be chaged and are implemented the same way
 *@author Boris Barroso
 *@copyright (c) 2008, by Boris Barroso
 *@created 3 July 2008
 *@modified 19 September 2008
 */

Rails.Tree = function(config) {
    
  //Toolbar items, Each one fires an Event and passess the selected node
  var tbItems = [{
    text : this.i18n.tbCreate,
    iconCls : 'rails-add',
    handler : function() {
      this.fireEvent('addNode', this.currentNode)
      },
    scope : this
  },{
    text : this.i18n.tbEdit,
    iconCls :'rails-edit',
    handler : function(){
      this.fireEvent('editNode', this.currentNode)
      },
    scope : this
  },{
    text : this.i18n.tbDelete,
    iconCls :'rails-del',
    handler : function(){
      this.fireEvent('deleteNode', this.currentNode)
      },
    scope : this
  }];

  //Apply configuration to Each item of toolbar to set other config options in it
  Ext.each(tbItems, function(item, i) {
    Ext.apply(item, config.menuItems[i]);
  });
  
  //Create root node
  var root = new Ext.tree.AsyncTreeNode({
    text : 'Root',
    draggable : false,
    expanded : true,
    id: 'root',
    children : config.jsonTree,
    iconCls : 'rails-root'
  });
  
  //Call the parent constructor class with config options
  Rails.Tree.superclass.constructor.call(this, {
    //Creacion de root
    root: root,
    rootVisible : this.rootVisible,
    id : this.id,
    loader: new Ext.tree.TreeLoader({
      preloadChildren : true,
      clearOnLoad : false
    }),
    enableDD : true,
    animCollapse : false,
    width : 250,
    heigth : 300,
    autoScroll : true,
    margins : '5 0 5 5',
    cmargins : '5 0 5 5',
    selModel : new Ext.tree.MultiSelectionModel(),
    autoScroll : true,
    //Events
    listeners : {
      click : {
        fn : this.onClick,
        scope: this
      },
      dblclick : {
        fn : this.onDblClick,
        scope: this
      },
      contextmenu : {
        fn : this.onContextMenu,
        scope: this
      },
      startdrag : {
        fn : this.onStartDrag,
        scope: this
      },
      movenode : {
        fn : this.onMoveNode,
        scope: this
      }
    },
    //Toolbar
    tbar: new Ext.Toolbar({
      items: tbItems
    }),
    collapsible : this.collapsible,
    animCollapse : this.animCollapse,
    collapseMode : this.collapseMode
  });
  
  //Apply configurations to the tree
  Ext.apply(this, config);
  
  this.currentNode = this.root;
    
  this.addEvents({
    addNode : true,
    editNode : true ,
    deleteNode : true
  });

}
/**
 *Class Rails.Tree for tree manipulation
 */
Ext.extend(Rails.Tree, Ext.tree.TreePanel, {

  /**
  *Add Collapse Expand bottons
  */
  afterRender : function() {
    Rails.Tree.superclass.afterRender.call(this);
    this.getTopToolbar().add({
      iconCls: 'rails-expand',
      tooltip: this.i18n.ttipExpand,
      scope: this,
      handler: function(){
        this.expandAll();
      }
    },{
      iconCls: 'rails-collapse',
      tooltip: this.i18n.ttipCollapse,
      scope: this,
      handler: function(){
        this.collapseAll();
      }
    });
  },
  /**
     *@cfg selected Node
     */
  currentNode : null,
  /**
  *@cfg Urls to use for editing the tree
  */
  addUrl : '',
  editUrl : '',
  deleteUrl : '',
  moveNodeUrl : '',
  /**
  *Crea el menu contextual del arbol
  *Se puede acceder a propedades de los Items del Menu ej. ( menuItems.add.text )
  *o add:{text:'Texto', id}
  */
  createContextMenu : function() {
    if(!this.contextMenu) {
      var items = [{
        id : 'createNode',
        iconCls : 'rails-add',
        text : this.i18n.ctxMenuCreate,
        handler : function(){ this.fireEvent('addNode', this.currentNode) },
        scope : this,
        disabled : false
      },{
        id : 'editNode',
        iconCls : 'rails-edit',
        text : this.i18n.ctxMenuEdit,
        handler : function(){ this.fireEvent('editNode', this.currentNode) },
        scope : this,
        disabled : false
      },{
        id : 'deleteNode',
        text : this.i18n.ctxMenuDelete,
        iconCls : 'rails-del',
        handler : function(){ this.fireEvent('deleteNode', this.currentNode) },
        scope : this,
        disabled : false
      }];
            
      //Se aplica las propiedades particulares para cada item
      Ext.each(items, function(item, i){
        if(this.menuItems[i])
          Ext.apply(item, this.menuItems[i]);
      }, this);
            
      this.contextMenu = new Ext.menu.Menu({
        id : 'tree-ctx',
        items : items
      });
    }
        
    return this.contextMenu;
  },
  /**
   *click Event
   */
  onClick : function( node, e ) {
    this.currentNode = node;
  },
  /**
   *Double click Event
   */
  onDblClick : function(node, e) {
    this.currentNode = node;
  },
  /**
  *present Contextmenu on event
  */
  onContextMenu : function(node, e) {
    this.currentNode = node;
    e.stopEvent();
        
    this.currentNode.select();
    this.createContextMenu();
    this.contextMenu.showAt(e.getXY());        
  },
  /**
  *Stores the position of a node before moving
  */
  onStartDrag : function(tree, node, e){
    this.oldParent = node.parentNode;
    this.oldNextSibling = node.nextSibling;
  },
  /**
  *Function called on move
  */
  onMoveNode : function(tree, node, oldParent, newParent, position) {
  var move = '';
    if(node.nextSibling) {
      sibling = node.nextSibling;
      move = 'left';
    }else if(node.previousSibling){
      sibling = node.previousSibling;
      move = 'right';
    }else{
      sibling = node.parentNode;
      move = 'parent';
    }

    this.disable();
    //Call to server
    Ext.Ajax.request({
      url: this.moveNodeUrl,
      params: {move: move, sibling: sibling.id, node: node.id, authenticity_token: AUTH_TOKEN},
      success: function(resp, o) {
        try{
          r = Ext.decode(resp.responseText);
          if(!r.success) {
            o.failure();
          }
          tree.enable();
        }catch(e) {
          o.failure();
        }
      },
      //Failure function
      failure: function(resp, o) {
        tree.suspendEvents();
        //Move the node to its place before moving
        if (this.oldNextSibblig) {
          this.oldParent.insertBefore(node, oldNextSibling);
        }else {
          this.oldParent.insertBefore(node, null);
        }
        tree.enable();
      }
    });
  },
  /**
   *Search recursive By id for a node, when it finds the node it sets
   *this.currentNode to the searched node
   *@param string id
   *@param TreeNode (optiona)
   */
  findChildRecursively: function(tree,attribute, value) {
    var cs = tree.childNodes;
    for(var i = 0, len = cs.length; i < len; i++) {
      if(cs[i].attributes[attribute] == value){
        return cs[i];
      }
      else {
        // Find it in this tree
        if(found = findChildRecursively(cs[i], attribute, value)) {
            return found;
        }
      }
    }

    return null;
  },
  /**
   *Search recursive By id for a node, when it finds the node it sets
   *this.currentNode to the searched node
   *@param string id
   *@param TreeNode (optiona)
   */
  searchNodeById: function(id, node) {
    node = node || this.root;
    for(var i = 0, l = node.childNodes.length; i < l; i++) {
      if(node.childNodes[i].id == id) {
        this.currentNode = node.childNodes[i];
        return;
      }
      if(node.hasChildNodes()) {
        this.searchNodeById(id, node.childNodes[i]);
      }
    }
  }
});
Ext.reg('railstree', Rails.Tree);

//Mensajes de Rails Tree
p = Rails.Tree.prototype; //
p.i18n = {
  tbCreate: 'Crear',
  tbEdit: 'Editar',
  tbDelete: 'Borrar',
  deleteTitle:'Borrar',
  deleteMsg:'Esta Seguro de Borrar a ',
  deleteErrorTitle:'Error',
  deleteErrorMsg:'No es posible borrar este Nodo debido a que tiene Hijos',
  errorMove : 'Error al mover el nodo',
  ctxMenuCreate: 'Crear',
  ctxMenuEdit: 'Editar',
  ctxMenuDelete: 'Borrar',
  ttipExpand: 'Expandir Nodos',
  ttipCollapse: 'Collapsar Nodos'
};