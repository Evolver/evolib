
(function( lib, namespace){

// declare namespace
var api =lib.namespace( namespace), undefined;

// dependencies: dom, data
if( lib.dom ===undefined)
	throw 'lib.dom is required by lib.event';
if( lib.data ===undefined)
	throw 'lib.data is required by lib.event';

// stub for debugging
api.debug =function( msg){};

// currently bound handler count
api.boundHandlers =0;

// currently handled event count
api.handledEvents ={};

// event models
var EventModels ={
	W3C: 0,
	IE: 1
};

// determine event model
var eventModel =(document.addEventListener !==undefined ? EventModels.W3C : EventModels.IE);

// detect if click event is triggerable by implicit MouseEvent
var clickTriggerable =true;
if( eventModel ==EventModels.W3C) {
	// create initial value in window object
	window.__clickTriggerable =false;
	
	// create anchor element to determine clickability
	var anchor =document.createElement( 'A');
	anchor.href ='javascript: window.__clickTriggerable=true;';
	
	// inject element into DOM
	document.documentElement.appendChild( anchor);
	
	// create event
	var evt =document.createEvent( 'MouseEvents');
	evt.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	anchor.dispatchEvent( evt);
	
	// remove element from DOM
	document.documentElement.removeChild( anchor);
	
	// store test result
	clickTriggerable =window.__clickTriggerable;
	
	// cleanup
	delete evt;
	delete anchor;
	delete window.__clickTriggerable;
}

// elements for testing event support
var divElement =document.createElement( 'DIV');
var inputElement =document.createElement( 'INPUT');
var formElement =document.createElement( 'FORM');
var optionElement =document.createElement( 'OPTION');
var frameElement =document.createElement( 'IFRAME');

// function to check if event is supported
function isEventSupported( elem, eventType) {
	// build handler name
	var handlerName ='on' +eventType.toLowerCase();
	
	// see if 'onXXXX' property exists
	if( handlerName in elem)
		// property exists, event is supported
		return true;
		
	// FF does not support the event support detection using
	// bethod above, so we do a bit of hacking here. We create
	// onXXXX attribute and see what type is it after creation.
	
	var result;
		
	// see if setAttribute is supported
	if( elem.setAttribute ===undefined) {
		// try to assign attribute explicitly
		result =(elem[ handlerName] ='return true;');
		
		// cleanup
		elem[ handlerName] ='';
		
	} else {
		// use setAttribute method
		elem.setAttribute( handlerName, 'return true;');
		result =elem[ handlerName];
		
		// cleanup
		elem.removeAttribute( handlerName);
	}
	
	if( typeof result ==='function')
		// event supported
		return true;
		
	// not supported
	return false;
}

// native event list (export this list)
var events =api.nativeEvents ={
	
	// Mouse events
	//	http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
	'click': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'click')
	},
	'mousedown': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'mousedown')
	},
	'mouseup': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'mouseup')
	},
	'mouseover': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'mouseover')
	},
	'mousemove': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( divElement, 'mousemove')
	},
	'mouseout': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'mouseout')
	},
	
	// Mouse events
	//  http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevents
	'dblclick': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'dblclick')
	},
	'mouseenter': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': false,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'mouseenter')
	},
	'mouseleave': {
		'type': 'MouseEvents',
		'interface': 'MouseEvent',
		'bubbles': false,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'mouseleave')
	},
	'mousewheel': {
		'type': 'MouseWheelEvents',
		'interface': 'MouseWheelEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( divElement, 'mousewheel')
	},
	
	// HTML event types
	//	http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-htmlevents
	'load': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': false,
		'cancelable': false,
		'supported': isEventSupported( frameElement, 'load')
	},
	'unload': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': false,
		'cancelable': false,
		'supported': isEventSupported( frameElement, 'unload')
	},
	'abort': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( frameElement, 'abort')
	},
	'error': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( frameElement, 'error')
	},
	'select': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( optionElement, 'select')
	},
	'change': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( inputElement, 'change')
	},
	'submit': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( formElement, 'submit')
	},
	'reset': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( formElement, 'reset')
	},
	'resize': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( window, 'resize') || isEventSupported( frameElement, 'resize')
	},
	'scroll': {
		'type': 'HTMLEvents',
		'interface': 'Event',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( frameElement, 'scroll')
	},
	
	// UI events
	//	http://www.w3.org/TR/DOM-Level-3-Events/#events-uievents
	'DOMActivate': {
		'type': 'UIEvents',
		'interface': 'UIEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( document.documentElement, 'DOMActivate')
	},
	'DOMFocusIn': {
		'type': 'UIEvents',
		'interface': 'UIEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( document.documentElement, 'DOMFocusIn')
	},
	'DOMFocusOut': {
		'type': 'UIEvents',
		'interface': 'UIEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( document.documentElement, 'DOMFocusOut')
	},
	'focus': {
		'type': 'UIEvents',
		'interface': 'UIEvent',
		'bubbles': false,
		'cancelable': false,
		'supported': isEventSupported( inputElement, 'focus')
	},
	'focusin': {
		'type': 'UIEvents',
		'interface': 'UIEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( inputElement, 'focusin')
	},
	'focusout': {
		'type': 'UIEvents',
		'interface': 'UIEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( inputElement, 'focusout')
	},
	'blur': {
		'type': 'UIEvents',
		'interface': 'UIEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( inputElement, 'blur')
	},
	
	// Mutation events
	//	http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mutationevents
	'DOMSubtreeModified': {
		'type': 'MutationEvents',
		'interface': 'MutationEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( divElement, 'DOMSubtreeModified')
	},
	'DOMNodeInserted': {
		'type': 'MutationEvents',
		'interface': 'MutationEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( divElement, 'DOMNodeInserted')
	},
	'DOMNodeRemoved': {
		'type': 'MutationEvents',
		'interface': 'MutationEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( divElement, 'DOMNodeRemoved')
	},
	'DOMNodeRemovedFromDocument': {
		'type': 'MutationEvents',
		'interface': 'MutationEvent',
		'bubbles': false,
		'cancelable': false,
		'supported': isEventSupported( document, 'DOMNodeRemovedFromDocument')
	},
	'DOMNodeInsertedIntoDocument': {
		'type': 'MutationEvents',
		'interface': 'MutationEvent',
		'bubbles': false,
		'cancelable': false,
		'supported': isEventSupported( document, 'DOMNodeInsertedIntoDocument')
	},
	'DOMAttrModified': {
		'type': 'MutationEvents',
		'interface': 'MutationEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( divElement, 'DOMAttrModified')
	},
	'DOMCharacterDataModified': {
		'type': 'MutationEvents',
		'interface': 'MutationEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': isEventSupported( divElement, 'DOMCharacterDataModified')
	},
	
	// Keyboard events
	//	http://www.w3.org/TR/2009/WD-DOM-Level-3-Events-20090908/#events-keyboardevents
	'keydown': {
		'type': 'KeyboardEvents',
		'interface': 'KeyboardEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( inputElement, 'keydown')
	},
	'keyup': {
		'type': 'KeyboardEvents',
		'interface': 'KeyboardEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( inputElement, 'keyup')
	},
	'keypress': {
		'type': 'KeyboardEvents',
		'interface': 'KeyboardEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( inputElement, 'keypress')
	},
	
	// Custom widely supported events
	'contextmenu': {
		'type': 'CustomEvents',
		'interface': 'CustomEvent',
		'bubbles': true,
		'cancelable': true,
		'supported': isEventSupported( inputElement, 'contextmenu')
	},
	
	// Gecko mouse scrolling
	'DOMMouseScroll': {
		'type': 'CustomEvents',
		'interface': 'CustomEvent',
		'bubbles': true,
		'cancelable': false,
		'supported': eventModel ==EventModels.W3C && window.navigator.userAgent.indexOf( 'Gecko') !==-1,
		'extraContext': ['detail']
	}

	// TODO: DOM 3
};

