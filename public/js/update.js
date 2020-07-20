/*!
 * jQuery Validation Plugin v1.19.2
 *
 * https://jqueryvalidation.org/
 *
 * Copyright (c) 2020 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend( $.fn, {

	// https://jqueryvalidation.org/validate/
	validate: function( options ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// Check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {

				// Track the used submit button to properly handle scripted
				// submits later.
				validator.submitButton = event.currentTarget;

				// Allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			} );

			// Validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {

					// Prevent form submit to be able to see console output
					event.preventDefault();
				}

				function handle() {
					var hidden, result;

					// Insert a hidden input as a replacement for the missing submit button
					// The hidden input is inserted in two cases:
					//   - A user defined a `submitHandler`
					//   - There was a pending request due to `remote` method and `stopRequest()`
					//     was called to submit the form in case it's valid
					if ( validator.submitButton && ( validator.settings.submitHandler || validator.formSubmitted ) ) {
						hidden = $( "<input type='hidden'/>" )
							.attr( "name", validator.submitButton.name )
							.val( $( validator.submitButton ).val() )
							.appendTo( validator.currentForm );
					}

					if ( validator.settings.submitHandler && !validator.settings.debug ) {
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( hidden ) {

							// And clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// Prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			} );
		}

		return validator;
	},

	// https://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				if ( !valid ) {
					errorList = errorList.concat( validator.errorList );
				}
			} );
			validator.errorList = errorList;
		}
		return valid;
	},

	// https://jqueryvalidation.org/rules/
	rules: function( command, argument ) {
		var element = this[ 0 ],
			isContentEditable = typeof this.attr( "contenteditable" ) !== "undefined" && this.attr( "contenteditable" ) !== "false",
			settings, staticRules, existingRules, data, param, filtered;

		// If nothing is selected, return empty object; can't chain anyway
		if ( element == null ) {
			return;
		}

		if ( !element.form && isContentEditable ) {
			element.form = this.closest( "form" )[ 0 ];
			element.name = this.attr( "name" );
		}

		if ( element.form == null ) {
			return;
		}

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );

				// Remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
				} );
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// Make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
		}

		// Make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param } );
		}

		return data;
	}
} );

// JQuery trim is deprecated, provide a trim method based on String.prototype.trim
var trim = function( str ) {

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim#Polyfill
	return str.replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "" );
};

// Custom selectors
$.extend( $.expr.pseudos || $.expr[ ":" ], {		// '|| $.expr[ ":" ]' here enables backwards compatibility to jQuery 1.7. Can be removed when dropping jQ 1.7.x support

	// https://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !trim( "" + $( a ).val() );
	},

	// https://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		var val = $( a ).val();
		return val !== null && !!trim( "" + val );
	},

	// https://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
} );

// Constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// https://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( params === undefined ) {
		return source;
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		} );
	} );
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		pendingClass: "pending",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {

			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element.name in this.invalid ) {
				this.element( element );
			}
		},
		onclick: function( element ) {

			// Click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// Or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),
		minlength: $.validator.format( "Please enter at least {0} characters." ),
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
		range: $.validator.format( "Please enter a value between {0} and {1}." ),
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),
		min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
		step: $.validator.format( "Please enter a multiple of {0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var currentForm = this.currentForm,
				groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				} );
			} );
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			} );

			function delegate( event ) {
				var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";

				// Set form expando on contenteditable
				if ( !this.form && isContentEditable ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = $( this ).attr( "name" );
				}

				// Ignore the element if it belongs to another form. This will happen mainly
				// when setting the `form` attribute of an input to the id of another form.
				if ( currentForm !== this.form ) {
					return;
				}

				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox'], [contenteditable], [type='button']", delegate )

				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}
		},

		// https://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend( {}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// https://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				v = this,
				result = true,
				rs, group;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				// If this element is grouped, then validate all group elements already
				// containing a value
				group = this.groups[ checkElement.name ];
				if ( group ) {
					$.each( this.groups, function( name, testgroup ) {
						if ( testgroup === group && name !== checkElement.name ) {
							cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
							if ( cleanElement && cleanElement.name in v.invalid ) {
								v.currentElements.push( cleanElement );
								result = v.check( cleanElement ) && result;
							}
						}
					} );
				}

				rs = this.check( checkElement ) !== false;
				result = result && rs;
				if ( rs ) {
					this.invalid[ checkElement.name ] = false;
				} else {
					this.invalid[ checkElement.name ] = true;
				}

				if ( !this.numberOfInvalids() ) {

					// Hide error containers on last error
					this.toHide = this.toHide.add( this.containers );
				}
				this.showErrors();

				// Add aria-invalid status for screen readers
				$( element ).attr( "aria-invalid", !rs );
			}

			return result;
		},

		// https://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				var validator = this;

				// Add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = $.map( this.errorMap, function( message, name ) {
					return {
						message: message,
						element: validator.findByName( name )[ 0 ]
					};
				} );

				// Remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				} );
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// https://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.invalid = {};
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			var elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			this.resetElements( elements );
		},

		resetElements: function( elements ) {
			var i;

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
					this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
				}
			} else {
				elements
					.removeClass( this.settings.errorClass )
					.removeClass( this.settings.validClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {

				// This check allows counting elements with empty error
				// message as invalid elements
				if ( obj[ i ] !== undefined && obj[ i ] !== null && obj[ i ] !== false ) {
					count++;
				}
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
					.filter( ":visible" )
					.trigger( "focus" )

					// Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {

					// Ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			} ).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// Select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea, [contenteditable]" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				var name = this.name || $( this ).attr( "name" ); // For contenteditable
				var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";

				if ( !name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// Set form expando on contenteditable
				if ( isContentEditable ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = name;
				}

				// Ignore elements that belong to other/nested forms
				if ( this.form !== validator.currentForm ) {
					return false;
				}

				// Select only the first element for each name, and only those with rules specified
				if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ name ] = true;
				return true;
			} );
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		resetInternals: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
		},

		reset: function() {
			this.resetInternals();
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var $element = $( element ),
				type = element.type,
				isContentEditable = typeof $element.attr( "contenteditable" ) !== "undefined" && $element.attr( "contenteditable" ) !== "false",
				val, idx;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter( ":checked" ).val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? "NaN" : $element.val();
			}

			if ( isContentEditable ) {
				val = $element.text();
			} else {
				val = $element.val();
			}

			if ( type === "file" ) {

				// Modern browser (chrome & safari)
				if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
					return val.substr( 12 );
				}

				// Legacy browsers
				// Unix-based path
				idx = val.lastIndexOf( "/" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Windows-based path
				idx = val.lastIndexOf( "\\" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Just the file name
				return val;
			}

			if ( typeof val === "string" ) {
				return val.replace( /\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				} ).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule, normalizer;

			// Prioritize the local normalizer defined for this element over the global one
			// if the former exists, otherwise user the global one in case it exists.
			if ( typeof rules.normalizer === "function" ) {
				normalizer = rules.normalizer;
			} else if (	typeof this.settings.normalizer === "function" ) {
				normalizer = this.settings.normalizer;
			}

			// If normalizer is defined, then call it to retreive the changed value instead
			// of using the real one.
			// Note that `this` in the normalizer is `element`.
			if ( normalizer ) {
				val = normalizer.call( element, val );

				// Delete the normalizer from rules to avoid treating it as a pre-defined method.
				delete rules.normalizer;
			}

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {
					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// If a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}

					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// Return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// Return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ] );
		},

		// Return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++ ) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		// The second parameter 'rule' used to be a string, and extended to an object literal
		// of the following form:
		// rule = {
		//     method: "method name",
		//     parameters: "the given method parameters"
		// }
		//
		// The old behavior still supported, kept to maintain backward compatibility with
		// old code, and will be removed in the next major release.
		defaultMessage: function( element, rule ) {
			if ( typeof rule === "string" ) {
				rule = { method: rule };
			}

			var message = this.findDefined(
					this.customMessage( element.name, rule.method ),
					this.customDataMessage( element, rule.method ),

					// 'title' is never undefined, so handle empty string as undefined
					!this.settings.ignoreTitle && element.title || undefined,
					$.validator.messages[ rule.method ],
					"<strong>Warning: No message defined for " + element.name + "</strong>"
				),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}

			return message;
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule );

			this.errorList.push( {
				message: message,
				element: element,
				method: rule.method
			} );

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map( function() {
				return this.element;
			} );
		},

		showLabel: function( element, message ) {
			var place, group, errorID, v,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );

			if ( error.length ) {

				// Refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

				// Replace message on existing label
				error.html( message );
			} else {

				// Create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {

					// Make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement.call( this, place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {

					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );

					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby
				} else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
					errorID = error.attr( "id" );

					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {

						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						v = this;
						$.each( v.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						} );
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.escapeCssMeta( this.idOrName( element ) ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// 'aria-describedby' should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + this.escapeCssMeta( describer )
					.replace( /\s+/g, ", #" );
			}

			return this
				.errors()
				.filter( selector );
		},

		// See https://api.jquery.com/category/selectors/, for CSS
		// meta-characters that should be escaped in order to be used with JQuery
		// as a literal part of a name/id or any selector.
		escapeCssMeta: function( string ) {
			return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				$( element ).addClass( this.settings.pendingClass );
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;

			// Sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			$( element ).removeClass( this.settings.pendingClass );
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();

				// Remove the hidden input that was used as a replacement for the
				// missing submit button. The hidden input is added by `handle()`
				// to ensure that the value of the used submit button is passed on
				// for scripted submits triggered by this method
				if ( this.submitButton ) {
					$( "input:hidden[name='" + this.submitButton.name + "']", this.currentForm ).remove();
				}

				this.formSubmitted = false;
			} else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
				this.formSubmitted = false;
			}
		},

		previousValue: function( element, method ) {
			method = typeof method === "string" && method || "remote";

			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, { method: method } )
			} );
		},

		// Cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" )
				.find( ".validate-equalTo-blur" )
					.off( ".validate-equalTo" )
					.removeClass( "validate-equalTo-blur" )
				.find( ".validate-lessThan-blur" )
					.off( ".validate-lessThan" )
					.removeClass( "validate-lessThan-blur" )
				.find( ".validate-lessThanEqual-blur" )
					.off( ".validate-lessThanEqual" )
					.removeClass( "validate-lessThanEqual-blur" )
				.find( ".validate-greaterThanEqual-blur" )
					.off( ".validate-greaterThanEqual" )
					.removeClass( "validate-greaterThanEqual-blur" )
				.find( ".validate-greaterThan-blur" )
					.off( ".validate-greaterThan" )
					.removeClass( "validate-greaterThan-blur" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ] );
				}
			} );
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// Convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// Exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// Support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// Force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );

			// Cast empty attributes like `data-rule-required` to `true`
			if ( value === "" ) {
				value = true;
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {

		// Handle dependency check
		$.each( rules, function( prop, val ) {

			// Ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					$.data( element.form, "validator" ).resetElements( $( element ) );
					delete rules[ prop ];
				}
			}
		} );

		// Evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) && rule !== "normalizer" ? parameter( element ) : parameter;
		} );

		// Clean number parameters
		$.each( [ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		} );
		$.each( [ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
				}
			}
		} );

		if ( $.validator.autoCreateRanges ) {

			// Auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			} );
			data = transformed;
		}
		return data;
	},

	// https://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.methods/
	methods: {

		// https://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {

			// Check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {

				// Could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value !== undefined && value !== null && value.length > 0;
		},

		// https://jqueryvalidation.org/email-method/
		email: function( value, element ) {

			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// https://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// https://jqueryvalidation.org/date-method/
		date: ( function() {
			var called = false;

			return function( value, element ) {
				if ( !called ) {
					called = true;
					if ( this.settings.debug && window.console ) {
						console.warn(
							"The `date` method is deprecated and will be removed in version '2.0.0'.\n" +
							"Please don't use it, since it relies on the Date constructor, which\n" +
							"behaves very differently across browsers and locales. Use `dateISO`\n" +
							"instead or one of the locale specific methods in `localizations/`\n" +
							"and `additional-methods.js`."
						);
					}
				}

				return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
			};
		}() ),

		// https://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// https://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// https://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// https://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// https://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// https://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// https://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// https://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/step-method/
		step: function( value, element, param ) {
			var type = $( element ).attr( "type" ),
				errorMessage = "Step attribute on input type " + type + " is not supported.",
				supportedTypes = [ "text", "number", "range" ],
				re = new RegExp( "\\b" + type + "\\b" ),
				notSupported = type && !re.test( supportedTypes.join() ),
				decimalPlaces = function( num ) {
					var match = ( "" + num ).match( /(?:\.(\d+))?$/ );
					if ( !match ) {
						return 0;
					}

					// Number of digits right of decimal point.
					return match[ 1 ] ? match[ 1 ].length : 0;
				},
				toInt = function( num ) {
					return Math.round( num * Math.pow( 10, decimals ) );
				},
				valid = true,
				decimals;

			// Works only for text, number and range input types
			// TODO find a way to support input types date, datetime, datetime-local, month, time and week
			if ( notSupported ) {
				throw new Error( errorMessage );
			}

			decimals = decimalPlaces( param );

			// Value can't have too many decimals
			if ( decimalPlaces( value ) > decimals || toInt( value ) % toInt( param ) !== 0 ) {
				valid = false;
			}

			return this.optional( element ) || valid;
		},

		// https://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {

			// Bind to the blur event of the target in order to revalidate whenever the target field is updated
			var target = $( param );
			if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
				target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				} );
			}
			return value === target.val();
		},

		// https://jqueryvalidation.org/remote-method/
		remote: function( value, element, param, method ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			method = typeof method === "string" && method || "remote";

			var previous = this.previousValue( element, method ),
				validator, data, optionDataString;

			if ( !this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
			this.settings.messages[ element.name ][ method ] = previous.message;

			param = typeof param === "string" && { url: param } || param;
			optionDataString = $.param( $.extend( { data: value }, param.data ) );
			if ( previous.old === optionDataString ) {
				return previous.valid;
			}

			previous.old = optionDataString;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.resetInternals();
						validator.toHide = validator.errorsFor( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						validator.invalid[ element.name ] = false;
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, { method: method, parameters: value } );
						errors[ element.name ] = previous.message = message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

} );

// Ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter( function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = xhr;
		}
	} );
} else {

	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = ajax.apply( this, arguments );
			return pendingRequests[ port ];
		}
		return ajax.apply( this, arguments );
	};
}
return $;
}));
/* ===================================================
 *  jquery-sortable.js v0.9.13
 *  http://johnny.github.com/jquery-sortable/
 * ===================================================
 *  Copyright (c) 2012 Jonas von Andrian
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ========================================================== */

