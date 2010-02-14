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
		date.setDate( date.getDate() +(ttl *1000));
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
		cookie =cookie.replace( /^\s+/, '');
		
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

})( __NAMESPACE__, 'cookie');