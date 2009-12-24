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

// declare namespace
var api =lib.namespace( namespace), undefined;

// dependencies: data, css

// import classes
var ErrorException =lib.classref( 'ErrorException');

// define configuration for animations
var config =api.config ={
  // animate every 22ms (45 fps)
  'step': 22
};

// transition queue
var TransitionQueue =api.TransitionQueue =function() {
  // initialize new array
  this.queue =new Array;
};

with( TransitionQueue) {
  // transition queue : initialized at construction
  prototype.queue =null;
  
  // add transition to queue
  prototype.add =function( Transition) {
    // push transition to queue
    this.queue.push( Transition);
  };
  
  // hit next tick, see if there are no more transitions
  // to do
  prototype.tick =function() {
    if( this.queue.length ==0)
      // animation completed
      return undefined;
      
    // get first transition in queue
    var T =this.queue[0];
    
    // hit tick
    var ret =T.tick();

    // see if completed
    if( ret) {
      // remove transition from queue
      this.queue.splice( 0, 1);
    }
    
    // return transition
    return T;
  };
  
  // clear transition queue
  prototype.clear =function() {
    // resize array
    this.queue.length =0;
  }
}

// transition object
var Transition =api.Transition =function( current, to, remainingMs, easingMs) {
  this.current =current;
  this.to =to;
  this.remainingMs =remainingMs;
  
  if( easingMs !==undefined && easingMs >0)
    this.easingMs =easingMs;
};

with( Transition) {
  // initialized in constructor
  prototype.current =null;
  prototype.to =null;
  
  // remaining miliseconds until animation finishes.
  // initialized in constructor.
  prototype.remainingMs =0;
  
  // delay easing
  prototype.easingMs =0;
  
  // tick callback
  prototype.tickCallback =null;
  
  // callback to execute when animation completes
  prototype.completionCallback =null;
  
  // hit next tick, see if animation completed
  prototype.tick =function() {
    
    // get next transition information
    var ret =api.getNextTransition( this.current, this.to, this.remainingMs);
    
    // add current values
    this.current +=ret.add;
    this.remainingMs -=ret.step -this.easingMs;
    
    // see if no more ms remaining
    if( this.remainingMs <=this.easingMs) {
      // call a callback if defined
      if( this.completionCallback !==null)
        // callback decides whether to continue animation or
        //  abort it
        if( this.completionCallback.call( this) ===undefined)
          // animation completed
          return true;
        
      // animation completed
      return true;
      
    } else {
      // call tick callback if defined
      if( this.tickCallback !==null)
        // callback decides whether to continue animation or abort it
        if( this.tickCallback.call( this) ===undefined)
          // animation did not complete yet
          return false;
        
      // animation did not complete yet
      return false;
    }
  };
}

// list of elements involved in animations
var elems =api.elems =[];

// adds element to animation queue or returns already
//  existing animation entry for specified element
function GetElementAnimationInfo( elem, create) {
  // check input
  if( create ===undefined)
    create =true;
    
  // seek for entry
  var entry;
  var i;
  for( i =0; i < elems.length; ++i) {
    entry =elems[ i];
    
    if( entry.elem ===elem)
      // found
      return entry;
  }
  
  // see if creation is allowed
  if( !create)
    // not found
    return undefined;
  
  // element was not found, create entry manually
  elems.push( entry ={
    // element
    'elem': elem,
    // list of properties to animate on
    'props': {}
  });
  
  // return entry
  return entry;
}

// remove element animation info
function RemoveElementAnimationInfo( elem) {
  // seek for entry
  var i;
  for( i =0; i < elems.length; ++i) {
    if( elems[ i].elem ===elem) {
      // found, remove entry
      elems.splice( i, 1);
      return;
    }
  }
  
  // failed to remove element
  throw new ErrorException( 'Did not found element entry, no animation info was removed');
}

// add property transition to element
function AddTransition( entry, prop, from, to, speed, easing, tickCallback, completionCallback) {
  // see if element has any existing transitions active
  // for specified property
  var tq =entry.props[ prop];
  if( tq ===undefined)
    tq =entry.props[ prop] =new TransitionQueue();
    
  // create new transition
  var t =new Transition( from, to, speed, easing);
  
  // assign callbacks
  if( tickCallback !==undefined && tickCallback !==null)
    t.tickCallback =tickCallback;
  if( completionCallback !==undefined && completionCallback !==null)
    t.completionCallback =completionCallback;
    
  // add transition to queue
  tq.add( t);
}

