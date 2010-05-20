
(function( lib, namespace){
	
// define api
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

// define default subsystem driver class
var Driver =api.Driver =function() {};

// define default sybsystem driver class prototype
with( Driver) {
	// adds and inits new form control
	prototype.add =function( object) {};
	// deinits and removes form control
	prototype.remove =function( object) {};
	// synchronizes form control with the subsystem
	prototype.sync =function( object) {};
}
	
})( EVOLIB_EXPORT, 'controls');