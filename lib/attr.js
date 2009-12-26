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

// get attribute

// get( elem, '');
// get( elem, []);
api.get =function( elem, attr) {
  
};

// set attribute

// set( elem, attr, value);
// set( elem, {});
api.set =function( elem, attr, value) {
  
};

// remove attribute

// remove( elem, attr);
// remove( elem, []);
api.remove =function( elem, attr) {
  
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
  
})( __NAMESPACE__, 'attr');