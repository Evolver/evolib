
<h1>Sizzle CSS selector engine</h1>

A pure-JavaScript CSS selector enginedesigned to be easily dropped in to a host library.

Find out more about Sizzzle on <a href="#http://sizzlejs.com/">http://sizzlejs.com/</a>.

<h1>Why Sizzle is used by evolib?</h1>

<b>Some browsers do not implement</b> W3C recommendation of <b>document.querySelector / document.querySelectorAll</b> which select elements by specified CSS selectors. To make CSS selectors work in all browsers, <b>evolib imports Sizzle</b> and uses it <b>as selector engine if querySelector / querySelectorAll are not available</b>.