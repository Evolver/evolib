
(function( lib, namespace){
  
// define namespace
var api =lib.namespace( 'ajax'), undefined;

// import classes
var ErrorException =lib.classref( 'ErrorException');

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
      // try Microsoft.XMLHTTP
      return new ActiveXObject( 'Microsoft.XMLHTTP');
      
    } catch( e) {
      try {
        // try Msxml2.XMLHTTP
        return new ActiveXObject( 'Msxml2.XMLHTTP');
        
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
  // pass data to callback in requested format
  switch( Request.response) {
    // json
    case Request.RESPONSE_JSON:
      Request.onSuccess( lib.parseJson( Request.xhr.responseText));
    break;
    // XML
    case Request.RESPONSE_XML:
      Request.onSuccess( Request.xhr.responseXML);
    break;
    // raw response
    case Request.RESPONSE_RAW:
    default:
      Request.onSuccess( Request.xhr.responseText);
    break;
  }
}

// handle completion
function Complete( Request) {
  // see if timeout was active
  if( Request.timeoutTimer !==null) {
    // stop timer
    clearTimeout( Request.timeoutTimer);
    // reset handle
    Request.timeoutTimer =null;
  }
  
  // reset all structures
  Request.active =false;
  Request.xhr =null;
  
  // execute complete callbacks
  Request.onComplete();
}

// handle timeout
function Timeout( Request) {
  if( !Request.active)
    // should not happen
    throw new ErrorException( 'A timeout handler was fired while request is not active');
    
  // set request to not active
  Request.active =false;
  
  // reset timeout timer handle
  Request.timeoutTimer =null;
  
  // abort XHR request
  Request.xhr.abort();
  
  // trigger abortion
  Error( Request, 'Timeout');
  Complete( Request);
};

// handle ready state change
function RequestReadyStateChange( Request) {
  if( !Request.active)
    // request is not active yet
    return;
    
  // reference XMLHttpRequest object
  var xhr =Request.xhr;
  
  // handle completion only
  if( xhr.readyState ==XHRReadyState.COMPLETED) {
    // request completed
    if( xhr.status ==0 && window.location.protocol ==='file:') {
      // working on a local filesystem, no response statuses available
      if( xhr.responseText.length ==0)
        Error( Request, 'File was empty or security error occured, access denied');
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
  var ret ='';
  for( var k in args)
    ret +=k +'=' +escape( args[k]) +'&';
    
  // return complete string
  return ret.substr( 0, ret.length -1);
}

// request object

// constructor
api.Request =function() {
};

// prototype
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
  prototype.RESPONSE_XML ='xml';
  
  // expected response type
  prototype.response =prototype.RESPONSE_RAW;
  
  // request timeout
  prototype.timeout =null;
  
  // send request
  prototype.send =function( url, method, args) {
    // check input
    if( method ===undefined || method ===null)
      method ='GET';
    if( args ===undefined)
      args =null;
      
    if( this.active)
      throw new ErrorException( 'Another request is already started');
    
    // XHR object
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
    
    // initialize timeout timer if requested
    if( this.timeout !==null) {
      // after specified amount of time trigger timeout handler
      this.timeoutTimer =setTimeout( function(){
        // trigger timeout handler
        Timeout( self);
        
      }, this.timeout *1000 /* specify in ms. */);
    }
    
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
    // override to handle event
  };
  
  // progress counter
  prototype.onProgress =function( loaded, total) {
    // override to handle event
  };
  
  // request successfully sent and got response from server
  prototype.onSuccess =function( response) {
    // override to handle event
  };
  
  // error occured during request
  prototype.onError =function( errormsg) {
    // override to handle event
  };
  
  // request sending completed
  prototype.onComplete =function() {
    // override to handle event
  };
}
  
})( EVOLIB_EXPORT, 'ajax');