!function ( $, window, pluginName, undefined){
  var containerDefaults = {
    // If true, items can be dragged from this container
    drag: true,
    // If true, items can be droped onto this container
    drop: true,
    // Exclude items from being draggable, if the
    // selector matches the item
    exclude: "",
    // If true, search for nested containers within an item.If you nest containers,
    // either the original selector with which you call the plugin must only match the top containers,
    // or you need to specify a group (see the bootstrap nav example)
    nested: true,
    // If true, the items are assumed to be arranged vertically
    vertical: true
  }, // end container defaults
  groupDefaults = {
    // This is executed after the placeholder has been moved.
    // $closestItemOrContainer contains the closest item, the placeholder
    // has been put at or the closest empty Container, the placeholder has
    // been appended to.
    afterMove: function ($placeholder, container, $closestItemOrContainer) {
    },
    // The exact css path between the container and its items, e.g. "> tbody"
    containerPath: "",
    // The css selector of the containers
    containerSelector: "ol, ul",
    // Distance the mouse has to travel to start dragging
    distance: 0,
    // Time in milliseconds after mousedown until dragging should start.
    // This option can be used to prevent unwanted drags when clicking on an element.
    delay: 0,
    // The css selector of the drag handle
    handle: "",
    // The exact css path between the item and its subcontainers.
    // It should only match the immediate items of a container.
    // No item of a subcontainer should be matched. E.g. for ol>div>li the itemPath is "> div"
    itemPath: "",
    // The css selector of the items
    itemSelector: "li",
    // The class given to "body" while an item is being dragged
    bodyClass: "dragging",
    // The class giving to an item while being dragged
    draggedClass: "dragged",
    // Check if the dragged item may be inside the container.
    // Use with care, since the search for a valid container entails a depth first search
    // and may be quite expensive.
    isValidTarget: function ($item, container) {
      return true
    },
    // Executed before onDrop if placeholder is detached.
    // This happens if pullPlaceholder is set to false and the drop occurs outside a container.
    onCancel: function ($item, container, _super, event) {
    },
    // Executed at the beginning of a mouse move event.
    // The Placeholder has not been moved yet.
    onDrag: function ($item, position, _super, event) {
      $item.css(position)
    },
    // Called after the drag has been started,
    // that is the mouse button is being held down and
    // the mouse is moving.
    // The container is the closest initialized container.
    // Therefore it might not be the container, that actually contains the item.
    onDragStart: function ($item, container, _super, event) {
      $item.css({
        height: $item.outerHeight(),
        width: $item.outerWidth()
      })
      $item.addClass(container.group.options.draggedClass)
      $("body").addClass(container.group.options.bodyClass)
    },
    // Called when the mouse button is being released
    onDrop: function ($item, container, _super, event) {
      $item.removeClass(container.group.options.draggedClass).removeAttr("style")
      $("body").removeClass(container.group.options.bodyClass)
    },
    // Called on mousedown. If falsy value is returned, the dragging will not start.
    // Ignore if element clicked is input, select or textarea
    onMousedown: function ($item, _super, event) {
      if (!event.target.nodeName.match(/^(input|select|textarea)$/i)) {
        event.preventDefault()
        return true
      }
    },
    // The class of the placeholder (must match placeholder option markup)
    placeholderClass: "placeholder",
    // Template for the placeholder. Can be any valid jQuery input
    // e.g. a string, a DOM element.
    // The placeholder must have the class "placeholder"
    placeholder: '<li class="placeholder"></li>',
    // If true, the position of the placeholder is calculated on every mousemove.
    // If false, it is only calculated when the mouse is above a container.
    pullPlaceholder: true,
    // Specifies serialization of the container group.
    // The pair $parent/$children is either container/items or item/subcontainers.
    serialize: function ($parent, $children, parentIsContainer) {
      var result = $.extend({}, $parent.data())

      if(parentIsContainer)
        return [$children]
      else if ($children[0]){
        result.children = $children
      }

      delete result.subContainers
      delete result.sortable

      return result
    },
    // Set tolerance while dragging. Positive values decrease sensitivity,
    // negative values increase it.
    tolerance: 0
  }, // end group defaults
  containerGroups = {},
  groupCounter = 0,
  emptyBox = {
    left: 0,
    top: 0,
    bottom: 0,
    right:0
  },
  eventNames = {
    start: "touchstart.sortable mousedown.sortable",
    drop: "touchend.sortable touchcancel.sortable mouseup.sortable",
    drag: "touchmove.sortable mousemove.sortable",
    scroll: "scroll.sortable"
  },
  subContainerKey = "subContainers"

  /*
   * a is Array [left, right, top, bottom]
   * b is array [left, top]
   */
  function d(a,b) {
    var x = Math.max(0, a[0] - b[0], b[0] - a[1]),
    y = Math.max(0, a[2] - b[1], b[1] - a[3])
    return x+y;
  }

  function setDimensions(array, dimensions, tolerance, useOffset) {
    var i = array.length,
    offsetMethod = useOffset ? "offset" : "position"
    tolerance = tolerance || 0

    while(i--){
      var el = array[i].el ? array[i].el : $(array[i]),
      // use fitting method
      pos = el[offsetMethod]()
      pos.left += parseInt(el.css('margin-left'), 10)
      pos.top += parseInt(el.css('margin-top'),10)
      dimensions[i] = [
        pos.left - tolerance,
        pos.left + el.outerWidth() + tolerance,
        pos.top - tolerance,
        pos.top + el.outerHeight() + tolerance
      ]
    }
  }

  function getRelativePosition(pointer, element) {
    var offset = element.offset()
    return {
      left: pointer.left - offset.left,
      top: pointer.top - offset.top
    }
  }

  function sortByDistanceDesc(dimensions, pointer, lastPointer) {
    pointer = [pointer.left, pointer.top]
    lastPointer = lastPointer && [lastPointer.left, lastPointer.top]

    var dim,
    i = dimensions.length,
    distances = []

    while(i--){
      dim = dimensions[i]
      distances[i] = [i,d(dim,pointer), lastPointer && d(dim, lastPointer)]
    }
    distances = distances.sort(function  (a,b) {
      return b[1] - a[1] || b[2] - a[2] || b[0] - a[0]
    })

    // last entry is the closest
    return distances
  }

  function ContainerGroup(options) {
    this.options = $.extend({}, groupDefaults, options)
    this.containers = []

    if(!this.options.rootGroup){
      this.scrollProxy = $.proxy(this.scroll, this)
      this.dragProxy = $.proxy(this.drag, this)
      this.dropProxy = $.proxy(this.drop, this)
      this.placeholder = $(this.options.placeholder)

      if(!options.isValidTarget)
        this.options.isValidTarget = undefined
    }
  }

  ContainerGroup.get = function  (options) {
    if(!containerGroups[options.group]) {
      if(options.group === undefined)
        options.group = groupCounter ++

      containerGroups[options.group] = new ContainerGroup(options)
    }

    return containerGroups[options.group]
  }

  ContainerGroup.prototype = {
    dragInit: function  (e, itemContainer) {
      this.$document = $(itemContainer.el[0].ownerDocument)

      // get item to drag
      var closestItem = $(e.target).closest(this.options.itemSelector);
      // using the length of this item, prevents the plugin from being started if there is no handle being clicked on.
      // this may also be helpful in instantiating multidrag.
      if (closestItem.length) {
        this.item = closestItem;
        this.itemContainer = itemContainer;
        if (this.item.is(this.options.exclude) || !this.options.onMousedown(this.item, groupDefaults.onMousedown, e)) {
            return;
        }
        this.setPointer(e);
        this.toggleListeners('on');
        this.setupDelayTimer();
        this.dragInitDone = true;
      }
    },
    drag: function  (e) {
      if(!this.dragging){
        if(!this.distanceMet(e) || !this.delayMet)
          return

        this.options.onDragStart(this.item, this.itemContainer, groupDefaults.onDragStart, e)
        this.item.before(this.placeholder)
        this.dragging = true
      }

      this.setPointer(e)
      // place item under the cursor
      this.options.onDrag(this.item,
                          getRelativePosition(this.pointer, this.item.offsetParent()),
                          groupDefaults.onDrag,
                          e)

      var p = this.getPointer(e),
      box = this.sameResultBox,
      t = this.options.tolerance

      if(!box || box.top - t > p.top || box.bottom + t < p.top || box.left - t > p.left || box.right + t < p.left)
        if(!this.searchValidTarget()){
          this.placeholder.detach()
          this.lastAppendedItem = undefined
        }
    },
    drop: function  (e) {
      this.toggleListeners('off')

      this.dragInitDone = false

      if(this.dragging){
        // processing Drop, check if placeholder is detached
        if(this.placeholder.closest("html")[0]){
          this.placeholder.before(this.item).detach()
        } else {
          this.options.onCancel(this.item, this.itemContainer, groupDefaults.onCancel, e)
        }
        this.options.onDrop(this.item, this.getContainer(this.item), groupDefaults.onDrop, e)

        // cleanup
        this.clearDimensions()
        this.clearOffsetParent()
        this.lastAppendedItem = this.sameResultBox = undefined
        this.dragging = false
      }
    },
    searchValidTarget: function  (pointer, lastPointer) {
      if(!pointer){
        pointer = this.relativePointer || this.pointer
        lastPointer = this.lastRelativePointer || this.lastPointer
      }

      var distances = sortByDistanceDesc(this.getContainerDimensions(),
                                         pointer,
                                         lastPointer),
      i = distances.length

      while(i--){
        var index = distances[i][0],
        distance = distances[i][1]

        if(!distance || this.options.pullPlaceholder){
          var container = this.containers[index]
          if(!container.disabled){
            if(!this.$getOffsetParent()){
              var offsetParent = container.getItemOffsetParent()
              pointer = getRelativePosition(pointer, offsetParent)
              lastPointer = getRelativePosition(lastPointer, offsetParent)
            }
            if(container.searchValidTarget(pointer, lastPointer))
              return true
          }
        }
      }
      if(this.sameResultBox)
        this.sameResultBox = undefined
    },
    movePlaceholder: function  (container, item, method, sameResultBox) {
      var lastAppendedItem = this.lastAppendedItem
      if(!sameResultBox && lastAppendedItem && lastAppendedItem[0] === item[0])
        return;

      item[method](this.placeholder)
      this.lastAppendedItem = item
      this.sameResultBox = sameResultBox
      this.options.afterMove(this.placeholder, container, item)
    },
    getContainerDimensions: function  () {
      if(!this.containerDimensions)
        setDimensions(this.containers, this.containerDimensions = [], this.options.tolerance, !this.$getOffsetParent())
      return this.containerDimensions
    },
    getContainer: function  (element) {
      return element.closest(this.options.containerSelector).data(pluginName)
    },
    $getOffsetParent: function  () {
      if(this.offsetParent === undefined){
        var i = this.containers.length - 1,
        offsetParent = this.containers[i].getItemOffsetParent()

        if(!this.options.rootGroup){
          while(i--){
            if(offsetParent[0] != this.containers[i].getItemOffsetParent()[0]){
              // If every container has the same offset parent,
              // use position() which is relative to this parent,
              // otherwise use offset()
              // compare #setDimensions
              offsetParent = false
              break;
            }
          }
        }

        this.offsetParent = offsetParent
      }
      return this.offsetParent
    },
    setPointer: function (e) {
      var pointer = this.getPointer(e)

      if(this.$getOffsetParent()){
        var relativePointer = getRelativePosition(pointer, this.$getOffsetParent())
        this.lastRelativePointer = this.relativePointer
        this.relativePointer = relativePointer
      }

      this.lastPointer = this.pointer
      this.pointer = pointer
    },
    distanceMet: function (e) {
      var currentPointer = this.getPointer(e)
      return (Math.max(
        Math.abs(this.pointer.left - currentPointer.left),
        Math.abs(this.pointer.top - currentPointer.top)
      ) >= this.options.distance)
    },
    getPointer: function(e) {
      var o = e.originalEvent || e.originalEvent.touches && e.originalEvent.touches[0]
      return {
        left: e.pageX || o.pageX,
        top: e.pageY || o.pageY
      }
    },
    setupDelayTimer: function () {
      var that = this
      this.delayMet = !this.options.delay

      // init delay timer if needed
      if (!this.delayMet) {
        clearTimeout(this._mouseDelayTimer);
        this._mouseDelayTimer = setTimeout(function() {
          that.delayMet = true
        }, this.options.delay)
      }
    },
    scroll: function  (e) {
      this.clearDimensions()
      this.clearOffsetParent() // TODO is this needed?
    },
    toggleListeners: function (method) {
      var that = this,
      events = ['drag','drop','scroll']

      $.each(events,function  (i,event) {
        that.$document[method](eventNames[event], that[event + 'Proxy'])
      })
    },
    clearOffsetParent: function () {
      this.offsetParent = undefined
    },
    // Recursively clear container and item dimensions
    clearDimensions: function  () {
      this.traverse(function(object){
        object._clearDimensions()
      })
    },
    traverse: function(callback) {
      callback(this)
      var i = this.containers.length
      while(i--){
        this.containers[i].traverse(callback)
      }
    },
    _clearDimensions: function(){
      this.containerDimensions = undefined
    },
    _destroy: function () {
      containerGroups[this.options.group] = undefined
    }
  }

  function Container(element, options) {
    this.el = element
    this.options = $.extend( {}, containerDefaults, options)

    this.group = ContainerGroup.get(this.options)
    this.rootGroup = this.options.rootGroup || this.group
    this.handle = this.rootGroup.options.handle || this.rootGroup.options.itemSelector

    var itemPath = this.rootGroup.options.itemPath
    this.target = itemPath ? this.el.find(itemPath) : this.el

    this.target.on(eventNames.start, this.handle, $.proxy(this.dragInit, this))

    if(this.options.drop)
      this.group.containers.push(this)
  }

  Container.prototype = {
    dragInit: function  (e) {
      var rootGroup = this.rootGroup

      if( !this.disabled &&
          !rootGroup.dragInitDone &&
          this.options.drag &&
          this.isValidDrag(e)) {
        rootGroup.dragInit(e, this)
      }
    },
    isValidDrag: function(e) {
      return e.which == 1 ||
        e.type == "touchstart" && e.originalEvent.touches.length == 1
    },
    searchValidTarget: function  (pointer, lastPointer) {
      var distances = sortByDistanceDesc(this.getItemDimensions(),
                                         pointer,
                                         lastPointer),
      i = distances.length,
      rootGroup = this.rootGroup,
      validTarget = !rootGroup.options.isValidTarget ||
        rootGroup.options.isValidTarget(rootGroup.item, this)

      if(!i && validTarget){
        rootGroup.movePlaceholder(this, this.target, "append")
        return true
      } else
        while(i--){
          var index = distances[i][0],
          distance = distances[i][1]
          if(!distance && this.hasChildGroup(index)){
            var found = this.getContainerGroup(index).searchValidTarget(pointer, lastPointer)
            if(found)
              return true
          }
          else if(validTarget){
            this.movePlaceholder(index, pointer)
            return true
          }
        }
    },
    movePlaceholder: function  (index, pointer) {
      var item = $(this.items[index]),
      dim = this.itemDimensions[index],
      method = "after",
      width = item.outerWidth(),
      height = item.outerHeight(),
      offset = item.offset(),
      sameResultBox = {
        left: offset.left,
        right: offset.left + width,
        top: offset.top,
        bottom: offset.top + height
      }
      if(this.options.vertical){
        var yCenter = (dim[2] + dim[3]) / 2,
        inUpperHalf = pointer.top <= yCenter
        if(inUpperHalf){
          method = "before"
          sameResultBox.bottom -= height / 2
        } else
          sameResultBox.top += height / 2
      } else {
        var xCenter = (dim[0] + dim[1]) / 2,
        inLeftHalf = pointer.left <= xCenter
        if(inLeftHalf){
          method = "before"
          sameResultBox.right -= width / 2
        } else
          sameResultBox.left += width / 2
      }
      if(this.hasChildGroup(index))
        sameResultBox = emptyBox
      this.rootGroup.movePlaceholder(this, item, method, sameResultBox)
    },
    getItemDimensions: function  () {
      if(!this.itemDimensions){
        this.items = this.$getChildren(this.el, "item").filter(
          ":not(." + this.group.options.placeholderClass + ", ." + this.group.options.draggedClass + ")"
        ).get()
        setDimensions(this.items, this.itemDimensions = [], this.options.tolerance)
      }
      return this.itemDimensions
    },
    getItemOffsetParent: function  () {
      var offsetParent,
      el = this.el
      // Since el might be empty we have to check el itself and
      // can not do something like el.children().first().offsetParent()
      if(el.css("position") === "relative" || el.css("position") === "absolute"  || el.css("position") === "fixed")
        offsetParent = el
      else
        offsetParent = el.offsetParent()
      return offsetParent
    },
    hasChildGroup: function (index) {
      return this.options.nested && this.getContainerGroup(index)
    },
    getContainerGroup: function  (index) {
      var childGroup = $.data(this.items[index], subContainerKey)
      if( childGroup === undefined){
        var childContainers = this.$getChildren(this.items[index], "container")
        childGroup = false

        if(childContainers[0]){
          var options = $.extend({}, this.options, {
            rootGroup: this.rootGroup,
            group: groupCounter ++
          })
          childGroup = childContainers[pluginName](options).data(pluginName).group
        }
        $.data(this.items[index], subContainerKey, childGroup)
      }
      return childGroup
    },
    $getChildren: function (parent, type) {
      var options = this.rootGroup.options,
      path = options[type + "Path"],
      selector = options[type + "Selector"]

      parent = $(parent)
      if(path)
        parent = parent.find(path)

      return parent.children(selector)
    },
    _serialize: function (parent, isContainer) {
      var that = this,
      childType = isContainer ? "item" : "container",

      children = this.$getChildren(parent, childType).not(this.options.exclude).map(function () {
        return that._serialize($(this), !isContainer)
      }).get()

      return this.rootGroup.options.serialize(parent, children, isContainer)
    },
    traverse: function(callback) {
      $.each(this.items || [], function(item){
        var group = $.data(this, subContainerKey)
        if(group)
          group.traverse(callback)
      });

      callback(this)
    },
    _clearDimensions: function  () {
      this.itemDimensions = undefined
    },
    _destroy: function() {
      var that = this;

      this.target.off(eventNames.start, this.handle);
      this.el.removeData(pluginName)

      if(this.options.drop)
        this.group.containers = $.grep(this.group.containers, function(val){
          return val != that
        })

      $.each(this.items || [], function(){
        $.removeData(this, subContainerKey)
      })
    }
  }

  var API = {
    enable: function() {
      this.traverse(function(object){
        object.disabled = false
      })
    },
    disable: function (){
      this.traverse(function(object){
        object.disabled = true
      })
    },
    serialize: function () {
      return this._serialize(this.el, true)
    },
    refresh: function() {
      this.traverse(function(object){
        object._clearDimensions()
      })
    },
    destroy: function () {
      this.traverse(function(object){
        object._destroy();
      })
    }
  }

  $.extend(Container.prototype, API)

  /**
   * jQuery API
   *
   * Parameters are
   *   either options on init
   *   or a method name followed by arguments to pass to the method
   */
  $.fn[pluginName] = function(methodOrOptions) {
    var args = Array.prototype.slice.call(arguments, 1)

    return this.map(function(){
      var $t = $(this),
      object = $t.data(pluginName)

      if(object && API[methodOrOptions])
        return API[methodOrOptions].apply(object, args) || this
      else if(!object && (methodOrOptions === undefined ||
                          typeof methodOrOptions === "object"))
        $t.data(pluginName, new Container($t, methodOrOptions))

      return this
    });
  };

}(jQuery, window, 'sortable');


