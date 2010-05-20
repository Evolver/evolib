
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
	'LOW': 2
};

// effect config
var config =api.config ={
	// effect quality
	'quality': EffectQuality.HIGH
};

// play 'hide' animation
api.hide =function( elem, speed, easing, callback) {
	// check input
	if( callback ===undefined)
		callback ===null;
		
	// list involved properties
	if( config.quality ==EffectQuality.HIGH) {
		var props =[
			'width', 'height', 'opacity', 'font-size', 'line-height',
			'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
			'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
			'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
		];
		
	} else if( config.quality ==EffectQuality.NORMAL) {
		// normal quality
		var props =[
			'width', 'height', 'opacity',
			'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
			'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
			'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
		];
		
	} else {
		// low quality
		var props =[
			'width', 'height',
			'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
			'padding-left', 'padding-right', 'padding-top', 'padding-bottom'
		];
	}
	
	// animation speed
	if( speed ===undefined || speed ===null)
		speed =70;
		
	// animation easing
	if( easing ===undefined || easing ===null)
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
		
		// store original style string
		this.custom.cssStyle =lib.css.getStyle( elem);
		
		// store information on display attribute
		lib.data.set( elem, 'anim.effect.hide.display', lib.css.getOne( elem, 'display'));
		
		// remove any overflow on element
		lib.css.setOne( elem, 'overflow', 'hidden');
	};
	
	// add animation completion callback
	Anim.callback =function() {
		// set original style string
		lib.css.setStyle( elem, this.custom.cssStyle);
		
		// update display attribute (hide element)
		lib.css.setOne( elem, 'display', 'none');
		
		// see if completion callback was specified
		if( callback !==null)
			// call callback
			callback.call( elem);
	};
	
	// play animation
	lib.anim.animate( elem, Anim);
};

// play 'show' animation
api.show =function( elem, speed, easing, callback) {
	// check input
	if( callback ===undefined)
		callback ===null;
		
	// list involved properties
	if( config.quality ==EffectQuality.HIGH) {
		var props =[
			'width', 'height', 'opacity', 'font-size', 'line-height',
			'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
			'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
			'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
		];
		
	} else if( config.quality ==EffectQuality.NORMAL) {
		// normal quality
		var props =[
			'width', 'height', 'opacity',
			'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
			'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
			'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
		];
		
	} else {
		// low quality
		var props =[
			'width', 'height',
			'border-left-width', 'border-right-width', 'border-top-width', 'border-bottom-width',
			'padding-left', 'padding-right', 'padding-top', 'padding-bottom'
		];
	}
	
	// animation speed
	if( speed ===undefined || speed ===null)
		speed =70;
		
	// animation easing
	if( easing ===undefined || easing ===null)
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
			
		// assign display style so that element becomes visible
		lib.css.setOne( elem, 'display', disp);
		
		// store original css style (this includes correct 'display' property also)
		this.custom.cssStyle =lib.css.getStyle( elem);
		
		// get current computed style for the element
		var style =lib.css.get( elem, props);
		
		// nullify all values involved in rendering
		var newProps ={};
		
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
	};
		
	// when animation completes, restore overflow
	Anim.callback =function() {
		// set style
		lib.css.setStyle( elem, this.custom.cssStyle);
		
		// see if completion callback was specified
		if( callback !==null)
			// call callback
			callback.call( elem);
	};
	
	// play animation
	lib.anim.animate( elem, Anim);
};

})( EVOLIB_EXPORT, 'anim.effect');