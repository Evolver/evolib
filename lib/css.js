
(function( lib, namespace){

// declare namespace
var api =lib.namespace( namespace), undefined;

if( lib.attr ===undefined)
	throw 'lib.attr is required by css.js';
if( lib.data ===undefined)
	throw 'lib.data is required by css.js';
if( lib.dom ===undefined)
	throw 'lib.dom is required by css.js';

// styling models
var StyleModel ={
	'CurrentStyle': 0,
	'W3C': 1
};

// detect styling model
var styleModel =(window.getComputedStyle !==undefined ? StyleModel.W3C : StyleModel.CurrentStyle);

// all property names
var supportedCSSProperties =api.supportedCSSProperties =[];

// load all property names
if( styleModel ==StyleModel.W3C) {
	// via getComputedStyle
	var style =window.getComputedStyle( document.createElement( 'DIV'), null);
	
	for( var i =0; i < style.length; ++i)
		supportedCSSProperties.push( style[i]);
	
	// cleanup
	delete style;
	
} else {
	// function to check if css property is supported
	var elem =document.createElement( 'DIV');
	
	// put element into document
	document.documentElement.appendChild( elem);
	
	// read style
	var currentStyle =elem.currentStyle;
	var props =[
		['backgroundAttachment','background-attachment'],
		['backgroundColor','background-color'],
		['backgroundImage','background-image'],
		['backgroundPositionX','background-position-x'],
		['backgroundPositionY','background-position-y'],
		['backgroundRepeat','background-repeat'],
		['borderBottomColor','border-bottom-color'],
		['borderBottomStyle','border-bottom-style'],
		['borderBottomWidth','border-bottom-width'],
		['borderCollapse','border-collapse'],
		['borderColor','border-color'],
		['borderLeftColor','border-left-color'],
		['borderLeftStyle','border-left-style'],
		['borderLeftWidth','border-left-width'],
		['borderRightColor','border-right-color'],
		['borderRightStyle','border-right-style'],
		['borderRightWidth','border-right-width'],
		['borderStyle','border-style'],
		['borderTopColor','border-top-color'],
		['borderTopStyle','border-top-style'],
		['borderTopWidth','border-top-width'],
		['borderWidth','border-width'],
		['bottom','bottom'],
		['boxSizing','box-sizing'],
		['captionSide','caption-side'],
		['clear','clear'],
		['color','color'],
		['cursor','cursor'],
		['direction','direction'],
		['display','display'],
		['emptyCells','empty-cells'],
		['fontFamily','font-family'],
		['fontSize','font-size'],
		['fontStyle','font-style'],
		['fontVariant','font-variant'],
		['fontWeight','font-weight'],
		['height','height'],
		['left','left'],
		['letterSpacing','letter-spacing'],
		['lineBreak','line-break'],
		['lineHeight','line-height'],
		['listStyleImage','list-style-image'],
		['listStylePosition','list-style-position'],
		['listStyleType','list-style-type'],
		['marginBottom','margin-bottom'],
		['marginLeft','margin-left'],
		['marginRight','margin-right'],
		['marginTop','margin-top'],
		['maxHeight','max-height'],
		['maxWidth','max-width'],
		['minHeight','min-height'],
		['minWidth','min-width'],
		['orphans','orphans'],
		['outlineColor','outline-color'],
		['outlineStyle','outline-style'],
		['outlineWidth','outline-width'],
		['overflow','overflow'],
		['overflowX','overflow-x'],
		['overflowY','overflow-y'],
		['paddingBottom','padding-bottom'],
		['paddingLeft','padding-left'],
		['paddingRight','padding-right'],
		['paddingTop','padding-top'],
		['pageBreakAfter','page-break-after'],
		['pageBreakBefore','page-break-before'],
		['pageBreakInside','page-break-inside'],
		['position','position'],
		['quote','quote'],
		['right','right'],
		['rubyAlign','ruby-align'],
		['rubyOverhang','ruby-overhang'],
		['rubyPosition','ruby-position'],
		['styleFloat','float'],
		['tableLayout','table-layout'],
		['textAlign','text-align'],
		['textDecoration','text-decoration'],
		['textIndent','text-indent'],
		['textJustify','text-justify'],
		['textOverflow','text-overflow'],
		['textTransform','text-transform'],
		['textUnderlinePosition','text-underline-position'],
		['top','top'],
		['verticalAlign','vertical-align'],
		['visibility','visibility'],
		['whiteSpace','white-space'],
		['widows','widows'],
		['width','width'],
		['wordBreak','word-break'],
		['wordSpacing','word-spacing'],
		['wordWrap','word-wrap'],
		['zIndex','z-index'],
		['zoom','zoom']
	];
	
	// check which properties are supported
	for( var i =0; i < props.length; ++i)
		if( currentStyle[ props[ i][ 0]] !==undefined)
			supportedCSSProperties.push( props[ i][ 1]);
	
	// remove element from document
	elem.parentNode.removeChild( elem);
	
	// cleanup
	delete elem, props, currentStyle;
}

// selector query models
var SelectorQueryModel ={
	'Sizzle': 0,
	'W3C': 1
};

// detect selector query model
var selectorQueryModel =( document.querySelectorAll !==undefined ? SelectorQueryModel.W3C : SelectorQueryModel.Sizzle);

// make sure selector query engine is present
if( selectorQueryModel !=SelectorQueryModel.W3C && lib.css.sizzle ===undefined)
	throw 'lib.css.sizzle is required by css.js';

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
	
	if( property =='left' || property =='right' || property =='top' || property =='bottom') {
		if( ret =='auto')
			// make sure property always contains number
			ret ='0px';
	}
	
	if( property =='visibility' && ret =='inherit') {
		// make sure 'visibility' setting does not return 'inherit'
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
		return (elem.offsetWidth
						-parseFloat( style.borderLeftWidth)
						-parseFloat( style.borderRightWidth)
						-parseFloat( style.paddingLeft)
						-parseFloat( style.paddingRight)) +'px';
	}
	
	// 'height' may return 'auto'
	if( property =='height' && ret =='auto') {
		// calculate correct value
		return (elem.offsetHeight
						-parseFloat( style.borderTopWidth)
						-parseFloat( style.borderBottomWidth)
						-parseFloat( style.paddingTop)
						-parseFloat( style.paddingBottom)) +'px';
	}
	
	// line-height may return 'normal' or 'inherit'
	if( property =='lineHeight' && (ret =='normal' || ret =='inherit')) {
		// calculate correct value
		if( elem.parentNode && elem.parentNode.currentStyle) {
			// find out visibility value for parent element
			return GetIECSSPropertyValue( elem.parentNode, elem.parentNode.currentStyle, property);
			
		} else {
			// assume 1em
			ret ='1em';
		}
	}
	
	// margin* may return 'auto' value
	if(( property =='marginLeft' || property =='marginRight' || property =='marginTop' || property =='marginBottom') && ret =='auto') {
		// assume none
		return '0px';
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
	
	if( property =='display' && ret =='') {
		// BUG: should never obtain empty display value
		lib.debug( namespace, 'Failed to obtain default display property for element ' +elem.nodeName);
	}
	
	if( property =='left' || property =='right' || property =='top' || property =='bottom') {
		if( ret =='auto')
			// make sure property always contains number
			ret ='0px';
	}
	
	if( property =='font-size')
		// normalize
		ret =parseFloat( ret).toFixed( 2) +'px';

	if( property =='line-height') {
		if( ret =='normal') {
			// return font size
			ret =GetCSSPropertyValue( elem, style, 'font-size');
			
		} else if( parseFloat( ret) <0) {
			// BUG: FF returns -1.XXXXXXe+7px value for line-height being set to 0px.
			//	Hit this bug in FF 3.5.5.
			//	Bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=536758
			
			// default to 0px
			ret ='0px';
		}
	}
		
	return ret;
};

// get computed CSS property values
if( styleModel ==StyleModel.W3C) {
	// W3C recommendation
	api.get =function( elem, properties) {
		
		if( properties ===undefined)
			// obtain all properties
			properties =supportedCSSProperties;
		
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
		
		if( properties ===undefined)
			// obtain all properties
			properties =supportedCSSProperties;
		
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
	// make property list
	var props ={};
	props[ property] =value;
	
	// set property values
	api.set( elem, props);
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
	if( lib.isString( arg2) && arg3 ===undefined)
		// read one property
		return cssRead( elem, arg2);
	
	if( lib.isArray( arg2) && arg3 ===undefined)
		// read multiple properties
		return cssRead( elem, arg2);
	
	// write properties
	return cssWrite( elem, arg2, arg3);
};

// get visibility status for an element
api.visibilityStatus =function( elem, recursive) {
	// default args
	if( recursive ===undefined)
		recursive =true;
	
	// load initial visibility info values
	var ret ={
		'display': true,
		'visible': true
	};
	
	while( elem.nodeType !==undefined && elem.nodeType ==lib.NodeType.ELEMENT_NODE) {
		var style =api.style( elem, ['display', 'visibility']);
		
		if( style.display =='none')
			ret.display =false;
		
		if( style.visibility =='hidden')
			ret.visible =false;
		
		if( recursive && elem.parentNode !==undefined && elem.parentNode !==null)
			elem =elem.parentNode;
		else
			break;
	}
	
	// return visibility status
	return ret;
};

// get visibility info for an element
api.visibilityInfo =function( elem) {
	return api.style( elem, ['display', 'visibility']);
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
		return api.queryMultiple( selectors);
		
	// context array specified
	if( context.length !==undefined) {
		// result storage
		var result =[];
		var found;
		var entry;
		
		// iterate over array of contexts
		for( var i =0; i < context.length; ++i) {
			// iterate result
			for( var x =0, found =api.queryMultiple( selectors, context[i]); x < found.length; ++x) {
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
	return api.queryMultiple( selectors, context);
};

// query single child element
api.queryOneChild =function( parent, selector) {
	// get id of context
	var contextId =lib.dom.getId( parent);
	
	// build selector of interest
	var selector ='#' +contextId +' ' +selector;
	
	// execute
	return api.queryOne( selector, parent.ownerDocument.documentElement);
};

// query multiple child elements
api.queryMultipleChildren =function( parent, selector) {
	// get id of context
	var contextId =lib.dom.getId( parent);
	
	// build selector of interest
	var selector ='#' +contextId +' ' +selector;
	
	// execute
	return api.queryMultiple( selector, parent.ownerDocument.documentElement);
};

// get element box sizing information
api.sizing =function( elem) {
	// get element computed dimensions
	var props =api.style( elem, [
		'width', 'height',
		'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
		'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
		'padding-left', 'padding-right', 'padding-top', 'padding-bottom'
	]);
	
	for( var k in props)
		// make sure all properties represent numbers
		props[ k] =parseInt( props[ k]);
		
	// return dimensions
	return props;
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
		
	// create node
	var el =document.createElement( nodeName);
	
	// append element to document
	document.documentElement.appendChild( el);
	
	// determine display, that was assigned to the element
	defaultDisplay[ nodeName] =disp =api.getOne( el, 'display');
	
	// remove node from document
	el.parentNode.removeChild( el);
	
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
	// set style attribute (css text)
	lib.attr.set( elem, 'style', css);
};

// clear element inline style
api.clearStyle =function( elem) {
	// clear style info
	lib.attr.set( elem, 'style', '');
};

// check if element is visible
api.visible =function( elem) {
	return api.visibilityInfo( elem).display !='none';
};

// hide element
api.hide =function( elems) {
	if( !lib.isArray( elems))
		elems =[ elems];
	
	for( var i =0; i < elems.length; ++i) {
		// reference element
		var elem =elems[ i];
		
		if( api.visibilityInfo( elem).display =='none')
			// already hidden
			continue;
		
		// store current display property
		lib.attr.set( elem, 'data-internal-old-display', api.getOne( elem, 'display'));
		
		// hide
		api.setOne( elem, 'display', 'none');
	}
};

// show element
api.show =function( elems) {

	if( !lib.isArray( elems))
		elems =[ elems];
	
	for( var i =0; i < elems.length; ++i) {
		// reference element
		var elem =elems[ i];

		if( api.visibilityInfo( elem).display !='none')
			// element is visible
			continue;
		
		// restore old display if property exists
		var oldDisplay =lib.attr.get( elem, 'data-internal-old-display');
		
		if( oldDisplay !==undefined) {
			// restore display
			api.setOne( elem, 'display', oldDisplay);
			
			// remove attribute
			lib.attr.remove( elem, 'data-internal-old-display');
			
		} else {
			// set default display
			api.setOne( elem, 'display', api.getDefaultDisplay( elem.nodeName));
		}
	}
};

// get scrollbar width and height (element should be overflown at the moment)
api.scrollbar =function( elem) {
	return {
		'width': elem.offsetWidth -elem.clientWidth,
		'height': elem.offsetHeight -elem.clientHeight
	};
};

// vaporize element. After vaporization, computed data is
//  still available and can be used for computations.
api.vaporize =function( elem) {
	// memorize following properties
	var mem =api.memorize( elem, ['position', 'visibility', 'display']);
	
	// modify
	api.style( elem, {
		'position': 'absolute',
		'visibility': 'hidden',
		'display': mem.display =='none' ? api.getDefaultDisplay( elem.nodeName) : mem.display
	});
};

// memorize specified list of properties on an element
api.memorize =function( elem, prop) {
	var memory;
	var ret;
	
	if( !lib.isArray( prop))
		var props =[ prop];
	else
		var props =prop;
	
	if( lib.data.has( elem, '__css_memory')) {
		// get available memory object
		memory =lib.data.get( elem, '__css_memory');
		
	} else {
		// initialize new memory array
		memory =[];
		
		// assign data memory
		lib.data.set( elem, '__css_memory', memory);
	}
	
	// push info
	memory.push( ret =api.style( elem, props));
	
	// return memorized object
	return ret;
};

// restore element's settings
api.restore =function( elem) {
	
	if( !lib.data.has( elem, '__css_memory'))
		// nothing to restore
		return;
	
	var memory =lib.data.get( elem, '__css_memory');
	
	if( memory.length ==0)
		// nothing to restore
		return;
	
	// restore element's state
	api.style( elem, memory.pop());
};

// get element's scrolling info
api.scrolling =function( elem) {

	// computations to return
	var ret ={
		'top': 0,
		'left': 0
	};

	if( elem ===undefined || elem ===elem.ownerDocument.documentElement || elem ===elem.ownerDocument.body) {
		// get document
		var d =(elem ===undefined ? document : elem.ownerDocument);

		// get scrolling
		ret.top =d.documentElement.scrollTop;
		ret.left =d.documentElement.scrollLeft;

		if( d.body !==undefined && d.body !==null) {
			// see if browser does not register scrolling on body element
			//  instead of HTML element
			if( ret.top < d.body.scrollTop)
				ret.top =d.body.scrollTop;
			if( ret.left < d.body.scrollLeft)
				ret.left =d.body.scrollLeft;
		}

	} else {
		// get element's scrolling
		ret.top =elem.scrollTop;
		ret.left =elem.scrollLeft;
	}

	// return computed scrolling
	return ret;
};

// get element's viewport information
api.viewport =function( elem) {
	
	if( elem.nodeType ==lib.NodeType.DOCUMENT_NODE)
		// if document passed in, use documentElement element instead
		elem =elem.documentElement;
	
	// get scrolling info
	var scrolling =api.scrolling( elem);

	return {
		'width': elem.clientWidth,
		'height': elem.clientHeight,
		'contentWidth': elem.scrollWidth,
		'contentHeight': elem.scrollHeight,
		'rect': {
			'top': scrolling.top,
			'left': scrolling.left,
			'bottom': scrolling.top +elem.clientHeight,
			'right': scrolling.left +elem.clientWidth
		}
	};
};

// get element's bounding rectangle on the viewport
api.rect =function( elem, box, clientElement) {
	// default args
	if( box ===undefined)
		box ='border-box';
	
	var rect =elem.getBoundingClientRect();
	var ret ={
		'left': rect.left,
		'top': rect.top,
		'bottom': rect.bottom,
		'right': rect.right
	};

	if( clientElement ===undefined || clientElement ===elem.ownerDocument || clientElement ===elem.ownerDocument.documentElement) {
		// get global fault (for IE7)
		var relativeRect =lib.bugs.clientBoundingRectFault();

	} else {
		// get rects of client element
		var relativeRect =clientElement.getBoundingClientRect();
	}

	// subtract offsets
	ret.top -=relativeRect.top;
	ret.bottom -=relativeRect.top;
	ret.left -=relativeRect.left;
	ret.right -=relativeRect.left;

	if( box =='padding-box' || box =='content-box') {
		// get borders
		var borders =api.style( elem, [
		  'border-left-width',
		  'border-right-width',
		  'border-top-width',
		  'border-bottom-width'
		]);

		// add borders
		ret.top +=parseInt( borders['border-top-width']);
		ret.left +=parseInt( borders['border-left-width']);

		// subtract borders
		ret.bottom -=parseInt( borders['border-bottom-width']);
		ret.right -=parseInt( borders['border-right-width']);
	}

	if( box =='content-box') {
		// get paddings
		var paddings =api.style( elem, [
		  'padding-left',
		  'padding-right',
		  'padding-top',
		  'padding-bottom'
		]);

		// add paddings
		ret.top +=parseInt( paddings['padding-top']);
		ret.left +=parseInt( paddings['padding-left']);

		// subtract paddings
		ret.bottom -=parseInt( paddings['padding-bottom']);
		ret.right -=parseInt( paddings['padding-right']);
	}
	
	// return computed rect
	return ret;
}

// get element's offset
api.offset =function( elem, newPos) {
	
	if( newPos ===undefined) {
		// get current offset
		var ret =api.style( elem, ['left', 'top']);
		
		ret.left =parseInt( ret.left);
		ret.top =parseInt( ret.top);
		
		return ret;
		
	} else {
		// set new offset
		api.style( elem, {
			'left': newPos.left +'px',
			'top': newPos.top +'px'
		});
	}
};

// get element's position on the screen
api.position =function( elem, withScrolling, viewportElement) {
	// default args
	if( withScrolling ===undefined)
		withScrolling =false;
	if( viewportElement ===undefined)
		viewportElement =elem.ownerDocument;
	
	// get element's initial offset
	var ret ={
		'left': elem.offsetLeft,
		'top': elem.offsetTop
	};
	
	var parent =elem;
	var offsetParent =elem.offsetParent;
	
	while( true) {
		if( parent.parentNode ===undefined)
			break;
		if( parent.parentNode ===null)
			break;
		
		// reference parent node
		parent =parent.parentNode;
		
		if( parent ===viewportElement)
			break;
		
		if( withScrolling) {
			ret.top -=parent.scrollTop;
			ret.left -=parent.scrollLeft;
		}
		
		if( offsetParent ===parent) {
			// offset parent has been met
			ret.top +=parent.offsetTop;
			ret.left +=parent.offsetLeft;
			
			// pick next offset parent in the tree
			offsetParent =parent.offsetParent;
		}
	}
	
	// return data
	return ret;
};

// copy properties from one element to another
api.copy =function( source, target, props) {
	api.style( target, api.style( source, props));
};

// compute offset for view
api.computeOffsetIntoView =function( elem, alignX, alignY, viewportElement) {
	// default args
	if( viewportElement ===undefined)
		// use document as viewport element by default
		viewportElement =elem.ownerDocument;
	
	// get viewport's info
	var vp =api.viewport( viewportElement);
	
	// get element's box
	var box =api.box( elem);
	
	// compute full width and height
	var width =box.dim['border-left-width'] +box.dim['padding-left'] +box.dim['width'] +box.dim['padding-right'] +box.dim['border-right-width'];
	var height =box.dim['border-top-width'] +box.dim['padding-top'] +box.dim['height'] +box.dim['padding-bottom'] +box.dim['border-bottom-width'];

	// subtract margins from viewport (shrink viewport by margin size)
	vp.rect.top +=box.dim['margin-top'];
	vp.rect.bottom -=box.dim['margin-bottom'];
	vp.rect.left +=box.dim['margin-left'];
	vp.rect.right -=box.dim['margin-right'];
	
	// get element's position on the viewport
	var pos =api.position( elem, undefined, viewportElement);
	
	// get element's offset on the viewport
	var offset =api.offset( elem);
	
	var diff ={
		'top': pos.top -vp.rect.top,
		'bottom': vp.rect.bottom - (pos.top +height),
		'left': pos.left -vp.rect.left,
		'right': vp.rect.right - (pos.left +width)
	};
	
	var fitsByX =((diff.left +diff.right) >=0);
	var fitsByY =((diff.top +diff.bottom) >=0);
		
	if( fitsByX || alignX ===undefined) {
		// horizontal alignment does not matter
		if( diff.left < 0) {
			offset.left -=diff.left;
			pos.left -=diff.left;
			
		} else if( diff.right < 0) {
			offset.left +=diff.right;
			pos.left +=diff.right;
		}
		
	} else if( alignX =='left') {
		// align with left border
		if( diff.left < 0 || diff.right < 0) {
			offset.left -=diff.left;
			pos.left -=diff.left;
		}
		
	} else {
		// align with right border
		if( diff.right < 0 || diff.left < 0) {
			offset.left +=diff.right;
			pos.left +=diff.right;
		}
	}
	
	if( fitsByY || alignY ===undefined) {
		// vertical alignment does not matter
		if( diff.top < 0) {
			offset.top -=diff.top;
			pos.top -=diff.top;
			
		} else if( diff.bottom < 0) {
			offset.top +=diff.bottom;
			pos.top +=diff.bottom;
		}
	
	} else if( alignY =='top') {
		// align with top border
		if( diff.top < 0 || diff.bottom < 0) {
			offset.top -=diff.top;
			pos.top -=diff.top;
		}
		
	} else {
		// align with bottom border
		if( diff.bottom < 0 || diff.top < 0) {
			offset.top +=diff.bottom;
			pos.top +=diff.bottom;
		}
	}
	
	// return info
	return {
		'offset': offset,
		'availSpace': {
			'top': pos.top -vp.rect.top,
			'left': pos.left -vp.rect.left,
			'bottom': vp.rect.bottom - ( pos.top +height),
			'right': vp.rect.right - ( pos.left +width)
		}
	};
};

})( EVOLIB_EXPORT, 'css');