var deleted = {}
deleted['categories'] = []
deleted['telephone'] = []
deleted['email'] = []
deleted['site'] = []
deleted['video-link'] = []
// первый блок radio click
//Карта
ymaps.load(init);

function init() {
    var officeMap = new ymaps.Map("mapDrag", {
        center: [55.76, 37.64],
        zoom: 10,
    }, {
        searchControlProvider: 'yandex#search'
    })
    function changeAddress(){
        let officeId = $(this).find('.ui-selectric-scroll .selected').data('index');
        // $.ajax({
        //     type: 'GET',
        //     url: 'https://api.github.com/users/starred',
        //     dataType: "json",
        //     data: officeId,
        //     success: function (response) {
        //     }
        // })
        let answer =
            {
                'address': 'Пример адреса',
                'floor': '3',
                'office': '206',
                'additional': 'Дополнительный комментарий',
                'coords': {
                    'longitude': 55.763761,
                    'latitude': 37.621732
                }
            }
        $('#update-address').val(answer['address']);
        $('#update-address-floor').val(answer['floor']);
        $('#update-address-office').val(answer['office']);
        $('#update-address-additional').val(answer['additional']);
        $('.address-coords').val([
            answer['coords']['longitude'],
            answer['coords']['latitude']
        ])
        officeMap.geoObjects.removeAll();
        if (answer['coords']['latitude'] !== null && answer['coords']['longitude'] !== null) {
            let lat = answer['coords']['latitude']
            let lon = answer['coords']['longitude']
            officeMap.geoObjects.removeAll()
            var myPlacemark = new ymaps.Placemark([lon, lat], null, {
                preset: 'islands#blueDotIcon',
                draggable: true
            });
            myPlacemark.events.add('dragend', function (e) {
                function SetByCoord(result) {
                    result = JSON.parse(result)
                    if (result["suggestions"][0]["value"])
                        $('#update-address').val(result["suggestions"][0]["value"])
                }

                var cord = e.get('target').geometry.getCoordinates();
                var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
                var token = "e42b1ce121984f1fba3256837f67e961b2982b05";
                var query = {lat: cord[0], lon: cord[1]};
                var options = {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Token " + token
                    },
                    body: JSON.stringify(query)
                }
                fetch(url, options)
                    .then(response => response.text())
                    .then(result => SetByCoord(result))
                    .catch(error => console.log("error", error));

            });
            officeMap.geoObjects.add(myPlacemark);
            // Слушаем событие окончания перетаскивания на метке.
            officeMap.setCenter([lon, lat], 10)
            $('.address-coords').val([lon, lat])
        }
    }
    changeAddress()
    //Выбор офиса
    jdoc.on('change', '.js-select__b-office', function (e) {
        changeAddress()

    })

    //Автозаполнение адреса
    var searchAddress = $('.search__address')

    function showSuggest(response) {
        response = JSON.parse(response)
        for (i in response["suggestions"]) {
            searchAddress.empty()
            let result = $('<li data-lat="' + response["suggestions"][i]['data']['geo_lat'] + '" data-lon="' + response["suggestions"][i]['data']['geo_lon'] + '" >\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-search__item">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="ui-search__item-text">\n' + response["suggestions"][i]['value'] + ' \n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
            searchAddress.append(result)
        }
    }

    function getAddressSuggestions() {
        var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
        var token = "e42b1ce121984f1fba3256837f67e961b2982b05";
        var query = $('#update-address').val();

        var options = {
            method: "POST",
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + token,

            },
            body: JSON.stringify({query: query, count: 5, language: 'ru',})
        }
        fetch(url, options)
            .then(response => response.text())
            .then(response => showSuggest(response))
            .catch(error => console.log("error", error));
    }

    jdoc.on('keyup', '#update-address', function (e) {
        clearTimeout(search);
        var search = setTimeout(getAddressSuggestions, 100)
    })
    jdoc.on('change', '#update-address', function (e) {
        let address = $('.search__address').find('.selected')
        let lon = address.data('lon')
        let lat = address.data('lat')
        let val = address.find('.ui-search__item-text').text();
        $(this).val('' + val + '')
        officeMap.geoObjects.removeAll()
        var myPlacemark = new ymaps.Placemark([lat, lon], null, {
            preset: 'islands#blueDotIcon',
            draggable: true
        });
        myPlacemark.events.add('dragend', function (e) {
            function SetByCoord(result) {
                result = JSON.parse(result)
                if (result["suggestions"][0]["value"])
                    $('#update-address').val(result["suggestions"][0]["value"])
            }

            var cord = e.get('target').geometry.getCoordinates();
            var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
            var token = "e42b1ce121984f1fba3256837f67e961b2982b05";
            var query = {lat: cord[0], lon: cord[1]};
            var options = {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + token
                },
                body: JSON.stringify(query)
            }
            fetch(url, options)
                .then(response => response.text())
                .then(result => SetByCoord(result))
                .catch(error => console.log("error", error));
        });
        officeMap.geoObjects.add(myPlacemark);
        // Слушаем событие окончания перетаскивания на метке.
        officeMap.setCenter([lat, lon], 10)
        $('.address-coords').val([lon, lat])
    });
}
jdoc.on('click', '.ui-check', function (e) {

    var t = $(this), val = t.find('.ui-check__input').val();

    if (val === 'update') {
        $('#fast-menu').removeClass('hidden');
        $('#scrolltop').removeClass('hidden');
        $('#update-container').removeClass('hidden');

        // пересчитаем позицию стики блока
        jbody.trigger("sticky_kit:recalc");
    }
});

