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

// dependencies: event, dom

// import classes
var ErrorException =lib.classref( 'ErrorException');

// see if mouseenter event is supported natively
if( lib.event.nativeEvents[ 'mouseenter'].supported && lib.event.nativeEvents[ 'mouseleave'].supported)
  // mouseenter & mouseleave are supported
  return;
  
// make sure there is not situation when only one of events is supported
lib.assert( !lib.event.nativeEvents['mouseenter'].supported, namespace, 'mouseleave event is supported while mouseenter is not');
lib.assert( !lib.event.nativeEvents['mouseleave'].supported, namespace, 'mouseenter event is supported while mouseleave is not');

// custom event : mouseenter
var MouseEnterEvent;

with( MouseEnterEvent =function(){}) {
  // does not bubble
  prototype.bubbles =false;
  // is not cancelable
  prototype.cancelable =false;
  
  // remember current element
  prototype.elem =null;
  
  // mouse over handle
  prototype.handleMouseOver =null;
  
  // event instance has been attached
  prototype.attach =function( elem) {
    // store element reference
    this.elem =elem;
    
    // create reference to object
    var self =this;
    
    // handle all mouseover events
    lib.event.bind( elem, 'mouseover', this.handleMouseOver =function( e){
      
      //lib.debug( namespace, 'mouseover: ' +e.relatedTarget.getAttribute( 'id') +' -> ' +e.target.getAttribute( 'id'));
      
      // see if it's a moment to trigger mouseenter
      if( e.relatedTarget !==null && lib.dom.isDescendantOf( e.relatedTarget, elem, true))
        return;
        
      // trigger mouseenter on an element
      lib.event.trigger( elem, 'mouseenter');
      
    });
  };
  
  // event instance has been detached
  prototype.detach =function() {
    // remove mouseover listener
    lib.event.unbind( this.elem, 'mouseover', this.handleMouseOver);
  };
}

// add 'mouseenter' event
lib.event.custom.add( 'mouseenter', MouseEnterEvent);

// custom event : mouseleave
var MouseLeaveEvent;

with( MouseLeaveEvent =function(){}) {
  // does not bubble
  prototype.bubbles =false;
  // is not cancelable
  prototype.cancelable =false;
  
  // remember current element
  prototype.elem =null;
  
  // mouse over handle
  prototype.handleMouseOut =null;
  
  // event instance has been attached
  prototype.attach =function( elem) {
    // store element reference
    this.elem =elem;
    
    // create reference to object
    var self =this;
    
    // handle all mouseover events
    lib.event.bind( elem, 'mouseout', this.handleMouseOut =function( e){
      
      //lib.debug( namespace, 'mouseout: ' +e.target.getAttribute( 'id') +' -> ' +e.relatedTarget.getAttribute( 'id'));
      
      // see if it's a moment to trigger mouseenter
      if( e.relatedTarget !==null && lib.dom.isDescendantOf( e.relatedTarget, elem, true))
        return;
        
      // trigger mouseleave on an element
      lib.event.trigger( elem, 'mouseleave');
      
    });
  };
  
  // event instance has been detached
  prototype.detach =function() {
    // remove mouseout listener
    lib.event.unbind( this.elem, 'mouseout', this.handleMouseOut);
  };
}

// add 'mouseleave' event
lib.event.custom.add( 'mouseleave', MouseLeaveEvent);

})( __NAMESPACE__, 'event.mouseenter_mouseleave');