
function log() { if ( console && console.log ) console.log.apply( console, arguments ); }

$4.fn.extend({
	terminal: function(options){
		var options = jQuery.extend({prompt: '>'}, options);
		
		var console = $('<ul/>').css({overflow: 'auto'});
		if( options && options.console && options.console.id ) console.attr('id', options.console.id);
		
		var form = $('<form/>');
		if( options && options.form && options.form.id ) console.attr('id', options.form.id);
		
		form.append(console);
		$(this).append(form);
		
		var inputLine, prompt, stdin;
		function pushStdin() {
			prompt = $('<span class="prompt active"/>')
				.css({float: 'left', position: 'absolute'})
				.text(options.prompt);
			stdin = $('<input type="text"/>');
			inputLine = $('<li/>').append( prompt, stdin );
			
			console.append( inputLine );
			var w = prompt.width();
			stdin.css({paddingLeft: w}).focus();
			inputLine.css({paddingRight: w});
		}
		
		function writeStringFormat( node, val, depth ) {
			if( !node ) node = $('<span/>');
			return node.addClass('string').append(
				$('<span class="q l">&ldquo;</span>'),
				$('<span class="c"/>').text( val ),
				$('<span class="q r">&rdquo;</span>')
			);
		}
		
		function appendArrayFormat( node, val, depth ) {
			node.append( '<span class="b l">[</span>' );
			for ( var i = 0, l = val.length; i < l; i++ ) {
				if( i ) node.append( '<span class=comma>,</span>' );
				if( i > 5 ) {
					node.append( '<span class=cont>&hellip;</span>' );
					break;
				}
				node.append( format( val[i], depth ) );
			}
			if( val.length == 0 ) {
				node.append( '<span class=empty>empty</span>' );
			}
			return node.append( '<span class="b r">]</span>' );
		}
		
		function appendObjectFormat( node, val, depth ) {
			node.append( '<span class="op l">{</span>' );
			var n = 0;
			for ( var key in val ) {
				if( n != 0 ) node.append('<span class=comma>,</span>');
				if( n > 5 ) {
					node.append( '<span class=cont>&hellip;</span>' );
					break;
				}
				node.append( $('<span class=label>').text( key ).append('<span class=cl>:</span>'), format( val[key], depth ) );
				n++;
			}
			return node.append( '<span class="op r">}</span>' );
		}
		
		function appendAttrFormat( node, key, val, depth ) {
			return $('<span class=attr>')
				.append(
					$('<span class=key>').text( key ),
					'<span class=eq>=</span>',
					$('<span class=val>').append( format( val, depth ) )
				)
				.appendTo( node );
		}
		
		function format( val, depth ) { //ToDo: Infinite, Date, object, dom, jQuery/4query, event, RegExp
			depth = depth || 0;
			depth++;
			var node = $('<span/>')
			if( depth > 3 ) return node.addClass('cont').append('&hellip;' );
			if ( typeof val === "boolean" ) {
				node.addClass( val ? 'b t' : 'b f' ).text( val ? 'true' : 'false' );
			} else if ( typeof val === "number" ) {
				node.addClass('number');
				if( isNaN( val ) ) node.addClass('nan').text( 'NaN' );
				else if( isFinite( val ) ) node.text( Math.abs( val ) );
				else node.addClass('infinity').append( '&infin;' );
				if( val < 0 ) node.prepend( '<span class=min>-</span>' ).addClass('neg');
				if( val == 0 ) node.addClass('zero');
			} else if ( typeof val === "string" ) {
				writeStringFormat( node, val, depth );
			} else if ( val === undefined ) {
				node.addClass('undef').text('undefined');
			} else if ( val === null ) {
				node.addClass('null').text('null');
			} else if ( $4.isFunction( val ) ) { //ToDo: Do something a little more FireBug like with named functions
				node.addClass('fn').append('function');
				if( val.name ) node.append( ' ', $('<span class=name>').text( val.name ) );
				node.append('<span class="p l">(</span><span class="p r">)</span>');
			} else if ( $4.isArray( val ) ) {
				appendArrayFormat( node.addClass('array'), val, depth );
			} else if ( typeof val === "object" ) {
				if( val.jquery ) {
					node.addClass('frame').addClass( val.v4query ? 'o4query' : 'jQuery' )
						.append( $('<span class=name>').text( val.v4query ? '4query' : 'jQuery' ) );
					appendArrayFormat( node, val, depth );
				} else if ( val.nodeType ) {
					node.addClass('dom');
					switch( val.nodeType ) {
					case Node.ELEMENT_NODE:
						node.append('<span class="a l">&lt;</span>')
							.append( $('<span class=name>').text( val.tagName.toLowerCase() ) );
						if( val.id ) appendAttrFormat( node, 'id', val.id, depth );
						if( val.className ) appendAttrFormat( node, 'class', val.className, depth );
						var cssText;
						if( cssText = $(val).attr('style') ) appendAttrFormat( node, 'style', cssText, depth );
						node.append('<span class="a r">&gt;</span>');
						break;
					case Node.TEXT_NODE:
						node.append('<span class=type>#text</span>')
							.append( '<span class="b l">[</span>' );
						writeStringFormat( undefined, val.nodeValue, depth ).appendTo( node );
						node.append( '<span class="b r">]</span>' );
						break;
					case Node.DOCUMENT_NODE:
						node.append('<span class=document>document</span>');
						var t = val === document ? 'local' : 'remote';
						node.append('<span class="b l">[</span><span class='+t+'>'+t+'</span><span class="b r">]</span>');
						break;
					default:
						appendObjectFormat( node.addClass('object'), val, depth );
						break;
					}
				} else {
					appendObjectFormat( node.addClass('object'), val, depth );
				}
			} else {
				node.text( val );
			}
			
			return node;
		}
		
		function pushResult( result ) {
			console.append( $('<li class=result>').append( format( result ) ) );
		}
		
		function pushError( error ) {// ToDo: Color like firebug warnings
			console.append( $('<li class=error>').append( $('<span class=name>').text(error.name), ':', $('<span class=message>').text(error.message) ) );
		}
		
		pushStdin();
		$(form).submit(function(evt) {
			evt.preventDefault();
			var val = stdin.val();
			if( val ) {
				prompt.removeClass('active');
				$(stdin).replaceWith($('<span/>').css(stdin.css(['background', 'color', 'border', 'paddingLeft', 'fontSize'])).text(val));
				try { pushResult( window["eval"]('('+val.replace(/;$/,'')+')') ); }
				catch ( e ) { pushError( e ); }
				console.scrollTop('bottom');
				pushStdin();
			}
			return false;
		});
	}
});


$4(document).ready(function($) {
	$('#terminal').terminal({
		console: {id:'console'}
	});
});