// --------------------------------------------------------------------------
// Worktime
// --------------------------------------------------------------------------

jdoc.on('change', '.js-worktime-checkbox', function () {

    if ($(this).is(':checked')) {
        $(this).closest('.js-worktime').addClass('is-active');
        $('.worktime-input').val('yes').trigger('change')
    } else {
        $(this).closest('.js-worktime').removeClass('is-active');
        $(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
        $(this).closest('.js-worktime').find('.js-worktime-content').hide();

        if ($('.js-worktime-checkbox').is(':checked') == false) {
            $('.worktime-input').val('').trigger('change')
        }
    }

});


jdoc.on('click', '.js-worktime-btn', function (e) {
    e.preventDefault();
    var targetId = $(this).data('target');

    $(this).closest('.js-worktime').find('.js-worktime-content').hide();

    if ($(this).is('.is-active')) {
        $(this).removeClass('is-active');
    } else {
        $(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
        $(this).addClass('is-active');
        $(this).closest('.js-worktime').find(targetId).show();
    }

});


jdoc.on('click', '.js-worktime-comment-btn, .js-worktime-comment-cancel', function (e) {
    e.preventDefault();

    if ($(this).closest('.js-worktime-comment').is('.is-open')) {

        $(this).closest('.js-worktime-comment').removeClass('is-open');

    } else {

        $(this).closest('.js-worktime-comment').addClass('is-open');
    }

});

// функция для добавления оффсета в 150 якорным ссылкам в плавающем блоке с прогресс баром
$('.panel__bookmark-link , .ui-taglist__link').each(function () {
    $(this).click(function () {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 150
        }, 200);
    })
})


