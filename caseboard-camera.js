(function(root){
 'use strict';
 function clampZoom(start,value){return Math.min(2,Math.max(Math.min(.01,start/10),value))}
 function zoomAt(camera,value,cx,cy){const next=clampZoom(camera.zoom,value);return {zoom:next,tx:cx-(cx-camera.tx)*next/camera.zoom,ty:cy-(cy-camera.ty)*next/camera.zoom}}
 function midpoint(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
 function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
 function beginPinch(camera,a,b){const mid=midpoint(a,b);return {zoom:camera.zoom,distance:Math.max(1,distance(a,b)),worldX:(mid.x-camera.tx)/camera.zoom,worldY:(mid.y-camera.ty)/camera.zoom}}
 function updatePinch(pinch,a,b){const mid=midpoint(a,b),zoom=clampZoom(pinch.zoom,pinch.zoom*distance(a,b)/pinch.distance);return {zoom,tx:mid.x-pinch.worldX*zoom,ty:mid.y-pinch.worldY*zoom}}
 const api={clampZoom,zoomAt,beginPinch,updatePinch};if(typeof module!=='undefined')module.exports=api;root.CASEBOARD_CAMERA=api;
})(typeof self!=='undefined'?self:globalThis);
