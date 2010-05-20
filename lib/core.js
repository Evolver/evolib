
// EVOLIB_EXPORT global variable is the reference to an object, that should
//	hold library's exported APIs. By default library exports it's API to
//	window object.
var EVOLIB_EXPORT =window.evolver ={};

(function( lib){
	
var undefined;

// HEAD element reference
var head =null;

// export configuration
var config =lib.config ={
	// enable debugging mode
	'debug': false
};

// error exception
var ErrorException =lib.ErrorException =function( message, code, data) {
	this.message =message;
	this.code =code !==undefined ? code : null;
	this.data =data !==undefined ? data : null;
};

with( ErrorException) {
	// error code
	prototype.code =null;
	
	// error message
	prototype.message =null;
	
	// additional data
	prototype.data =null;
	
	// export as string
	prototype.toString =function() {
		return this.message +' (code ' +(this.code ===null ? 'not specified' : this.code) +')';
	};
}

// debugging function (can be overriden from the outer world to receive
//	debugging info)
lib.debug =function( namespace, msg) {
	// override to read debug info
	throw new ErrorException( 'evolib' +(namespace ===null ? '' : ' (' +namespace +')') +': ' +msg);
};

// assertion function
lib.assert =function( condition, namespace, msg) {
	if( !condition)
		lib.debug( namespace, msg);
};

// get reference to namespace
lib.namespace =function( namespace, create, rootObject) {
	if( create ===undefined || create ===null)
		create =true;
	if( rootObject ===undefined || rootObject ===null)
		rootObject =lib;
	
	// separate namespace in parts
	var parts =namespace.split( '.');
	
	// lookup object to return
	var ret =rootObject;
	var part;
	for( var i =0; i < parts.length; ++i) {
		part =parts[i];
		
		// see if namespace is defined
		if( ret[ part] ===undefined) {
			if( create) {
				// make sure all paths are defined
				ret[ part] ={};
				
			} else {
				// otherwise return undefined
				if( config.debug)
					// indicate failure of namespace loading
					lib.debug( null, 'Did not found required namespace "' +namespace +'"');
					
				return undefined;
			}
		}
			
		// reference next part
		ret =ret[ part];
	}
	
	// return namespace reference
	return ret;
};

// get reference to class/function. Actually it is an alias
// of lib.namespace
lib.classref =function( className, rootObject) {
	return lib.namespace( className, undefined, rootObject);
};

// return predefined namespace instance
lib.require =function( namespace) {
	return lib.namespace( namespace, false);
};

// check if element is an array
lib.isArray =function( variable) {
	return Object.prototype.toString.apply( variable) ==='[object Array]';
};

// check if element is string
lib.isString =function( variable) {
	return Object.prototype.toString.apply( variable) ==='[object String]';
};

// check if element is object
lib.isObject =function( variable) {
	return Object.prototype.toString.apply( variable) ==='[object Object]';
};

// get index of item in object
lib.indexOf =function( object, item, fromIndex) {
	if( fromIndex ===undefined)
		fromIndex =0;
		
	if( object.indexOf)
		// use built-in indexOf method
		return object.indexOf( item, fromIndex);
		
	else {
		// just iterate
		for( var i in object)
			if( object[i] ==item)
				return i;
				
		return -1;
	}
};

// extend obj1 by obj2
lib.extend =function( obj1, obj2) {
	for( var k in obj2)
		obj1[k] =obj2[k];
};

// merge two objects
lib.merge =function( obj1, obj2) {
	// clone first object
	var ret =lib.clone( obj1);
	
	for( var k in obj2)
		ret[k] =obj2[k];
		
	// return new object
	return ret;
};

// clone variable

//	clone( var) - get full clone of object
//	clone( var, false) - do not clone values of arrays and properties of objects
lib.clone =function( variable, recursive) {
	if( recursive ===undefined)
		recursive =true;

	var ret;
	
	// clone array
	if( variable ===null)
		ret =null;
		
	else if( variable ===undefined)
		ret =undefined;
		
	else if( lib.isArray( variable)) {
		var i;
		ret =new Array;
		if( recursive) {
			for( i =0; i < variable.length; ++i)
				ret.push( lib.clone( variable[i], recursive));
		} else {
			// use concat instead
			ret.concat( variable);
		}
		
	} else if( typeof variable =='function') {
		// just reference the function (currently the safest
		//	known way).
		ret =variable;
		
	// clone object or function
	} else if( typeof variable =='object') {
		var k;
		// construct object
		ret =new Object;
			
		if( recursive) {
			for( k in variable) {
				if( variable.hasOwnProperty( k))
					ret[ k] =lib.clone( variable[k], recursive);
			}
				
		} else {
			for( k in variable) {
				if( variable.hasOwnProperty( k))
					ret[ k] =variable[k];
			}
		}
		
	// clone other vars
	} else
		ret =variable;
		
	// return cloned value
	return ret;
};

// count properties in object
lib.count =function( object) {
	// undefined by default
	var ret;
	
	if( lib.isArray( object)) {
		// count elements in array
		ret =object.length;
		
	} else if( typeof object =='object') {
		// count elements in object
		ret =0;
		var k;
		// count own properties
		for( k in object) {
			if( object.hasOwnProperty( k))
				ret++;
		}
	} else if( typeof object =='string') {
		// count characters in string
		ret =string.length;
		
	}
	
	return ret;
};

// get first element from array, string or object
lib.first =function( object) {
	if( object.length !==undefined) {
		// array or string
		if( object.length ==0)
			// empty
			return undefined;
		
		// return first index
		return object[ 0];
	}
	
	try {
		for( var k in object)
			return object[ k];
		
	} catch( e) {}
	
	// failed to obtain first index
	return undefined;
};

// test if variable is empty
lib.empty =function( object) {
	if( object.length !==undefined && object.length >0)
		return false;
	
	try {
		for( var k in object)
			return false;
		
	} catch( e) {}
	
	// failed to determine
	return true;
};

// determine if value is within array
lib.inArray =function( value, array, strict) {
	if( strict ===undefined)
		strict =true;
		
	if( strict) {
		// strict comparison
		for( var i =0; i < array.length; ++i)
			if( array[ i] ===value)
				return true;
		
	} else {
		// normal comparison
		for( var i =0; i < array.length; ++i)
			if( array[ i] ==value)
				return true;
	}
	
	// value not found
	return false;
};

// test for script injection through createTextNode + appendChild
var scriptInject =false;
var html =document.documentElement;
var script =document.createElement( 'script');

// test for scriptInject
script.type ='text/javascript';
try {
	script.appendChild( document.createTextNode( 'window.__domlibScriptInject =true;'));
} catch( e){}

// insert script
html.insertBefore( script, html.firstChild);

// test for value
if( window.__domlibScriptInject) {
	// script injection in it's standard form is supported
	scriptInject =true;
	delete window.__domlibScriptInject;
}

// cleanup
html.removeChild( script);
delete html;
delete script;

// evaluate script locally preserving all context variables.
//	variables are named this weird to avoid overlapping with
//	callee's context.
lib.eval =function( __$js, __$thisObj) {
	if( __$thisObj ===undefined)
		return eval( __$js);

	// 'this' object is used, return execution result
	return (function(){ return eval( __$js); }).call( __$thisObj);
};

// evaluate script without context (global eval) and return execution result.

//	globalEval( js) - evaluate script
//	globalEval( js, thisObj) - evaluate script having 'this' variable equal to thisObj.
lib.globalEval =function( js, thisObj) {
	// see if 'this' object has to be set
	var stackUsed =thisObj !==undefined;
	
	// create stack and modify script
	if( stackUsed) {
		if( !window.__domlibGlobalEvalStack)
			// declare stack
			window.__domlibGlobalEvalStack =new Array();
			
		// push 'this' object reference in to stack
		window.__domlibGlobalEvalStack.push( thisObj);
		
		// modify script, wrap it with a function call.
		js =
			// this calls our code with 'this' variable set and stores the return value in
			//	window.__domlibGlobalEvalResult
			'window.__domlibGlobalEvalResult =(function(){' +js +'}).call( window.__domlibGlobalEvalStack.pop());';
	}
	
	// create elements
	var head =document.documentElement;
	var script =document.createElement( 'script');
	script.type ='text/javascript';
	
	if( scriptInject)
		script.appendChild( document.createTextNode( js));
	else
		script.text =js;
		
	// evaluate code
	head.insertBefore( script, head.firstChild);
	head.removeChild( script);
	
	var ret;
	
	if( stackUsed) {
		// obtain execution result and perform cleanup
		ret =window.__domlibGlobalEvalResult;
		
		// delete return value container
		delete window.__domlibGlobalEvalResult;
		
		// this performs cleanup after execution by deleting window.__domlibGlobalEvalStack
		//	variable if there are no more items in the stack. globalEval can be called recursively,
		//	that's why we use stacks here.
		if( window.__domlibGlobalEvalStack.length ==0)
			delete window.__domlibGlobalEvalStack;
	}
			
	// returns undefined if nothing assigned
	return ret;
};

// uid counter
var uidCounter =0;
var uidKey ='_uid' +(+new Date);

// implementation
	
// get object unique id
lib.getUid =function( elem) {
	var ret;

	if( elem.getAttribute) {
		// .getAttribute
		ret =elem.getAttribute( uidKey);
		if( ret ===null)
			elem.setAttribute( uidKey, ret =uidCounter++);
			
	} else {
		// use property
		if( elem[ uidKey] ===undefined)
			ret =elem[ uidKey] =uidCounter++;
		else
			ret =elem[ uidKey];
	}
	
	return ret;
};

// parse JSON

// parseJson( data)
lib.parseJson =function( jsonString) {
	try {
		// parse JSON
		return eval( '(' +jsonString +')');
		
	} catch( e) {
		// failed to parse JSON
		lib.debug( null, 'parseJson() : got exception "' +e +'" while parsing JSON data');
		
		// return undefined
		return undefined;
	}
};

// get time in milliseconds
lib.getTimeMs =function() {
	return (new Date).getTime();
};

// DOM ready facility
var ready ={
		// is DOM ready?
		'isReady': false,
		// ready state check interval
		'checkInterval': null,
		// list of functions to execute on ready
		'list': []
};

// check document ready state
function CheckDocumentReadyState() {
	
	switch( document.readyState) {
		// document has become manipulatable
		case 'complete':
		case 'loaded':
			// clear interval if existed
			if( ready.checkInterval !==null) {
				// clear check interval
				clearInterval( ready.checkInterval);
				ready.checkInterval =null;
			}
			// document has loaded
			ready.isReady =true;
			
			// execute all pending ready methods
			for( var k in ready.list)
				ready.list[k].call();
			
			// clear list
			ready.list.length =0;
			return;
		break;
	}
	
	// launch capturing timer
	if( ready.checkInterval !==null)
		// timer already launched
		return;
	
	// initialize interval
	ready.checkInterval =setInterval( CheckDocumentReadyState, 25);
}

// call function on DOM ready
lib.ready =function( callback){
	if( ready.isReady)
		// instantly call function and return
		return callback.call();
	
	// add function to the list
	ready.list.push( callback);
	
	// check document ready state
	CheckDocumentReadyState();
};


// sprintf_arg() impl.
lib.sprintfArg =function( string, args) {
	for( var k in args)
		// replace args one by one
		string =string.replace( '{' +k +'}', args[ k]);
	
	return string;
};
	
})( EVOLIB_EXPORT);