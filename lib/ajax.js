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
  
// define namespace
var api =lib.namespace( 'ajax'), undefined;
  
// function to allocate new XMLHttpRequest object
var NewXMLHttpRequest;
  
if( window.ActiveXObject) {
  // Microsoft way
  NewXMLHttpRequest =function() {
    return new ActiveXObject( 'Microsoft.XMLHTTP');
  };
  
} else {
  // W3C way
  NewXMLHttpRequest =function() {
    return new XMLHttpRequest();
  }; 
}

// request object
api.Request =function() {
  // allocate XMLHttpRequest object
  this.xhr =NewXMLHttpRequest();
};

with( api.Request) {
  // XMLHttpRequest object, initialized at construction
  prototype.xhr =null;
  
  // synchronous/asynchronous request
  prototype.async =true;
  
  // url to query
  prototype.url =null;
  
  // response types
  prototype.RESPONSE_RAW ='raw';
  prototype.RESPONSE_JSON ='json';
  
  // expected response type
  prototype.response =prototype.RESPONSE_RAW;
  
  // send request
  prototype.send =function( method, args) {
    
  };
  
  // abort request processing
  prototype.abort =function() {
    
  };
}
  
})( window.evolver, 'ajax');