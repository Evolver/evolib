
(function( lib, namespace){

// declare namespace
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

if( lib.attr ===undefined)
	throw new ErrorException( 'lib.attr is required by css.js');

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
if( selectorQueryModel !=SelectorQueryModel.W3C && lib.css.sizzle ===undefined)
  throw new ErrorException( 'lib.css.sizzle is required by css.js');

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
  
  // 'width' may return 'auto'
  if( property =='width' && ret =='auto') {
    // calculate correct value
    ret =(elem.offsetWidth
            -parseFloat( style.borderLeftWidth)
            -parseFloat( style.borderRightWidth)
            -parseFloat( style.paddingLeft)
            -parseFloat( style.paddingRight)) +'px';
  }
  
  // 'height' may return 'auto'
  if( property =='height' && ret =='auto') {
    // calculate correct value
    ret =(elem.offsetHeight
            -parseFloat( style.borderTopWidth)
            -parseFloat( style.borderBottomWidth)
            -parseFloat( style.paddingTop)
            -parseFloat( style.paddingBottom)) +'px';
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
    
  // BUG: FF returns -1.XXXXXXe+7px value for line-height being set to 0px.
  //  Hit this bug in FF 3.5.5.
  //  Bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=536758
  if( property =='line-height' && parseFloat( ret) <0)
    // default to 0px
    ret ='0px';
    
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

// set default display
api.setDefaultDisplay =function( elem) {
	api.setOne( elem, 'display', api.getDefaultDisplay( elem.nodeName));
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
    return lib.css.queryMultiple( selectors);
    
  // context array specified
  if( lib.isArray( context)) {
    // result storage
    var result =[];
    var found;
    var entry;
    
    // iterate over array of contexts
    for( var i =0; i < context.length; ++i) {
      // iterate result
      for( var x =0, found =lib.css.queryMultiple( selectors, context[i]); x < found.length; ++x) {
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
  return lib.css.queryMultiple( selectors, context);
};

// get element box sizing information
api.sizing =function( elem) {
  // get element computed dimensions
  var props =api.style( elem, [
    'width', 'height',
    'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
    'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
    'padding-left', 'padding-right', 'padding-top', 'padding-bottom']
  );
  
  // make sure all properties represent numbers
  for( var k in props)
    props[ k] =parseInt( props[ k]);
    
  // return dimensions
  return props;
};

// get element offset on the screen
api.offset =function( elem) {
  // use getBoundingClientRect only
  var rect =elem.getBoundingClientRect();
  var ret ={
    'left': rect.left,
    'top': rect.top,
    'right': rect.right,
    'bottom': rect.bottom
  };
  var doc =elem.ownerDocument;
  var docElement =doc.documentElement;
  var docBody =doc.body;
  
  var scrollTop =docElement.scrollTop || docBody.scrollTop;
  var scrollLeft =docElement.scrollLeft || docBody.scrollLeft;
  
  var addTop =scrollTop -(docElement.clientTop || docBody.clientTop);
  var addLeft =scrollLeft -(docElement.clientLeft || docBody.clientLeft);
  
  // add scrolling offsets
  ret.top +=addTop;
  ret.bottom +=addTop;
  ret.left +=addLeft;
  ret.right +=addLeft;
  
  // return info
  return ret;
};

// get element box information
api.box =function( elem) {
  // return information on box
  return {
    'box': api.offset( elem),
    'dim': api.sizing( elem)
  };
};

// get CSS representation of property value
api.getPropCSSValue =function( property, rawValue) {
  // see which property is passed in
  switch( property) {
    case 'width':
    case 'height':
    case 'left':
    case 'top':
    case 'margin-left':
    case 'margin-right':
    case 'margin-top':
    case 'margin-bottom':
    case 'padding-left':
    case 'padding-right':
    case 'padding-top':
    case 'padding-bottom':
    case 'border-left-width':
    case 'border-right-width':
    case 'border-top-width':
    case 'border-bottom-width':
    case 'font-size':
    case 'line-height':
      // indicate that value is in pixels
      return Math.round( rawValue) +'px';
      
    // opacity
    case 'opacity':
      // return valid opacity value
      return parseFloat( rawValue).toFixed( 2);
      
    default:
      // return raw value
      return rawValue;
  }
};

// node displays
var defaultDisplay ={};

// get element default display property
api.getDefaultDisplay =function( nodeName) {
  // see if result precached
  var disp =defaultDisplay[ nodeName];
  if( disp !==undefined)
    return disp;
    
  // determine value and store it
  var frag =document.createDocumentFragment();
  var el =document.createElement( nodeName);
  // append element to DOM
  frag.appendChild( el);
  
  // determine display
  defaultDisplay[ nodeName] =disp =api.getOne( el, 'display');
  
  // return value
  return disp;
};

// get element inline style
api.getStyle =function( elem) {
  // return value of style attribute
  return lib.attr.get( elem, 'style');
};

// set element inline style
api.setStyle =function( elem, css) {
  // set style attribute
  lib.attr.set( elem, 'style', css);
};

// clear element inline style
api.clearStyle =function( elem) {
  // clear style info
  lib.attr.set( elem, 'style', '');
};

})( EVOLIB_EXPORT, 'css');