// cleanup after testing
delete divElement;
delete inputElement;
delete formElement;
delete optionElement;
delete frameElement;

// don't process next internal event
var dontProcessNextInternal =false;
var dontProcessEventType =null;

// custom event storage
var customEvents ={};

// function for obtaining event interface by event type
function getEventInterface( type) {
	if( events[ type] ===undefined || !events[ type].supported)
		return 'CustomEvent';// custom events have CustomEvent interface
	
	// return native event interface
	return events[ type].interface;
};

// function for obtaining event interface prototype by event type
function getEventPrototype( type) {
	// return prototype
	return api[ getEventInterface( type)].prototype;
};

// function for obtaining event context by event type
function getEventContext( type) {
	// return context info
	return api[ getEventInterface( type)].prototype.context;
};

// function for obtaining event handler name
function getEventHandlerName( type) {
	return 'on' +type.toLowerCase();
};

// get IE event type name
function IEEventType( type) {
	// actually, all event types in IE are prefixed with
	//	'on', but there might come time, when Microsoft
	//	will implement DOM events, such as DOMNodeInserted,
	//	and i guess they will not prefix these events with 'on'.
	if( events[ type] ===undefined)
		// return event name without changes
		return type;
		
	switch( type) {
		case 'click':
		case 'dblclick':
		case 'mousedown':
		case 'mouseup':
		case 'mouseover':
		case 'mouseout':
		case 'mousemove':
		case 'mouseenter':
		case 'mouseleave':
		case 'mousewheel':
		case 'load':
		case 'unload':
		case 'abort':
		case 'error':
		case 'select':
		case 'change':
		case 'submit':
		case 'reset':
		case 'resize':
		case 'scroll':
		case 'focus':
		case 'focusin':
		case 'focusout':
		case 'blur':
		case 'keydown':
		case 'keypress':
		case 'keyup':
		case 'contextmenu':
			return 'on' +type;
		break;
	}
		
	// return type with no changes
	return type;
};

// event constructor
api.Event =function() {
};

