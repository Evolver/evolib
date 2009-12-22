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

(function( lib){

// dependencies: event, dom

// import classes
var ErrorException =lib.classref( 'Error');

// see if mouseleave event is supported natively
if( lib.event.nativeEvents[ 'mouseleave'].supported)
  return;

// custom event : mouseleave
var MouseLeaveEvent;

with( MouseLeaveEvent =function(){}) {
  // does not bubble
  prototype.bubbles =false;
  // is not cancelable
  prototype.cancelable =false;
  
  // elements and their handlers
  prototype.elems =[];
  
  // handle mouse over
  prototype.handleMouseOut =function( e) {
    // see if it's a moment to trigger mouseleave
    if( !lib.dom.isDescendantOf( e.currentTarget, e.relatedTarget))
      return;
      
    // trigger mouseenter on an element
    lib.event.trigger( e.currentTarget, 'mouseleave');
  };
  
  // find element entry by element
  prototype.findElem =function( elem) {
    var elems =this.elems;
    var i;
    var entry;
    for( i =0; i < elems.length; ++i) {
      // reference entry
      entry =elems[ i];
      
      // entry found, return it
      if( entry.elem ===elem)
        return entry;
    }
    
    // entry not found
    throw new ErrorException( 'Entry was not found');
  };
  
  // event instance has been attached
  prototype.attach =function( elem) {
    // add new element entry
    this.elems.push({
      'elem': elem,
      'handlers': []
    });
    
    // handle all mouseover events
    lib.event.bind( elem, 'mouseout', this.handleMouseOut);
  };
  
  // add event handler
  prototype.bind =function( elem, handler, capture) {
    // add new handler
    this.findElem( elem).handlers.push({
      'handler': handler,
      'capture': capture
    });
  };
  
  // remove event handler
  prototype.unbind =function( elem, handler, capture) {
    var handlers =this.findElem( elem).handlers;
    var i;
    var handler;
    for( i =0; i < handlers.length; ++i) {
      handler =handlers[ i];
      
      // handler found, remove it
      if( handler.handler ===handler && handler.capture ===capture) {
        handlers.splice( i, 1);
        break;
      }
    }
  };
  
  // event instance has been detached
  prototype.detach =function( elem) {
    // remove mouseover listener
    lib.event.unbind( elem, 'mouseout', this.handleMouseOut);
    
    // remove element
    var elems =this.elems;
    var i;
    for( i =0; i < elems.length; ++i) {
      // element found, remove it's associated handlers
      if( elems[ i].elem ===elem) {
        elems.splice( i, 1);
        break;
      }
    }
  };
}

// add 'mouseenter' event
lib.event.custom.add( 'mouseleave', MouseLeaveEvent);

})( __NAMESPACE__);