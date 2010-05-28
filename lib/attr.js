
(function( lib, namespace){

// define api
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

// get element attribute
function GetElementAttributeValue( elem, attr) {
	
	if( elem.nodeType !=lib.NodeType.ELEMENT_NODE)
		// no attributes for non-element nodes
		return undefined;
	
	var skipProperty =false;
	
	if( attr =='class' && lib.bugs.classAttributeMissesClassName())
		// return class name property's value
		return elem.className;
	
	if( attr =='style') {
		if( lib.bugs.styleAttributeUsesObject()) {
			// obtain style string from object
			return elem.style.cssText;
			
		} else {
			// obtain value from attribute
			skipProperty =true;
		}
	}
	
	if( attr =='selected' && elem.nodeName =='OPTION' && lib.bugs.selectedIndexSelectsOption())
		// touch .selectedIndex property on SELECT element
		elem.parentNode && (elem.parentNode.selectedIndex || (elem.parentNode.parentNode && elem.parentNode.parentNode.selectedIndex));
	
	if( !skipProperty && elem[ attr] !==undefined)
		// return property
		return elem[ attr];
	
	var value =elem.getAttribute( attr);
	
	if( value ===null)
		return undefined;
	else
		// return attribute
		return value;
}

// get attribute

// get( elem, '');
// get( elem, []);
api.get =function( elem, attr) {

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
	
	if( elem.nodeType !=lib.NodeType.ELEMENT_NODE)
		// no attributes for non-element nodes
		return undefined;
	
	var skipProperty =false;
	
	if( attr =='class' && lib.bugs.classAttributeMissesClassName())
		// assign class name property's value
		return elem.className =value;
	
	if( attr =='style') {
		if( lib.bugs.styleAttributeUsesObject()) {
			// assign css text
			return elem.style.cssText =value;
			
		} else {
			// assign attribute
			skipProperty =true;
		}
	}
	
	if( !skipProperty && elem[ attr] !==undefined)
		// assign property's value
		return elem[ attr] =value;
	
	// assign attribute's value
	elem.setAttribute( attr, value);
}

// set attribute(-s)

// set( elems, attr, value);
// set( elem, attr, value);
// set( elems, {});
// set( elem, {});
api.set =function( elem, attr, value) {
	
	if( lib.isArray( elem) || lib.isCollection( elem)) {
		// iterate list of elements
		for( var i =0; i < elem.length; ++i)
			api.set( elem[ i], attr, value);
		return;
	}
		
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
	for( i =0; i < removeAttrs.length; ++i)
		// remove attribute
		elem.removeAttribute( removeAttrs[ i]);
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