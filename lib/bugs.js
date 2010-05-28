
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
var propertyDeletionUnsupported =undefined;

// determine whether property deletion throws exception
api.propertyDeletionUnsupported =function() {
	if( propertyDeletionUnsupported !==undefined)
		return propertyDeletionUnsupported;
	
	var el =GetDummy( 'DIV');
	el.__testAttribute =5;
	
	var thrown =false;
	
	try {
		delete el.__testAttribute;
		
	} catch( e) {
		thrown =true;
	}
	
	return propertyDeletionUnsupported =thrown;
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

})( EVOLIB_EXPORT);