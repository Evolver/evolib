
(function( lib, namespace){
	
// define api
var api =lib.namespace( namespace), undefined;

// set associated data

// setData( elem, key, data)
api.set =function( elem, key, data) {
	
	if( elem.associatedData ===undefined)
		// no data was previously associated, create
		//  data container.
		elem.associatedData ={};
	
	// associate data
	elem.associatedData[ key] =data;
	
};
	
// see if element has data

// hasData( elem)
// hasData( elem, key)
api.has =function( elem, key) {
	
	if( elem.associatedData ===undefined)
		// no data associated
		return false;
	
	if( key !==undefined && elem.associatedData[ key] ===undefined)
		// no data associated
		return false;
	
	// got associated data
	return true;
};
	
// remove associated data
	
// removeData( elem)
// removeData( elem, key)
api.remove =function( elem, key) {
	
	if( elem.associatedData ===undefined)
		// no data associated
		return;
	
	if( key ===undefined) {
		// remove all associated data
		try {
			delete elem.associatedData;
			
		} catch( e) {
			elem.associatedData =undefined;
		}
		
	} else {
		// remove target data
		
		if( elem.associatedData[ key] ===undefined)
			// already removed
			return;
		
		try {
			delete elem.associatedData[ key];
			
		} catch( e) {
			elem.associatedData[ key] =undefined;
		}
	}
	
};
	
// obtain stored data

// getData( elem)
// getData( elem, key)
api.get =function( elem, key) {
	
	if( elem.associatedData ===undefined)
		// no data associated
		return undefined;
	
	if( elem.associatedData[ key] ===undefined)
		// no data associated
		return undefined;
	
	// return associated data
	return elem.associatedData[ key];
};
	
})( EVOLIB_EXPORT, 'data');