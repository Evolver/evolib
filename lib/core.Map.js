
(function( lib){

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
		var existed =(this.values[ key] !==undefined);
		
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
	
	// clear map
	prototype.clear =function() {
		// reinitialize array of keys and object of values
		this.keys =[];
		this.values ={};
	};
}
	
})( EVOLIB_EXPORT);