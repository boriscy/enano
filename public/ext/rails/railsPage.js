/**
 *Creates a Page class to add edit new pages and the nodes of the pages
 *The class has the following Events:
 *createPage(node, form) node TreeNode, form FormPanel where data from the page is edited
 *editPage(node, form)
 *deletePage(node)
 */
Rails.Page = function(config) {
  config = config || {};

  Rails.Page.superclass.constructor.call(this, {

    width : 250,
    jsonTree : config.jsonTree || [],
    menuItems : [
      { text : 'Crear', tooltip : 'Crear Página'},
      { text : 'Editar', tooltip : 'Editar Página'},
      { text : 'Borrar', tooltip : 'Borrar Página'}
    ]
  });
  
  Ext.apply(this, config);

  this.addEvents({
    oncreatepage: true,
    oneditpage: true,
    deletepage: true
  });

  this.on({
    addNode: { fn: this.createPage },
    editNode: { fn: this.editPage },
    deleteNode : { fn: this.deletePage },
    scope: this
  })
}

Ext.extend(Rails.Page, Rails.Tree, {
  region: 'west',
  animate: false,
  split: true,
  collapsible: true,
  collapseMode: 'mini',
  createPageUrl: '/pages/create/',
  editPageUrl: '/pages/edit/',
  updatePageUrl: 'pages/update',
  deletePageUrl: '/pages/destroy/',
  moveNodeUrl: '/pages/move',
  treeMenu: {}, //Menu of the tree
  /**
   *Sets the parameters o a node
   *@param object TreeNode
   *@param object params
   */
  setNodeParams: function(node, params) {
    if(params.text) {
      node.setText(params.text);
      delete(params.text);
    }
    if(params.iconCls) {
      node.getUI().getIconEl();
      u = Ext.get(u);
      u.removeClass(cls);
      u.addClass(r.iconCls);
      node.iconCls = node.atributes.IconCls = params.iconCls;
      delete(params.iconCls);
    }
    for(var k in params) {
      node.attributes[k] = params[k];
    }
  },
  /**
  *Creates te form to edit pages
  *@param object config
  */
  createForm : function (config) {

    config = config || {};

    //Form Items
    var items = [{
      xtype : 'hidden',
      name:'page[id]',
      value : config.page_id
    },{
      xtype : 'hidden',
      name:'page[parent_id]',
      value : config.page_parent_id || ''
    },{
      xtype :'textfield',
      name:'page[title]',
      fieldLabel: 'Título',//this.i18n.frmLblTitle,
      value : config.page_title || '',
      //allowBlank:false,
      width : 400
    }];

    check = false;
    Ext.each(Rails.PAGE_TYPES, function(item) {
      if(!config.page_type_id && check == false) {
        item.checked = true;
        check = true;
      }else if(item.inputValue == config.page_type_id) {
        item.checked = true;
      }else {
        item.checked = false;
      }
      items[items.length] = item;
    });

    items[items.length] = {
      xtype : 'xcheckbox',
      name : 'page[publish]',
      fieldLabel : 'Publicar',//this.i18n.frmLblPublish,
      checked: config.page_publish
    };

    items[items.length] = {
      xtype : 'xtinymce',
      fieldLabel : 'Texto',//this.i18n.frmLblBody,
      name : 'page[body]',
      //width : 600,
      height : 400,
      value : config.page_body,
      file_browser_callback: function() {alert(1)}
    };

    var form = new Rails.Form({
      url : config.url,
      closable: true,
      //id : 'pages::removeNode::'+config.page_id,
      title : config.title || config.page_title,// this.i18n.newPageTitle,
      bodyStyle: 'padding:10px 10px 0',
      autoScroll : true,
      items : items,
      tbar : [{
        text : 'Guardar',//this.i18n.tbarSave,
        iconCls : 'rails-save',
        tooltip : 'Guardar Página',//this.i18n.tbarSaveTtip,
        handler : function(){this.form = form; this.savePage()},
        scope : this
      },{
        text : 'Vista Previa',//this.i18n.tbarPreView,
        iconCls : 'rails-preview',
        tooltip : 'Vista Previa',//this.i18n.tbarPreViewTtip,
        handler : function() { this.form = form; this.previewPage(); },
        scope : this
      },{
        text: 'Isertar Productos',
        iconCls: '',
        tooltip: 'Insertar Productos',
        handler: function() {
          var editor = form.findByName('page[body]').editor;
          editor.focus();
          editor.execCommand("mceInsertContent",false,'<h1 class="products-insert" style="width:90%;height:200px;background:#DFDFDF">Productos</h1>');
        },
        scope: this
      }],
      listeners: {
        beforedestroy: {fn: this.closeForm, scope: this}
      }
    });

    return form;
  },
  /**
   *Executed after closing the fom that generates the form
   */
  closeForm: function(form) {
    var id = form.form.getValues()['page[id]'];
    if(id == 'newPage') {
      var node = this.getNodeById(id);
      node.remove();
      this.currentNode = this.root;
      this.currentNode.select();
    }
    return true;
  },
  /**
  *Adds a new Page
  */
  createPage : function() {
    //Prevents to append a child to a new pages until it is saved
    if(this.currentNode.id == 'newPage') {
      Ext.Msg.show({
        title : this.i18n.Error,
        msg : 'No se puede adiconar Nodos a una página no creada',
        buttons : Ext.MessageBox.OK,
        icon:Ext.MessageBox.ERROR
      });
      return false;
    }

    // Creation of a new node
    this.currentNode.expand();
    this.currentNode.appendChild( new Ext.tree.TreeNode({
      id : 'newPage',
      text : 'Nueva Página', //this.i18n
      draggable : true,
      iconCls : 'rails-page-white'
    }));

    var form = this.createForm({
      url : this.createPageUrl,
      title: 'Nueva Página', //this.i18n
      page_id : 'newPage',
      page_parent_id : this.currentNode.id,
      page_title : 'Nueva Página',//this.i18n.newPageTitle,
      page_body : '<h2>Nueva Página</h2>' //'+this.i18n.newPageTitle+'
    });

    this.currentNode = this.currentNode.findChild('id', 'newPage');
    this.currentNode.select();
    //tab = {id: 'tabnewPage', title: this.i18n.newPageTitle };
    this.fireEvent('oncreatepage', this.currentNode, form);
  },
  /**
   *Edits a page
   *@param object node
   */
  editPage : function(node) {

    if(node.id == 'root') {
      Ext.Msg.show({
        title : 'Error',//this.i18n.Error,
        msg : 'Debe elegir un nodo distinto a la raiz',//this.i18n.errorSave,
        buttons : Ext.MessageBox.OK,
        icon:Ext.MessageBox.ERROR
      });
      return false;
    }
    //Get the edited page
    Ext.Ajax.request({
      params: {id: node.id},
      method: 'GET',
      url: this.editPageUrl,
      scope: this,
      success: function(resp, obj) {
        try {
          r = Ext.decode(resp.responseText);
          if(!r.id) {
            obj.failure();
            return;
          }

          var form = this.createForm({
            url : this.updatePageUrl,
            page_id : r.id,
            page_type_id: r.page_type_id,
            page_publish: r.publish,
            page_parent_id : r.parent_id,
            page_title : r.title,
            page_body : r.body
          });
          //Fire edit event
          this.fireEvent('oneditpage', this.currentNode, form);
        }catch(e) {
          obj.failure();
        }
      },
      failure: function(resp, obj) {
        showError('Error', 'No se pudo obtener la página');
      }
    });

  },
  /**
  *Allows to save the data from the Page
  */
  deletePage: function(node) {

     Ext.Msg.confirm('Borrar', 'Esta seguro de borrar el nodo '+node.text, function(conf) {
        if(conf=='yes'){
          
          Ext.Ajax.request({
            params: {id: node.id, authenticity_token: AUTH_TOKEN},
            method: 'POST',
            scope: this,
            url: this.deletePageUrl,
            success: function(resp,  obj) {
              try {
                var r = Ext.decode(resp.responseText);
                if(r.success) {
                  node.remove();
                  //Fire delete Event
                  this.fireEvent('ondeletepage', this.currentNode);
                }else {
                  obj.failure();
                }
              }catch(e) {
                obj.failure();
              }
            },
            failure: function(resp, obj) {
              showError('Error', 'Falló al borrar el nodo');
            }
          });
        }
     }, this);
    
    if(!node.hasChildNodes()) {
      
    }else{
      showError('Error', 'Seleccione una página que no tenga dependencias');
    }
  },
  savePage : function() {
    
    //get contentfrom TinyMCE, and the form
    var values = this.form.form.getValues(); //Form
    var id = values['page[id]'];
    var pageBodyTinyMCE = this.form.findByName('page[body]');
    
    this.form.form.setValues({'page[body]': this.form.findByName('page[body]').editor.getContent() });
    
    this.form.submit({
      url : this.form.url,
      scope: this,
      success: function(form, resp) {
        try {
          var r = Ext.decode(resp.response.responseText);
        }catch(e) {
          form.failure();
        }
        
        var pages = this.pages;
        var node = this.getNodeById(values['page[id]']);
        
        //When a new page is created
        if(this.form.url == this.createPageUrl) {
          var newNode = node.parentNode.appendChild( new Ext.tree.TreeNode({
            id : r.id,
            text : r.title,
            draggable : true,
            iconCls : r.iconCls
          }));
          node.remove();
          this.currentNode = newNode;
          this.form.form.setValues({'page[id]': r.id});
          this.form.url = this.editPageUrl;
        }else {
          var cls = node.attributes.iconCls;
          var u = node.getUI().getIconEl();
          this.currentNode = node;
          u = Ext.get(u);
          u.removeClass(cls);
          u.addClass(r.iconCls);
          node.setText(r.title);
          node.attributes.iconCls = r.iconCls;
          node.select();
        }
        this.form.setTitle(r.title);
      },
      failure: function(){
        Ext.Msg.show({
            title : this.i18n.Error,
            msg : this.i18n.errorNewPage,
            buttons : Ext.MessageBox.OK,
            icon:Ext.MessageBox.ERROR
          });
        return false;
      }
    });
  },
  /**
   *Shows a Preview of the Page
   */
  previewPage : function() {
    var values = this.form.form.getValues();
    var id = values['page[id]'];
    values['preview'] = true;
    
    if(!id.match(/^[0-9]+$/)) {
      Ext.Msg.show({
        title:'Error',
        msg: 'Debe guradar la página, para poder ver una vista previa',
        buttons: Ext.MessageBox.OK,
        icon:Ext.MessageBox.ERROR
      });
      return false;
    }

    //Creates a form to POST to the preview
    this.form.form.setValues({'page[body]': this.form.findByName('page[body]').editor.getContent() });
    b = document.getElementsByTagName('body')[0];
    f = document.createElement('form');
    f.style.display = 'none';
    f.setAttribute('method','POST');
    f.setAttribute('action','/pages/preview');
    f.setAttribute('target','_blank');
    
    for(var k in values) {
      var i = document.createElement('input');
      i.setAttribute('type', 'text');
      i.setAttribute('name', k);
      i.setAttribute('value', values[k]);
      f.appendChild(i);
    }
    b.appendChild(f);
    f.submit();
    b.removeChild(f);
  }
});

Ext.reg('railspage', Rails.Page);