// get CSS representation of property value
function GetPropTransitionCSSValue( property, rawValue) {
  // see which property is passed in
  switch( property) {
    case 'width':
    case 'height':
    case 'left':
    case 'top':
    case 'margin-left':
    case 'margin-tight':
    case 'margin-top':
    case 'margin-bottom':
    case 'padding-left':
    case 'padding-tight':
    case 'padding-top':
    case 'padding-bottom':
    case 'border-left-width':
    case 'border-tight-width':
    case 'border-top-width':
    case 'border-bottom-width':
    case 'font-size':
      // indicate that value is in pixels
      return Math.floor( rawValue) +'px';
      
    default:
      // return raw value
      return rawValue;
  }
}

// get raw CSS value of property
function GetPropTransitionRawCSSValue( property, value) {
  // see which property is passed in
  switch( property) {
    case 'opacity':
      // return float
      return parseFloat( value);
      
    default:
      // return integer value
      return parseInt( value);
  }
}

// animate
function Animate() {
  // iterate array of elements involved in transition
  var i;
  var entry;
  // property references
  var p, p2;
  // transition queue reference
  var tq;
  // style property values computed by transitions, these
  // values need to be assigned to element in animation tick
  // completion
  var propTransition;
  var hasTransitions;
  
  for( i =0; i < elems.length; ++i) {
    entry =elems[ i];
    // reset computed style
    propTransition ={};
    hasTransitions =false;
    
    // iterate through it's properties
    for( p in entry.props) {
      // hit a tick for current property
      tq =entry.props[ p].tick();
      
      if( tq ===undefined) {
        // no more animations for current property
        delete entry.props[ p];
        
      } else {
        // animate property
        propTransition[ p] =GetPropTransitionCSSValue( p, tq.current);
        hasTransitions =true;
      }
    }
    
    
    if( hasTransitions)
      // assign new CSS properties
      lib.css.set( entry.elem, propTransition);
    
    // see if got no more properties to animate on
    if( lib.count( entry.props) ==0) {
      // remove element entry
      elems.splice( i--, 1);
    }
  }
}

// animation tick
function AnimationTick() {
  // animate
  Animate();
  
  // delay next tick.
  setTimeout( AnimationTick, config.step);
}

// start animation loop
AnimationTick();

// apply transform on an element
api.transform =function( elem, prop, from, to, speed, easing, tickCallback, completionCallback) {
  // get element info
  var elementInfo =GetElementAnimationInfo( elem);
  
  // see what type is prop of
  if( lib.isString( prop)) {
    // see if 'from' is specified
    if( from ===undefined || from ===null)
      from =GetPropTransitionRawCSSValue( prop, lib.css.getOne( elem, prop));
      
    // add single transition
    AddTransition( elementInfo, prop, from, to, speed, easing, tickCallback, completionCallback);
    
  } else {
    // add multiple transitions
    var k;
    var entry;
    var props =[];
    var style;
    
    // list all properties
    for( k in prop) {
      // if no 'from' specified, add it to style prop list
      if( props[k].from ===null)
        props.push[ k];
    }
      
    // load style props, which require 'from' value to be
    // present
    if( props.length >0)
      style =lib.css.get( elem, props);
      
    // add transitions
    for( k in prop) {
      entry =prop[ k];
      
      // add transitions one by one
      AddTransition( elementInfo, k,
        entry.from ===null ? style[ k] : entry.from,
        entry.to,
        entry.speed,
        entry.easing,
        entry.tickCallback,
        entry.completionCallback);
    }
  }
  
  // transitions added
};

// cancel transform(s) on element
api.cancel =function( elem, prop) {
  // see if array of properties specified
  if( prop ===undefined) {
    // remove element entry
    RemoveElementAnimationInfo( elem);
    return;
  }
  
  // element animation info entry reference
  var entry =GetElementAnimationInfo( elem, false);
  
  if( lib.isArray( prop)) {
    // array of properties specified, remove specified properties
    var i;
    for( i =0; i < prop.length; ++i)
      // delete any animation entries
      delete entry.props[ prop[ i]];

  } else {
    // delete target property
    delete entry.props[ prop];
  }
};

// get next transition info
api.getNextTransition =function( current, to, remainingMs) {
  // current - current value
  // to - final value to be after animation completes
  // remainingMs - how much ms available till animation completes
  
  // calculate range
  var range =to -current;
  // calculate tick count till animation completes
  var ticks =remainingMs / config.step;
  
  // data to return
  var ret ={
    'add': 0,
    'step': 0
  };
  
  // see if any more ticks remain
  if( ticks <= 1) {
    // finalize animation
    ret.add =range;
    ret.step =remainingMs;
    
  } else {
    // continue animation
    ret.add =range / ticks;
    ret.step =config.step;
  }
  
  // return transition info
  return ret;
};


})( __NAMESPACE__, 'anim');