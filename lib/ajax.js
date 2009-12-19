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

// XHR ready states
var XHRReadyState ={
  'UNINITIALIZED': 0,
  'LOADING': 1,
  'LOADED': 2,
  'INTERACTIVE': 3,
  'COMPLETED': 4
};
  
// function to allocate new XMLHttpRequest object
var NewXMLHttpRequest;
  
if( window.ActiveXObject) {
  // Microsoft way
  NewXMLHttpRequest =function() {
    try {
      // try Msxml2.XMLHTTP
      return new ActiveXObject( 'Msxml2.XMLHTTP');
      
    } catch( e) {
      try {
        // try Microsoft.XMLHTTP
        return new ActiveXObject( 'Microsoft.XMLHTTP');
        
      } catch( e) {
        // give up
        lib.debug( namespace, 'NewXMLHttpRequest() : gave up while trying to allocate ActiveXObject');
        return undefined;
      }
    }
  };
  
} else {
  // W3C way
  NewXMLHttpRequest =function() {
    return new XMLHttpRequest();
  }; 
}

// handle start
function Start( Request) {
  // execute onstart callback
  Request.onStart();
}

// handle progress
function Progress( Request, loaded, total) {
  // execute progress callback
  Request.onProgress( loaded, total);
}

// handle error
function Error( Request, msg) {
  // execute error callback
  Request.onError( msg);
}

// handle success
function Success( Request) {
  // execute success callback
  Request.onSuccess( Request.xhr.responseText);
}

// handle completion
function Complete( Request) {
  // reset all structures
  Request.active =false;
  Request.xhr =null;
  
  // execute complete callbacks
  Request.onComplete();
}

// handle ready state change
function RequestReadyStateChange( Request) {
  if( !Request.active)
    // request is not active yet
    return;
    
  // reference XMLHttpRequest object
  var xhr =Request.xhr;
  
  // handle completion only
  if( xhr.readyState.state ==XHRReadyState.COMPLETED) {
    // request completed
    if( xhr.status ==0 && location.protocol ==='file:') {
      // working on a local filesystem, no response statuses available
      if( xhr.responseText.length ==0)
        Error( Request, 'Security error, access denied');
      else
        Success( Request);
      
    } else if( xhr.status >=200 && xhr.status < 300) {
      // http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_Success
      Success( Request);
      
    } else if( xhr.status ==304) {
      // Not Modified
      Success( Request);
      
    } else {
      // assume failure
      Error( Request, 'Response status: ' +xhr.status);
    }

    // request completed
    Complete( Request);
    
  }
}

// get argument string from object
function GetXHRPostArgs( args) {
  var ret;
  for( var k in args)
    ret +=k +'=' +escape( args[k]) +'&';
    
  // return complete string
  return ret.substr( 0, ret.length -1);
}

// request object

api.Request =function() {
};

with( api.Request) {
  // activity status
  prototype.active =false;
  
  // XMLHttpRequest object, initialized at send()
  prototype.xhr =null;
  
  // synchronous/asynchronous request
  prototype.async =true;
  
  // timeout timer
  prototype.timeoutTimer =null;
  
  // auth info
  prototype.user =null;
  prototype.password =null;
  
  // response types
  prototype.RESPONSE_RAW ='raw';
  prototype.RESPONSE_JSON ='json';
  
  // expected response type
  prototype.response =prototype.RESPONSE_RAW;
  
  // data uploading timeout
  //prototype.uploadTimeout =null;
  
  // data downloading timeout
  //prototype.responseTimeout =null;
  
  // send request
  prototype.send =function( url, method, args) {
    // check input
    if( method ===undefined || method ===null)
      method ='GET';
    if( args ===undefined)
      args =null;
      
    if( this.active)
      throw 'Another request is already started';
    
    // allocate new XHR object
    var xhr =this.xhr =NewXMLHttpRequest();
    
    // initialize
    xhr.open( method, url, this.async);
    
    // see if request is synchronous
    if( this.async) {
      // reference current object
      var self =this;
      // assign callback to handle request ready states
      xhr.onreadystatechange =function(){ RequestReadyStateChange( self); };
    }
    
    // handle request start
    Start( this);
    
    try {
      // send request
      if( args ===null) {
        // send naked request
        xhr.send( null);
        
      } else {
        // set header indicating that we are sending POST request
        xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded');
        xhr.send( GetXHRPostArgs( args));
      }
      
    } catch( e) {
      // failed to initiate request or error occured
      Error( this, 'Request failed: ' +e);
      Complete( this);
      
      return;
    }
    
    // request is active
    this.active =true;
    
    // IE does not fire onreadystatechange in async mode,
    // FF does not fire onreadystatechange in sync mode
    RequestReadyStateChange( this);
  };
  
  // abort request processing
  prototype.abort =function() {
    // see if already aborted
    if( !this.active)
      return;
      
    // set xhr as inactive so that onreadystatechange does
    // not handle ready states any more.
    this.active =false;
    
    // abort XHR request
    this.xhr.abort();
    
    // trigger abortion
    Error( this, 'Aborted');
    Complete( this);
  };
  
  // event routines
  
  // request started
  prototype.onStart =function() {
    alert( 'onStart');
  };
  
  // progress counter
  prototype.onProgress =function( loaded, total) {
    alert( 'onProgress: ' +loaded +'/' +total);
  };
  
  // request successfully sent and got response from server
  prototype.onSuccess =function( response) {
    alert( 'onSuccess, status=' +this.xhr.status +' (state=' +this.xhr.readyState +'), data length=' +response.length);
  };
  
  // error occured during request
  prototype.onError =function( errormsg) {
    alert( 'onError: ' +errormsg);
  };
  
  // request sending completed
  prototype.onComplete =function() {
    alert( 'onComplete');
  };
}
  
})( window.evolver, 'ajax');