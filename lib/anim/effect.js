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

// effect information and settings
var config =api.config ={
  // show/hide effect
  'show_hide': {
    // speed easing
    'easing': 15,
    // properties to animate
    'animationProps': [
      'width', 'height', 'opacity',
      'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
      'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
      'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
    ]
  }
};

// get element animation data
api.getEffectData =function( elem, effect) {
  // get data of animation effects
  var ret =lib.data.get( elem, '__anim.effect');
  if( ret ===undefined)
    lib.data.set( elem, '__anim.effect', ret ={});
    
  // see if effect entry exists
  if( ret[ effect] ===undefined)
    // create new entry
    return ret[ effect] ={};
  else
    // return existing entry
    return ret[ effect];
};

// hide effect
api.hide =function( elem, speed, callback) {
  // get effect data
  var effectData =api.getEffectData( elem, 'hide');
  
  // determine hidden state
  if( effectData.hidden ===undefined)
    effectData.hidden =!lib.css.visible( elem);
  
  // see if element is already hidden or is being hid
  if( effectData.hidden || effectData.isHiding)
    // element is already hidden
    return;
    
  // animation property reference
  var animationProps =config.show_hide.animationProps;
  
  // properties to get
  var propertiesGet =lib.clone( animationProps);
  // add display property
  propertiesGet.push( 'display');
    
  // remember current width, height and opacity
  var style =lib.css.get( elem, propertiesGet);
  
  // transition properties
  var transitionProps ={};
  var i;
  var p;
  for( i =0; i < animationProps.length; ++i) {
    // reference property name
    p =animationProps[ i];
    
    transitionProps[ p] ={
      'from': lib.anim.getPropTransitionRawCSSValue( p, style[ p]),
      'to': 0,
      'speed': speed,
      'easing': config.show_hide.easing
    };
  }
  
  // add completion callback to any of the transforms
  transitionProps[ animationProps[0]].completionCallback =function() {
    // store hidden object information
    effectData.hidden =true;
    effectData.isHiding =false;
    
    // store original style info
    effectData.originalStyle =style;
    
    // hide object
    lib.css.setOne( elem, 'display', 'none');
  };
  
  // assign transition
  lib.anim.transform( elem, transitionProps);
};

// show effect
api.show =function( elem, speed, callback) {
  // get effect data
  var effectData =api.getEffectData( elem, 'hide');
  
  // determine hidden state
  if( effectData.hidden ===undefined)
    effectData.hidden =!lib.css.visible( elem);
  
  // see if element is already hidden or is being hid
  if( effectData.hidden || effectData.isHiding)
    // element is already hidden
    return;
    
  // properties to animate
  var animationProps =[
    'width', 'height', 'opacity',
    'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
    'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
    'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
  ];
  
  // properties to get
  var propertiesGet =lib.clone( animationProps);
  // add display property
  propertiesGet.push( 'display');
    
  // remember current width, height and opacity
  var style =lib.css.get( elem, propertiesGet);
  
  // transition properties
  var transitionProps ={};
  var i;
  var p;
  for( i =0; i < animationProps.length; ++i) {
    // reference property name
    p =animationProps[ i];
    
    transitionProps[ p] ={
      'from': lib.anim.getPropTransitionRawCSSValue( p, style[ p]),
      'to': 0,
      'speed': speed,
      'easing': -15
    };
  }
  
  // add completion callback to any of the transforms
  transitionProps[ animationProps[0]].completionCallback =function() {
    // store hidden object information
    effectData.hidden =true;
    effectData.isHiding =false;
    
    // store original style info
    effectData.originalStyle =style;
    
    // hide object
    lib.css.setOne( elem, 'display', 'none');
  };
  
  // assign transition
  lib.anim.transform( elem, transitionProps);
};


})( __NAMESPACE__, 'anim.effect');