// event prototype
api.Event.prototype ={
	// phaseType
	CAPTURING_PHASE: 0,
	AT_TARGET: 1,
	BUBBLING_PHASE: 2,
	
	// context info
	context: [],
	
	// public properties
	/*[readonly]*/ type: null,
	/*[readonly]*/ target: null,
	/*[readonly]*/ currentTarget: null,
	/*[readonly]*/ eventPhase: 0,// capturing phase by default
	/*[readonly]*/ bubbles: true,
	/*[readonly]*/ cancelable: true,
	/*[readonly]*/ timeStamp: null,
	
	// protected properties
	/*[protected]*/ propagationStopped: false,
	/*[protected]*/ immediatePropagationStopped: false,
	/*[protected]*/ defaultPrevented: false,
	/*[protected]*/ propagationStoppedAtPhase: null,
	/*[protected]*/ propagationStoppedAtElem: null,
	
	initEvent: function( type, bubbles, cancelable) {
		this.type =type;
		this.bubbles =bubbles;
		this.cancelable =cancelable;
	},
	
	stopPropagation: function() {
		this.propagationStopped =true;
	},
	
	stopImmediatePropagation: function() {
		this.immediatePropagationStopped =true;
	},
	
	preventDefault: function() {
		if( this.cancelable)
			this.defaultPrevented =true;
	},
	
	isPropagationStopped: function() {
		return this.propagationStopped || this.immediatePropagationStopped;
	},
	
	isImmediatePropagationStopped: function() {
		return this.immediatePropagationStopped;
	},
	
	isDefaultPrevented: function() {
		return this.defaultPrevented;
	},
	
	// copy libevent native event object
	copyEvent: function( e) {
		// public
		this.type =e.type;
		this.target =e.target;
		this.currentTarget =e.currentTarget;
		this.eventPhase =e.eventPhase;
		this.bubbles =e.bubbles;
		this.cancelable =e.cancelable;
		this.timeStamp =e.timeStamp;
		// protected
		this.propagationStopped =e.propagationStopped;
		this.immediatePropagationStopped =e.immediatePropagationStopped;
		this.defaultPrevented =e.defaultPrevented;
		this.propagationStoppedAtPhase =e.propagationStoppedAtPhase;
		this.propagationStoppedAtElem =e.propagationStoppedAtElem;
		
		// get current event's prototype
		var prototype =getEventPrototype( this.type);
		// reference context
		var context =prototype.context;

		var i, k;
		// copy context info
		for( i =0; i < context.length; ++i) {
			k =context[i];
			if( e[k] !==undefined)
				this[k] =e[k];
			else
				// set default value
				this[k] =prototype[k];
		}
	},
	
	// merge W3C event context info into current event object.
	// NOTE: this has to be called only for native event types.
	copyW3CEvent: function( e) {
		this.type =e.type;
		this.target =e.target;
		this.currentTarget =e.currentTarget;
		this.eventPhase =e.eventPhase;
		this.bubbles =e.bubbles;
		this.cancelable =e.cancelable;
		this.timeStamp =e.timeStamp;
		
		// get event context by event id
		var context =this.context;
		
		// copy properties
		var i, k;
		for( i =0; i < context.length; ++i) {
			k =context[i];
			
			switch( k) {
				case 'keyIdentifier':
					this[k] =e.which || e.keyCode;
				break;
				
				// FIXME: how to determine these?
				case 'keyLocation':
				break;
				
				case 'relatedTarget':
					this[k] =e.relatedTarget || e.target;
				break;
				
				case 'modifiersList':
					this[k] =e.modifiersList || '';
				break;
				
				default:
					this[k] =e[k];
				break;
			}
		}
		
		// copy additional context properties (not defined by W3C) to increase
		//  cross browser compatibility
		if( e.pageX !==undefined) this.pageX =e.pageX;
		if( e.pageY !==undefined) this.pageY =e.pageY;
		if( e.which !==undefined) this.which =e.which;
		if( e.keyCode !==undefined) this.keyCode =e.keyCode;
	},
	
	// merge IE event context info into current event object.
	// NOTE: this has to be called only for native event types.
	copyIEEvent: function( e, defaultView) {
		// copy type
		var type =this.type =e.type;

		if( events[ type] !==undefined) {
			var eventInfo =events[ type];
			this.bubbles =eventInfo.bubbles;
			this.cancelable =eventInfo.cancelable;
			
		} else {
			// all custom events bubble and can be canceled
			this.bubbles =true;
			this.cancelable =true;
		}
		
		this.target =e.srcElement;
		// no way to determine this.
		this.currentTarget =null;
		// no way to determine this, IE supports bubbling only.
		this.eventPhase =this.BUBBLING_PHASE;
		// no way to determine this, assume current
		this.timeStamp =0 +(new Date());
		
		// get context
		var context =getEventContext( type);

		var i, k;
		for( i =0; i < context.length; ++i) {
			// examine each property
			switch( k =context[i]) {
				
				case 'button':
					// standard says that only one button can be pressed at a time,
					//	IE says - multiple (left and right, for example).
					if( e.button &0x1)
						this.button =0;
					if( e.button &0x2)
						this.button =2;
					else if( e.button &0x04)
						this.button =1;
					else {
						// no mouse button is pressed, assume left mouse btn is pressed.
						this.button =0;
					}
				break;
				
				case 'metaKey':
					// FIXME
					this.metaKey =false;
				break;
				
				case 'relatedTarget':
					if( type =='mouseout')
						this.relatedTarget =e.toElement;
					else
						this.relatedTarget =e.fromElement;
				break;
				
				case 'detail':
					// no way to determine this one
					// FIXME: must depend on event ('click', 'DOMActivate', etc)
					this.detail =1;
				break;
				
				// these can be safely copied
				case 'screenX':
				case 'screenY':
				case 'clientX':
				case 'clientY':
				case 'altKey':
				case 'shiftKey':
				case 'ctrlKey':
				case 'repeat':
				case 'wheelDelta':
					this[k] =e[k];
				break;
				
				case 'keyIdentifier':
					this[k] =e.keyCode;
				break;
				
				// assign view from passed in defaultView property
				case 'view':
					this.view =defaultView;
				break;
				
				// no way to determine these
				case 'keyLocation':
				case 'modifiersList':
				break;
				
				// unsupported context property
				default:
					throw 'Don\'t know what to assign to context property "' +k +'" while copying context from IE event';
				break;
			}
		}
	},
	
	// stop propagation at specified element at specified phase
	stopPropagationAt: function( phase, elem) {
		if( phase ===undefined)
			this.propagationStoppedAtPhase =null;
		else
			this.propagationStoppedAtPhase =phase;
		
		if( elem ===undefined)
			this.propagationStoppedAtElem =null;
		else
			this.propagationStoppedAtElem =elem;
	},
	
	// see if propagation is stopped at elem at specified phase
	isPropagationStoppedAt: function( phase, elem) {
		// any phase is matched?
		if( this.propagationStoppedAtPhase ===null) {
			// element matches?
			if( elem !==undefined && this.propagationStoppedAtElem !==null && this.propagationStoppedAtElem ==elem)
				return true;
				
		// current phase matches stop phase?
		} else if( phase ==this.propagationStoppedAtPhase) {
			// any element match?
			if( this.propagationStoppedAtElem ===null)
				return true;
			// element exact match?
			if( elem !==undefined && elem ==this.propagationStoppedAtElem)
				return true;
		}
		
		// propagation is not stopped here
		return false;
	},
	
	// see if event is a custom event
	isCustom: function() {
		return events[ this.type] ===undefined;
	}
};

// UIEvent
api.UIEvent =function() {
};

// UIEvent : Event
api.UIEvent.prototype =lib.merge( api.Event.prototype, {
	// context
	context: api.Event.prototype.context.concat([
		'view', 'detail'
	]),
	
	// public properties
	/*[readonly]*/ view: null,
	/*[readonly]*/ detail: 0,
	
	initUIEvent: function( type, bubbles, cancelable, view, detail) {
		this.initEvent( type, bubbles, cancelable);
		this.view =view;
		this.detail =detail;
	}
});

// MouseEvent
api.MouseEvent =function() {
};

// MouseEvent : UIEvent
api.MouseEvent.prototype =lib.merge( api.UIEvent.prototype, {
	// context
	context: api.UIEvent.prototype.context.concat([
		'screenX', 'screenY', 'clientX', 'clientY',
		'ctrlKey', 'shiftKey', 'altKey', 'metaKey',
		'button', 'relatedTarget'
	]),
	
	// public properties
	/*[readonly]*/ screenX: 0,
	/*[readonly]*/ screenY: 0,
	/*[readonly]*/ clientX: 0,
	/*[readonly]*/ clientY: 0,
	/*[readonly]*/ ctrlKey: false,
	/*[readonly]*/ shiftKey: false,
	/*[readonly]*/ altKey: false,
	/*[readonly]*/ metaKey: false,
	/*[readonly]*/ button: 0,
	/*[readonly]*/ relatedTarget: null,
	
	initMouseEvent: function( type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, shiftKey, altKey, metaKey, button, relatedTarget) {
		this.initUIEvent( type, bubbles, cancelable, view, detail);
		this.screenX =screenX;
		this.screenY =screenY;
		this.clientX =clientX;
		this.clientY =clientY;
		this.ctrlKey =ctrlKey;
		this.shiftKey =shiftKey;
		this.altKey =altKey;
		this.metaKey =metaKey;
		this.button =button;
		this.relatedTarget =relatedTarget;
	}
});

