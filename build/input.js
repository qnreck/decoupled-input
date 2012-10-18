var InputController=function(a){this.deviceHandlers={};this.setupBindings(a)};
InputController.prototype={bindings:null,deviceHandlers:null,input:null,setupBindings:function(a){this.bindings={};this.input={};Object.keys(a).forEach(function(b){var c=a[b],d={}.toString;this.input[b]=0;if("[object Array]"==d.call(c))for(var d=0,e=c.length;d<e;d++)this._applyBinding(c[d],b);else this._applyBinding(c,b)},this)},updateBindings:function(a){this.setupBindings(a);Object.keys(this.deviceHandlers).forEach(function(a){this.deviceHandlers[a].bindings=this.bindings[a]||{};this.deviceHandlers[a].input=
this.input},this)},_applyBinding:function(a,b){this.bindings[a.device]||(this.bindings[a.device]={});this.bindings[a.device][a.inputId]={description:b,down:!!a.down,up:!!a.up,invert:!!a.invert}},registerDeviceHandler:function(a,b){this.deviceHandlers[b]=new a(this.bindings[b]||{},this.input)},destroy:function(){Object.keys(this.deviceHandlers).forEach(function(a){this.deviceHandlers[a].destroy()},this)}};
var GamepadHandler=function(a,b){this.bindings=a;this.input=b;this.gamepads=[];this.prevRawGamepadTypes=[];this.prevTimestamps=[];this.buttonStates=[];this.init()};
GamepadHandler.prototype={deadzone:0.01,buttonStates:null,gamepads:null,isPolling:!1,prevRawGamepadTypes:null,prevTimestamps:null,init:function(){if(navigator.webkitGetGamepads||navigator.webkitGamepads||-1!=navigator.userAgent.indexOf("Firefox/"))window.addEventListener("MozGamepadConnected",this.connectListener=this.onGamepadConnect.bind(this),!1),window.addEventListener("MozGamepadDisconnected",this.disconnectListener=this.onGamepadDisconnect.bind(this),!1),(navigator.webkitGamepads||navigator.webkitGetGamepads)&&
this.startPolling()},onGamepadConnect:function(a){this.gamepads.push(a.gamepad);this.startPolling()},onGamepadDisconnect:function(a){for(var b=this.gamepads-1;0<=b;b--)if(this.gamepads[b].index==a.gamepad.index){this.gamepads.splice(b,1);break}0==this.gamepads.length&&this.stopPolling()},startPolling:function(){this.isPolling||(this.isPolling=!0,this.tick())},stopPolling:function(){this.isPolling=!1},tick:function(){if(this.isPolling){var a=this.tick.bind(this);window.requestAnimationFrame?window.requestAnimationFrame(a):
window.mozRequestAnimationFrame?window.mozRequestAnimationFrame(a):window.webkitRequestAnimationFrame&&window.webkitRequestAnimationFrame(a)}this.pollStatus()},pollStatus:function(){this.pollGamepads();for(var a=0,b=this.gamepads.length;a<b;a++){var c=this.gamepads[a];c.timestamp&&c.timestamp==this.prevTimestamps[a]||(this.prevTimestamps[a]=c.timestamp,this.onStatusChanged(a))}},pollGamepads:function(){var a=navigator.webkitGetGamepads&&navigator.webkitGetGamepads()||navigator.webkitGamepads,b,c;
if(a){this.gamepads.length=0;var d=!1;b=0;for(c=a.length;b<c;b++)typeof a[b]!=this.prevRawGamepadTypes[b]&&(d=!0,this.prevRawGamepadTypes[b]=typeof a[b]),a[b]&&this.gamepads.push(a[b]);if(d){b=this.buttonStates.length=0;for(c=this.gamepads.length;b<c;b++){var a=this.gamepads[b],e=this.buttonStates[b]=[];a.buttons.forEach(function(a,b){e[b]=a},this)}}}},onStatusChanged:function(a){var b=this.gamepads[a],c=this.buttonStates[a],d,e,a=0;for(d=b.buttons.length;a<d;a++){var f=b.buttons[a],g=c[a];e="button-"+
a;g!=f&&(g=f>g?"down":"up",c[a]=f,e in this.bindings&&(e=this.bindings[e],e[g]&&(this.input[e.description]=f)))}a=0;for(d=b.axes.length;a<d;a++)c="axis-"+a,c in this.bindings&&(e=this.bindings[c],c=b.axes[a],e.invert&&(c*=-1),this.input[e.description]=Math.abs(c)>this.deadzone?c:0)},destroy:function(){window.removeEventListener("MozGamepadConnected",this.connectListener,!1);window.removeEventListener("MozGamepadDisconnected",this.disconnectListener,!1)}};
var KeyboardHandler=function(a,b){this.bindings=a;this.input=b;document.addEventListener("keyup",this.upListener=this.onKeyUp.bind(this),!1);document.addEventListener("keydown",this.downListener=this.onKeyDown.bind(this),!1)};
KeyboardHandler.prototype={onKeyDown:function(a){a.keyCode in this.bindings&&(a=this.bindings[a.keyCode],a.down&&(this.input[a.description]=1))},onKeyUp:function(a){a.keyCode in this.bindings&&(a=this.bindings[a.keyCode],a.up&&(this.input[a.description]=0))},destroy:function(){document.removeEventListener("keyup",this.upListener,!1);document.removeEventListener("keydown",this.downListener,!1)}};
var MouseHandler=function(a,b){this.bindings=a;this.input=b;this.input.mouseX=0;this.input.mouseY=0;var c=!1,d=null;["webkitPointerLockElement","mozPointerLockElement","pointerLockElement"].forEach(function(a){a in document&&(c=!0,d=a)},this);this.hasPointerLockSupport=c;this.pointerLockElementProperty=d;document.addEventListener("mousemove",this.moveListener=this.onMouseMove.bind(this),!1);document.addEventListener("mousedown",this.downListener=this.onMouseDown.bind(this),!1);document.addEventListener("mouseup",
this.upListener=this.onMouseUp.bind(this),!1);document.addEventListener("contextmenu",(this.ctxListener=function(a){a.preventDefault()}).bind(this),!1);window.addEventListener("resize",this.resizeListener=this.onResize.bind(this),!1);this.onResize()};
MouseHandler.prototype={hasPointerLockSupport:!1,pointerLockElementProperty:"",movementProperty:"",infiniteXAxis:!1,infiniteYAxis:!1,width:0,height:0,onMouseMove:function(a){var b,c,d,e;d=this.width;b=d/2;e=this.height;c=e/2;var f=this.hasPointerLockSupport&&null!=document[this.pointerLockElementProperty];this._initialized||(["webkitMovement","mozMovement","movement"].forEach(function(b){b+"X"in a&&(this.movementProperty=b)},this),this.input.mouseX=a.pageX-(f?a[this.movementProperty+"X"]:0),this.input.mouseY=
a.pageY-(f?a[this.movementProperty+"Y"]:0),this._initialized=!0);var g=a[this.movementProperty+"X"],h=a[this.movementProperty+"Y"];f?(d=this.clamp(0,d,this.input.mouseX+g),e=this.clamp(0,e,this.input.mouseY+h)):(d=a.pageX,e=a.pageY);b=this.infiniteXAxis?f?g:d-this.input.mouseX:-(d-b)/b;c=this.infiniteYAxis?f?h:e-this.input.mouseY:-(e-c)/c;this.input.mouseX=d;this.input.mouseY=e;"x"in this.bindings&&(d=this.bindings.x,this.input[d.description]=d.invert?-1*b:b);"y"in this.bindings&&(d=this.bindings.y,
this.input[d.description]=d.invert?-1*c:c)},onMouseDown:function(a){a.button in this.bindings&&(a=this.bindings[a.button],a.down&&(this.input[a.description]=1))},onMouseUp:function(a){a.button in this.bindings&&(a=this.bindings[a.button],a.up&&(this.input[a.description]=0))},onResize:function(){this.width=window.innerWidth;this.height=window.innerHeight},clamp:function(a,b,c){return Math.min(b,Math.max(a,c))},destroy:function(){document.removeEventListener("mousemove",this.moveListener,!1);document.removeEventListener("mousedown",
this.downListener,!1);document.removeEventListener("mouseup",this.upListener,!1);document.removeEventListener("contextmenu",this.ctxListener,!1);window.removeEventListener("resize",this.resizeListener,!1)}};
