/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  
  Evolver's JavaScript Library (evolib).
  Copyright (C) 2009  Dmitry Stepanov <dmitrij@stepanov.lv>
  
  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
  */

(function( lib){
  
var undefined;

// HEAD element reference
var head =null;

// export configuration
var config =lib.config ={
  // enable debugging mode
  'debug': false,
  // library base directory (with trailing slash)
  'root': '/'
};

// debugging function (can be overriden from the outer world to receive
//  debugging info)
lib.debug =function( namespace, msg) {
  // override to read debug info
  throw 'evolib' +(namespace ===null ? '' : ' (' +namespace +')') +': ' +msg;
};

// get reference to namespace
lib.namespace =function( namespace, create) {
  if( create ===undefined)
    create =true;
  
  // separate namespace in parts
  var parts =namespace.split( '.');
  
  // lookup object to return
  var ret =lib;
  var part;
  for( var i =0; i < parts.length; ++i) {
    part =parts[i];
    
    // see if namespace is defined
    if( ret[ part] ===undefined) {
      if( create) {
        // make sure all paths are defined
        ret[ part] ={};
        
      } else {
        // otherwise return undefined
        if( config.debug)
          // indicate failure of namespace loading
          lib.debug( null, 'Did not found required namespace "' +namespace +'"');
          
        return undefined;
      }
    }
      
    // reference next part
    ret =ret[ part];
  }
  
  // return namespace reference
  return ret;
};

// return predefined namespace instance
lib.require =function( namespace) {
  return lib.namespace( namespace, false);
};

// get index of item in object
lib.indexOf =function( object, item, fromIndex) {
  if( fromIndex ===undefined)
    fromIndex =0;
    
  if( object.indexOf)
    // use built-in indexOf method
    return object.indexOf( item, fromIndex);
    
  else {
    // just iterate
    for( var i in object)
      if( object[i] ==item)
        return i;
        
    return -1;
  }
};

// extend obj1 by obj2
lib.extend =function( obj1, obj2) {
  for( var k in obj2)
    obj1[k] =obj2[k];
};

// merge two objects
lib.merge =function( obj1, obj2) {
  // clone first object
  var ret =lib.clone( obj1);
  
  for( var k in obj2)
    ret[k] =obj2[k];
    
  // return new object
  return ret;
};

// clone variable

//  clone( var) - get full clone of object
//  clone( var, false) - do not clone values of arrays and properties of objects
lib.clone =function( variable, cloneAll) {
  if( cloneAll ===undefined)
    cloneAll =true;

  var ret;
  
  // clone array
  if( variable ===null)
    ret =null;
    
  else if( variable ===undefined)
    ret =undefined;
    
  else if( typeof variable =='array') {
    var i;
    ret =new Array;
    if( cloneAll) {
      for( i =0; i < variable.length; ++i)
        ret.push( lib.clone( variable[i], cloneAll));
    } else {
      // use concat instead
      ret.concat( variable);
    }
    
  } else if( typeof variable =='function') {
    // just reference the function (currently the safest
    //  known way).
    ret =variable;
    
  // clone object or function
  } else if( typeof variable =='object') {
    var k;
    // construct object
    ret =new Object;
      
    if( cloneAll) {
      for( k in variable) {
        if( variable.hasOwnProperty( k))
          ret[ k] =lib.clone( variable[k], cloneAll);
      }
        
    } else {
      for( k in variable) {
        if( variable.hasOwnProperty( k))
          ret[ k] =variable[k];
      }
    }
    
  // clone other vars
  } else
    ret =variable;
    
  // return cloned value
  return ret;
};

// count properties in object
lib.count =function( object) {
  // undefined by default
  var ret;
  
  if( typeof object =='array') {
    // count elements in array
    ret =object.length;
    
  } else if( typeof object =='object') {
    // count elements in object
    ret =0;
    var k;
    // count own properties
    for( k in object) {
      if( object.hasOwnProperty( k))
        ret++;
    }
  } else if( typeof object =='string') {
    // count characters in string
    ret =string.length;
    
  }
  
  return ret;
};

// test for BUG in IE: after removeChild() called, element's parentNode is not being
// set to null in some cases.
var div =document.createElement( 'DIV');
document.documentElement.appendChild( div);
document.documentElement.removeChild( div);
// remember bug state
var hasParentNodeBug =(div.parentNode !==null);

// clean up
delete div;

// test for script injection through createTextNode + appendChild
var scriptInject =false;
var html =document.documentElement;
var script =document.createElement( 'script');

// test for scriptInject
script.type ='text/javascript';
try {
  script.appendChild( document.createTextNode( 'window.__domlibScriptInject =true;'));
} catch( e){}

// insert script
html.insertBefore( script, html.firstChild);

// test for value
if( window.__domlibScriptInject) {
  // script injection in it's standard form is supported
  scriptInject =true;
  delete window.__domlibScriptInject;
}

// cleanup
html.removeChild( script);
delete html;
delete script;

// get element's window object
lib.getElementWindow =function( elem) {
  var doc;
  if( elem.ownerDocument !==undefined)
    doc =elem.ownerDocument;// DOMElement
  else if( elem.getElementById !==undefined)
    doc =elem;// document
  else if( elem.location !==undefined)
    return elem;// got window object itself
  else
    // don't know what's this
    return undefined;
    
  if( doc.defaultView !==undefined)
    // W3C
    return doc.defaultView;
  else if( doc.parentWindow !==undefined)
    // IE
    return doc.parentWindow;
  else
    // ???
    return undefined;
};

// evaluate script locally preserving all context variables.
//  variables are named this weird to avoid overlapping with
//  callee's context.
lib.eval =function( __$js, __$thisObj) {
  if( __$thisObj ===undefined)
    return eval( __$js);

  // 'this' object is used, return execution result
  return (function(){ return eval( __$js); }).call( __$thisObj);
};

// evaluate script without context (global eval) and return execution result.

//  globalEval( js) - evaluate script
//  globalEval( js, thisObj) - evaluate script having 'this' variable equal to thisObj.
lib.globalEval =function( js, thisObj) {
  // see if 'this' object has to be set
  var stackUsed =thisObj !==undefined;
  
  // create stack and modify script
  if( stackUsed) {
    if( !window.__domlibGlobalEvalStack)
      // declare stack
      window.__domlibGlobalEvalStack =new Array();
      
    // push 'this' object reference in to stack
    window.__domlibGlobalEvalStack.push( thisObj);
    
    // modify script, wrap it with a function call.
    js =
      // this calls our code with 'this' variable set and stores the return value in
      //  window.__domlibGlobalEvalResult
      'window.__domlibGlobalEvalResult =(function(){' +js +'}).call( window.__domlibGlobalEvalStack.pop());';
  }
  
  // create elements
  var head =document.documentElement;
  var script =document.createElement( 'script');
  script.type ='text/javascript';
  
  if( scriptInject)
    script.appendChild( document.createTextNode( js));
  else
    script.text =js;
    
  // evaluate code
  head.insertBefore( script, head.firstChild);
  head.removeChild( script);
  
  var ret;
  
  if( stackUsed) {
    // obtain execution result and perform cleanup
    ret =window.__domlibGlobalEvalResult;
    
    // delete return value container
    delete window.__domlibGlobalEvalResult;
    
    // this performs cleanup after execution by deleting window.__domlibGlobalEvalStack
    //  variable if there are no more items in the stack. globalEval can be called recursively,
    //  that's why we use stacks here.
    if( window.__domlibGlobalEvalStack.length ==0)
      delete window.__domlibGlobalEvalStack;
  }
      
  // returns undefined if nothing assigned
  return ret;
};

// remove element from DOM
lib.removeNode =function( node) {
  // element can be removed from DOM?
  if( node.parentNode ===undefined)
    throw 'Element can not be removed from DOM.';
  // is element already removed from DOM?
  if( node.parentNode ===null)
    return;// not present in DOM
  
  var parent =node.parentNode;
    
  // BUG: IE does not set parentNode to null 
  //  after removing element from DOM, so we
  //  need to check is element is present
  //  within childnodes of parent element,
  //  and if is, remove node.
  if( hasParentNodeBug) {
    var i, found =false;
    for( i =0; i < parent.childNodes.length; ++i) {
      if( parent.childNodes[i] ==node) {
        found =true;
        break;
      }
    }
    // see if node is within .childNodes of parent
    if( !found)
      return;// node not found within parent node,
             // it meants that node is not in DOM.
  }
  
  // remove node
  parent.removeChild( node);
};

// check if node is descendant of another node

//  isDescendantOf( elem, parent) - check if elem is descendant of parent
//  isDescendantOf( elem, parent, true) - also check of elem ==parent
lib.isDescendantOf =function( elem, parent, allowEq) {
  if( allowEq && elem ==parent)
    return true;
    
  try {
    if( elem.parentNode ===undefined)
      return false;
  } catch( e) {
    // IE barks if you access undefined property
    //  for some objects.
    return false;
  }
    
  var node =elem;
  while( node.parentNode) {
    if(( node =node.parentNode) ==parent)
      return true;
  }
  
  // did not found parent
  return false;
};

// uid counter
var uidCounter =0;
var uidKey ='_uid' +(+new Date);

// implementation
  
// get object unique id
lib.getUid =function( elem) {
  var ret;

  if( elem.getAttribute) {
    // .getAttribute
    ret =elem.getAttribute( uidKey);
    if( ret ===null)
      elem.setAttribute( uidKey, ret =uidCounter++);
      
  } else {
    // use property
    if( elem[ uidKey] ===undefined)
      ret =elem[ uidKey] =uidCounter++;
    else
      ret =elem[ uidKey];
  }
  
  return ret;
};

// data storage object
var dataStore ={};

// set associated data

// setData( elem, key, data)
lib.setData =function( elem, key, data) {
  var id =lib.getUid( elem);
  
  // create storage for the element
  if( dataStore[ id] ===undefined)
    dataStore[ id] ={};
    
  // assign new data
  dataStore[ id][ key] =data;
};
  
// see if element has data

// hasData( elem)
// hasData( elem, key)
lib.hasData =function( elem, key) {
  var id =lib.getUid( elem);
  
  if( key ===undefined)
    // see if got any data stored
    return dataStore[ id] !==undefined;
    
  // see if got specific key
  else if( dataStore[ id] !==undefined)
    return dataStore[ id][ key] !==undefined;
    
  else
    // has no data stored
    return false;
};
  
// remove associated data
  
// removeData( elem)
// removeData( elem, key)
lib.removeData =function( elem, key) {
  var id =lib.getUid( elem);
  
  if( key ===undefined)
    // remove whole data store
    delete dataStore[ id];
    
  // remove specific data store key
  else if( dataStore[ id] !==undefined)
    delete dataStore[ id][ key];
};
  
// obtain stored data

// getData( elem)
// getData( elem, key)
lib.getData =function( elem, key) {
  var id =lib.getUid( elem);
  
  if( key ===undefined) {
    // return all data available
    if( dataStore[ id] !==undefined)
      return dataStore[ id];
    else
      return undefined;
    
  // remove specific data store key
  } else if( dataStore[ id] !==undefined) {
      // see if got key stored
      if( dataStore[ id][ key] !==undefined)
        return dataStore[ id][ key];
      else
        return undefined;
    
  } else
    // has no data stored
    return undefined;
};
  
})( window.evolver ={});