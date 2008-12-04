Ext.Msg.minWidth = 300;
/***
 *Very important note, One must first render the DataView, then after the tree node can be rendered
 *and all the child nodes be displayed when it loads for the first time
 */

/**
 *View for the Browser
 */
Rails.View = function(config) {

  config = config || {};
  Ext.apply(this, config);
  /**
   *Function for the template to set dir
   */
  function isDir(leaf) {
    if(leaf) {
      return 'file';
    }else{
      return 'dir';
    }    
  }

  function shortName(name) {
    if(name.length > 16) {
      return name.substr(0, 16)+"...";
    }    
    return name;
  }
  /***
   *View
   */
  this.view = new Ext.DataView({
    multiSelect: true,
    itemSelector: 'div.thumb-wrap',
    ctCls: 'browserView',
    store: new Ext.data.JsonStore({
      autoLoad: false,
      url: this.browseUrl,
      root: 'files',
      sortInfo: {field: 'text', direction: 'ASC'},
      id: 'id',
      fields: [
        'id', 'imgsrc', 'text', "leaf",
        {name: 'dir', mapping: 'leaf', convert: isDir}
      ]
    }),
    trackOver: true,
    //plugins: new Ext.DataView.DragSelector({dragSafe:true}),
    tpl: new Ext.XTemplate(
      '<tpl for=".">',
      '<div class="thumb-wrap" id="{id}" title="{dir}">',
      '<div class="thumb"><img src="{imgsrc}" class="thumb-img" title="{text}"></div>',
      '<div class="text">{text}</div></div>',
      '</tpl>'
    )
  });
  
  //Store sets for a change event
  this.view.store.on('datachanged', function() {
    this.setDrag = true;
  }, this);

  panel = this;
  /**
   *Sets Drag and drop for items
   */
  this.view.on('mouseenter', function( dataView, index, node, e){
    if(this.setDrag){
      this.purgeListeners();
      try{
        this.view.store.each( function(item) {
          var id = '#'+item.json.id+' div.thumb-wrap';
          var node = Ext.get(item.json.id);
          new Ext.dd.DragSource(node);
          
          if(!item.json.leaf) {
            var dropTarget = new Ext.dd.DropTarget(node);

            var selectedClass = this.selectedClass;
            dropTarget.notifyDrop = function(dd, e, data) {
              
              if (Ext.fly(dd._domRef.id).hasClass(selectedClass)) {
                nodes = panel.view.getSelectedNodes();
              }else{
                nodes = dd._domRef.id;
              }              
              panel.moveNodes(nodes, dropTarget.id, 'move');
            }
            var n = Ext.get(item.json.id);
            //Add a double click event
            n.on('dblclick', function(e, node) {
              nodeID = true;
              var n = node;
              var i = 0;
              while(i< 4) {
                if(n.id) {
                  break;
                }else{
                  n = n.parentNode;
                }
                i++;
              }
              this.setRequest(n.id, this);
              this.fireEvent('beforeopenfolder', n.id);              
            }, this);
          }
        }, this);
      }catch(e) {}
      this.setDrag = false;
    }
  }, this);

  //End of DataView
  /***********************************************/

  //Toolbar
  var fileToolbar = [{
    text: 'Cortar', iconCls: 'rails-cut', handler: this.cut, scope: this
  },{
    text: 'Copiar', iconCls: 'rails-copy', handler: this.copy, scope: this
  },{
    text: 'Pegar', iconCls: 'rails-paste', handler: this.paste, scope: this, disabled: true
  },'-',{
    text: 'Borrar Archivos', iconCls: 'rails-delete', handler: this.deleteFiles, scope: this
  },{
    text: 'Subir Archivos', iconCls: 'rails-add', handler: this.uploadFiles, scope: this
  },{
    text: 'Descargar Archivos', iconCls: 'rails-download', handler: this.downloadFile, scope: this
  },'-',{
    text: 'Crear directorio', iconCls: 'rails-dir', handler: this.createDirectory, scope: this
  },'-',{
    text: 'Seleccionar Archivo', iconCls: 'rails-select', handler: function() { 
      var nodes = this.view.getSelectedNodes();
      if( nodes.length == 1) {
        this.view.fireEvent('selectfile', nodes[0].id );
      }
    }, scope: this, disabled: true
  }];
  
  //Main toolbar
  this.tb = new Ext.Toolbar({
    items:[{
      text: 'Archivo', menu: fileToolbar
    },{
      tooltip: 'Atras', iconCls: 'rails-back', handler: function(){ this.moveHistory('b'); }, scope: this, disabled: true
    },{
      tooltip: 'Adelante', iconCls: 'rails-forward', handler: function(){ this.moveHistory('f'); }, scope: this, disabled: true
    },{
      tooltip: 'Subir Nivel', iconCls: 'rails-up', handler: function(){this.setRequest('../', this); }, scope: this
    },{
      tooltip: 'Actualizar', iconCls: 'rails-refresh', handler: function(){ this.setRequest(this.currentDir, this) }, scope: this
    },{
      tooltip: 'Cortar', iconCls: 'rails-cut', handler: this.cut, scope: this
    },{
      tooltip: 'Copiar', iconCls: 'rails-copy', handler: this.copy, scope: this
    },{
      tooltip: 'Pegar', iconCls: 'rails-paste', handler: this.paste, scope: this, disabled: true
    },{
      tooltip: 'Subir Archivos', iconCls: 'rails-add', handler: this.uploadFiles, scope: this
    },{
      tooltip: 'Borrar Archivos', iconCls: 'rails-delete', handler: this.deleteFiles, scope: this
    },{
      tooltip: 'Crear Directorio', iconCls: 'rails-dir', handler: this.createDirectory, scope: this
    }]
  });
  
  /**
   *Call parent class
   */
  Rails.View.superclass.constructor.call(this, {
    id: 'RailsView',
    items: [this.view],
    tbar: this.tb,
    region: config.region || 'center',
    autoScroll: true,
    bodyStyle: 'padding: 10px',
    title: 'Ruta: /'
  });

  /**
   *Events
   */
  this.view.on('contextmenu', function(v, i, node, e) {
    this.tb.items.itemAt(0).menu.showAt( e.getXY() );
    e.stopEvent();
    
    if( v.getSelectedNodes().indexOf(node) < 0 ) {
      v.select(node);
    }    
  }, this,  {delegate: '.browserView'});
  
  
  /**
   *Events
   */
  this.addEvents({
    beforeopenfolder: true,
    afteropenfolder: true,
    firsttime: true,
    selectfile: true
  });

  //Fires when it is the first time it is created
  //this.fireEvent('firsttime', this.view.store);
}

