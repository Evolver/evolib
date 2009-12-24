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

// data storage object
var dataStore ={};

// set associated data

// setData( elem, key, data)
api.set =function( elem, key, data) {
  var id =lib.getUid( elem);
  
  // create storage for the element
  if( dataStore[ id] ===undefined)
    dataStore[ id] ={};
    
  // assign new data
  dataStore[ id][ key] =data;
};
  
// see if element has data

// hasData( elem)
// hasData( elem, key)
api.has =function( elem, key) {
  var id =lib.getUid( elem);
  
  if( key ===undefined)
    // see if got any data stored
    return dataStore[ id] !==undefined;
    
  // see if got specific key
  else if( dataStore[ id] !==undefined)
    return dataStore[ id][ key] !==undefined;
    
  else
    // has no data stored
    return false;
};
  
// remove associated data
  
// removeData( elem)
// removeData( elem, key)
api.remove =function( elem, key) {
  var id =lib.getUid( elem);
  
  if( key ===undefined)
    // remove whole data store
    delete dataStore[ id];
    
  // remove specific data store key
  else if( dataStore[ id] !==undefined)
    delete dataStore[ id][ key];
};
  
// obtain stored data

// getData( elem)
// getData( elem, key)
api.get =function( elem, key) {
  var id =lib.getUid( elem);
  
  if( key ===undefined) {
    // return all data available
    if( dataStore[ id] !==undefined)
      return dataStore[ id];
    else
      return undefined;
    
  // remove specific data store key
  } else if( dataStore[ id] !==undefined) {
      // see if got key stored
      if( dataStore[ id][ key] !==undefined)
        return dataStore[ id][ key];
      else
        return undefined;
    
  } else
    // has no data stored
    return undefined;
};
  
})( __NAMESPACE__, 'data');