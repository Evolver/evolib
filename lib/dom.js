
(function( lib, namespace){
	
// declare namespace
var api =lib.namespace( namespace), undefined;

// node types
var NodeType =lib.NodeType;

// see if element is within DOM
api.inDOM =function( node) {
	// W3C
	if( node.parentNode ===null)
		return false;// not present in DOM
		
	// BUG: IE does not set parentNode to null 
	//	after removing element from DOM, so we
	//	need to check is element is present
	//	within childnodes of parent element,
	//	and if is, remove node.
	if( lib.bugs.removeChildPreservesParentNode()) {
		// reference parent element
		var parent =node.parentNode;
		
		// see if parent is equal to node's document
		if( parent.nodeType ==NodeType.DOCUMENT_NODE || parent.nodeType ==NodeType.DOCUMENT_FRAGMENT_NODE)
			// node's parentNode is equal to node's owner document,
			// it means that node is not within DOM
			return false;
			
		var i, found =false;
		for( i =0; i < parent.childNodes.length; ++i) {
			if( parent.childNodes[i] ==node) {
				found =true;
				break;
			}
		}
		
		// see if node is within .childNodes of parent
		if( !found)
			// node not found within parent node,
			// it meants that node is not in DOM.
			return false;
	}
	
	// present in DOM
	return true;
};

// remove element from DOM
function RemoveNode( node) {
	// element can be removed from DOM?
	if( node.parentNode ===undefined)
		throw 'Element can not be removed from DOM';
		
	// is element already removed from DOM?
	if( !api.inDOM( node))
		// not present in DOM
		return false;
	
	// remove node
	node.parentNode.removeChild( node);
	
	// node removed
	return true;
};

// remove single element
function RemoveSingle( elem) {
	// remove all child nodes first
	while( elem.firstChild)
		// remove each child node
		RemoveSingle( elem.firstChild);
		
	// try to remove node from DOM
	if( !RemoveNode( elem))
		// node already removed from DOM
		return;

	if( lib.event !==undefined && elem.nodeType ==NodeType.ELEMENT_NODE) {
		// remove associated event listeners
		lib.event.unbind( elem);
	}
	
	if( lib.data !==undefined) {
		// remove associated data
		lib.data.remove( elem);
	}
}

// remove multiple elements
function RemoveMultiple( elems) {
	// iterate array of elements
	for( var i =0; i < elems.length; ++i)
		// remove nodes one by one
		RemoveSingle( elems[ i]);
}

// check if node is descendant of another node

//	isDescendantOf( elem, parent) - check if elem is descendant of parent
//	isDescendantOf( elem, parent, true) - also check of elem ==parent
api.isDescendantOf =function( elem, parent, allowEq) {
	// default args
	if( allowEq ===undefined)
		allowEq =false;
	
	if( allowEq && elem ==parent)
		return true;
		
	try {
		if( elem.parentNode ===undefined)
			return false;
		
	} catch( e) {
		// IE barks if you access undefined property
		//	for some objects.
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

// get element's window object
api.getElementWindow =function( elem) {
	if( elem.navigator !==undefined && elem.location !==undefined)
		// got window itself
		return elem;
	
	if( elem.defaultView !==undefined)
		// element has window assigned
		return elem.defaultView;
	
	var doc;
	if( elem.ownerDocument !==undefined)
		doc =elem.ownerDocument;// DOMElement
	else if( elem.document !==undefined)
		doc =elem.document;// old IE browsers
	else if( elem.getElementById !==undefined)
		doc =elem;// document
	else
		// don't know what's this
		return undefined;
		
	if( doc.defaultView !==undefined)
		return doc.defaultView;// W3C
	else if( doc.parentWindow !==undefined)
		return doc.parentWindow;// IE
	else
		return undefined;// ???
};

// get element's document object
api.getElementDocument =function( elem) {
	if( elem.ownerDocument !==undefined)
		// W3C
		return elem.ownerDocument;
	else if( elem.document !==undefined)
		// old IE browsers
		return elem.document;
	else
		// ???
		return undefined;
};

// create new element
api.create =function( elementName, doc) {
	return ( doc ? doc : document).createElement( elementName);
};

// remove element from DOM
api.remove =function( elem) {
	if( elem ===undefined)
		// nothing to remove
		return;
	
	if( lib.isArray( elem) || lib.isCollection( elem))
		// remove multiple elements
		RemoveMultiple( elem);
	else
		// remove single element
		RemoveSingle( elem);
};

// append children of one element to another element
api.appendChildren =function( targElem, sourceElem) {
	// append all childnodes one by one
	while( sourceElem.firstChild)
		targElem.appendChild( sourceElem.firstChild);
};

// prepend children of one element to another element
api.prependChildren =function( targElem, sourceElem) {
	// prepend all nodes to the beginning
	while( sourceElem.lastChild) {
		if( targElem.firstChild ===null)
			// append child because no subnodes available
			targElem.appendChild( sourceElem.lastChild);
		else
			// insert node before first child
			targElem.insertBefore( sourceElem.lastChild, targElem.firstChild);
	}
};

// get form element of target element
api.getForm =function( elem) {
	var f =elem;
	
	while( f.parentNode !==undefined && f.parentNode !==null) {
		f =f.parentNode;
		
		if( f.nodeName =='FORM')
			// return form element
			return f;
	}
	
	// not found
	return undefined;
};

})( EVOLIB_EXPORT, 'dom');