/**
 *extend of Panel which holds all the views for the files
 */
Ext.extend(Rails.View, Ext.Panel, {
  browseUrl: '/enano_files/browse',
  moveUrl: '/enano_files/move',
  uploadUrl: '/enano_files/upload',
  deleteUrl: '/enano_files/delete',
  createDirectoryUrl: '/enano_files/make_directory',
  downloadUrl: '/enano_files/download',
  rootDir: '/home/rails/', //This part must be set from the server
  currentDir: '', //The current dir the browser is in
  previousDir: '', //Stores the previous directory for copy, cut actions
  selectedClass: 'x-view-selected', // Class used to make a selected node
  selectedFiles: [], //Nodes selected for a copy, cut action
  history: [], //Stores the location
  historySize: 10, // Default history size
  browseHistory: false,
  historyPos: -1, //indicates the position in history
  tinyMCE: false, //Used when a tiny MCE editor calls
  /**
   *Moves nodes from one location to other if copy param is set it will do a copy paste
   *@param string/object id or array of nodes
   *@param string|array nodes Nodes that are moved, it could be an array or xpath expression
   *@param boolean copy Tell if the action is a copy paste action
   */
  moveNodes: function(nodes, target, action) {
    action = action || 'move';
    var n = new Array();

    files_length = 0;
    var params = {authenticity_token: AUTH_TOKEN, target: target, action: action}

    if(typeof nodes == 'object') {
      Ext.each(nodes, function(item, i) {
        params['files['+i+']'] = item.id;
        files_length++;
      });
    }else{
      params['files[0]'] = nodes;
    }
    
    params['files_length'] = files_length;
    
    //Make Ajax request
    Ext.Ajax.request({
      params: params,
      method: 'POST',
      url: this.moveUrl,
      scope: this,
      success: function(resp, obj) {
        try {
          var r = Ext.decode(resp.responseText);
        }catch(e) {
          obj.failure();
        }
        if(r.success) {
          //Delete files from the stores
          if(action == 'move') {
            for(var k in r.files) {
              var id  = this.currentDir + "/" + r.files[k].id.replace(/^(.*)\/(\w)+?/, "$2");
              if(id) {
                var data = this.view.store.getById(id);
                this.view.store.remove(data);
              }
            }
          }else {
            //cut or copy action
            var data = [];
            Ext.each(this.view.store.data.items, function(it){ data.push(it.json); });
            Ext.each(r.files, function(it){ 
              if(it.success) {
                data.push(it); 
              }
            });
            this.view.store.loadData({files: data});
          }
        }else {
          obj.failure();
        }
      },
      failure: function(resp, obj) {
        showError('Error', 'No se puedo mover algunos nodos');
      }
    });
  },
  /**
   *Function that fires after the View is rendered
   */
  afterRender: function() {
    Rails.View.superclass.afterRender.call(this);
    this.setRequest('', this);
  },
  /**
   *Loads data for the different views
   */
  setStore: function(data) {
    this.store = data;
    this.view.storeLad(data);
  },
  /***
   *Calls the Request action for the view and grid
   */
  setRequest: function(id, panel) {
    id = id || '';
    if(id != '' && this.browseHistory) {
      if(this.history.length >= this.historySize){
        this.history.remove(this.history[0]);
      }
      this.browseHistory = false;
      this.history.push(id);
      if( this.history.length < 10 )
          this.historyPos++;
    }
    view = panel.view;
    //grid = this.grid || grid;
    Ext.Ajax.request({
      params: {node: id, root: 'files'},
      method: 'GET',
      url: this.browseUrl,
      sope: this,
      success: function(resp, obj) {
        try {
          var r = Ext.decode(resp.responseText);
         }catch(e) {
          obj.failure();
        }
        //Load data to View and grid
        if(r.success) {
          view.store.loadData(r);
          panel.previousDir = panel.currentDir;
          panel.currentDir = r.dir //Set current Dir
          panel.fireEvent('afteropenfolder', r);
          panel.setPath();          
          //this.setHistoryBF(); // Sets to enable or disable the history forward and backward buttons
        }else {
          obj.failure();
        }
      },
      failure: function(resp, obj) {
        showError('Error', 'Existion un error al obtener los datos');
      }
    });
  },
  setPath: function(path) {
    path = path || this.currentDir;
    this.setTitle('Ruta: '+path);
  },
  setCurrentDir: function(dir){
    this.currentDir = dir;
  },
  /**
   *Generates a upload dialog for file uploads
   *The response must be {success: true, error:'',
   *file: {date: '', id: '', imgsrc: '', leaf: true, size: '', smallicon: '', text: '' } }
   */
  uploadFiles: function(target) {
    
    if(!this.uploadDialog){
      this.uploadDialog = new Ext.ux.UploadDialog.Dialog({
        width: 600, height: 300, url: this.uploadUrl, title: 'Subir Archivos',
        upload_autostart: false, post_var_name: 'file'
      });
      this.uploadDialog.on('uploadsuccess', function(dia, text, resp) {
        if(this.currentDir == this.uploadDir);
        this.addNodes([resp.file], this.view);
      }, this);
    }
    this.uploadDir = this.currentDir;
    this.uploadDialog.base_params.authenticity_token = AUTH_TOKEN;
    this.uploadDialog.base_params.directory = this.currentDir;
    this.uploadDialog.show();
    //this.uploadDialog('uploadstart', function(){ console.log(arguments)}, this);
  },
  /**
   *Allows the download of files
   */
  downloadFile: function() {
    var nodes = this.view.getSelectedNodes();
    if(nodes.length != 1) {
      alert('Error');
      return false;
    }
    var www = 'http://localhost:3000';
    var path = nodes[0].id.replace(ROOT_PUBLIC_REGEX, '');
    w = new Ext.Window({
      title: 'Descargar Archivo',
      closeAction: 'close',
      width: 320,
      height: 100,
      html: '<iframe src="'+www+'/enano_files/download/?file='+path+'" width="300"></iframe>'
    });
    w.show();
  },
  /**
   *Creates a directory
   *Prompts a message for the dir name and it returns
   */
  createDirectory: function() {
    Ext.Msg.prompt('Directorio', 'Nombre del directorio:', function(btn, text){
      if (btn == 'ok') {
        if(!/^[a-z0-9-_]+$/i.test(text)) {
          Ext.Msg.show({
            title:'Error',
            msg: 'El nombre del directorio es incorrecto',
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.ERROR
          });
          return false;
        }
        Ext.Ajax.request({
          params: {directory: text, path: this.currentDir, authenticity_token: AUTH_TOKEN},
          method: 'POST',
          url: this.createDirectoryUrl,
          scope: this,
          success: function(resp, obj) {
            try {
              var r = Ext.decode(resp.responseText);
            }catch(e) {
              obj.failure();
              return false;
            }
            var data = [];
            this.addNodes([r]);
          },
          failure: function(resp, obj) {
            showError('Error', 'Exisitio un error al crear el directorio');
          }
        });
      }
    }, this);
  },
  /**
   *Adds new nodes to the stores
   *@param array nodes Nodes that will be added to the store
   *@param onject view The View with the store to be aupdated
   */
  addNodes: function(nodes, view) {
    view = view || this.view;
    var data = [];
    Ext.each(this.view.store.data.items, function(it){ data.push(it.json); }, this);
    Ext.each(nodes, function(item, i) {
      data.push(item);
    }, this);
    console.log(nodes);
    view.store.loadData({files: data});
  },
  /**
   *Cut action
   */
  cut: function(){
    this.selectedFiles = this.view.getSelectedNodes();
    if(this.selectedFiles.length >0 ){
      this.moveAction = 'cut';
      this.togglePaste(true);
    }
  },
  /**
   *function to create a copy
   */
  copy: function() {
    this.selectedFiles = this.view.getSelectedNodes();
    if(this.selectedFiles.length >0 ){
      this.previousDir = this.currentDir;
      this.moveAction = 'copy';
      this.togglePaste(true);
    }
  },
  /**
   *Paste function
   */
  paste: function() {
    if(this.moveAction == 'copy') {
      this.moveFiles(this.selectedFiles);
    }else{
      this.moveAction = '';
      if(this.currentDir == this.previousDir) {
        return false;
      }
      this.togglePaste(false);
    }
    this.moveNodes(this.selectedFiles, this.currentDir, 'cut');
  },
  /**
   *enable paste button
   */
  togglePaste: function(val) {
    if(val) {
      this.tb.items.itemAt(0).menu.items.itemAt(2).enable();
      this.tb.items.itemAt(7).enable();
    }else{
      this.tb.items.itemAt(0).menu.items.itemAt(2).disable();
      this.tb.items.itemAt(7).disable();
    }
  },
  /**
   *Enables and disables the select for the editor
   *@param boolean val
   */
  toggleSelect: function(val) {
    if(val) {
      this.tb.items.itemAt(0).menu.items.itemAt(10).enable();
    }else {
      this.tb.items.itemAt(0).menu.items.itemAt(10).disable();
    }
  },
  /**
   *Deletes files or directories
   *gets the selected nodes from the dataView and deletes in the server
   */
  deleteFiles: function() {
    var nodes = this.view.getSelectedNodes();
    if(nodes.length <= 0) {
      return false;
    }
    var items = [];
    var params = {authenticity_token: AUTH_TOKEN};
    Ext.each(nodes, function(item, i) {
      params['files['+i+']'] = item.id;
      items.push('"'+this.getFileName(item.id)+'"');
    }, this);
    
    Ext.Msg.confirm('Esta seguro de borrar:<br/>'+items.join(", "), '', function(conf) {
      if(conf=='yes') {
        Ext.Ajax.request({
          params: params,
          method: 'POST',
          url: this.deleteUrl,
          scope: this,
          success: function(resp, obj) {
            try {
              var r = Ext.decode(resp.responseText);
            }catch(e) {
              obj.failure();
              return false;
            }
            //remove files from history and the browser
            Ext.each(r.files, function(item, i) {
              var errorMsg = '';
              if(item.deleted) {
                //remove from history
                var i;
                while((i = this.history.indexOf('uno')) >= 0 ){
                  this.history.remove(this.history[i]);
                }
                var data = this.view.store.getById(item.id);
                this.view.store.remove(data);
              }else{
                errorMsg+= this.getFileName(item.id);
              }
              //Shows not deleted Files
              if(errorMsg != '') {
                Ext.Msg.show({
                  title:'Error',
                  msg: 'Los sigueintes archivos no pudieron ser borrados:<br/>'+errorMsg,
                  buttons: Ext.MessageBox.OK,
                  icon:Ext.MessageBox.ERROR
                });
              }
            }, this);
          },
          failure: function(resp, obj) {
            showError('Error', 'Existio un error al tratar de borrar los archivos');
          }
        });
      }
    }, this);
  },
  /**
   *Uses the history to move
   *@param string dir Direction f = forward and b = backward
   */
  moveHistory: function(dir) {
    dir = dir || '';
    if(dir == 'f' || dir == 'b') {
      if( dir == 'b') {
        this.historyPos--;
      }else{
        this.historyPos++;
      }
      this.setRequest(this.history[this.historyPos], this);
    }
  },
  /**
   *Enales or disables de back and forward buttons
   */
  setHistoryBF: function() {
    //
  },
  getFileName: function(name) {
    return name.replace(/^(.*)\/(\w)+?/, "$2");
  }
});

