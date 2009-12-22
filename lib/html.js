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
  
// define api
var api =lib.namespace( namespace), undefined;

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
  
})( __NAMESPACE__, 'html');