/**
 *This class creates the main ViewPort for the application 
 * @author Boris Barroso boriscyber@gmail.com
 * @copyright (c) Boris Barroso
 * @created 23 September 2008
 * @modified 23 September 2008
 */
Rails.Viewport = function(config) {
  a = new Ext.Button({
    text: 'Browser', 
    height: 40, applyTo: 'north'
  });
  
  Rails.Viewport.superclass.constructor.call(this, {
    id: 'mainPanel',
    layout:'border',
    items:[{
      region: 'north',
      height:60,
      baseCls: 'x-panel-header',
      title: 'Enano',
      items: [{
        xtype : 'imagebutton', imgPath : '../images/folder.png', imgWidth : 32,  imgHeight : 32,
        text : 'Browser', handler: this.showBrowser, width: 100, scope: this
      },{
        xtype: 'imagebutton', text: 'Salir', handler: function() { window.location = '/logout'}, imgPath: '../images/exit.png'
      }]
    },{
      xtype: 'railspage',
      title: 'Pages',
      jsonTree: config.jsonTree
    },{
      xtype : 'tabpanel',
      region : 'center',
      activeItem : 0,
      defaults : {
        autoScroll: true
      },
      items: [{
        id : 'welcome',
        title : this.i18n.welcomeTab,
        contentEl : 'welcome-div',
        closable : true,
        treepath : '',
        listeners : {
          beforeremove : {
            fn : this.closeTab,
            scope : this
          }
        }
      }]
    }]
  });

  //Apply all the configurations so that it changes the default config
  Ext.apply(this, config);

  this.enc = this.items.itemAt(0);
  this.pages = this.items.itemAt(1);
  this.tabs = this.items.itemAt(2);
  

  /**
  *Events for creating, editing and deleting pages
  */
  this.pages.on({
    oncreatepage : {
      fn : function(node, form) {
        var tab = this.tabs.add(form)
        this.tabs.activate(tab);
      }, scope : this
    },
    oneditpage : { fn: function(node, form) {
        var tab = this.tabs.add(form)
        this.tabs.activate(tab);
      }, scope: this
    },
    ondeletepage: { fn: function(node) {
        var tabs = this.tabs.items.items;
        Ext.each(tabs, function(item){
            
            try{
                if(item.items.itemAt(0).value == node.id) {
                    this.tabs.remove(item);
                }
            }catch(e){}
        }, this);
      },
      scope: this
    }
  });

  this.tabs.on('tabchange', function(tabpanel, tab) {
    //this.pages.selectPath(tab.treepath);///////////
    }, this);

  //Verifes when a tab is removed (closed) from the tab pannel to save data
  this.tabs.on('remove', function(panel, tab){
    //
  }, this);

  //Selects the current treeNode when a tab is selected
  this.pages.selectPath(this.tabs.items.itemAt(0).treepath);

}

Ext.extend(Rails.Viewport, Ext.Viewport, {

  addPageUrl : '',
  editPageUrl : '',
  deletePageUrl : '',
  showBrowser: function() {
    if(!this.browser) {
      this.browser = new Rails.Browser();
      //Catch the browser event to set a file
      this.browser.view.items.itemAt(0).on('selectfile', function(file) {
        enanoSelectFile(file);
      });
    }
    this.browser.show();
  },
  /**
  *Function that closes the active tab
  */
  closeTab: function(panel, tab) {
    if(tab.id == 'tabnewPage') {
      //Remove the item from the tree
      var node = this.pages.root.findChild('id', tab.id.substr(3,7));
      node.remove();
    }
    return false;
  },
  /**
  *Adds a new tab with the detail of a page
  *@param object tab
  *@param object object The object that is attached to the tab
  */
  addTab: function(tab, object) {
    
    //Search the tab in case that it is Open
    if(this.tabs.findById(tab.id)){
      return;
    }
    //Ext.each(this.tabs.items.items, function(item){}, this);
    
    //Apply default config
    Ext.apply(tab,{
      closable: true,
      activate: true,
      layout: 'fit',
      items: object
    });
    //Render Tab
    tab = this.tabs.add(tab);
    this.tabs.activate(tab);
    this.tabs.activeTab.doLayout();
  }
});

Rails.Viewport.prototype.i18n = {
  Error: 'Error',
  welcomeTab: 'Bienvenido',
  errorNewPage: 'Debe seleccionar una página que ya haya sido salvada',
  errorRootPage: 'Seleccione una página',
  errorSave: 'Existion un error al salvar',
  newPageTitle: 'Nueva Página',
  tbarSave: 'Guardar',
  tbarSaveTtip: 'Guardar Página',
  tbarPreView: 'Vista Previa',
  tbarPreViewTtip: 'Vista Previa',
  frmLblTitle: 'Título',
  frmLblPageType: 'Tipo',
  frmLblPublish: 'Públicar',
  frmLblBody: 'Contenido'
}