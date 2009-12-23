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

(function( lib, namespace){

// declare namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

// styling models
var StyleModel ={
  'CurrentStyle': 0,
  'W3C': 1
};

// detect styling model
var styleModel =(window.getComputedStyle !==undefined ? StyleModel.W3C : StyleModel.CurrentStyle);

// selector query models
var SelectorQueryModel ={
  'Sizzle': 0,
  'W3C': 1
};

// detect selector query model
var selectorQueryModel =( document.querySelectorAll !==undefined ? SelectorQueryModel.W3C : SelectorQueryModel.Sizzle);

// make sure selector query engine is present
if( selectorQueryModel !=SelectorQueryModel.W3C)
  lib.require( 'css.sizzle');

// regular expressions
var reg ={
  // GetIECSSPropertyValue
  'alpha': /alpha\(([^\)]+)\)/i,
  'alphaOpacity': /opacity\s*=\s*([0-9]{1,3})/i,
  'num': /^-?\d/,
  'pixelNum': /^-?\d+(px)?$/i,
  // CamelizeCSSProperty
  'dashLetter': /-([a-z])/g
};

// used by CamelizeCSSProperty()
var camelizeReplaceFn =function( matches, first){
  return first.toUpperCase();
};

// cameLize CSS property name
function CamelizeCSSProperty( property) {
  // return camelized property
  return property.replace( reg.dashLetter, camelizeReplaceFn);
};

// get IE css property value
function GetIECSSPropertyValue( elem, style, property) {
  
  // get apacity from CSS filter setting
  if( property =='opacity') {
    // analyze filter property
    var match =style.filter.match( reg.alpha);
    if( match !==null) {
      // alpha specification found, find opacity setting
      match =match[1].match( reg.alphaOpacity);
      if( match !==null) {
        // opacity setting found
        value =parseInt( match[1]);
        // divide value by 100, because IE uses 1...100 range for
        // opacity setting
        return value / 100;
      }
    }
    
    // opacity is not supported or is not set
    return 1;
  }
  
  // make sure right name for float is used
  if( property =='float') {
    property ='styleFloat';
    
  } else {
    // camelize property name
    property =CamelizeCSSProperty( property);
  }
  
  // read value
  var ret =style[ property];
  
  if( ret ===undefined) {
    // not supported
    lib.debug( namespace, 'GetIECSSPropertyValue() : property "' +property +'" is not supported');
    return null;
  }
  
  // make sure 'visibility' setting does not return 'inherit'
  if( property =='visibility' && ret =='inherit') {
    if( elem.parentNode && elem.parentNode.currentStyle) {
      // find out visibility value for parent element
      return GetIECSSPropertyValue( elem.parentNode, elem.parentNode.currentStyle, property);
      
    } else {
      // assume visible
      return 'visible';
    }
  }
  
  // make sure pixels are returned
  if( !reg.pixelNum.test( ret) && reg.num.test( ret)) {
    // convert to pixels
    var activeStyle =elem.style;
    var left =activeStyle.left, rsLeft =elem.runtimeStyle.left;
     
    elem.runtimeStyle.left =elem.currentStyle.left;
    activeStyle.left =(property =='fontSize' ? '1em' : ( ret || 0));
    ret =activeStyle.pixelLeft +'px';
     
    // restore values
    activeStyle.left =left;
    elem.runtimeStyle.left =rsLeft;
  }
  
  // return value
  return ret;
};

// get W3C css property value
function GetCSSPropertyValue( elem, style, property) {
  // read property value
  var ret =style.getPropertyValue( property);
  
  if( property =='opacity' && ret =='')
    // make sure opacity always contains a number
    ret =1;
    
  return ret;
};

// get computed CSS property values
if( styleModel ==StyleModel.W3C) {
  // W3C recommendation
  api.get =function( elem, properties) {
    var ret ={};
    var style =window.getComputedStyle( elem, null);
    
    var k;
    for( var i =0; i < properties.length; ++i)
      ret[ k =properties[i]] =GetCSSPropertyValue( elem, style, k);
      
    return ret;
  };
  
} else {
  // IE way
  api.get =function( elem, properties) {
    var ret ={};
    var style =elem.currentStyle;
    
    var k;
    for( var i =0; i < properties.length; ++i)
      ret[ k =properties[i]] =GetIECSSPropertyValue( elem, style, k);
      
    return ret;
  };
  
}

// get computed CSS property value
api.getOne =function( elem, property) {
  return api.get( elem, [property])[property];
};

// set CSS property value
function SetCSSPropertyValue( elem, property, value) {
  // get style reference
  var style =elem.style;
  
  // assign property value
  
  if( property =='float') {
    // IE/W3C float
    style[( styleModel ==StyleModel.W3C ? 'cssFloat' : 'styleFloat')] =value;
    return;
    
  }
  
  if( property =='opacity' && styleModel ==StyleModel.CurrentStyle) {
    // IE opacity
    style['filter'] ='alpha(opacity=' +parseInt( value *100) +')';
    return;
  }
  
  // do not accept negative widths and heights
  if(( property =='width' || property =='height') && parseFloat( value) <0) {
    // assign to zero px
    value ='0px';
  }
  
  // camelize property
  var camelProp =CamelizeCSSProperty( property);
  
  if( lib.config.debug) {
    // see if property is supported
    if( style[ camelProp] ===undefined) {
      lib.debug( namespace, 'SetCSSPropertyValue() : property "' +property +'" is not supported');
      return;
    }
  }
  
  // assign property
  style[ camelProp] =value;
};

// set CSS property values
api.set =function( elem, properties) {
  for( var property in properties)
    SetCSSPropertyValue( elem, property, properties[ property]);
};

// set CSS property value
api.setOne =function( elem, property, value) {
  SetCSSPropertyValue( elem, property, value);
};

// read CSS properties
function cssRead( elem, arg2) {
  if( lib.isArray( arg2))
    return api.get( elem, arg2);
  else
    return api.getOne( elem, arg2);
}

// write CSS properties
function cssWrite( elem, arg2, arg3) {
  var elems =lib.isArray( elem) ? elem : [elem];
  var assign;
  
  // see how the values to be assigned were passed in
  if( lib.isString( arg2)) {
    // in form of $css( ..., 'key', 'value')
    assign ={};
    assign[ arg2] =arg3;
    
  } else {
    // in form of object
    assign =arg2;
  }
  
  // assign values
  if( lib.isArray( elem)) {
    // assign to a bunch of elements
    for( var i =0; i < elem.length; ++i)
      api.set( elem[i], assign);
    
  } else {
    // assign to a single element
    api.set( elem, assign);
  }
}

// Read CSS properties
// style( elem, '');
// style( elem, []);

// Write CSS properties
// style( elem, '', '');
// style( elem, {});
// style( [], '', '');
// style( [], {});

api.style =function( elem, arg2, arg3) {
  // check which operation requested
  if( arg3 ===undefined || lib.isArray( arg2))
    // reading operation
    return cssRead( elem, arg2);
  else
    // writing operation
    return cssWrite( elem, arg2, arg3);
};

// see if element is visible
api.visible =function( elem) {
  if( !elem.parentNode || !elem.style)
    // is visible
    return true;
    
  // see if display is set to none
  if( api.getOne( elem, 'display') ==='none')
    // not visible
    return false;
    
  // return status of parent node
  return api.visible( elem.parentNode);
};

if( selectorQueryModel ==SelectorQueryModel.W3C) {
  // W3C recommendation
  api.queryMultiple =function( selectors, context) {
    if( context ===undefined)
      return document.querySelectorAll( selectors);
    else
      return context.querySelectorAll( selectors);
  };
  api.queryOne =function( selectors, context) {
    if( context ===undefined)
      return document.querySelector( selectors);
    else
      return context.querySelector( selectors);
  };
  
} else {
  // Sizzle way
  api.queryMultiple =function( selectors, context) {
    if( context ===undefined)
      return lib.css.sizzle.query( selectors);
    else
      return lib.css.sizzle.query( selectors, context);
  };
  api.queryOne =function( selectors, context) {
    var ret =api.query( selectors, context);
    if( ret.length ==0)
      return null;
    else
      return ret[0];
  };
}

// query DOM
api.query =function( selectors, context) {
  // if no context specified, query globally
  if( context ===undefined)
    return lib.css.query( selectors);
    
  // context array specified
  if( lib.isArray( context)) {
    // result storage
    var result =[];
    var found;
    var entry;
    
    // iterate over array of contexts
    for( var i =0; i < context.length; ++i) {
      // iterate result
      for( var x =0, found =lib.css.query( selectors, context[i]); x < found.length; ++x) {
        // see if entry is not already present within an array
        if( !lib.inArray( entry =found[ x], result))
          // add entry to resulting array
          result.push( entry);
      }
    }
    
    // return result
    return result;
  }
  
  // assume context is an element
  return lib.css.query( selectors, context);
};

// get element offset on the screen
api.offset =function( elem) {
  // read http://ejohn.org/blog/getboundingclientrect-is-awesome/, implement method basing on
  // jQuery's .offset() implementation.
};

})( __NAMESPACE__, 'css');