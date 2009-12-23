<?php
// Author: Dmitry Stepanov <dmitrij@stepanov.lv>
// URL: http://www.stepanov.lv
// Sun Dec 20 21:00:07 GMT 2009 21:00:07 build.php

// space where to export the library
define( 'EXPORT_NS', 'window.evolver');

// where to take source files from
define( 'SOURCE_ROOT', dirname( __DIR__) .'/');

// compile library file
function lib_file( $path) {
  return str_replace( '__NAMESPACE__', EXPORT_NS, file_get_contents( SOURCE_ROOT .'lib/' .$path));
}

// Library package builder

file_put_contents( __DIR__ .'/evolver.js',
  // build library core
  lib_file( 'core.js') ."\n\n" .
  lib_file( 'dom.js') ."\n\n" .
  lib_file( 'html.js') ."\n\n" .
  lib_file( 'css/sizzle.js') ."\n\n" .
  lib_file( 'css.js') ."\n\n" .
  lib_file( 'event.js') ."\n\n" .
  lib_file( 'event/custom/remove.js') ."\n\n" .
  lib_file( 'event/mouseenter_mouseleave.js') ."\n\n" .
  lib_file( 'ajax.js')
);

?>