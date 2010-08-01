
(function( lib, namespace){
	
// define api
var api =lib.namespace( namespace), undefined;

// phrase registry
var phrases =api.phrases ={};

// get phrase

// get( ns, lang, name)
// get( ns, lang, [ name, name... ]);

api.get =function( namespace, lang, name) {
	
	if( lib.isArray( name)) {
		// array of phrases requested
		var ret ={};
		var i, p;
		for( i =0; i < name.length; ++i)
			ret[ p =name[ i]] =api.get( namespace, lang, p);
		
		// return phrases
		return ret;
	}
	
	if( phrases[ namespace] ===undefined || phrases[ namespace][ lang] ===undefined || phrases[ namespace][ lang][ name] ===undefined)
		// return phrase identification string
		return namespace +'#' +lang +':' +name;
	
	// return phrase
	return phrases[ namespace][ lang][ name];
};

// set phrases

api.set =function( namespace, lang, trans) {
	if( phrases[ namespace] ===undefined)
		phrases[ namespace] ={};
	
	if( phrases[ namespace][ lang] ===undefined)
		phrases[ namespace][ lang] ={};
	
	var k;
	for( k in trans)
		// copy phrases
		phrases[ namespace][ lang][ k] =trans[ k];
};
	
})( EVOLIB_EXPORT, 'lang');