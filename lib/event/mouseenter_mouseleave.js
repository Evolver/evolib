
(function( lib, namespace){

var undefined;

if( lib.event ===undefined)
	throw 'lib.event is required by mouseenter_mouseleave.js';
if( lib.dom ===undefined)
	throw 'lib.dom is required by mouseenter_mouseleave.js';

// dependencies: event, dom

// see if mouseenter event is supported natively
if( lib.event.nativeEvents[ 'mouseenter'].supported && lib.event.nativeEvents[ 'mouseleave'].supported)
	// mouseenter & mouseleave are supported
	return;
	
// make sure both events are unsupported
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

})( EVOLIB_EXPORT, 'event.mouseenter_mouseleave');