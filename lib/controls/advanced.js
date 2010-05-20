
// advanced control driver

(function( lib, namespace){
	
// define api
var api =lib.namespace( namespace), undefined;

// dependencies: controls
if( lib.controls ===undefined)
	throw new ErrorException( 'lib.controls is required by lib.controls.advanced');
if( lib.dom ===undefined)
	throw new ErrorException( 'lib.dom is required by lib.controls.advanced');
if( lib.data ===undefined)
	throw new ErrorException( 'lib.data is required by lib.controls.advanced');
if( lib.css ===undefined)
	throw new ErrorException( 'lib.css is required by lib.controls.advanced');

// import classes
var ErrorException =lib.classref( 'ErrorException');

var support =api.support ={
		// needs to loose focus for change triggering?
		'needsFocusLooseToTriggerChange': document.releaseCapture !==undefined ? true : false,
		// is change event being fired when value changes while having focus?
		'triggersChangeOnClick': false,
		// is change event being fired when click() event is fired?
		'triggersChangeOnClickWithFocus': false
};

// testing data container
var test ={
	'input': document.createElement( 'INPUT'),
	'testChangeOnClick': function() {
		api.support.triggersChangeOnClick =true;
		api.support.triggersChangeOnClickWithFocus =true;
	},
	'testChangeOnClickWithFocus': function(){
		api.support.triggersChangeOnClickWithFocus =true;
	},
	'activeElement': document.activeElement ===null ? document.documentElement : document.activeElement
};

// perform tests on checkboxes
test.input.type ='checkbox';
test.input.checked =false;

//add element to document
document.documentElement.appendChild( test.input);

// test change without focus
lib.event.bind( test.input, 'change', test.testChangeOnClick);
lib.event.trigger( test.input, 'click');
lib.event.unbind( test.input, 'change');

if( !api.support.triggersChangeOnClick) {
	// test change within focus/blur condition
	lib.event.bind( test.input, 'change', test.testChangeOnClickWithFocus);
	lib.event.trigger( test.input, 'focus');
	lib.event.trigger( test.input, 'click');
	lib.event.trigger( test.activeElement, 'focus');
	lib.event.unbind( test.input, 'change');
}

// remove element from document
document.documentElement.removeChild( test.input);

// cleanup after testing
delete test;

// refocuses on element (event handler)
function TriggerRefocus( e) {
	if( e.eventPhase !=e.AT_TARGET)
		// must be at target
		return;
	
	// reference current object
	var self =this;
	
	setTimeout( function(){
		if( document.activeElement ===self)
			lib.event.trigger( document.documentElement, 'focus');
		
		// focus element
		lib.event.trigger( self, 'focus');
	}, 0);
};

// triggers focus and then refocuses on element (event handler)
function TriggerFocusWithRefocus( e) {
	if( e.eventPhase !=e.AT_TARGET)
		// must be at target
		return;
	
	if( document.activeElement !==this)
		// focus on target element
		lib.event.trigger( this, 'focus');
	
	// trigger refocus
	TriggerRefocus( e);
};

// define driver class
var Driver =api.Driver =function(){
	// reference current object
	var self =this;
	
	lib.ready( function(){
		// sync all controls on document ready
		self.sync();
	});
};

with( Driver) {
	// copy default prototype
	lib.extend( prototype, lib.controls.Driver.prototype);
	
	// append prototype
	
	// list of attached controls
	prototype.controls ={};
	
	// types of form controls
	prototype.FORM_CONTROL_TEXT ='text';
	prototype.FORM_CONTROL_TEXTAREA ='textarea';
	prototype.FORM_CONTROL_CHECKBOX ='checkbox';
	prototype.FORM_CONTROL_RADIOBOX ='radiobox';
	prototype.FORM_CONTROL_SELECTBOX ='selectbox';
	prototype.FORM_CONTROL_BUTTON ='button';
}

// get form control type
Driver.prototype.getControlType =function( object) {
	switch( object.nodeName) {
		// simple input
		case 'INPUT':
			switch( object.type) {
				// text input
				case 'text':
				case 'password':
					return this.FORM_CONTROL_TEXT;
				break;
				// button
				case 'submit':
				case 'reset':
					return this.FORM_CONTROL_BUTTON;
				break;
				// checkbox
				case 'checkbox':
					return this.FORM_CONTROL_CHECKBOX;
				break;
				// radiobox
				case 'radio':
					return this.FORM_CONTROL_RADIOBOX;
				break;
				// unsupported input
				default:
					throw new ErrorException( 'Input type "' +object.type +'" is not supported');
				break;
			}
		break;
		// text area
		case 'TEXTAREA':
			return this.FORM_CONTROL_TEXTAREA;
		break;
		// select object
		case 'SELECT':
			return this.FORM_CONTROL_SELECTBOX;
		break;
		// unsupported object
		default:
			throw new ErrorException( 'Control "' +object.nodeName +'" is not supported');
		break;
	}
};

// add and init form control
Driver.prototype.add =function( object) {
	// determine type of form control
	var self =this;

	// get object's unique id
	var uid =lib.getUid( object);
	
	if( this.controls[ uid] !==undefined)
		// object is already registered
		return;
	
	// get control type
	var type =this.getControlType( object);
	
	// add object to the list of registered controls
	this.controls[ uid] =object;
	
	lib.event.bind( object, 'remove', function(){
		// when object is removed from DOM, remove it from control registry
		self.remove( this);
	});

	// initialize control
	this.initControl( object, type);
};

// deinit and remove object from driver
Driver.prototype.remove =function( object) {
	
	if( object ===undefined) {
		// remove all controls
		var f;
		while(( f =lib.first( this.controls)) !==undefined)
			// one by one
			this.remove( f);
		return;
	}
	// get object's unique id
	var uid =lib.getUid( object);
	
	if( this.controls[ uid] ===undefined)
		// object is not within control list
		return;
	
	// deinitialize control
	this.deinitControl( object, this.getControlType( object));
	
	// remove object from list of controls
	delete this.controls[ uid];
};

// synchronizes form control with the subsystem
Driver.prototype.sync =function( object) {
	
	if( object ===undefined) {
		// sync all controls
		for( var k in this.controls)
			// one by one
			this.sync( this.controls[ k]);
		return;
	}
	
	// sync control
	switch( this.getControlType( object)) {
		case this.FORM_CONTROL_TEXT:
			this.syncTextControl( object);
		break;
		case this.FORM_CONTROL_TEXTAREA:
			this.syncTextareaControl( object);
		break;
		case this.FORM_CONTROL_CHECKBOX:
			this.syncCheckboxControl( object);
		break;
		case this.FORM_CONTROL_RADIOBOX:
			this.syncRadioboxControl( object);
		break;
		case this.FORM_CONTROL_SELECTBOX:
			this.syncSelectboxControl( object);
		break;
		case this.FORM_CONTROL_BUTTON:
			this.syncButtonControl( object);
		break;
		default:
			lib.debug( 'Don\'t know how to sync control ' +type);
		break;
	}
};

// initialize control
Driver.prototype.initControl =function( object, type) {
	switch( type) {
		case this.FORM_CONTROL_TEXT:
			this.initTextControl( object);
		break;
		case this.FORM_CONTROL_TEXTAREA:
			this.initTextareaControl( object);
		break;
		case this.FORM_CONTROL_CHECKBOX:
			this.initCheckboxControl( object);
		break;
		case this.FORM_CONTROL_RADIOBOX:
			this.initRadioboxControl( object);
		break;
		case this.FORM_CONTROL_SELECTBOX:
			this.initSelectboxControl( object);
		break;
		case this.FORM_CONTROL_BUTTON:
			this.initButtonControl( object);
		break;
		default:
			lib.debug( 'Don\'t know how to initialize control ' +type);
		break;
	}
};

// initialize text control
Driver.prototype.initTextControl =function( object) {
};

// initialize textarea control
Driver.prototype.initTextareaControl =function( object) {
};

// initialize checkbox control
Driver.prototype.initCheckboxControl =function( object) {
	
	if( support.needsFocusLooseToTriggerChange) {
		lib.event.bind( object, 'keyup', TriggerRefocus);
		lib.event.bind( object, 'mouseup', TriggerRefocus);
		lib.event.bind( object, 'click', TriggerFocusWithRefocus);
	}
	
	// remember old checkbox display properties
	//lib.data.set( object, '__oldCSS', lib.css.style( object, ['']));
};

// initialize radiobox control
Driver.prototype.initRadioboxControl =function( object) {
	
	if( support.needsFocusLooseToTriggerChange) {
		lib.event.bind( object, 'keyup', TriggerRefocus);
		lib.event.bind( object, 'mouseup', TriggerRefocus);
		lib.event.bind( object, 'click', TriggerFocusWithRefocus);
	}
	
};

// initialize selectbox control
Driver.prototype.initSelectboxControl =function( object) {
};

// initialize button control
Driver.prototype.initButtonControl =function( object) {
};

// deinitialize control
Driver.prototype.deinitControl =function( object, type) {
	switch( type) {
		case this.FORM_CONTROL_TEXT:
			this.deinitTextControl( object);
		break;
		case this.FORM_CONTROL_TEXTAREA:
			this.deinitTextareaControl( object);
		break;
		case this.FORM_CONTROL_CHECKBOX:
			this.deinitCheckboxControl( object);
		break;
		case this.FORM_CONTROL_RADIOBOX:
			this.deinitRadioboxControl( object);
		break;
		case this.FORM_CONTROL_SELECTBOX:
			this.deinitSelectboxControl( object);
		break;
		case this.FORM_CONTROL_BUTTON:
			this.deinitButtonControl( object);
		break;
		default:
			lib.debug( 'Don\'t know how to deinitialize control ' +type);
		break;
	}
};

Driver.prototype.deinitTextControl =function( object) {
};
Driver.prototype.deinitTextareaControl =function( object) {
};
Driver.prototype.deinitCheckboxControl =function( object) {
	
	if( support.needsFocusLooseToTriggerChange) {
		lib.event.unbind( object, 'keyup', TriggerRefocus);
		lib.event.unbind( object, 'mouseup', TriggerRefocus);
		lib.event.unbind( object, 'click', TriggerFocusWithRefocus);
	}

};
Driver.prototype.deinitRadioboxControl =function( object) {
	
	if( support.needsFocusLooseToTriggerChange) {
		lib.event.unbind( object, 'keyup', TriggerRefocus);
		lib.event.unbind( object, 'mouseup', TriggerRefocus);
		lib.event.unbind( object, 'click', TriggerFocusWithRefocus);
	}
	
};
Driver.prototype.deinitSelectboxControl =function( object) {
};
Driver.prototype.deinitButtonControl =function( object) {
};

// sync controls

Driver.prototype.syncTextControl =function( object) {
};
Driver.prototype.syncTextareaControl =function( object) {
};
Driver.prototype.syncCheckboxControl =function( object) {
};
Driver.prototype.syncRadioboxControl =function( object) {
};
Driver.prototype.syncSelectboxControl =function( object) {
};
Driver.prototype.syncButtonControl =function( object) {
};

	
})( EVOLIB_EXPORT, 'controls.advanced');