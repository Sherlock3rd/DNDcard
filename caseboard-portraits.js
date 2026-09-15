// Viewports into the user's original screenshots; no portraits are redrawn.
(function(root){
 const first='assets/images/raven-town-reference-1.png',second='assets/images/raven-town-reference-2.png';
 const crops={};
 for(const [id,x,y] of [['militia-priest',74,92],['militia-captain',206,92],['mayor',389,92],['secretary',521,92],['former-captain',74,367],['necromancer',206,367],['hyde-father',389,367],['hyde-grandson',521,367],['hyde-grandfather',389,532]])crops['raven-'+id]={path:first,x,y,size:60,width:663,height:629};
 for(const [id,x,y] of [['tavern-husband',55,316],['tavern-wife',174,316],['smith-apprentice',378,316],['merchant',47,532]])crops['raven-'+id]={path:second,x,y,size:58,width:628,height:644};
 if(typeof module==='object'&&module.exports)module.exports=crops;else root.CASEBOARD_PORTRAITS=crops;
})(typeof window==='undefined'?globalThis:window);
