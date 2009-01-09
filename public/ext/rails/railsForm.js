/**
 *Modify to make it work to atumatically load error responses
 */
Ext.override(Ext.form.Action, {
  
  processResponse : function(response){
        
    if(this.form.wait) {
      this.form.wait.hide();
    }
    this.response = response;
    if(!response.responseText){
      return true;
    }
    this.result = this.handleResponse(response);
    return this.result;
  }
});

/**
 *Modification of BasicForm to make it work with Rails
 */
Ext.override(Ext.BasicForm, {
    
  /**
   *Presentación de mensaje cuando se envia datos al servidor
   */
  beforeAction : function() {
    this.wait = Ext.MessageBox.show({
      msg : 'Espere mientras se guarda sus datos...',
      progressText : 'Guardando...',
      width : 300,
      wait : true
    });
  },
  /**
     *Acción que se ejecuta cuando se recibe respuesta del servidor
     */
  afterAction : function(action, success) {
        
    this.activeAction = null;
    var o = action.options;
    this.wait.hide();
        
    if(success) {
      if(o.reset){
        this.reset();
      }
      Ext.callback(o.success, o.scope, [this, action]);
      this.fireEvent('actioncomplete', this, action);
    }else {
      //Ext.callback(o.failure, o.scope, [this, action]);
      this.fireEvent('actionfailed', this, action);
    }
  }
  /**
  *Presents the errors that the form made in the server, the server
  *must set a variable erros which holds the errors for each node
  *@param object action Respuesta del servidor
  */
  /*setErrors : function(action) {
        
    try {
      var resp = Ext.decode(action.response.responseText);
      if( resp.errors ) {
        Ext.each(resp.errors, function(item) {
          for(var k in item) {
            var num = this.items.findIndex('id', k );
            this.items.items[num].markInvalid(item[k]);
          }
        }, this);
      }
    }catch(e) {
      throw e;
    }
  }*/
});

/**
 *@author Boris Barroso
 *@class Rails.Form clase creada con el proposito de crear una forma especifica para RailsPHP
 *@copyright (c) 2008, by Boris Barroso
 *@date Julio 2008
 */
Rails.Form = function(config) {
  Ext.apply(this, config);
  //Dimension de los campos, se realiza un autodimensionamiento de los campos
  if(config.width && config.labelWidth){
    if(!config.defaults)
      this.defaults.width = config.width -(config.labelWidth +60);
  }
    
  Rails.Form.superclass.constructor.call(this);
  this.add({
    xtype:'hidden',
    name:'authenticity_token',
    id:'authenticity_token',
    value : AUTH_TOKEN
  });
}

Ext.extend(Rails.Form, Ext.form.FormPanel, {
    
  defaults : {},
  msgTarget : 'side',
  /*defaults:{
        width:100
    },*/
  /**
     *funcion que permite guardar los Datos en el servidor
     *@param object params lista de parametros para realizar el submit, como URL, scope, success, failure
     */
  submit : function(params) {
    this.getForm().submit(params);
  },
    
  /**
     *Borra todos los valores de la forma
     */
  resetValues : function(){
        
    Ext.each(this.items.items, function(item){
      item.setValue('');
    });
  },
  /**
   *Finds an item by its name
   */
  findByName: function(name, retArray) {
    retArray = retArray || false;
    var item = this.findBy( function(i) {
      if(i.name == name) {
        return true;
      }
    }, this);
    return retArray == true ? item : item[0];
  }
});

Ext.reg('railsform', Rails.Form);

/**
 *Code to present messages like the example messages in Ext examples
 */
Ext.example = function(){
  var msgCt;
    
  function createBox(t, s){
    return ['<div class="msg">',
    '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
    '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
    '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
    '</div>'].join('');
  }
  return {
    msg : function(title, format){
      if(!msgCt){
        msgCt = Ext.DomHelper.insertFirst(document.body, {
          id:'msg-div'
        }, true);
      }
      msgCt.alignTo(document, 't-t');
      var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
      var m = Ext.DomHelper.append(msgCt, {
        html:createBox(title, s)
        }, true);
      m.slideIn('t').pause(1).ghost("t", {
        remove:true
      });
    },
    
    init : function(){
      var t = Ext.get('exttheme');
      if(!t){ // run locally?
        return;
      }
      var theme = Cookies.get('exttheme') || 'aero';
      if(theme){
        t.dom.value = theme;
        Ext.getBody().addClass('x-'+theme);
      }
      t.on('change', function(){
        Cookies.set('exttheme', t.getValue());
        setTimeout(function(){
          window.location.reload();
        }, 300);
      });
    
      var lb = Ext.get('lib-bar');
      if(lb){
        lb.show();
      }
    }
  };
}();


// vim: ts=4:sw=4:nu:fdc=2:nospell
/**
 * Ext.ux.form.XCheckbox - checkbox with configurable submit values
 *
 * @author  Ing. Jozef Sakalos
 * @version $Id: Ext.ux.form.XCheckbox.js 313 2008-08-18 18:00:16Z jozo $
 * @date    10. February 2008
 *
 *
 * @license Ext.ux.form.XCheckbox is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

/*global Ext */

/**
  * @class Ext.ux.XCheckbox
  * @extends Ext.form.Checkbox
  */