// MouseWheelEvent
api.MouseWheelEvent =function() {
};

// MouseWheelEvent : MouseEvent
api.MouseWheelEvent.prototype =lib.merge( api.MouseEvent.prototype, {
	// context
	context: api.MouseEvent.prototype.context.concat([
		'modifiersList', 'wheelDelta'
	]),
	
	// public properties
	/*[readonly]*/ screenX: 0,
	/*[readonly]*/ screenY: 0,
	/*[readonly]*/ clientX: 0,
	/*[readonly]*/ clientY: 0,
	/*[readonly]*/ button: 0,
	/*[readonly]*/ relatedTarget: null,
	/*[readonly]*/ modifiersList: null,
	/*[readonly]*/ wheelDelta: null,
	
	initMouseEvent: function( type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, button, relatedTarget, modifiersList, wheelDelta) {
		this.initUIEvent( type, bubbles, cancelable, view, detail);
		this.screenX =screenX;
		this.screenY =screenY;
		this.clientX =clientX;
		this.clientY =clientY;
		this.button =button;
		this.relatedTarget =relatedTarget;
		this.modifiersList =modifiersList;
		this.wheelDelta =wheelDelta;
	}
});

// MutationEvent
api.MutationEvent =function() {
};

// MutationEvent : Event
api.MutationEvent.prototype =lib.merge( api.Event.prototype, {
	// attrChangeType
	MODIFICATION: 1,
	ADDITION: 2,
	REMOVAL: 3,
	
	// context
	context: api.Event.prototype.context.concat([
		'relatedNode', 'prevValue', 'newValue', 'attrName',
		'attrChange'
	]),
	
	// public properties
	/*[readonly]*/ relatedNode: null,
	/*[readonly]*/ prevValue: null,
	/*[readonly]*/ newValue: null,
	/*[readonly]*/ attrName: null,
	/*[readonly]*/ attrChange: 1,
	
	initMutationEvent: function( type, bubbles, cancelable, relatedNode, prevValue, newValue, attrName, attrChange) {
		this.initEvent( type, bubbles, cancelable);
		this.relatedNode =relatedNode;
		this.prevValue =prevValue;
		this.newValue =newValue;
		this.attrName =attrName;
		this.attrChange =attrChange;
	}
});

// KeyboardEvent
api.KeyboardEvent =function() {
};

// KeyboardEvent : UIEvent
api.KeyboardEvent.prototype =lib.merge( api.UIEvent.prototype, {
	// KeyLocationCode
	DOM_KEY_LOCATION_STANDARD: 0x00,
	DOM_KEY_LOCATION_LEFT: 0x01,
	DOM_KEY_LOCATION_RIGHT: 0x02,
	DOM_KEY_LOCATION_NUMPAD: 0x03,
	DOM_KEY_LOCATION_MOBILE: 0x04,
	DOM_KEY_LOCATION_JOYSTICK: 0x05,
	
	// context
	context: api.UIEvent.prototype.context.concat([
		'keyIdentifier', 'keyLocation', 'ctrlKey', 'shiftKey',
		'altKey', 'metaKey', 'repeat'
	]),
	
	// public properties
	/*[readonly]*/ keyIdentifier: null,
	/*[readonly]*/ keyLocation: 0,// standard location by default
	/*[readonly]*/ ctrlKey: false,
	/*[readonly]*/ shiftKey: false,
	/*[readonly]*/ altKey: false,
	/*[readonly]*/ metaKey: false,
	/*[readonly]*/ repeat: 0,
	
	initKeyboardEvent: function( type, bubbles, cancelable, view, detail, keyIdentifier, keyLocation, ctrlKey, shiftKey, altKey, metaKey, repeat) {
		this.initUIEvent( type, bubbles, cancelable, view, detail);
		this.keyIdentifier =keyIdentifier;
		this.keyLocation =keyLocation;
		this.ctrlKey =ctrlKey;
		this.shiftKey =shiftKey;
		this.altKey =altKey;
		this.metaKey =metaKey;
		this.repeat =repeat;
	}
});

// CustomEvent
api.CustomEvent =function() {
};

// CustomEvent : Event
api.CustomEvent.prototype =lib.merge( api.Event.prototype, {
	
	// public properties
	/*[readonly]*/ detail: {},		// data, associated to custom event
	
	initCustomEvent: function( type, bubbles, cancelable, detail) {
		this.initEvent( type, bubbles, cancelable);
		this.detail =detail;
	}
});

// get data associated with element
api.getData =function( elem, forceCreate) {
	if( forceCreate ===undefined)
		forceCreate =true;
		
	var data =lib.data.get( elem, '__eventlib');
	if( data ===undefined && forceCreate) {
		// initialize element
		lib.data.set( elem, '__eventlib', data ={
			// listeners for capture phase
			'capture': {},
			// listeners for bubble phase
			'bubble': {},
			// attached event handlers
			'handlers': {},
			// setup custom events
			'customEvents': {}
		});
	}
	return data;
};

// remove all associated data
api.removeData =function( elem) {
	// remove
	lib.data.remove( elem, '__eventlib');
};

// create event
api.createEvent =function( type) {
	// get event interface name
	var interface =getEventInterface( type);
	
	// instantiate event and return
	var e =new api[interface];
	
	if( events[ type] !==undefined && events[ type].supported) {
		var eventInfo =events[ type];
		// init native event
		e.initEvent( type, eventInfo.bubbles, eventInfo.cancelable);
		
	} else if( customEvents[ type] !==undefined) {
		// init custom predefined event
		e.initCustomEvent( type, customEvents[ type].prototype.bubbles, customEvents[ type].prototype.cancelable, {});
		
	} else {
		// init custom non-predefined event
		e.initCustomEvent( type, true, true, {});
	}
	
	if( events[ type] !==undefined && events[ type].extraContext !==undefined)
		// add extra context data
		e.context =e.context.concat( events[ type].extraContext);
	
	// return event
	return e;
};

