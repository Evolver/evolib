
(function( lib, namespace){

// define api
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

// determine if .selected property is correctly working since it is failing
//	in IE and Safari if <SELECT>.selectedIndex was never accessed.
var SelectedIndexBeforeOptionSelected =document.createElement( 'select').appendChild( document.createElement( 'option')).selected;

// attributes that do not need to be seeked in property list
var noPropertyAttrs ={
	'style': true
};

// get element attribute
function GetElementAttributeValue( elem, attr) {
	// see which attribute requested

	if( attr =='selected') {
		if( !SelectedIndexBeforeOptionSelected) {
			// we need to access selectedIndex before using .selected property
			elem.parentNode && (elem.parentNode.selectedIndex || (elem.parentNode.parentNode && elem.parentNode.parentNode.selectedIndex));
			
			// the algorithm above accesses elem.parentNode first, and if access was successul, then tries to access
			//	parentNode.selectedIndex. If selectedIndex attempt was not successful, then tries to access
			//	parentNode.parentNode.selectedIndex (in case option is in optgroup).
		}
	}
	
	// test if attribute is accessible through elem[attr]
	if( !noPropertyAttrs[ attr] && elem[ attr] !==undefined)
		// return attribute value
		return elem[ attr];
		
	// see if attribute is explicitly set
	var ret =elem.getAttribute( attr);
	
	// see if attribute was specified
	if( ret ===null)
		// value for this attribute is undefined
		return undefined;
	
	// just return value of attribute
	return ret;
}

// get attribute

// get( elem, '');
// get( elem, []);
api.get =function( elem, attr) {
	// see what type of node is passed in
	if( elem.nodeType !=lib.dom.NodeType.ELEMENT_NODE)
		// do not get attributes from anything other than element nodes
		throw new ErrorException( 'Unable to obtain attributes from non-element nodes');
		
	// see if array of attributes specified
	if( lib.isArray( attr)) {
		// obtain list of attributes
		var ret ={};
		
		// gather attribute values
		var i;
		var p;
		for( i =0; i < attr.length; ++i)
			ret[ p =attr[ i]] =GetElementAttributeValue( elem, p);
			
		// return object with attribute values
		return ret;
	}
	
	// return single attribute value
	return GetElementAttributeValue( elem, attr);
};

// set element attribute
function SetElementAttributeValue( elem, attr, value) {
	// see which attribute should be set
	
	// test if attribute is accessible through elem[attr]
	if( !noPropertyAttrs[ attr] && elem[ attr] !==undefined) {
		// assign attribute value
		elem[ attr] =value;
		return;
	}
	
	// assign attribute value by creating new attribute
	elem.setAttribute( attr, value);
}

// set attribute

// set( elem, attr, value);
// set( elem, {});
api.set =function( elem, attr, value) {
	// see what type of node is passed in
	if( elem.nodeType !=lib.dom.NodeType.ELEMENT_NODE)
		// do not set attributes to anything other than element nodes
		throw new ErrorException( 'Unable to set attributes to non-element nodes');
		
	// build list of attributes to update
	var updateAttrs;
	// see if object of attributes passed in
	if( lib.isObject( attr)) {
		// assign object passed in
		updateAttrs =attr;
		
	} else {
		// create object and set single attribute
		// to update.
		updateAttrs ={};
		updateAttrs[ attr] =value;
	}
	
	// update attributes one by one
	var p;
	for( p in updateAttrs)
		// set attribute
		SetElementAttributeValue( elem, p, updateAttrs[ p]);
};

// remove attribute

// remove( elem, attr);
// remove( elem, []);
api.remove =function( elem, attr) {
	// build list of attributes to remove
	var removeAttrs;
	if( lib.isArray( attr))
		removeAttrs =attr;
	else
		removeAttrs =[ attr];
		
	// remove attributes one by one
	var i, p;
	for( i =0; i < removeAttrs.length; ++i) {
		p =removeAttrs[ i];

		// see if attribute can be removed
		if( !noPropertyAttrs[ p] && elem[ p] !==undefined)
			throw new ErrorException( 'Attribute "' +p +'" can not be removed');

		// remove attribute
		elem.removeAttribute( p);
	}
};

// check if element has an attribute(s)
api.has =function( elem, attr) {
	var testAttrs;
	// see if array of attributes specified
	if( lib.isArray( attr))
		testAttrs =attr;
	else
		testAttrs =[ attr];
		
	// check if all attributes are present
	var i, p;
	for( i =0; i < testAttrs.length; ++i) {
		// test if property exists on an element
		if( elem[ p =testAttrs[ i]] !==undefined)
			continue;
			
		// property does not exist, test if attribute
		// exists
		if( elem.getAttribute( p) !==null)
			continue;
			
		// attribute not found
		return false;
	}
	
	// all attributes present
	return true;
};

// check if class is added on an element
api.hasClass =function( elem, className) {
	// see if array of classes specified
	if( lib.isArray( className)) {
		// if all classes are present, return true, otherwise return false
		var i;
		for( i =0; i < className.length; ++i) {
			if( !api.hasClass( elem, className[ i]))
				return false;
		}
		// got all classes
		return true;
	}
	
	// seek for occurence of className within element's class attr
	return (' ' +elem.className +' ').indexOf( ' ' +className +' ') !==-1;
};

// add class to element's class list
api.addClass =function( elem, className) {
	// get current class list
	var classList =api.getClassList( elem);
	var addClasses;
	
	// add classes one by one if array of classes passed in
	if( lib.isArray( className)) {
		addClasses =className;
		
	} else {
		// add single class
		addClasses =[ className];
	}
	
	// add classes
	var i;
	for( i =0; i < addClasses.length; ++i) {
		// see if class already added
		if( lib.inArray( className =addClasses[ i], classList))
			continue;
			
		// add class
		classList.push( className);
	}
	
	// assign new class list for an element
	api.setClassList( elem, classList);
};

// get class list
api.getClassList =function( elem) {
	if( elem.className =='')
		// class list is empty
		return new Array;
	
	// got classes, return list of them
	return elem.className.split( ' ');
};

// set class list
api.setClassList =function( elem, classList) {
	return elem.className =classList.join( ' ');
};

// remove class from an element
api.removeClass =function( elem, className) {
	// get class list
	var classList =api.getClassList( elem);
	var removeClasses;
	
	// see if array of classes passed in
	if( lib.isArray( className))
		removeClasses =className;
	else
		removeClasses =[ className];
		
	// remove classes one by one
	var i, c;
	for( i =0; i < classList.length; ++i) {
		for( c =0; c < removeClasses.length; ++c) {
			if( classList[ i] ==removeClasses[ c]) {
				// remove class entry
				classList.splice( i--, 1);
				break;
			}
		}
	}
	
	// assign new class list
	api.setClassList( elem, classList);
};
	
})( EVOLIB_EXPORT, 'attr');