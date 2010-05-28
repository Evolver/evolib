
(function( lib){
	
var undefined;

// HEAD element reference
var head =null;

// export configuration
var config =lib.config ={
	// enable debugging mode
	'debug': false
};

// node types
var NodeType =lib.NodeType ={
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

// check if element is function
lib.isFunction =function( variable) {
	return Object.prototype.toString.apply( variable) ==='[object Function]';
};

// check if element is a collection of items
lib.isCollection =function( variable) {
	return variable.length !==undefined && variable.item !==undefined && lib.isFunction( variable.item);
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
			ret =ret.concat( variable);
		}
		
	} else if( lib.isFunction( variable)) {
		// just reference the function (currently the safest
		//	known way).
		ret =variable;
		
	// clone object or function
	} else if( lib.isObject( variable)) {
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
	
	if( object instanceof lib.Map)
		return object.length();
	
	if( object instanceof Array || object instanceof String)
		return object.length;
	
	if( lib.isCollection( object))
		return object.length;
	
	if( lib.isObject( object)) {
		// count elements in object
		var ret =0;
		
		// count own properties
		for( var k in object)
			if( object.hasOwnProperty( k))
				ret++;
		
		// return count
		return ret;
	}
	
	// don't know how to count
	return undefined;
};

// get first element from array, string or object
lib.first =function( object) {
	
	if( object instanceof lib.Map) {
		if( object.length() ==0)
			// map is empty
			return undefined;
		
		// return first element
		return object.values[ object.keys[ 0]];
	}
	
	if( object instanceof Array || object instanceof String) {
		// array or string
		if( object.length ==0)
			// empty
			return undefined;
		
		// return first index
		return object[ 0];
	}
	
	if( lib.isCollection( object)) {
		// collection
		if( object.length ==0)
			// empty
			return undefined;
		
		// return first item
		return object.item( 0);
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
	if( object instanceof lib.Map)
		// map
		return object.length() ==0;
	
	if( object instanceof Array || object instanceof String)
		// string
		return object.length ==0;
	
	if( object instanceof Object) {
		// object
		for( var k in object)
			return false;
		return true;
	}
	
	throw new ErrorException( 'Don\'t know how to determine if object is empty (' +(typeof object) +')');
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
var uidKey ='uid' +(+new Date);

// implementation
	
// get object unique id
lib.getUid =function( elem) {
	var ret =undefined;

	if( elem.getAttribute) {
		// .getAttribute
		ret =elem.getAttribute( 'data-uid');
		if( ret ===null)
			elem.setAttribute( 'data-uid', ret =uidCounter++);
			
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

// map
var Map =lib.Map =function( keys, values) {
	if( keys ===undefined)
		keys =[];
	if( values ===undefined)
		values ={};
	
	// load associative
	this.loadAssoc( keys, values);
	
	// return current object
	return this;
};

with( Map) {
	// we do not define "keys" and "values" vars in prototype, since
	//  defining them in prototype will reference same empty object
	//  and array for all new Map objects.
	
	// load associated list of objects
	prototype.loadAssoc =function( keys, values) {
		this.keys =keys;
		this.values =values;
	};
	
	// load map with list of objects
	prototype.load =function() {
		// reset keys and values
		this.keys =[];
		this.values ={};
		
		for( var i =0; i < arguments.length; ++i)
			this.push( arguments[ i]);
	};
	
	// push object(s) into map
	prototype.push =function() {
		var k, i;
		for( i =0; i < arguments.length; ++i) {
			// generate key name and push
			this.keys.push( k =this.makeKey());
			this.values[ k] =arguments[ i];
		}
	};
	
	// make unused key
	prototype.makeKey =function() {
		var ret =0;
		// find unused index
		while( this.values[ ret++] !==undefined);
		// return key
		return ret;
	};
	
	// get length of map
	prototype.length =function() {
		return this.keys.length;
	};
	
	// check if key is within map
	prototype.has =function( key) {
		return this.values[ key] !==undefined;
	};
	
	// get value by key
	prototype.get =function( key) {
		return this.values[ key];
	};
	
	// get value by index
	prototype.index =function( i) {
		return this.get( this.keys[ i]);
	};
	
	// add new value by key
	prototype.set =function( key, value) {
		// determine if value under specified key already exists
		var existed =this.values[ key] !==undefined;
		
		// set new value
		this.values[ key] =value;
		
		if( !existed)
			// push new key to the list
			this.keys.push( key);
	};
	
	// delete existing key value
	prototype.remove =function( key) {
		var i =this.getKeyIndex( key);
		if( i ===undefined)
			// key is not within map
			return;
		
		// remove key
		this.keys.splice( i, 1);
		// remove value
		delete this.values[ key];
		
		// return new length
		return this.keys.length;
	};
	
	// get key's index
	prototype.getKeyIndex =function( key) {
		for( var i =0; i < this.keys.length; ++i)
			if( this.keys[ i] ==key)
				return i;
		
		// index not found
		return undefined;
	};
	
	// set key's position index
	prototype.setKeyIndex =function( key, index) {
		if( index < 0) {
			// move to the beginning if negative index specified
			index =0;
			
		} else if( index >=this.keys.length) {
			// insert at the end if target index is greater
			index =this.keys.length -1;
		}
		
		var i =this.getKeyIndex( key);
		if( i ===undefined)
			// key is not within map
			return;
		
		// reorder keys
		this.keys.splice( i, 1);
		this.keys.splice( index, 0, key);
		
		// return new index
		return index;
	};
	
	// reorder : move key forward or backwards
	prototype.move =function( key, move) {
		var i =this.getKeyIndex( key);
		if( i ===undefined)
			// key is not within map
			return;
		
		// move key and return index
		return this.setKeyIndex( key, i +move);
	};
	
	// reorder : move key after target key
	prototype.moveAfter =function( key, target) {
		var i =this.getKeyIndex( key);
		if( i===undefined)
			// source key not found
			return undefined;
		
		if( key ==target)
			// already at position
			return i;
		
		// pull key from key list
		this.keys.splice( i, 1);
		
		// get index of target key
		i =this.getKeyIndex( target);
		if( i ===undefined) {
			// insert key to the end of array
			this.keys.push( key);
			
			// return index
			return this.keys.length -1;
		}
		
		// move after
		this.keys.splice( ++i, 0, key);
		
		// return index
		return i;
	};
	
	// reorder : move key before target key
	prototype.moveBefore =function( key, target) {
		var i =this.getKeyIndex( key);
		if( i===undefined)
			// source key not found
			return undefined;
		
		if( key ==target)
			// already at position
			return i;
		
		// pull key from key list
		this.keys.splice( i, 1);
		
		// get index of target key
		i =this.getKeyIndex( target);
		if( i ===undefined || i ==0) {
			// insert key to the first position
			this.keys.unshift( key);
			return 0;
		}
		
		// move before
		this.keys.splice( i, 0, key);
		
		// return index
		return i;
	};
	
	// iterate
	prototype.iterate =function( callback, mutationAware) {
		if( mutationAware !==undefined && mutationAware)
			// clone keys
			var keys =lib.clone( this.keys);
		else
			// reference keys
			var keys =this.keys;
		
		var k;
		for( var i =0; i < keys.length; ++i) {
			k =keys[ i];
			
			if( this.values[ k] ===undefined)
				// value was removed during iteration?
				continue;

			if( callback.call( this, k, this.values[ k]) ===false)
				// stop iteration
				break;
		}
	};
	
	// convert to object
	prototype.toObject =function() {
		return lib.clone( this.values);
	};
}

// create range array of values
lib.range =function( min, max) {
	if( min ==max)
		// return array with one value
		return [ min];
	
	// array to return
	var ret =[], i;
	
	if( max > min) {
		// from less to high
		for( i =min; i <= max; ++i)
			ret.push( i);
		
	} else {
		// high to less
		for( i =min; i >=max; i--)
			ret.push( i);
	}
	
	// return range
	return ret;
};
	
})( EVOLIB_EXPORT);