/**
 *Browser Class
 */
Rails.Browser = function(config) {
  /**
   *Create Tree
   */
  root = new Ext.tree.TreeNode({
    text: 'Invisible Root',
    id:'filesRoot',
    draggable: false,
    children: []
  });

  var tree = new Ext.tree.TreePanel({
     id: 'browserTreePanel',
     region: 'west',
     split: true,
     collapsible: true,
     autoScroll: true,
     collapseMode: 'mini' ,
     loader: new Ext.tree.TreeLoader({
       url: this.browseUrl,
       baseParams: {browse: 'dir'},
       requestMethod:'GET',
        preloadChildren: true
    }),
    width: 200,
    enableDD: false,
    containerScroll: true,
    root: root,
    rootVisible: false
  });
  
  this.tree = tree;

  /*********************************/
  
  Ext.apply(this, config);
  /**
   *Default actions
   */
  Rails.Browser.superclass.constructor.call(this, {
    layout: 'border',
    title: 'Navegador',
    width: 700,
    minWidth: 300,
    height: 480,
    minHeight: 200,
    style: 'zindex: 400003 !important',
    closeAction: 'hide',
    modal: true,
    maximizable: true,
    listeners: {
      beforeclose: { fn: this.closeWindow },
      scope: this
    },
    items: [
      tree,
      new Rails.View(config) // Define config for the Urls 
    ]
  });

  this.view = this.items.itemAt(1);

  //Fires when it opens a folder for the first time
  this.view.on('afteropenfolder', function(data) {
    if(!this.initBrowser) {
      Ext.each(data.files, function(item){
        if(!item.leaf) {
          this.tree.root.appendChild(item);
        }
      }, this);
      this.initBrowser = true;
    }
  }, this);

  this.tree.on('click', function(node, e) {
    this.view.setRequest(node.id, this.view);
  }, this);
  
}