Ext.ns('Ext.ux.form');
Ext.ux.form.XCheckbox = Ext.extend(Ext.form.Checkbox, {
     submitOffValue:'false'
    ,submitOnValue:'true'

    ,onRender:function() {

        this.inputValue = this.submitOnValue;

        // call parent
        Ext.ux.form.XCheckbox.superclass.onRender.apply(this, arguments);

        // create hidden field that is submitted if checkbox is not checked
        this.hiddenField = this.wrap.insertFirst({tag:'input', type:'hidden'});

        // support tooltip
        if(this.tooltip) {
            this.imageEl.set({qtip:this.tooltip});
        }

        // update value of hidden field
        this.updateHidden();

    } // eo function onRender

    /**
     * Calls parent and updates hiddenField
     * @private
     */
    ,setValue:function(v) {
        v = this.convertValue(v);
        this.updateHidden(v);
        Ext.ux.form.XCheckbox.superclass.setValue.apply(this, arguments);
    } // eo function setValue

    /**
     * Updates hiddenField
     * @private
     */
    ,updateHidden:function(v) {
        v = undefined !== v ? v : this.checked;
        v = this.convertValue(v);
        if(this.hiddenField) {
            this.hiddenField.dom.value = v ? this.submitOnValue : this.submitOffValue;
            this.hiddenField.dom.name = v ? '' : this.el.dom.name;
        }
    } // eo function updateHidden

    /**
     * Converts value to boolean
     * @private
     */
    ,convertValue:function(v) {
        return (v === true || v === 'true' || v === this.submitOnValue || String(v).toLowerCase() === 'on');
    } // eo function convertValue

}); // eo extend

// register xtype
Ext.reg('xcheckbox', Ext.ux.form.XCheckbox);

// eo file

/**
 *Override to Make it work with names with brackets
 *http://www.extjs.com/forum/showthread.php?p=210602#post210602
 */
Ext.DomQuery.matchers[2].re = /^(?:([\[\{])(?:@)?([\w-]+)\s?(?:(=|.=)\s?(?:"(.*?)"|'(.*?)'|(.*?)))?[\]\}])/;

Ext.override(Ext.form.Radio, {
	getGroupValue : function(){
		var c = this.getParent().child('input[name="'+this.el.dom.name+'"]:checked', true);
		return c ? c.value : null;
	},
	toggleValue : function() {
		if(!this.checked){
			var els = this.getParent().select('input[name="'+this.el.dom.name+'"]');
			els.each(function(el){
				if(el.dom.id == this.id){
					this.setValue(true);
				}else{
					Ext.getCmp(el.dom.id).setValue(false);
				}
			}, this);
		}
	},
	setValue : function(v){
		if(typeof v=='boolean') {
			Ext.form.Radio.superclass.setValue.call(this, v);
		}else{
			var r = this.getParent().child('input[name="'+this.el.dom.name+'"][value="'+v+'"]', true);
			if(r && !r.checked){
				Ext.getCmp(r.id).toggleValue();
			};
		}
	}
});

/**
 *Displays an error message
 */
function showError(title, msg) {
  Ext.Msg.show({
    title : title,
    msg : msg,
    buttons : Ext.MessageBox.OK,
    icon:Ext.MessageBox.ERROR
  });
}

/**
 * Allows to generate Image buttons
 */
Ext.namespace('Ext.ux');
Ext.ux.ImageButton = function(cfg) {
    Ext.ux.ImageButton.superclass.constructor.call(this, cfg);
};

Ext.extend(Ext.ux.ImageButton, Ext.Button, {
    onRender : function(ct, position) {
      this.disabledImgPath = this.disabledImgPath || this.imgPath;
      
//      var tplHTML = '<div class="ux-image-button" style="{width}">'+
//        '<div class="ux-image-button-tl"><div class="ux-image-button-tr"><div class="x-tip-tc"></div></div></div>'+
//        '<div class="ux-image-button-ml"><div class="ux-image-button-mr"><div class="ux-image-button-mc">'+
//        '<img src="{imgPath}" border="0" width="{imgWidth}" height="{imgHeight}" alt="{tooltip}" style="cursor: {cursor};"/> '+
//        '<div class="text">{imgText:htmlEncode}</div>'+
//        '</div></div></div>'+
//        '<div class="x-tip-bl"><div class="x-tip-br"><div class="x-tip-bc"></div></div></div>'+
//        '</div>';
      var tplHTML = '<div class="ux-img-but"><div class="over"></div><div class="cont">'+
        '<img src="{imgPath}" border="0" width="{imgWidth}" height="{imgHeight}" alt="{tooltip}" style="cursor: {cursor};"/> '+
        '<div class="text">{imgText:htmlEncode}</div></div></div>';
      var tpl = new Ext.Template(tplHTML);
      var btn, targs = {
          imgPath : this.disabled ? this.disabledImgPath : this.imgPath,
          imgWidth : this.imgWidth || "",
          imgHeight : this.imgHeight || "",
          imgText : this.text || "",
          width : this.width ? this.width+'px' : "auto",
          tooltip : this.tooltip || ""
      };

      btn = tpl.append(ct, targs, true);
      btn.on("click", this.onClick, this);
      if (this.cls) {
          btn.addClass(this.cls);
      }
      btn.dom.style.width = this.width+'px';
      this.el = btn;
      if (this.hidden) {
          this.hide();
      }
  },
  //
  autoWidth: function(){},
  disable : function(newImgPath) {
      var replaceImgPath = newImgPath || this.disabledImgPath;
      if (replaceImgPath)
          this.el.dom.firstChild.src = replaceImgPath;
      this.disabled = true;
  },
  enable : function(newImgPath) {
      var replaceImgPath = newImgPath || this.imgPath;
      if (replaceImgPath)
          this.el.dom.firstChild.src = replaceImgPath;
      this.disabled = false;
  }
});

Ext.reg('imagebutton', Ext.ux.ImageButton);