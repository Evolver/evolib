
// EVOLIB_EXPORT global variable is the reference to an object, that should
//	hold library's exported APIs. By default library exports it's API to
//	window.evolver object.
var EVOLIB_EXPORT =window.evolver ={};

(function( lib){

// define api
var api =lib.bugs ={}, undefined;

// list of dummy objects
var dummy ={};

// function to obtain dummy element
function GetDummy( nodeName) {
	if( dummy[ nodeName] ===undefined)
		return dummy[ nodeName] =document.createElement( nodeName);
	
	// return dummy object
	return dummy[ nodeName];
};

// cached result
var propertyCreatesAttribute =undefined;

// determine whether creation of element property forces
//  DOM attribute to be created on element.
api.propertyCreatesAttribute =function() {
	if( propertyCreatesAttribute !==undefined)
		return propertyCreatesAttribute;
	
	var el =GetDummy( 'DIV');
	el.__testAttribute =5;
	
	propertyCreatesAttribute =el.getAttribute( '__testAttribute') ===5;
	
	if( api.throwsOnPropertyDelete())
		// mark as undefined
		el.__testAttribute =undefined;
	else
		delete el.__testAttribute;
};

// cached result
var propertyDeletionThrowsException =undefined;

// determine whether property deletion throws exception
api.propertyDeletionThrowsException =function() {
	if( propertyDeletionThrowsException !==undefined)
		return propertyDeletionThrowsException;
	
	var el =GetDummy( 'DIV');
	el.__testAttribute =5;
	
	var thrown =false;
	
	try {
		delete el.__testAttribute;
		
	} catch( e) {
		thrown =true;
	}
	
	return propertyDeletionThrowsException =thrown;
};

// cached result
var styleAttributeUsesObject =undefined;

// determine whether style attribute returns object
api.styleAttributeUsesObject =function() {
	if( styleAttributeUsesObject !==undefined)
		return styleAttributeUsesObject;
	
	return styleAttributeUsesObject =(typeof GetDummy( 'DIV').getAttribute( 'style') ==='object');
};

// cached result
var classAttributeMissesClassName =undefined;

// determine whether assigning class attribute does not
//  update className property of object.
api.classAttributeMissesClassName =function() {
	if( classAttributeMissesClassName !==undefined)
		return classAttributeMissesClassName;
	
	var el =GetDummy( 'DIV');
	el.className ='';
	el.setAttribute( 'class', '__testClass');
	
	return classAttributeMissesClassName =( el.getAttribute( 'class') !==el.className);
};

// cached result
var selectedIndexSelectsOption =undefined;

// determine whether <SELECT>.selectedIndex needs to be accessed
//  before obtaining selected property or attribute on <OPTION>
//  element.
api.selectedIndexSelectsOption =function() {
	if( selectedIndexSelectsOption !==undefined)
		return selectedIndexSelectsOption;
	
	return selectedIndexSelectsOption =!(document.createElement( 'SELECT').appendChild( document.createElement( 'OPTION')).selected);
};

// cached result
var removeChildPreservesParentNode =undefined;

// determine whether removeChild sets element's parentNode to null.
api.removeChildPreservesParentNode =function() {
	if( removeChildPreservesParentNode !==undefined)
		return removeChildPreservesParentNode;
	
	var dummy =GetDummy( 'DIV');
	
	// append and remove dummy
	document.documentElement.appendChild( dummy).parentNode.removeChild( dummy);
	
	return removeChildPreservesParentNode =(dummy.parentNode !==null);
};

// cached result
var zIndexAutoUnsupported =undefined;

// determine whether z-index: 'auto' is supported.
api.zIndexAutoUnsupported =function() {
	if( zIndexAutoUnsupported !==undefined)
		return zIndexAutoUnsupported;
	
	var dummy =GetDummy( 'DIV');
	
	dummy.style.zIndex ='auto';
	
	return zIndexAutoUnsupported =(dummy.style.zIndex !=='auto');
};

// cached result
var clientBoundingRectFault =undefined;

// determine bounding client rect fault
api.clientBoundingRectFault =function() {
	if( clientBoundingRectFault !==undefined)
		return clientBoundingRectFault;
	
	var scrollTop =document.documentElement.scrollTop || ( document.body && document.body.scrollTop);
	var scrollLeft =document.documentElement.scrollLeft || ( document.body && document.body.scrollLeft);

	window.scrollTo( 0, 0);
	var rect =document.documentElement.getBoundingClientRect();
	window.scrollTo( scrollLeft, scrollTop);
	
	// return computation result
	return clientBoundingRectFault ={
		'left': rect.left < 0 ? 0 : rect.left,
		'top': rect.top < 0 ? 0 : rect.left
	};
};

})( EVOLIB_EXPORT);