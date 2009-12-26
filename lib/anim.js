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

// transition object
var Transition =api.Transition =function( to, remainingMs, easingFactor) {
  this.to =to;
  this.remainingMs =remainingMs;
  
  if( easingFactor !==undefined && easingFactor >0) {
    // make sure easing factor is > 0 and < 1
    if( easingFactor >=1)
      throw new ErrorException( 'Invalid easing factor');
      
    // remember easing factor
    this.easingFactor =easingFactor;
  }
};

with( Transition) {
  // last computed transition value
  prototype.computed =null;
  
  // initialized in constructor
  prototype.to =null;
  
  // remaining miliseconds until animation finishes.
  // initialized in constructor.
  prototype.remainingMs =0;
  
  // easing factor
  prototype.easingFactor =0;
  
  // callback to execute when animation completes
  prototype.callback =null;
  
  // hit next tick, see if animation completed
  prototype.tick =function( current) {
    // apply easing
    this.remainingMs +=config.step *this.easingFactor;
    
    // get next transition information
    var ret =api.getNextTransition( current, this.to, this.remainingMs);
    
    // add current values
    this.computed =current +ret.add;
    this.remainingMs -=ret.step;
    
    // see if no more ms remaining
    if( this.remainingMs <=0) {
      // call a callback if defined
      if( this.callback !==null)
        // callback decides whether to continue animation or
        //  abort it
        if( this.callback.call( this) ===undefined)
          // animation completed
          return true;
        
      // animation completed
      return true;
      
    } else {
      // animation did not complete yet
      return false;
    }
  };
}

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
  
  // add transitions from another transition queue
  prototype.merge =function( TransitionQueue) {
    // join queues
    this.queue =this.queue.concat( TransitionQueue.queue);
  };
  
  // hit next tick, see if there are no more transitions
  // to do
  prototype.tick =function( current) {
    // reference transition queue
    var queue =this.queue;
    // return value
    var ret ={
      // is transform queue empty?
      'completed': false,
      // transform object
      'transition': null
    };
    
    // see if transform queue is empty
    if( queue.length ==0) {
      // no more transforms to calculate,
      // animation completed
      ret.completed =true;
      return ret;
    }
      
    // get first transition in queue
    var T =queue[0];
    
    // hit tick
    var transitionStatus =T.tick( current);

    // see if completed
    if( transitionStatus)
      // remove transition from queue
      queue.splice( 0, 1);
    
    // assign transition object
    ret.transition =T;
    
    // see if transition queue became empty
    if( queue.length ==0)
      // mark queue as emptied
      ret.completed =true;
    
    // return transition
    return ret;
  };
  
  // clear transition queue
  prototype.clear =function() {
    // resize array
    this.queue.length =0;
  }
}

// animation object (set of transition queues)
var Animation =api.Animation =function() {
  // initialize transforms object
  this.transforms =new Object;
  
  // init custom data object
  this.custom =new Object;
};

with( Animation) {
  // initialized at construction
  prototype.transforms =null;
  
  // was animation already started?
  prototype.started =false;
  
  // start callback
  prototype.start =null;
  
  // completion callback
  prototype.callback =null;
  
  // current property values
  prototype.currentProps =null;
  
  // Custom data container.
  // initialized at construction.
  prototype.custom =null;
  
  // get property's transition queue
  prototype.getTransitionQueue =function( prop) {
    var ret =this.transforms[ prop];
    
    if( ret ===undefined)
      this.transforms[ prop] =ret =new TransitionQueue();
      
    // return transition queue instance
    return ret;
  };
  
  // add specified transition to specified parameter
  //  transition queue
  prototype.addTransition =function( prop, t) {
    // add transition to transition queue
    this.getTransitionQueue( prop).add( t);
  };
  
  // add specified transition queue to specified parameter
  //  transition queue
  prototype.appendTransitionQueue =function( prop, tq) {
    // add transform queue transforms to local transform queue
    this.getTransitionQueue( prop).merge( tq);
  };
  
  // cancel animation for specified property
  prototype.cancel =function( prop) {
    // see what type of properties passed in
    if( lib.isArray( prop)) {
      // array of properties specified, remove specified properties
      var i;
      for( i =0; i < prop.length; ++i)
        // delete any animation entries
        delete this.transforms[ prop[ i]];
  
    } else {
      // delete target property
      delete this.transforms[ prop];
    }
  };
  
  // Hit next tick. Returns object with properties
  //  that should be changed on element.
  prototype.tick =function( propCallback) {
    // see if animation was previously started
    if( !this.started) {
      // mark animation as started
      this.started =true;
      // call start callback if specified
      if( this.start !==null)
        this.start.call( this);
    }
    
    // reference transform array
    var transforms =this.transforms;
    // return value
    var ret ={
      // did animation complete?
      'completed': false,
      // transform these properties
      'transform': null,
      // callback to call after property setup
      'callback': null
    };
    
    // see if got any properties to transform
    if( lib.count( transforms) ==0) {
      // assume animation completion
      ret.completed =true;
      return ret;
    }
    
    // indexes
    var i, p;
    // transition queue reference
    var tqRet;
    var transition;
    // style property values computed by transitions, these
    // values need to be assigned to element in animation tick
    // completion
    var propTransition ={};
    var hasTransitions =false;
    
    // index all properties involved in current animation
    var involvedProps =[];
    for( p in transforms)
      involvedProps.push( p);
      
    // get current values for those properties
    var currentProps =this.currentProps;
    // see if properties are available
    if( currentProps ===null)
      // obtain properties
      this.currentProps =currentProps =propCallback( involvedProps);
    
    // iterate properties
    for( p in transforms) {
      // hit a tick for current property
      tqRet =transforms[ p].tick( currentProps[ p]);
      
      // store transitions if they specified
      if(( transition =tqRet.transition) !==null) {
        // store property transition state
        propTransition[ p] =currentProps[ p] =transition.computed;
        // mark that we have any transforms to apply
        hasTransitions =true;
      }
        
      // see if animation completed
      if( tqRet.completed)
        // no more transitions for current property
        delete transforms[ p];
    }
    
    // see if has transitions
    if( !hasTransitions)
      // state of properties does not change at current tick
      return ret;
      
    // set properties to transform
    ret.transform =propTransition;
    
    // see if animation completed
    if( lib.count( transforms) ==0) {
      // mark animation as completed
      ret.completed =true;
      
      // reset last property values
      this.currentProps =null;
      
      // pass callback info to higher level
      ret.callback =this.callback;
    }
    
    // return object with properties to change
    return ret;
  };
}

