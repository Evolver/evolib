
(function( lib){
	
var undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

if( lib.event ===undefined)
	throw new ErrorException( 'lib.event is required by remove.js');

// custom event : remove
var RemoveEvent;

with( RemoveEvent =function(){}) {
	// does not bubble
	prototype.bubbles =false;
	// is not cancelable
	prototype.cancelable =false;
}

// add 'remove' event
lib.event.custom.add( 'remove', RemoveEvent);

})( EVOLIB_EXPORT);