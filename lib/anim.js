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
  'step': 22,
  // compensate processing time
  'compensateProcessingTime': false
};

// current stepping
var stepping =config.step;

// last time when animation step was executed
var lastSteppingTime =null;

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
  prototype.tick =function( availableTimeMs, current) {
    // return value
    var ret ={
      // did transition complete
      'completed': false,
      // how time did tick consume
      'timeConsumed': 0
    };
    
    // get next transition information
    var nextTransition =api.getNextTransition( current, this.to, availableTimeMs, this.remainingMs);
    
    // remember time consumed
    ret.timeConsumed =nextTransition.step;
    
    // add current values
    this.computed =current +nextTransition.add;
    this.remainingMs -=nextTransition.step;
    
    // see if no more ms remaining
    if( this.remainingMs <=0) {
      // call a callback if defined
      if( this.callback !==null) {
        // callback decides whether to continue animation or
        //  abort it
        if(( ret.completed =this.callback.call( this)) ===undefined)
          // assume animation completed
          ret.completed =true;
      }
        
      // animation completed
      ret.completed =true;
      
    } else {
      // determine value from which to calculate easing
      var easing =stepping *this.easingFactor;

      // apply easing
      this.remainingMs +=easing;
    }

    // return status
    return ret;
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
  prototype.tick =function( availableTimeMs, current) {
    // reference transition queue
    var queue =this.queue;
    // return value
    var ret ={
      // is transform queue empty?
      'completed': false,
      // computed value
      'computed': null,
      // time consumed to perform calculations
      'timeConsumed': 0
    };
    
    // see if transform queue is empty
    if( queue.length ==0) {
      // no more transforms to calculate,
      // animation completed
      ret.completed =true;
      return ret;
    }
      
    // transition object reference
    var T;
    var noMoreTransitions =false;
    var timeConsumed =0;
    var tsRet;
    
    while( availableTimeMs >0) {
      // reference first transition in queue
      T =queue[0];
      
      // hit tick
      var tsRet =T.tick( availableTimeMs, current);
      
      // increment time consumed
      timeConsumed +=tsRet.timeConsumed;
      // decrement available time
      availableTimeMs -=tsRet.timeConsumed;
      
      // assign computed value
      ret.computed =T.computed;
  
      // see if completed
      if( tsRet.completed) {
        // remove transition from queue
        queue.splice( 0, 1);
        
        // check if got any more transitions to execute
        if( lib.count( queue) ==0) {
          // got no more transitions
          noMoreTransitions =true;
          break;
        }
      }
    }
    
    // assign time consumed
    ret.timeConsumed =timeConsumed;
    
    // see if transition queue became empty
    if( noMoreTransitions)
      // mark queue as emptied
      ret.completed =true;
    
    // return transition
    return ret;
  };
  
  // clear transition queue
  prototype.clear =function() {
    // resize array
    this.queue.length =0;
  };
  
  // stop any transitions
  prototype.stop =function() {
    // reference transition queue
    var queue =this.queue;
    
    // iterate queue
    var i;
    for( i =0; i < queue.length; ++i)
      // reset remainingMs to 0
      queue[ i].remainingMs =0;
  };
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
  
  // is being stopped
  prototype.stopped =false;
  
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
    // see if animation has been stopped
    if( this.stopped)
      // reset transition's remainingMs to 0
      t.remainingMs =0;
      
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
  prototype.tick =function( availableTimeMs, propGetCallback, propSetCallback) {
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
      // time consumed to execute animation
      'timeConsumed': 0
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
    var computed;
    // style property values computed by transitions, these
    // values need to be assigned to element in animation tick
    // completion
    var propTransition ={};
    var hasTransitions =false;
    
    // create time counters for all transforms
    var transformTiming ={};
    
    // index all properties involved in current animation
    var involvedProps =[];
    for( p in transforms) {
      involvedProps.push( p);
      transformTiming[ p] =availableTimeMs;
    }
      
    // get current values for those properties
    var currentProps =this.currentProps;
    // see if properties are available
    if( currentProps ===null)
      // obtain properties
      this.currentProps =currentProps =propGetCallback( involvedProps);
    
    // perform property transformations
    var noPendingTransforms =false;
    var noTimeForTransforms =true;
    
    // while there is time to execute transition queues
    while( true) {
      
      // iterate properties
      for( p in transforms) {
        // hit a tick for current property
        tqRet =transforms[ p].tick( transformTiming[ p], currentProps[ p]);
        
        // decrement available time
        transformTiming[ p] -=tqRet.timeConsumed;
        
        // store computed value
        if(( computed =tqRet.computed) !==null) {
          // store property transition state
          propTransition[ p] =currentProps[ p] =computed;
          // mark that we have any transforms to apply
          hasTransitions =true;
        }
          
        // see if animation completed
        if( tqRet.completed)
          // no more transitions for current property
          delete transforms[ p];
          
        // see if there is still time for transformations to apply
        if( transformTiming[ p] >0)
          // there is still time to execute rest of transforms
          noTimeForTransforms =false;
      }
      
      // see if any transforms are pending
      if( lib.count( transforms) ==0) {
        // no more transforms to apply
        noPendingTransforms =true;
        break;
      }
      
      // see if all transformations have hit their time limit
      if( noTimeForTransforms)
        // time limit hit
        break;
    }
    
    // set consumed time
    if( noTimeForTransforms) {
      // all time consumed
      ret.timeConsumed =availableTimeMs;
      
    } else {
      // maximum time consumption
      var max =0;
      var t;
      // only part of time consumed, get maximum time consumption
      // from transform timing object
      for( p in transformTiming) {
        t =availableTimeMs -transformTiming[ p];
        
        // update maximum
        if( t > max)
          max =t;
      }
      
      // set consumed time
      ret.timeConsumed =max;
    }
    
    // see if has transitions
    if( !hasTransitions)
      // state of properties does not change at current tick
      return ret;
      
    // transform properties
    propSetCallback( propTransition);
    
    // see if animation completed
    if( noPendingTransforms) {
      // mark animation as completed
      ret.completed =true;
      
      // reset last property values
      this.currentProps =null;
      
      // call completion callback if specified
      if( this.callback !==null)
        this.callback.call( this);
    }
    
    // return object with properties to change
    return ret;
  };
  
  // stop active animations
  prototype.stop =function() {
    // mark as stopped
    this.stopped =true;

    // reference transforms
    var transforms =this.transforms;
    
    // iterate all transforms
    var p;
    for( p in transforms)
      // stop active transforms
      transforms[ p].stop();
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
  prototype.tick =function( availableTimeMs, propGetCallback, propSetCallback) {
    // reference queue
    var queue =this.queue;
    // return value
    var ret ={
      // is animation queue empty?
      'completed': false
    };
    
    // see if got any objects in queue
    if( queue.length ==0) {
      // animation queue is empty, all animations
      // completed
      ret.completed =true;
      return ret;
    }
      
    // animation object reference
    var A;
    var noMoreAnimations =false;
    
    while( availableTimeMs >0) {
      // reference first animation in the queue
      A =queue[0];
      
      // hit a tick on an animation
      var animationRet =A.tick( availableTimeMs, propGetCallback, propSetCallback);
      
      // decrement available time
      availableTimeMs -=animationRet.timeConsumed;
      
      // see what's the status of animation
      if( animationRet.completed) {
        // animation has completed, remove animation from queue
        queue.splice( 0, 1);
        
        if( lib.count( queue) ==0) {
          // no more animations got
          noMoreAnimations =true;
          break;
        }
      }
    }
    
    // see if animation queue became empty
    if( noMoreAnimations)
      ret.completed =true;
      
    // return animation queue status
    return ret;
  };
  
  // stop animation
  prototype.stop =function() {
    // reference animation queue
    var queue =this.queue;
    
    // see if got any animations in queue
    if( queue.length ==0)
      // queue already emptied
      return;
      
    // iterate all animations in queue
    var i;
    for( i =0; i < queue.length; ++i) {
      // instruct animation to drop it's transition queue's
      //  each transition's remainingMs to 0
      queue[ i].stop();
    }
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
  // see if processing time compensation enabled
  if( config.compensateProcessingTime) {
    // get time in milliseconds
    var timeMs =lib.getTimeMs();
    
    // calculate corrent stepping time
    if( lastSteppingTime !==null)
      // set stepping
      stepping =timeMs -lastSteppingTime;
      
    // remember new last stepping time
    lastSteppingTime =lib.getTimeMs();
    
  } else {
    // assign stepping to configuration step
    stepping =config.step;
  }
  
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
    ret =entry.animationQueue.tick(
      // available time
      stepping,
      
      // callback to get properties
      function( props){
        // return property values
        var propValues =lib.css.get( entry.elem, props);
  
        // make sure we pass back raw values
        var p;
        for( p in propValues)
          propValues[ p] =api.getPropTransitionRawCSSValue( p, propValues[ p]);
          
        // return property values
        return propValues;
      },
      
      // callback to set properties
      function( props) {
        // convert all property values
        var p;
        for( p in props)
          // assign correct value to apply
          props[ p] =lib.css.getPropCSSValue( p, props[ p]);
          
        // apply transforms
        lib.css.set( entry.elem, props);
      }
    );
      
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
  
  // next animation step delay
  var step =config.step;
  
  // see if processing time compensation is enabled
  if( config.compensateProcessingTime) {
    // see if animation execution took too long (time diff
    //  exceeds config.step)
    var timeDiffMs =lib.getTimeMs() -lastSteppingTime;
    
    if( step <= timeDiffMs)
      // next step should be executed instantly
      step =0;
    else
      // otherwise subtract time taken for calculations
      //  from next step delay time
      step -=timeDiffMs;
  }

  // delay next tick.
  setTimeout( AnimationTick, step);
}

// start animation loop
AnimationTick();

// add an animation on an element to play
api.animate =function( elem, Animation) {
  // add animation to animation queue
  GetElementAnimationQueue( elem).animationQueue.add( Animation);
};

// stop any animations on element
api.stop =function( elem) {
  // get element animation queue
  var entry =GetElementAnimationQueue( elem, false);
  
  // see if element has got any animations
  if( entry ===undefined)
    // all animations already stopped
    return;
    
  // instruct animation queue to instantly stop all animations
  entry.animationQueue.stop();
  
  // run animation routine
  Animate();
};

// get next transition info
api.getNextTransition =function( current, to, stepMs, remainingMs) {
  // current - current value
  // to - final value to be after animation completes
  // stepMs - animation step in milliseconds
  // remainingMs - how much ms available till animation completes
  
  // calculate range
  var range =to -current;
  // calculate tick count till animation completes
  var ticks =remainingMs / stepMs;
  
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
    ret.step =stepMs;
  }

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