// bind to listen for an event
api.bind =function( elem, type, handler, capture) {
	
	// debug
	api.debug( 'binding ' +type +' for ' +elem);
	
	if( capture ===undefined)
		capture =false;// bubbling phase by default
	
	if( type.indexOf( ' ') !=-1) {
		// list of event types specified
		var eventList =type.split( ' ');
		
		for( var i =0; i < eventList.length; ++i)
			// bind events one by one
			api.bind( elem, eventList[ i], handler, capture);
		
		return;
	}
		
	// get data reference
	var data =api.getData( elem);
	var handlers =capture ? data.capture : data.bubble;
	
	// add event handler
	if( handlers[ type] ===undefined)
		handlers[ type] =[ handler];
	else
		handlers[ type].push( handler);
	
	// increase bound event handler count
	++api.boundHandlers;
	
	// see if event is custom
	if( events[ type] ===undefined || !events[ type].supported) {
		// see if custom event exists
		var customEvent =customEvents[ type];
		
		if( customEvent ===undefined)
			// no custom event implementations are defined
			return;
			
		// see if custom event handling instance is already allocated for current element
		var customEventInstance;
		
		if( data.customEvents[ type] ===undefined) {
			// create custom event handler instance
			data.customEvents[ type] =customEventInstance =new customEvent( elem);
				
			// see if attach method exists
			if( customEvent.prototype.attach !==undefined) {
				// call attach method
				customEventInstance.attach( elem);
			}
		}
		
		// see if 'bind' handler is defined
		if( customEvent.prototype.bind !==undefined) {
			// call bind handler
			customEventInstance.bind( handler, capture);
		}
		
		// no need to bind native listeners for custom,
		//	non-native events.
		return;
	}
	
	// see if already have event handler for this event
	if( data.handlers[ type] !==undefined)
		// already got event handler for this type
		return;
		
	// no handler, attach one
	
	// try to attach listener
	if( eventModel ==EventModels.W3C) {
		// W3C event model.
		
		// define handler to handle event
		var handler =function( nativeEvent /* native event object */){
			
			api.debug( 'native event incoming ' +nativeEvent.target +' (' +nativeEvent.type +')');

			// stop event's propagation
			nativeEvent.stopPropagation();
			
			if( nativeEvent.alreadyProcessed) {
				// event is already processed
				return;
			}
			
			if( dontProcessNextInternal && (dontProcessEventType ===null || dontProcessEventType ==nativeEvent.type)) {
				// this event should not be processed
				nativeEvent.alreadyProcessed =true;
				return;
			}
			
			// mark event as already processed
			nativeEvent.alreadyProcessed =true;
			
			// create eventlib-native event
			var e =api.createEvent( nativeEvent.type);
			// copy W3C event information into eventlib-native event object
			e.copyW3CEvent( nativeEvent);
			
			// set event phase
			e.eventPhase =e.CAPTURING_PHASE;

			// trigger event
			api.triggerEvent( e.target, e, undefined, true, elem);
			
			if( e.isDefaultPrevented())
				// prevent default action if requested
				nativeEvent.preventDefault();
				
			api.debug( 'native event processed (DefaultPrevented: ' +e.isDefaultPrevented() +')');
		};
		
		// add event listener
		elem.addEventListener( type, handler, true /* we need captures */);
		
	} else if( eventModel ==EventModels.IE) {
		// IE event model.
		
		// create handler to handle event
		var handler =function(){
			// trigger native event
			var nativeEvent =window.event;// IE way
			var stopPropagation =window.event.cancelBubble;
			var preventDefault =!window.event.returnValue;
			
			api.debug( 'native event incoming ' +nativeEvent.srcElement +' (' +nativeEvent.type +')');
			
			// do not propagate native event
			nativeEvent.cancelBubble =true;

			// ignore of the event requested?
			if( dontProcessNextInternal && (dontProcessEventType ===null || dontProcessEventType ==nativeEvent.type)) {
				api.debug( 'native event processing prevented');
				return;
			}
			
			// create eventlib-native event
			var e =api.createEvent( nativeEvent.type);
			// copy IE event information into eventlib-native event object
			e.copyIEEvent( nativeEvent, window);
			
			// BUG: IE sometimes has nativeEvent.srcElement equal to null,
			//	which shouldn't be under any circumstances. We workaround
			//	this bug by assigning value of e.target to current elem.
			if( e.target ===null)
				e.target =elem;
			
			// set event phase
			e.eventPhase =e.CAPTURING_PHASE;
			
			// trigger event
			api.triggerEvent( e.target, e, undefined, true, elem);
			
			// see if handlers prevented default action
			nativeEvent.returnValue =!e.isDefaultPrevented();
			
			api.debug( 'native event processed (DefaultPrevented: ' +e.isDefaultPrevented() +')');
		};
		
		// attach event. IE supports bubbling only.
		elem.attachEvent( IEEventType( type), handler);
		
	} else
		throw 'Unsupported event model';
	
	// add handler to the list
	data.handlers[ type] =handler;
};

