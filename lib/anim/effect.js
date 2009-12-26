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

// dependencies: anim, data, css

// import classes
var ErrorException =lib.classref( 'ErrorException');
var Animation =lib.anim.Animation;
var Transition =lib.anim.Transition;

// play 'hide' animation
api.hide =function( elem, speed, easing) {
  // list involved properties
  var props =[
    'width', 'height', 'opacity', 'font-size', 'line-height',
    'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
    'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
    'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
  ];
  
  // animation speed
  if( speed ===undefined)
    speed =70;
    
  // animation easing
  if( easing ===undefined)
    easing =0.7;
  
  // create animation
  var Anim =new Animation();
    
  // when animation starts, setup
  Anim.start =function() {
    // see if element is already hidden
    if( !lib.css.visible( elem))
      // element is already hidden
      return;
      
    // create property transitions
    var i;
    for( i =0; i < props.length; ++i)
      Anim.addTransition( props[ i], new Transition( 0, speed, easing));
      
    // store element style at animation start
    var style =this.custom.style =lib.css.get( elem, props.concat(['display', 'overflow']));
    
    // store information on display attribute
    lib.data.set( elem, 'anim.effect.hide.display', style['display']);
    
    // remove any overflow on element
    lib.css.setOne( elem, 'overflow', 'hidden');
  };
  
  // add animation completion callback
  Anim.callback =function() {
    // reference original style
    var style =this.custom.style;
    
    // restore style, but hide element
    style['display'] ='none';
    
    // set style
    lib.css.set( elem, style);
  };
  
  // play animation
  lib.anim.animate( elem, Anim);
};

// play 'show' animation
api.show =function( elem, speed, easing) {
  // list involved properties
  var props =[
    'width', 'height', 'opacity', 'font-size', 'line-height',
    'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
    'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
    'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
  ];
  
  // animation speed
  if( speed ===undefined)
    speed =70;
    
  // animation easing
  if( easing ===undefined)
    easing =0.7;

  // create animation
  var Anim =new Animation();
    
  // when animation starts, setup
  Anim.start =function() {
    // see if element is hidden
    if( lib.css.visible( elem))
      // element is already visible
      return;
      
    // determine display property to be assigned to an element
    var disp =lib.data.get( elem, 'anim.effect.hide.display');
    if( disp ===undefined) {
      // use element's default display
      disp =lib.css.getDefaultDisplay( elem.nodeName);
      
    } else {
      // remove stored display info
      lib.data.remove( elem, 'anim.effect.hide.display');
    }
      
    // assign all style props to be 0 and restore visibility
    var newProps ={
      'display': disp,
      'visibility': 'visible'
    };
    // assign props so element becomes visible
    lib.css.set( elem, newProps);
    
    // get current computed style for the element
    var style =lib.css.get( elem, props.concat( 'overflow'));
    
    // nullify all values involved in rendering
    delete newProps['display'];
    delete newProps['visibility'];
    
    // hide overflow
    newProps['overflow'] ='hidden';
    
    var p, i;
    for( i =0; i < props.length; ++i)
      newProps[ p =props[ i]] =lib.css.getPropCSSValue( p, 0);
      
    // assign new style props
    lib.css.set( elem, newProps);
    
    // create property transitions
    for( i =0; i < props.length; ++i)
      this.addTransition( p =props[ i], new Transition( lib.anim.getPropTransitionRawCSSValue( p, style[ p]), speed, easing));
    
    // store original style
    this.custom.style =style;
  };
    
  // when animation completes, restore overflow
  Anim.callback =function() {
    // reference original style
    var style =this.custom.style;
    
    // restore overflow
    lib.css.setOne( elem, 'overflow', style['overflow']);
  };
  
  // play animation
  lib.anim.animate( elem, Anim);
};

})( __NAMESPACE__, 'anim.effect');