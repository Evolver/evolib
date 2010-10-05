<?php
// Author: Dmitry Stepanov <dmitrij@stepanov.lv>
// URL: http://www.stepanov.lv
// Sun Dec 20 21:00:07 GMT 2009 21:00:07 build.php

// where to take source files from
define( 'SOURCE_ROOT', dirname( __DIR__) .'/');

// compile library file
function lib_file( $path) {
  return file_get_contents( SOURCE_ROOT .'lib/' .$path);
}

// Library package builder

$authorNote =<<<NOTE
/**
 * Evolib - Evolver's JavaScript library.
 * http://github.com/Evolver/evolib
 *
 * Copyright (C) 2010 Dmitry Stepanov <dmitrij@stepanov.lv>
 * URL: http://www.stepanov.lv
 *
 * Publicly available for non-commercial use under GPL v2 license terms.
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 */

NOTE;

file_put_contents( __DIR__ .'/evolver.js',
	$authorNote .
	lib_file( 'std/String.prototype.js') ."\n\n" .
  lib_file( 'bugs.js') ."\n\n" .
  lib_file( 'core.js') ."\n\n" .
  lib_file( 'core.Map.js') ."\n\n" .
  lib_file( 'lang.js') ."\n\n" .
  lib_file( 'cookie.js') ."\n\n" .
  lib_file( 'attr.js') ."\n\n" .
  lib_file( 'data.js') ."\n\n" .
  lib_file( 'dom.js') ."\n\n" .
  lib_file( 'html.js') ."\n\n" .
  lib_file( 'css/sizzle.js') ."\n\n" .
  lib_file( 'css.js') ."\n\n" .
  lib_file( 'event.js') ."\n\n" .
  lib_file( 'event/mouseenter_mouseleave.js') ."\n\n" .
  lib_file( 'ajax.js') ."\n\n" .
  lib_file( 'anim.js') ."\n\n" .
  lib_file( 'anim/effect.js')
);

?>