// unbind listener
api.unbind =function( elem, type, handler, capture) {
	// debug
	api.debug( 'unbinding ' +type +' for ' +elem);
	
	if( capture ===undefined)
		capture =false;// bubbling phase by default
	
	if( type !==undefined && type.indexOf( ' ') !=-1) {
		// list of event types specified
		var eventList =type.split( ' ');
		
		for( var i =0; i < eventList.length; ++i)
			// unbind events one by one
			api.unbind( elem, eventList[ i], handler, capture);
		
		return;
	}
		
	var data =api.getData( elem);
	var handlers =capture ? data.capture : data.bubble;
	
	// frequently used locals
	var k, typeHandlers;
	
	// unbind handler
	function unbindHandler( type, typeHandlers, handler) {
		// see if event type is custom
		var isCustom =(events[ type] ===undefined);
		var customEventInstance =data.customEvents[ type];
		
		if( isCustom && customEventInstance !==undefined && customEventInstance.unbind !==undefined)
			customEventInstance.unbind( handler, capture);
			
		// find handler in type handlers
		var i;
		for( i =typeHandlers.length -1; i >=0; --i) {
			// see if handler matches
			if( typeHandlers[ i] ==handler) {
				// remove handler
				typeHandlers.splice( i, 1);
				
				// decrement bound handler count
				--api.boundHandlers;
			}
		}
	};
		
	// unbind all handlers for specified event type
	function unbindType( type, typeHandlers) {
		// peek handlers one by one
		while( typeHandlers.length) {
			unbindHandler( type, typeHandlers, typeHandlers[ typeHandlers.length -1]);
		}
	};
	
	// unbind whole phase
	function unbindPhase( handlers) {
		var k;
		for( k in handlers) {
			unbindType( k, handlers[k]);
			
			// delete container of handlers for specified
			//	event type.
			delete handlers[k];
		}
	};
	
	// remove all handlers for specified phase
	if( type ===undefined) {
		// remove all listeners
		unbindPhase( handlers);
		
	// remove all handlers for specified type
	} else if( handler ===undefined && handlers[type] !==undefined) {
		// remove all listeners for specified type
		unbindType( type, handlers[type]);
		
		// remove type entry
		delete handlers[type];
		
	} else {
		// remove exact event listener
		if( handlers[type] !==undefined) {
			typeHandlers =handlers[type];
			
			// listeners defined
			unbindHandler( type, typeHandlers, handler);
			
			// see if any event handlers left
			if( typeHandlers.length ==0)
				delete handlers[ type];
		}
	}
	
	// see which custom event attaches we have to detach
	for( k in data.customEvents) {
		// see if got handlers in either bubbling or capturing phases
		if( data.bubble[ k] ===undefined && data.capture[k] ===undefined) {
			// need to call detach
			var customEventInstance =data.customEvents[ k];
			
			// delete entry
			delete data.customEvents[k];
			
			// call detach function
			if( customEventInstance.detach !==undefined)
				customEventInstance.detach();
		}
	}
	
	// remove native event listeners
	for( k in data.handlers) {
		// see if event listeners present in either
		//	capturing stage or bubbling stage.
		if( data.capture[k] !==undefined || data.bubble[k] !==undefined)
			continue;// skip this
			
		// detach native listener
		if( eventModel ==EventModels.IE)
			elem.detachEvent( IEEventType( type), data.handlers[k]);
		else if( eventModel ==EventModels.W3C)
			elem.removeEventListener( type, data.handlers[k], true /* we use capturing for W3C */);
		else
			throw 'Unsupported event model "' +eventModel +'"';
			
		// delete handler reference
		delete data.handlers[k];
	}
	
	// see if any more handlers are available.
	if( lib.count( data.capture) ==0 && lib.count( data.bubble) ==0) {
		// all handlers are unbound, perform cleanup
		api.removeData( elem);
	}
};

// see if elem has any event listeners bound
api.bound =function( elem, type, handler, capture) {
	if( capture ===undefined)
		capture =false;// bubbling phase by default
		
	// get data reference
	var data =api.getData( elem);
	
	// see if any listeners are bound
	if( lib.count( capture ? data.capture : data.bubble) ==0)
		// no listeners are bound for specified event phase
		return false;
		
	if( type ===undefined)
		return true;
		
	// see if any handlers are bound
	if( (capture ? data.capture : data.bubble)[type] ===undefined)
		// no event handlers are bound to handle the event
		return false;
		
	if( handler ===undefined)
		return true;
		
	// see if handler is bound
	var handlers =capture ? data.capture[ type] : data.bubble[ type];
	
	for( var i =0; i < handlers; ++i)
		if( handlers[i] ==handler)
			return true;
	
	if( handlers ===undefined)
		// no handlers defined for 
		return true;
	
	// did not found handler
	return false;
};

// trigger event by type
api.trigger =function( elem, type, data, context, preventDefault, stopPropagation) {
	// default args
	if( preventDefault ===undefined)
		preventDefault =false;
	if( stopPropagation ===undefined)
		stopPropagation =false;
	
	if( type.indexOf( ' ') !=-1) {
		// list of event types specified
		var eventList =type.split( ' ');
		
		// list of events to return by type
		var ret ={};
		
		for( var i =0; i < eventList.length; ++i) {
			// reference event type
			var eventType =eventList[ i];
			
			// trigger events one by one
			ret[ eventType] =api.trigger( elem, eventType, data, context, preventDefault, stopPropagation);
		}
		
		// return event objects
		return ret;
	}
		
	// create new event object
	var e =api.createEvent( type);

	// assign target
	e.target =elem;
	
	if( preventDefault)
		e.preventDefault();
	if( stopPropagation)
		e.stopPropagation();
		
	if( context !==undefined && context !==null) {
		var k;
		// assign context
		for( k in context)
			e[k] =context[k];
	}
	
	// trigger event
	api.triggerEvent( elem, e, data);
	
	// return event object
	return e;
};

