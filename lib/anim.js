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

// list of elements involved in animations
var elems =[];

// adds element to animation queue or returns already
//  existing animation entry for specified element
function GetElementAnimationInfo( elem) {
  // seek for entry
  var entry;
  var i;
  var found =false;
  for( i =0; i < elems.length; ++i) {
    entry =elems[ i];
    
    // element found?
    if( entry.elem ===elem) {
      // found
      found =true;
      break;
    }
  }
  
  // if element was not found, create entry manually
  if( !found) {
    entry ={
      // element
      'elem': elem,
      // list of properties to animate on
      'props': {}
    };
  }
  
  // return entry
  return entry;
}

// add property transition to element
function AddElementTransition( entry, prop, from, to, speed) {
  // see if element has any existing transitions active
  // for specified property
  var tq =entry.props[ prop];
  if( tq ===undefined)
    entry.props[ prop] =tq =new TransitionQueue();
    
  // add transition to queue
  tq.add( new Transition( from, to, speed));
}

// transition queue
var TransitionQueue =api.TransitionQueue =function() {
  
};

with( TransitionQueue) {
  // transition queue
  prototype.queue =[];
  
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
var Transition =api.Transition =function( current, to, remainingMs) {
  this.current =current;
  this.to =to;
  this.remainingMs =remainingMs;
};

with( Transition) {
  // initialized in constructor
  prototype.current =null;
  prototype.to =null;
  
  // remaining miliseconds until animation finishes.
  // initialized in constructor.
  prototype.remainingMs =0;
  
  // hit next tick, see if animation completed
  prototype.tick =function() {
    // get next transition information
    var ret =api.getNextTransition( this.current, this.to, this.remainingMs);
    
    // add current values
    this.current +=ret.add;
    this.remainingMs -=ret.step;
    
    // see if no more ms remaining
    if( this.remainingMs ==0)
      // animation completed
      return true;
    else
      // animation did not complete yet
      return false;
  };
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
      return rawValue +'px';
      
    default:
      // return raw value
      return rawValue;
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
  
  for( i =0; i < elems.length; ++i) {
    entry =elems[ i];
    // reset computed style
    propTransition ={};
    
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
        /*
        // make sure computed style for involved properties is obtained
        if( cs ===null) {
          // list all properties involved in current animation process
          for( p2 in entry.props)
            csProps.push( p2);
            
          // get computed style for target properties
          cs =lib.css.get( elem, csProps);
        }
        */
      }
    }
    
    // assign new values
    lib.css.set( elem, propTransition);
    
    // see if got no more properties to animate on
    if( lib.count( entry.props) ==0) {
      // remove element entry
      elems.splice( i, 1);
    }
  }
}

// animation tick
function AnimationTick() {
  // animate
  Animate();
  
  // delay next tick
  setTimeout( AnimationTick, config.step);
}

// start animation loop
AnimationTick();

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
    ret.add =Math.floor( range / ticks);
    ret.step =config.step;
  }
  
  // return transition info
  return ret;
}


})( __NAMESPACE__, 'anim');