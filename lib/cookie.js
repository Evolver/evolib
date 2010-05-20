
(function( lib, namespace){
	
// define api
var api =lib.namespace( namespace), undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

// set cookie's value
api.set =function( name, value, ttl, path, domain, secure) {
	// see if path was specified
	if( path ===undefined)
		path ='/';
	
	// build string to assign to document.cookie
	var cookieString =name +'=' +escape( value);
	
	// see if ttl is set
	if( ttl !==undefined) {
		// get current date object
		var date =new Date();
		// set cookie ttl
		if( ttl ===0) {
			// unlimited ttl, add five years to the expiration date.
			//	five years should be enough to keep cookie "unlimited"
			//	in ttl.
			date.setDate( date.getDate() +157680000);
			
		} else if( ttl < 0) {
			// remove cookie, set old ttl
			date.setDate( date.getDate() -1);
			
		} else {
			// limited ttl
			date.setDate( date.getDate() +(ttl *1000));
		}
		// add "expires" string
		cookieString +='; expires=' +date.toGMTString();
	}
	
	// add path info
	cookieString +='; path=' +path;
	
	// add domain info
	if( domain !==undefined)
		cookieString +='; domain=' +domain;
	
	// add secure info
	if( secure !==undefined && secure)
		cookieString +='; secure';
	
	// create cookie
	document.cookie =cookieString;
};

// get cookie value
api.get =function( name) {
	// obtain list of cookies
	var cookies =document.cookie.split( ';');
	var i, cookie, valueOffset =name.length +1;
	
	//seek for cookie of interest
	for( i =0; i < cookies.length; ++i) {
		// reference cookie
		cookie =cookies[i];
		
		// strip whitespaces on both sides of cookie string
		cookie =cookie.replace( /^\s+/, '').replace( /\s+$/, '');
		
		// make sure this is the cookie of interest
		if( cookie.substr( 0, valueOffset) !=name +'=')
			// not a cookie we are looking for
			continue;
		
		// extract cookie's value
		return unescape( cookie.substr( valueOffset));
	}
	
	// return undefined
	return undefined;
};

// delete cookie
api.remove =function( name, path, domain, secure) {
	// set cookie with negative expire time
	api.set( name, '', -1, path, domain, secure);
	
	if( lib.config.debug) {
		// make sure cookie was unset
		if( api.get( name) !==undefined)
			throw new ErrorException( 'Failed to delete cookie. Cookie survived after setting negative ttl.');
	}
};

// see if cookie is set
api.exists =function( name) {
	return api.get( name) !==undefined;
};

})( EVOLIB_EXPORT, 'cookie');