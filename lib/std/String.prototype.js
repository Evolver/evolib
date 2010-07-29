
(function(){
	
var undefined;

// space characters
var spaces =' \t\r\n';

// function to check if char is space
function isspace( chr) {
	return spaces.indexOf( chr) !==-1;
};

if( String.prototype.trim ===undefined) {
	// define String.trim()
	String.prototype.trim =function( left, right) {
		
		// default args
		if( left ===undefined)
			left =true;
		if( right ===undefined)
			right =true;
		
		var l =this.length;
		var begin =0;
		var end =l;
		
		if( left) {
			// trim left
			while( begin < end && isspace( this.charAt( begin)))
				++begin;
		}
		
		if( right) {
			// trim right
			while( end > begin && isspace( this.charAt( end -1)))
				--end;
		}
		
		// remove spaces
		return this.substr( begin, end -begin);
	};
	
	// define String.trimLeft()
	String.prototype.trimLeft =function() {
		return this.trim( true, false);
	};

	// define String.trimRight()
	String.prototype.trimRight =function() {
		return this.trim( false, true);
	};
}

if( String.prototype.trimLeft ===undefined) {
	// define String.trimLeft()
	String.prototype.trimLeft =function() {
		var end =this.length;
		var begin =0;
		
		while( begin < end && isspace( this.charAt( begin)))
			++begin;
		
		return this.substr( begin, end -begin);
	};
}

if( String.prototype.trimRight ===undefined) {
	// define String.trimRight()
	String.prototype.trimRight =function() {
		var end =this.length;
		var begin =0;
		
		while( end > begin && isspace( this.charAt( end -1)))
			--end;
		
		return this.substr( begin, end -begin);
	};
}

})();