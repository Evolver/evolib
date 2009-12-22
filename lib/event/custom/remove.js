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

(function( lib){

// dependencies: event

// import classes
var ErrorException =lib.classref( 'Error');

// custom event : remove
var RemoveEvent;

with( RemoveEvent =function(){}) {
  // does not bubble
  prototype.bubbles =false;
  // is not cancelable
  prototype.cancelable =false;
}

// add 'remove' event
lib.event.custom.add( 'remove', RemoveEvent);

})( __NAMESPACE__);