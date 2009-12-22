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

// import error exception
var ErrorException =lib.classref( 'Error');

// dependencies: event

// test for BUG in IE: after removeChild() called, element's parentNode is not being
// set to null in some cases.
var div =document.createElement( 'DIV');
document.documentElement.appendChild( div);
document.documentElement.removeChild( div);
// remember bug state
var hasParentNodeBug =(div.parentNode !==null);

// clean up
delete div;

// node types
var NodeType =api.NodeType ={
  'ELEMENT_NODE': 1,
  'ATTRIBUTE_NODE': 2,
  'TEXT_NODE': 3,
  'CDATA_SECTION_NODE': 4,
  'ENTITY_REFERENCE_NODE': 5,
  'ENTITY_NODE': 6,
  'PROCESSING_INSTRUCTION_NODE': 7,
  'COMMENT_NODE': 8,
  'DOCUMENT_NODE': 9,
  'DOCUMENT_TYPE_NODE': 10,
  'DOCUMENT_FRAGMENT_NODE': 11,
  'NOTATION_NODE': 12
};

// see if element is within DOM
api.inDOM =function( node) {
  // W3C
  if( node.parentNode ===null)
    return false;// not present in DOM
    
  // BUG: IE does not set parentNode to null 
  //  after removing element from DOM, so we
  //  need to check is element is present
  //  within childnodes of parent element,
  //  and if is, remove node.
  if( hasParentNodeBug) {
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
    throw new ErrorException( 'Element can not be removed from DOM');
    
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
function removeSingle( elem) {
  // remove all child nodes first
  while( elem.firstChild)
    // remove each child node
    removeSingle( elem.firstChild);
    
  // try to remove node from DOM
  if( !RemoveNode( elem))
    // node already removed from DOM
    return;

  // fire remove event on dom nodes
  if( elem.nodeType ==NodeType.ELEMENT_NODE)
    // do not propagate event
    lib.event.trigger( elem, 'remove');
}

// remove multiple elements
function removeMultiple( elems) {
  // iterate array of elements
  for( var i =0; i < elems.length; ++i)
    // remove nodes one by one
    removeSingle( elems[ i]);
}

// check if node is descendant of another node

//  isDescendantOf( elem, parent) - check if elem is descendant of parent
//  isDescendantOf( elem, parent, true) - also check of elem ==parent
api.isDescendantOf =function( elem, parent, allowEq) {
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

// get element's window object
api.getElementWindow =function( elem) {
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
  if( lib.isArray( elem))
    // remove multiple elements
    removeMultiple( elem);
  else
    // remove single element
    removeSingle( elem);
};

})( __NAMESPACE__, 'dom');