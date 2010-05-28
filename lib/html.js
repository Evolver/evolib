
(function( lib, namespace){
	
// define api
var api =lib.namespace( namespace), undefined;

// dependencies: dom

//import classes
var ErrorException =lib.classref( 'ErrorException');

// element to hold text node
var escapeDiv =null;

// text node to hold html to be escaped
var escapeTextNode =null;

// get escaped html code
api.escape =function( html) {
	// see if escaping elements was initialized
	if( escapeDiv ===null) {
		// initialize elements
		escapeDiv =document.createElement( 'DIV');
		escapeTextNode =document.createTextNode( html);
		
		// put text node inside created div
		escapeDiv.appendChild( escapeTextNode);
		
	} else {
		// assign text to text node
		escapeTextNode.data =html;
	}
	
	// return escaped html
	return escapeDiv.innerHTML;
};

// text node to hold the html to be stripped
var stripDiv =null;

// get text from specified html code
api.strip =function( html) {
	// see if stripping method was initialized
	if( stripDiv ===null) {
		// initialize
		stripDiv =document.createElement( 'DIV');
	}
	
	// assign inner html
	stripDiv.innerHTML =html;
	
	if( stripDiv.textContent !==undefined)
		return stripDiv.textContent;
		
	if( stripDiv.innerText !==undefined)
		return stripDiv.innerText;
	
	// failed to strip
	return undefined;
};

// set inner html code of element
api.set =function( elem, html) {
	// empty element
	api.empty( elem);
	
	// append inner html
	api.append( elem, html);
};

// get inner html code of element
api.get =function( elem) {
	// obtain
	return elem.innerHTML;
};

// append html code to the element
api.insert =function( elem, html, append) {
	if( append ===undefined)
		append =true;
		
	// create DIV element to hold HTML code
	var div =document.createElement( 'DIV');
	// assign inner HTML
	div.innerHTML =html;
	
	if( append) {
		// append all childnodes one by one
		lib.dom.appendChildren( elem, div);
			
	} else {
		// prepend all nodes to the beginning
		lib.dom.prependChildren( elem, div);
	}
	
	// html code inserted
};

// prepend html code to the element
api.append =function( elem, html) {
	api.insert( elem, html, true);
};

// prepend html code to the element
api.prepend =function( elem, html) {
	api.insert( elem, html, false);
};

// empty element
api.empty =function( elem) {
	// remove all child nodes of element
	while( elem.firstChild)
		lib.dom.remove( elem.firstChild);
};

// get text content
api.getText =function( elem) {
	if( elem.textContent !==undefined)
		return elem.textContent;
	else
		return elem.innerText;
};

// set text content
api.setText =function( elem, text) {
	// empty
	api.empty( elem);
	
	// append
	api.appendText( elem, text);
};

// insert text content
api.insertText =function( elem, text, append) {
	if( append ===undefined)
		append =true;
	
	if( elem.textContent !==undefined)
		elem.textContent =append ? elem.textContent + text : text + elem.textContent;
	else
		elem.innerText =append ? elem.innerText + text : text + elem.innerText;
};

// append text
api.appendText =function( elem, text) {
	api.insertText( elem, text, true);
};

// prepend text
api.prependText =function( elem, text) {
	api.insertText( elem, text, false);
};
	
})( EVOLIB_EXPORT, 'html');