$(document).ready(function () {

    $('.js-select__b-office').trigger('change')
    //выбор заявки
    $('.select-form').change(function () {
        switch ($(this).val()) {
            case 'update':
                $('.company-info .panel__settings').children().show()
                $('.l__sidebar').show()
                jbody.trigger("sticky_kit:recalc");
                break
            case 'transfer':
                $('.company-info .panel__settings').children().show()
                $('.l__sidebar').hide()
                break
            case 'closed_temp':
                $('.company-info .panel__settings').children().show()
                $('.l__sidebar').hide()
                break
            case 'closed':
                $('.company-info .panel__settings').children().show()
                $('.l__sidebar').hide()
                break

        }

    })


    //Стайлинг списка над прогресс баром  и его самого в зависимости от заполнения полей
    // связано по дата-атрибуту, но можно и вручную выбирать по  id так будет чуточку быстрей но менее универсально
    $('.company-info').validate()
    const progressBar = $('.ui-progress-bar');
    let fillingStep = Math.ceil((100 / $('.panel__bookmark-link').length));

    function updateBar() {
        let currentStep = 0;
        $('.progress-input').each(function () {
            if ($(this).val() !== '') {
                $('.panel__bookmark-link[href="#' + $(this).attr('id') + '"]').css('color', 'green');
                if( currentStep >= 100 ||  Math.ceil(currentStep + fillingStep) >= 100){
                    currentStep = 100
                }else{
                    currentStep += fillingStep
                }
                progressBar.css('width', '' + currentStep + '%');
                progressBar.html(currentStep + '%')
            } else {
                $('.panel__bookmark-link[href="#' + $(this).attr('id') + '"]').css('color', 'grey');
            }

        })
    }

    $('.progress-input').on('keyup', function () {
        updateBar()
    })
    $('.progress-input').on('change', function () {
        updateBar()
    })
    $('.progress-input').trigger('change')

    //удаление инпутов по клику на крестик
    jdoc.on('click', '.ui-input-delete', function (e) {
        e.preventDefault()
        let parent = $(this).parents('.panel__settings-row')
        let parentInput = parent.find('.ui-input')
        deleted['' + parentInput.attr("name") + ''].push(parentInput.data('id'))
        parent.remove()
        $(this).remove()

    })
    jdoc.on('click', '.ui-input-price', function (e) {
        e.preventDefault()
        let parent = $(this).parents('.ui-input-group').find('.ui-input')
        parent.remove()
        $(this).remove()
    })
    //TODO здесь идет много кода вставки шаблонов полей, как вариант, если это будет использоваться только здесь, то можно написать одну универсальную функцию которая будет по дата-атрибутам понимать куда/чего
    // либо смотреть на вышестоящий элемент , забирать его html и генерировать новый элемент
    jdoc.on('click', '.btn-add-email', function (e) {
        e.preventDefault()
        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let emailRow = $('<div class="panel__settings-row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden " for="update-email">Email</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="email" placeholder="name@mail.ru" id="update-email" name="email" value="raduga@mail.ru" data-id="123">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label">Комментарий к email</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" name="email-comment" type="text" placeholder="отдел продаж">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $('.btn-add-email__row'))

        }
    })
    jdoc.on('click', '.btn-add-tel', function (e) {
        e.preventDefault()
        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let telephoneRow = $('<div class="panel__settings-row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden">Телефон</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="tel" name="telephone" placeholder="+7 999 12 34 567" id="update-tel2" data-id="123">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-md-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden">Комментарий к телефону</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" name="telephone-name" type="text" placeholder="отдел продаж">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $('.btn-add-tel__row'))
        }
    })

    jdoc.on('click', '.btn-add-row', function (e) {
        e.preventDefault();
        let priceRow = $('<li class="ui-input-price">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-val">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text" placeholder="Наименование" value="">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-field">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input ui-input--w200" type="text" placeholder="Цена" value="">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn-move btn-move btn-move btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-move" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-move"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
        $(".panel__sortable").append(priceRow)
    })

    jdoc.on('click', '.btn-add-site', function (e) {
        e.preventDefault();
        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let siteRow = $('\t<div class="panel__settings-row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden" for="update-website">Сайт</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input progress-input" type="text" name="site" placeholder="http://www.renins.com" id="update-website" data-id="123" value="">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $(".btn-add-site__row"))
        }
    })
    jdoc.on('click', '.btn-add-video', function (e) {
        e.preventDefault();
        console.log($('.btn-add-video__row').siblings('.panel__settings-row'))
        if ($(this).parent('.panel__settings-group').find('.panel__settings-row').length < 10) {
            let videoRow = $('\t<div class="panel__settings-row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<label class="ui-label is-md-hidden ">Видео (только YouTube)</label>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="row">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-sm-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text"  name="video-link" placeholder="Ссылка на видео">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="col-sm-6">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-group">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input" type="text" name="video-name" placeholder="Название видео">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="ui-input-delete">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t\t\t\t\t</div>').insertBefore( $(".btn-add-video__row"))

        }

    })


    // Добавление нового заголовка в форму прайс листа
    jdoc.on('click', '.btn-add-title', function (e) {
        e.preventDefault();
        let priceTitle = $('<li class="ui-input-price  title-price">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-price-val">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-icon">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-badge" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-badge"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input class="ui-input ui-input--light" type="text" placeholder="Услуги печати">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-input-append">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn-move btn-move btn-move btn--48 btn--light">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-move" aria-hidden="true">\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-move"></use>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
            '\t\t\t\t\t\t\t\t\t\t\t\t\t</li>');
        $(".panel__sortable").append(priceTitle)
    })
    // Сортировка полей прайслиста по drag ивенту
    $("ol.panel__sortable").sortable({
        group: 'no-drop',
        handle: '.btn-move',
        onDragStart: function ($item, container, _super) {
            // Duplicate items of the no drop area
            if (!container.options.drop)
                $item.clone().insertAfter($item);
            _super($item, container);
        }
    });
    // делаю поиск с задержкой к обращению к апи в 200 мс, если неактуально в данном конкретном случае то нужно убрать setTimeout в ивентлисенере ниже
    var searchList = $('.search-categories__list');
    var searchProgress = $('.search-categories__progress');
    var CategoriesBlock = $('.search-categories__categories')
    const maxCategories = $('.search-categories__search').data('maxCategories')

    function searchCategories() {
        let val = $('#search').val()
        $.ajax({
            type: 'GET',
            url: 'https://api.github.com/users/' + val + '/starred',
            dataType: "json",
            success: function (response) {
                console.log(response)
                for (let i in response) {
                    let result = $('<li data-id="' + response[i]['id'] + '" data-num="' + i + '">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="ui-search__item">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="ui-search__item-text">\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t ' + response[i]['name'] + ' \n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</li>')
                    searchList.append(result)
                }
            }
        })
        searchProgress.addClass('hidden')
    }

    jdoc.on('keyup', '.search-categories__search', function () {
        if ($(this).val().length >= 2) {
            searchProgress.removeClass('hidden')
            searchList.empty()
            clearTimeout(search);
            var search = setTimeout(searchCategories, 100);
        }
    })
    jdoc.on('click', '.search-categories__list li', function () {
        $('.search-categories__list li').removeClass('selected');
        $(this).addClass('selected');
        $('.search-categories__search').trigger('change');
    })
    jdoc.on('change', '.search-categories__search', function () {
        if (maxCategories !== 1) {
            if ($('.search-categories__categories').find('.btn--selected').length >= maxCategories) {
                alrt('Можно добавить не более ' + maxCategories + ' шт.')
                return false
            } else {
                    if ($('.search-categories__list li.seleeted').length == 0) {
                        return false
                    }
                    else {
                        let id = $('.search-categories__list li.selected').data('id')
                        if ($('.search-categories__categories').find('.btn[data-id="' + id + '"]').length === 0) {
                            let val = $('.search-categories__list li.selected').text()
                            let category = $('<div class="col-auto">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--selected" data-id="' + id + '">' + val + '\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="btn__delete">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>')
                            CategoriesBlock.append(category)
                        }
                        else {
                            CategoriesBlock.empty()
                            let id = $('.search-categories__list li.selected').data('id')
                            if ($('.search-categories__categories').find('.btn[data-id="' + id + '"]').length === 0) {
                                let val = $('.search-categories__list li.selected').text()
                                let category = $('<div class="col-auto">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button  type="button" class ="btn btn--selected" data-id="' + id + '">' + val + '\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span class="btn__delete">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg class="icon-delete" aria-hidden="true">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<use xlink:href="/sprites/sprite.svg#icon-delete"></use>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>')
                                CategoriesBlock.append(category)
                            }
                        }
                    }
                $(this).val('')
            }
        }
    })
    jdoc.on('click', '.search-categories__categories .btn--selected', function (e) {
        $(this).parents('.col-auto').remove()

        deleted['categories'].push($(this).parents('.btn--selected').data('id'))
    })
    jdoc.on('click', '.js-select__b-office option', function (e) {
        $('.js-select__b-office option').removeClass('selected')
        $(this).addClass('selected')
    })



    jdoc.on('focusin', '#update-address', function (e) {
        e.preventDefault();
        if (!jhtml.hasClass('is-search-open')) {
            var all_li = $(this).find('.ui-search__list > li');
            jhtml.addClass('is-search-open');
            all_li.removeClass('selected');
        }
    });


//Добавление поля комментария для модератора
    jdoc.on('click', '.panel__settings-moderator .ui-link', function (e) {
        $(this).addClass('hidden');
        $(this).siblings('.ui-link').removeClass('hidden');
        $('.panel__settings-m-comment').toggleClass('hidden');
    })

//Блок с временем работы
    function SetWorkHours(elem, msg_1, msg_2) {
        $(elem).find('.js-select').change(function () {

            let from = $(elem).find('.js-select').first().val();
            let to = $(elem).find('.js-select').last().val();
            if (from == '00:00' && to == '00:00') {
                var msg = msg_1;
                $(elem).find('.ui-check__input').prop('checked', true)
            } else {
                var msg = msg_2 + from + ' -- ' + to;
                $(elem).find('.ui-check__input').prop('checked', false)
            }
            // в дата таргет стоит id + # вначале,в верстке так изначально было
            $('.ui-worktime__period-btn[data-target="#' + $(elem).attr('id') + '"]').text(msg);
        })
        $(elem).find('.ui-check__input').change(function () {
            if ($(this).is(":checked") == true) {
                var msg = msg_1
                $(elem).find('.js-select').first().val('00:00').change().selectric('refresh');
                $(elem).find('.js-select').last().val('00:00').change().selectric('refresh');
                $('.ui-worktime__period-btn[data-target="#' + $(elem).attr('id') + '"]').text(msg);
            }
        })
    }

    $('.ui-worktime__period [id *= "time"]').each(function (index, elem) {
        SetWorkHours(elem, 'Круглосуточно', 'c ')
    })
    $('.ui-worktime__period [id *= "break"]').each(function (index, elem) {
        SetWorkHours(elem, 'Без перерыва', 'перерыв ')
    })
    //сделал не на спанах внутри кнопки для уменьшения работы бека
    $(document).on('click', '.ui-worktime__period-btn', function (e) {
        try{  let val = $(this).text().split(' ');
            let inputs = $('' + $(this).data('target') + '')

            let from = inputs.find('.js-select').first();
            let to = inputs.find('.js-select').last();
            let checkbox = inputs.find('.ui-check__input');
            console.log(val[0])
            if (val[0] == 'Круглосуточно' || val[0] == 'Без') {
                from.val('00:00').change().selectric('refresh');
                to.val('00:00').change().selectric('refresh');
                checkbox.prop('checked', true);
            } else {
                from.val(val[1]).change().selectric('refresh');
                to.val(val[3]).change().selectric('refresh');
                checkbox.prop('checked', false)
            }}catch (e) {
            console.log(e)
        }

    })

//    переключение вида формы
    $('.ui-check__input[name="update-status"]').change(function () {
        let val = $(this).val()
        switch (val) {
            case "update":
                $('.ui-taglist').show()
                $('.panel__settings-group').show();
                $(".l__sticky.js-sticky").show();
                jbody.trigger("sticky_kit:recalc");
                break
            case "transfer":
                $('.ui-taglist').hide()
                $('.panel__settings-group:not(.change_address):not(.pm-comment):not(.panel__settings-m-comment)').hide();
                $('.panel__settings-group.change_address').show();
                if ($('.panel__settings-m-comment.hidden').length > 0)
                    $('.panel__settings-moderator .ui-link').first().trigger('click');
                $(".l__sticky.js-sticky").hide();
                break
            default:
                $('.ui-taglist').hide()
                $('.panel__settings-group:not(.pm-comment):not(.panel__settings-m-comment)').hide();
                if ($('.panel__settings-m-comment.hidden').length > 0)
                    $('.panel__settings-moderator .ui-link').first().trigger('click');
                $(".l__sticky.js-sticky").hide();
                break
        }

    })
//Сериализация формы
    $('.btn--submit').click(function (e) {
        if (CategoriesBlock.find('.btn').length === 0){
            alert('Необходимо добавить категорию')
            $('#search').focus().scrollTo(100)
            return false
        }
        $('.ui-worktime__period-btn').trigger('click');
        e.preventDefault()
        var data = {}
        let array = $('.company-info').serializeArray();
        data['telephone'] = []
        data['email'] = []
        data['site'] = []
        data['video'] = []
        //не уверен что именно ид такое нужно подставлять в этом поле
        data['type-of-issue'] = $('.panel__tabs-btn.js-tabsid-btn.is-active').data('tabsBtn')

        for (var i in array) {

            switch (array[i]['name']) {
                case "telephone":
                    data['telephone'].push({
                        'telephone': array[i]['value'],
                        'comment': array[(parseInt(i) + 1)]['value']
                    })
                    break
                case "email":
                    data['email'].push({'email': array[i]['value'], 'comment': array[(parseInt(i) + 1)]['value']})
                    break
                case "site":
                    data['site'].push({'email': array[i]['value'], 'comment': array[(parseInt(i) + 1)]['value']})
                    break
                case "video-link":
                    data['video'].push({'video': array[i]['value'], 'name': array[(parseInt(i) + 1)]['value']})
                    break
                default:
                    if (array[i]['name'] !== "telephone-name" || array[i]['name'] !== "email-comment" || array[i]['name'] !== "video-name") {
                        data[array[i]['name']] = array[i]['value']
                    }


            }
        }
        let days = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
        ]
        data['schedule'] = {
            'monday': {},
            'tuesday': {},
            'wednesday': {},
            'thursday': {},
            'friday': {},
            'saturday': {},
            'sunday': {},
        }
        $('.ui-worktime__row').each(function (index, elem) {
            if ($(this).find('.js-worktime-checkbox').attr("checked") !== 'checked') {
                data['schedule']['' + days[index] + '']['not_working'] = true
            } else {
                data['schedule']['' + days[index] + '']['not_working'] = false;

                if ($(this).find('.ui-worktime__period-content[id *= "time"]').find('.ui-check__input').is(':checked')) {
                    data['schedule']['' + days[index] + '']['24/7'] = true;
                } else {
                    data['schedule']['' + days[index] + '']['24/7'] = false;
                    data['schedule']['' + days[index] + '']['from'] = $(this).find('.ui-worktime__period-content[id *= "time"]').find('.js-select').first().val();
                    data['schedule']['' + days[index] + '']['to'] = $(this).find('.ui-worktime__period-content[id *= "time"]').find('.js-select').last().val();
                }

                if ($(this).find('.ui-worktime__period-content[id *= "break"]').find('.ui-check__input').is(':checked')) {
                    data['schedule']['' + days[index] + '']['no_break'] = true
                } else {
                    data['schedule']['' + days[index] + '']['no_break'] = false
                    data['schedule']['' + days[index] + '']['break_from'] = $(this).find('.ui-worktime__period-content[id *= "break"]').find('.js-select').first().val();
                    data['schedule']['' + days[index] + '']['break_to'] = $(this).find('.ui-worktime__period-content[id *= "break"]').find('.js-select').last().val();
                }
                data['schedule']['' + days[index] + '']['comment'] = $(this).find('.ui-input--40').val()
            }
        })

        data['pricelist'] = {
            "value": []
        }

        $('.panel__sortable').find('.ui-input-price').each(function (index, elem) {
            let text = $(this).find('.ui-input-price-val').find('.ui-input').val()
            if ($(this).hasClass('title-price')) {
                data['pricelist']["value"][index] = {}
                data['pricelist']["value"][index]['type'] = 'title'
                data['pricelist']["value"][index]['text'] = text
                data['pricelist']["value"][index]['order'] = index
            } else {

                let value = $(this).find('.ui-input--w200').val()
                data['pricelist']["value"][index] = {}
                data['pricelist']["value"][index]['type'] = 'string'
                data['pricelist']["value"][index]['text'] = text
                data['pricelist']["value"][index]['value'] = value
                data['pricelist']["value"][index]['order'] = index
            }
        })
        data['categories'] = []
        $('.search-categories__categories').find('.btn--selected').each(function () {
            data['categories'].push($(this).data('id'))
        })
        data['socials'] = {}
        $('.ui-input[id*="update-social-"]').each(function () {
            data['socials']['' + this.id + ''] = $(this).val()
        })
        data['deleted'] = deleted
        console.log(data)
    })
    $('.is-acceptence').change(function () {
        if ($(this).is(':checked')) {
            $('.btn--submit').removeAttr('disabled').removeClass('disabled')
        } else {
            $('.btn--submit').attr('disabled', 'disabled').addClass('disabled')
        }
    })


    jdoc.on('click', '.js-tabsid-btn', function(e)
    {

        if($(this).hasClass('premium-tab')){
            $('.premium-submit').show()
        }
        else {
            $('.premium-submit').hide()
        }
        e.preventDefault();

        var tab = $(this),
            tab_id = $(this).attr('data-tabs-btn'),
            tabsid = tab.closest('.js-tabsid'),
            tabsid_btn = tabsid.find('.js-tabsid-btn'),
            tabsid_content = tabsid.find('.js-tabsid-content');
        if ( tab.is('.is-active') )
        {
           return false
        }
        else
        {
            tabsid_btn.removeClass('is-active');
            tabsid_content.removeClass('is-active');

            tabsid.find('[data-tabs-btn=' + tab_id + ']').addClass('is-active');
            tabsid.find('[data-tabs-content=' + tab_id + ']').addClass('is-active');
        }


    });

})