Ext.extend(Rails.Browser,  Ext.Window, {
  dataView: {},
  browseUrl: '/enano_files/browse',
  moveUrl: '/enano_files/move',
  uploadUrl: '/enano_files/upload',
  deleteUrl: '/enano_files/delete',
  createDirectoryUrl: '/enano_files/make_directory',
  rootDir: '/home/rails/public/file', //This part must be set from the server
  
  /**
   *Executed after the Window is closed
   */
  closeWindow: function(tree, parentNode, node) {
    return node.leaf;
  },
  /**
   *Creates the store for the DataView
   */
  createStore: function() {
    //
  }
});

Ext.reg('railsbrowser', Rails.Browser);
/*
p1 = new Ext.Panel({title:'Uno', html: 'Inicio Uno',  anchor: '100%, 50%'});
p2 = new Ext.Panel({title:'Dos', html: 'Inicio Dos',  anchor: '100%, 50%'});
w = new Ext.Window({
title: 'Ventana', width: 100, height: 200,items: [p1,p2], layout: 'anchor',
listeners: {
bodyresize: {fn: function(){
}, scope: this}
}
});
w.show();
w.items.itemAt(0).body.dom.parentNode.style.display = "";

w.items.itemAt(1).setHeight(w.getInnerHeight()-27);
w.items.itemAt(1).setVisible(false);
 */