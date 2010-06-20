
(function( lib){
	
var undefined;

if( lib.event ===undefined)
	throw 'lib.event is required by remove.js';

// custom event : css
var CSSEvent;

with( CSSEvent =function(){}) {
	// does not bubble
	prototype.bubbles =false;
	// is not cancelable
	prototype.cancelable =false;
}

// add 'css' event
lib.event.custom.add( 'css', CSSEvent);

})( EVOLIB_EXPORT);