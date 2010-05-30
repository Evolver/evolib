
(function( lib, namespace){

// declare namespace
var api =lib.namespace( namespace), undefined;

// dependencies: anim, data, css

// import classes
var ErrorException =lib.classref( 'ErrorException');
var Animation =lib.anim.Animation;
var Transition =lib.anim.Transition;

// effect levels
var EffectQuality =api.EffectQuality ={
	// high quality
	'HIGH': 0,
	// medium quality
	'NORMAL': 1,
	// low quality
	'LOW': 2,
	// no effects
	'NO_EFFECTS': 3
};

// config
var config =api.config ={
	// effect quality
	'quality': EffectQuality.HIGH
};

// effect config
var effectConfig ={};


// show/hide effect
effectConfig['show_hide'] ={};

// high quality effect
effectConfig['show_hide'][ EffectQuality.HIGH] =[
	'width', 'height', 'opacity', 'font-size', 'line-height',
	'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
	'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
	'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
];

// normal quality effect
effectConfig['show_hide'][ EffectQuality.NORMAL] =[
	'width', 'height', 'opacity',
	'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
	'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
	'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
];

// low quality effect
effectConfig['show_hide'][ EffectQuality.LOW] =[
	'width', 'height',
	'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
	'padding-left', 'padding-right', 'padding-top', 'padding-bottom'
];

// play 'hide' animation
api.hide =function( elem, speed, easing, callback) {
	
	// animation speed
	if( speed ===undefined || speed ===null)
		speed =70;
		
	// animation easing
	if( easing ===undefined || easing ===null)
		easing =0.7;
	
	// get animation properties
	var props =effectConfig['show_hide'][ config.quality];
	
	// create animation
	var Anim =new Animation();
		
	// when animation starts, setup
	Anim.start =function() {

		if( props !==undefined) {
			// make sure element is being displayed
			//lib.css.memorize( elem, 'display');
			//lib.css.show( elem);
			
			// store original style string
			this.custom.cssStyle =lib.css.getStyle( elem);
			
			// restore element
			//lib.css.restore( elem);
				
			// hide any overflow on element
			lib.css.setOne( elem, 'overflow', 'hidden');
			
			// create property transitions
			var i;
			for( i =0; i < props.length; ++i)
				Anim.addTransition( props[ i], new Transition( 0, speed, easing));
		}
	};
	
	// add animation completion callback
	Anim.callback =function() {

		if( props !==undefined) {
			// set original style string
			lib.css.setStyle( elem, this.custom.cssStyle);
		}
		
		// hide element
		lib.css.hide( elem);
		
		// see if completion callback was specified
		if( callback !==undefined)
			// call callback
			callback.call( elem);
	};
	
	// play animation
	lib.anim.animate( elem, Anim);
};

// play 'show' animation
api.show =function( elem, speed, easing, callback) {

	// animation speed
	if( speed ===undefined || speed ===null)
		speed =70;
		
	// animation easing
	if( easing ===undefined || easing ===null)
		easing =0.7;
	
	// get animation properties
	var props =effectConfig['show_hide'][ config.quality];

	// create animation
	var Anim =new Animation();
		
	// when animation starts, setup
	Anim.start =function() {
		
		if( props !==undefined) {
			// make sure element is being displayed
			lib.css.memorize( elem, 'display');
			lib.css.show( elem);
			
			// store original css style (this includes correct 'display' property also)
			this.custom.cssStyle =lib.css.getStyle( elem);
			
			// restore state
			lib.css.restore( elem);
			
			// vaporize element
			lib.css.vaporize( elem);
			
			// get current computed style for the element
			var style =lib.css.get( elem, props);
			
			// restore element
			lib.css.restore( elem);
			
			// nullify all values involved in rendering
			var newProps ={};
			
			var p, i;
			for( i =0; i < props.length; ++i)
				newProps[ p =props[ i]] =lib.css.getPropCSSValue( p, 0);
			
			// hide overflow
			newProps['overflow'] ='hidden';
				
			// assign new style props
			lib.css.set( elem, newProps);
			
			// create property transitions
			for( i =0; i < props.length; ++i)
				this.addTransition( p =props[ i], new Transition( lib.anim.getPropTransitionRawCSSValue( p, style[ p]), speed, easing));
		}
		
		// show element if was hidden
		lib.css.show( elem);
	};
		
	// when animation completes, restore overflow
	Anim.callback =function() {
		
		if( props !==undefined) {
			// set style
			lib.css.setStyle( elem, this.custom.cssStyle);
		}
		
		// see if completion callback was specified
		if( callback !==undefined)
			// call callback
			callback.call( elem);
	};
	
	// play animation
	lib.anim.animate( elem, Anim);
};

// play 'fadeTo' animation
api.fadeTo =function( elem, opacity, speed, easing, callback) {
	
	// animation speed
	if( speed ===undefined || speed ===null)
		speed =150;
		
	// animation easing
	if( easing ===undefined || easing ===null)
		easing =0;

	// create animation
	var Anim =new Animation();
		
	// when animation starts, setup
	Anim.start =function() {
		
		if( config.quality ==EffectQuality.NO_EFFECTS) {
			// if effects are disabled, just set opacity to target opacity
			lib.css.style( elem, 'opacity', opacity);
			return;
		}
		
		// create opacity transition
		this.addTransition( 'opacity', new Transition( lib.anim.getPropTransitionRawCSSValue( 'opacity', opacity), speed, easing));
	};
		
	// when animation completes, restore overflow
	Anim.callback =function() {
		
		// see if completion callback was specified
		if( callback !==undefined)
			// call callback
			callback.call( elem);
	};
	
	// play animation
	lib.anim.animate( elem, Anim);
};

// play 'fadeIn' animation
api.fadeIn =function( elem, speed, easing, callback) {
	
	// make sure element is being shown and is
	//  transparent
	lib.css.show( elem);
	lib.css.style( elem, 'opacity', 0);
	
	api.fadeTo( elem, 1, speed, easing, function(){
		
		if( callback !==undefined)
			// execute callback
			callback.call( elem);
	});
};

// play 'fadeOut' animation
api.fadeOut =function( elem, speed, easing, callback) {
	
	api.fadeTo( elem, 0, speed, easing, function(){
		
		// hide element
		lib.css.hide( elem);
		
		if( callback !==undefined)
			// execute callback
			callback.call( elem);
	});
};

})( EVOLIB_EXPORT, 'anim.effect');