// trigger event by object
api.triggerEvent =function( elem, eventObject, data, internal, capturer) {

	//	Do not take in count path modifications as said by W3C
	//	(http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-basic 1.2.2. Event capture)
	
	// each event listener should be executed within try-catch block,
	//	as required by the W3C (http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-basic 1.2.1. Basic event flow)
	
	if( internal ===undefined)
		// triggering non-internal (explicit) event by default.
		//	internal = browser triggers the event.
		internal =false;
		
	// determine path which has to be tranversed.
	var path =[elem];
	var node =elem;
	try {
		while( node.parentNode)
			path.push( node =node.parentNode);
	} catch( e) {
		// IE throws error if, for example, window is used as elem
	}
	
	var elemWindow =lib.dom.getElementWindow( elem);
	if( elemWindow ===undefined)
		throw 'Unable to determine element\'s window object. Make sure you are using DOMElements as event targets.';
		
	// add window to path
	path.push( elemWindow);
		
	// assign target
	eventObject.target =elem;
	
	// shortcuts
	var type =eventObject.type;
	var isNativeEvent =events[ type] !==undefined;
	var eventInfo =isNativeEvent ? events[type] : undefined;
	
	// increment handled event count
	if( type in api.handledEvents)
		++api.handledEvents[ type];
	else
		api.handledEvents[ type] =1;
	
	api.debug( 'triggering event ' +type +' for ' +elem);

	var nodeData;
	var handlers;
	// begin capture phase
	//	W3C: capturing does not trigger for target element.
	if( eventObject.eventPhase ==eventObject.CAPTURING_PHASE) {
		// enter capturing phase
		var i;
		for( i =path.length -1; i > 0; --i) {
			node =path[i];
			nodeData =api.getData( node, false);
			
			// see if propagation is stopped
			if( eventObject.isPropagationStopped())
				break;
			
			// see if propagation needs to be stopped at current traversing condition
			if( eventObject.isPropagationStoppedAt( eventObject.eventPhase, node)) {
				// stop propagation
				eventObject.stopPropagation();
				// break the loop
				break;
			}
			
			api.debug( 'capture ' +node);
			
			// assign current target
			eventObject.currentTarget =node;
			
			// execute bound capture handlers
			if( nodeData !==undefined && nodeData.capture[ type] !==undefined && nodeData.capture[ type].length > 0) {
				// got defined handlers, execute them
				handlers =nodeData.capture[ type];
				// trigger handlers
				for( var h =0; h < handlers.length; ++h) {
					// call handler
					handlers[h].call( node, eventObject, data);

					// see if immediate propagation stopped
					if( eventObject.isImmediatePropagationStopped())
						break;
				}
			}
		}
		
		// update phase
		eventObject.eventPhase =eventObject.AT_TARGET;
	}
	
	// entering bubbling phase
	api.debug( 'entering bubbling phase on event ' +type +' for ' +elem);
	
	// begin bubbling phase
	for( i =0; i < path.length; ++i) {
		node =path[i];
		nodeData =api.getData( node, false);
		
		// see if propagation is stopped
		if( eventObject.isPropagationStopped())
			break;
		
		// see if propagation needs to be stopped at current traversing condition
		if( eventObject.isPropagationStoppedAt( eventObject.eventPhase, node)) {
			// stop propagation
			eventObject.stopPropagation();
			// break the loop
			break;
		}
		
		api.debug( 'bubble ' +node);
		
		// assign current target
		eventObject.currentTarget =node;
		
		// execute bound bubble handlers
		if( nodeData !==undefined && nodeData.bubble[ type] !==undefined && nodeData.bubble[ type].length > 0) {
			// got defined handlers, execute them
			handlers =nodeData.bubble[ type];
			// trigger handlers
			for( var h =0; h < handlers.length; ++h) {
				// call handler
				handlers[h].call( node, eventObject, data);
				
				// see if immediate propagation stopped
				if( eventObject.isImmediatePropagationStopped())
					break;
			}
		}
		
		// determine if we need to call onXXXX handlers for current node.
		var triggerOnXXXX =false;
		
		// internal event trigger
		if( eventModel ==EventModels.IE) {
			if( internal) {
				// if IE event model in use, see if for current node
				//	IE has already triggered onXXXX handlers internally.
				if( !lib.dom.isDescendantOf( node, capturer, true))
					triggerOnXXXX =true;// trigger now
					
			} else {
				// trigger only if in BUBBLING phase
				triggerOnXXXX =(eventObject.eventPhase ==eventObject.BUBBLING_PHASE);
			}
			
		} else if( eventModel==EventModels.W3C) {
			// always trigger
			triggerOnXXXX =true;
			
		} else
			throw 'Unsupported event model "' +eventModel +'"';
		
		// trigger custom handler in onXXXX attribute
		if( triggerOnXXXX) {
			// bubbling phase
			if( node.getAttribute) {
				if( isNativeEvent) {
					// build handler name
					var handlerName =getEventHandlerName( type);
					// see if got handler. Most browsers register it.
					if( node[ handlerName]) {
						// call handler
						if( node[ handlerName].call( node) ===false)
							// prevent default action
							eventObject.preventDefault();
						
					// firefox fails to register node[onXXXX] for BODY element
					} else if( node.getAttribute( handlerName) !==null) {
						// got attribute
						var js =node.getAttribute( handlerName);
						if( lib.globalEval( js, node) ===false)
							// prevent default action
							eventObject.preventDefault();
					}
				}
			}
		}
		
		// update phase
		if( eventObject.eventPhase ==eventObject.AT_TARGET) {
			eventObject.eventPhase =eventObject.BUBBLING_PHASE;
			
			// see if event bubbles
			if( !eventObject.bubbles) {
				
				api.debug( 'event does not bubble, stopping propagation');
				
				// stop propagation
				eventObject.stopPropagation();
				// break the loop
				break;
			}
		}
	}
	
	// if event is not internal and is not canceled,
	//	we need to see if we are able to trigger
	//	the default action. If we do, we need to
	//	trigger it and avoid event being processed
	//	twice, because after triggering default action,
	//	most likely the browser will fire another
	//	event of the same type.
	if( !internal && isNativeEvent) {
		api.debug( 'determining how to trigger default action');
		
		// do not call onXXXX handler in IE by default;
		var ieCallHandler =false;

		if( !eventObject.cancelable || !eventObject.isDefaultPrevented()) {
			// do not process next internal event
			dontProcessNextInternal =true;
			dontProcessEventType =type;
			
			api.debug( 'triggering native');
			
			// trigger default action
			switch( type) {
				case 'submit':
				case 'reset':
				case 'focus':
				case 'blur':
				case 'select':
				case 'abort':
				case 'click':
					// emulate action
					if( elem[type]) {
						api.debug( 'using .' +type +'()');
						// see if got click immitation method
						elem[ type]();
						
					} else {
						// trigger native event
						api.debug( 'using native event for ' +type);
						api.triggerNativeEvent( elem, type);
					}
				break;
				// for other events - no default action implementation available
				default:
					if( eventModel ==EventModels.IE) {
						// at this step no onXXXX handler is called for 'elem'
						//	in IE.
						ieCallHandler =true;
					}
				break;
			}
			
			// if we have just processed click event
			if( type =='click') {
				// firefox does not trigger navigation to href when triggering 'click' on anchor,
				//	but other browsers do. Well, actually, it shouldn't, W3C says -
				//	no explicit clicking on anchors.
				// The .click() method of IE is widely adopted and needed by the devs.,
				//	so we will make clicking by event triggering in this lib come true also.
				if( eventModel ==EventModels.W3C && !clickTriggerable && elem.nodeName && elem.nodeName =='A') {
					// see if there is javascript code in href
					var href =elem.getAttribute( 'href');
					// TODO: take in count 'target' attribute if present
					
					// see if href attribute is not empty
					if( href !==null) {
						// see if got javascript code in "href"
						if( href.substr( 0, 11) =='javascript:') {
							// execude specified in href code
							var js =href.substr( 11);
							// evaluate script globally
							lib.globalEval( js);
							
						} else {
							// otherwise just change location
							lib.dom.getElementWindow( elem).location.href =href;
						}
					}
					
				}
			}
			
			api.debug( 'native triggered');
			
			// reset flag
			dontProcessNextInternal =false;
			dontProcessEventType =null;
			
		} else {
			// default is prevented.
			api.debug( 'default is prevented!');
			
			if( eventModel ==EventModels.IE) {
				// At this step, we have elem's onXXXX handler
				//	untriggered. Actually, we don't give a shit about the result of
				//	the function, but the user may rely on that function's execution,
				//	for example, if user is modifying something external from it.
				ieCallHandler =true;
			}
		}
		
		// see if final onXXXX handler has to be called
		//	in IE.
		if( eventModel ==EventModels.IE) {
			if( ieCallHandler) {
				api.debug( 'calling on' +type +'()');
				if( elem['on'+type]) {
					// see if default is prevented
					if( elem['on'+type].call( elem) ===false)
						eventObject.preventDefault();
				}
				api.debug( 'call ended');
			}
		}
	}

};

