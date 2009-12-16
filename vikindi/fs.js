
(function( lib){
  
// declare namespace
var api =lib.namespace( 'vikindi.fs'), undefined;

// file server access instance
var Access =api.Access =function( serverHost) {
  // store server host
  this.serverHost =serverHost;
};

// file server access prototype

// server host
Access.prototype.serverHost =null;

// get file download url
Access.prototype.url =function( fileId) {
  return 'http://' +this.serverHost +'/download.php?id=' +fileId;
};

// get image download url
Access.prototype.gfxUrl =function( fileId, maxX, maxY, saveProps) {
  // check input
  if( maxX ===undefined) maxX =null;
  if( maxY ===undefined) maxY =null;
  if( saveProps ===undefined) saveProps =true;
  
  maxX =maxX ===null ? 0 : maxX;
  maxY =maxY ===null ? 0 : maxY;
  saveProps =saveProps ? 1 : 0;
  
  // return url
  return 'http://' +this.serverHost +'/download_image.php?id=' +fileId +'&x=' +maxX +'&y=' +maxY +'&saveProps=' +saveProps;
};
  
})( window.evolver);