// animation queue object
var AnimationQueue =api.AnimationQueue =function() {
  // initialize animation queue array
  this.queue =new Array;
};

with( AnimationQueue) {
  // initialized at construction
  prototype.queue =null;
  
  // add animation to queue
  prototype.add =function( Animation) {
    this.queue.push( Animation);
  };
  
  // hit a tick, return animation queue completion
  // status
  prototype.tick =function( propCallback) {
    // reference queue
    var queue =this.queue;
    // return value
    var ret ={
      // is animation queue empty?
      'completed': false,
      // transformations to apply
      'transform': null,
      // callback to call after property values changed
      'callback': null,
      // callback context
      'callbackContext': null
    };
    
    // see if got any objects in queue
    if( queue.length ==0) {
      // animation queue is empty, all animations
      // completed
      ret.completed =true;
      return ret;
    }
      
    // reference first animation in the queue
    var A =queue[0];
    
    // hit a tick on an animation
    var animationRet =A.tick( propCallback);
    
    // see what's the status of animation
    if( animationRet.completed) {
      // animation has completed, remove animation from queue
      queue.splice( 0, 1);
      
      // see if callback was passed
      if( animationRet.callback !==null) {
        // execute at higher level
        ret.callback =animationRet.callback;
        ret.callbackContext =A;
      }
    }
    
    // assign properties to transform
    ret.transform =animationRet.transform;
    
    // see if animation queue became empty
    if( queue.length ==0)
      ret.completed =true;
      
    // return animation queue status
    return ret;
  };
}

// list of elements involved in animations
var elems =api.elems =[];

// adds element to animation queue or returns already
//  existing animation entry for specified element
function GetElementAnimationQueue( elem, create) {
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
    'animationQueue': new AnimationQueue()
  });
  
  // return entry
  return entry;
}

// remove element animation info
function RemoveElementAnimationQueue( elem) {
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

// animate
function Animate() {
  // iterate array of elements involved in transition
  var i;
  var entry;
  // property references
  var p;
  // style property values computed by transitions, these
  // values need to be assigned to element in animation tick
  // completion
  var ret;
  var propTransform;
  
  for( i =0; i < elems.length; ++i) {
    entry =elems[ i];
    
    // check if element is still in dom
    if( !lib.dom.inDOM( entry.elem)) {
      // cancel all animations for current element, because it was removed
      // from DOM
      elems.splice( i--, 1);
      continue;
    }
    
    // hit an animation tick
    ret =entry.animationQueue.tick( function( props){
      // return property values
      var propValues =lib.css.get( entry.elem, props);

      // make sure we pass back raw values
      var p;
      for( p in propValues)
        propValues[ p] =api.getPropTransitionRawCSSValue( p, propValues[ p]);
        
      // return property values
      return propValues;
    });
    
    // see if transform has to be applied
    if(( propTransform =ret.transform) !==null) {
      // convert all property values to requested
      for( p in propTransform)
        // assign correct value to apply
        propTransform[ p] =lib.css.getPropCSSValue( p, propTransform[ p]);
        
      // apply transforms
      lib.css.set( entry.elem, propTransform);
    }
    
    // execute callback if requested
    if( ret.callback !==null)
      // use specified context
      ret.callback.call( ret.callbackContext);
      
    // see if animation has completed
    if( ret.completed) {
      // delete entry and continue
      elems.splice( i--, 1);
      continue;
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

// add an animation on an element to play
api.animate =function( elem, Animation) {
  // add animation to animation queue
  GetElementAnimationQueue( elem).animationQueue.add( Animation);
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
  
  //alert( 'transition: ' +current +' -> ' +to +' in ' +remainingMs +'ms (' +parseInt( ticks) +' ticks), add=' +ret.add +', step=' +ret.step +'ms');
  
  // return transition info
  return ret;
};

// get raw CSS value of property
api.getPropTransitionRawCSSValue =function( property, value) {
  // see which property is passed in
  switch( property) {
    case 'opacity':
      // return float
      return parseFloat( value);
      
    default:
      // return integer value
      return parseFloat( value);
  }
};

})( __NAMESPACE__, 'anim');