// trigger native event
api.triggerNativeEvent =function( elem, type) {
	// get event info
	var ret;
	var eventInfo =events[ type];
	
	if( eventModel ==EventModels.W3C) {
		// use prototype, that holds default context values
		var eventContext =api[ eventInfo.interface].prototype;
		
		// create event of it's type
		var e =document.createEvent( eventInfo.type);
		
		// initialize event
		if( eventInfo.type =='MouseEvents') {
			e.initMouseEvent(
				type,// typeArg
				eventInfo.bubbles,// canBubbleArg
				eventInfo.cancelable,// cancelableArg
				elem.ownerDocument.defaultView,// viewArg
				eventContext.detail,// detailArg
				eventContext.screenX,// screenXArg
				eventContext.screenY,// screenYArg
				eventContext.clientX,// clientXArg
				eventContext.clientY,// clientYArg
				eventContext.ctrlKey,// ctrlKeyArg
				eventContext.altKey,// altKeyArg
				eventContext.shiftKey,// shiftKeyArg
				eventContext.metaKey,// metaKeyArg
				eventContext.button,// buttonArg
				eventContext.relatedTarget// relatedTargetArg
			);
			
		} else if( eventInfo.type =='MouseWheelEvents') {
			e.initMouseWheelEvent(
				type,// typeArg
				eventInfo.bubbles,// canBubbleArg
				eventInfo.cancelable,// cancelableArg
				elem.ownerDocument.defaultView,// viewArg
				eventContext.detail,// detailArg
				eventContext.screenX,// screenXArg
				eventContext.screenY,// screenYArg
				eventContext.clientX,// clientXArg
				eventContext.clientY,// clientYArg
				eventContext.button,// buttonArg
				eventContext.relatedTarget,// relatedTargetArg
				eventContext.modifiersList,// modifiersListArg
				eventContext.wheelDelta// wheelDeltaArg
			);
				
		} else if( eventInfo.type =='HTMLEvents') {
			e.initEvent(
				type,// typeArg
				eventInfo.bubbles,// canBubbleArg
				eventInfo.cancelable// cancelableArg
			);
			
		} else if( eventInfo.type =='UIEvents') {
			e.initUIEvent(
				type,// typeArg
				eventInfo.bubbles,// canBubbleArg
				eventInfo.cancelable,// cancelableArg
				elem.ownerDocument.defaultView,// viewArg
				eventContext.detail// detailArg
			);
			
		} else if( eventInfo.type =='MutationEvents') {
			e.initMutationEvent(
				type,// typeArg
				eventInfo.bubbles,// canBubbleArg
				eventInfo.cancelable,// cancelableArg
				eventContext.relatedNode,// relatedNodeArg
				eventContext.prevValue,// prevValueArg
				eventContext.newValue,// newValueArg
				eventContext.attrName,// attrNameArg
				eventContext.attrChange// attrChangeArg
			);
			
		} else if( eventInfo.type =='KeyboardEvents') {
			e.initKeyboardEvent(
				type,// typeArg
				eventInfo.bubbles,// canBubbleArg
				eventInfo.cancelable,// cancelableArg
				elem.ownerDocument.defaultView,// viewArg
				eventContext.detail,// detailArg
				eventContext.keyIdentifier,//keyIdentifierArg
				eventContext.keyLocation,//keyLocationArg
				eventContext.ctrlKey,//ctrlKeyArg
				eventContext.shiftKey,//shiftKeyArg
				eventContext.altKey,//altKeyArg
				eventContext.metaKey,//metaKeyArg
				eventContext.repeat//repeatArg
			);
			
		} else if( eventInfo.type =='CustomEvents') {
			e.initCustomEvent(
				type,// typeArg
				eventInfo.bubbles,// canBubbleArg
				eventInfo.cancelable,// cancelableArg
				eventContext.detail// detailArg
			);
			
		} else
			throw 'Unable to initialize event of type "' +eventInfo.type +'"';
			
		// dispatch event
		ret =elem.dispatchEvent( e);
				
	} else if( eventModel ==EventModels.IE) {
		// dispatch event
		ret =elem.fireEvent( IEEventType( type));

	} else
		throw 'Unsupported event mode "' +eventModel +'"';
	
	return ret;
};

// proxy event
api.proxy =function( eventObject, newTarget, preventDefaultOnSource, triggerDefaultOnTarget) {
	// default args
	if( preventDefaultOnSource ===undefined)
		preventDefaultOnSource =false;
	if( triggerDefaultOnTarget ===undefined)
		triggerDefaultOnTarget =false;
	
	// create new event object
	var e =api.createEvent( eventObject.type);
	// copy event
	e.copyEvent( eventObject);
	
	if( !triggerDefaultOnTarget)
		// prevent default action
		e.preventDefault();
	
	// trigger it
	api.triggerEvent( newTarget, e);
	
	// cancel current event's propagation
	eventObject.stopPropagation();
	
	if( preventDefaultOnSource) {
		// prevent default action
		eventObject.preventDefault();
	}
};

// custom event API
api.custom ={};

// add new custom event
//	add( 'mycustomevent', handlingInstance)
api.custom.add =function( event, handlingInstance) {
	// see if event name matches any default events
	if( events[ event] !==undefined && events[ event].supported)
		throw 'Can not define custom event "' +event +'" because native event under the same name exists and is supported by the browser';
		
	// see if event already exists
	if( customEvents[ event] !==undefined)
		throw 'Custom event "' +event +'" already exists';
		
	// see if 'bubbles' flag has been set
	if( handlingInstance.prototype.bubbles ===undefined)
		handlingInstance.prototype.bubbles =true;
		
	// see if 'cancelable' flag has been set
	if( handlingInstance.prototype.cancelable ===undefined)
		handlingInstance.prototype.cancelable =true;
		
	// define custom event
	customEvents[ event] =handlingInstance;
};

// remove custom event
//	remove( 'mycustomevent');
api.custom.remove =function( event) {
	delete customEvents[ event];
};

// make sure custom event exists
api.custom.exists =function( event) {
	return customEvents[ event] !==undefined;
};

})( EVOLIB_EXPORT, 'event');