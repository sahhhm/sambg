/*
-drawable (draw info) 
  -checker
  -dice    (dice shit)
  -space  (draw, highlight, numCheckers, player, etc.)
    - selectable (select)
      - triangle 
      - bar
    - bearoff (draw, highlight)
*/

var Drawable = { drawInfo: {}, 
                 patterns: {},
                 ctxs: {},
                 canvasEls: {} };
				 
Drawable.initialize = function(specs) {

  var bgCanvas = document.getElementById('bg_canvas')
  var nakedCanvas = document.getElementById('bg_naked')
  var bgCtx = document.getElementById('bg_canvas').getContext("2d")
  var nakedCtx = document.getElementById('bg_naked').getContext("2d")
  
  this.ctxs = { ctx  : bgCtx,
                nctx : nakedCtx };
					
  this.canvasEls = { canvas		: bgCanvas,
                     nakedCanvas: nakedCanvas}; 

  this.canvasEls.canvas.addEventListener("click", bgOnClick, false);
  this.canvasEls.canvas.width = specs.pixelWidth;
  this.canvasEls.canvas.height = specs.pixelHeight;
  this.canvasEls.nakedCanvas.width = specs.pixelWidth;
  this.canvasEls.nakedCanvas.height = specs.pixelHeight;
  
  this.drawInfo = { pieceWidth : specs.pieceWidth,
                    pieceHeight: specs.pieceHeight,
                    p1color: specs.p1color,
                    p2color: specs.p2color,
                    bearOffWidth : specs.bearOffWidth,
                    bearOffHeight : specs.bearOffHeight,
                    boardHeight: specs.boardHeight,
                    barColumn : specs.barColumn,
                    bearOffColumn : specs.bearOffColumn,
                    maxPiecesPerTriangle : specs.maxPiecesPerTriangle,
					pixelHeight : specs.pixelHeight,
					pixelWidth : specs.pixelWidth       
                   };

  this.settings = {
    highlightWidth : 3,
	selectWidth : 3,
	selectColor : "#75c938",
    highlightColor : "#8D38C9"
  };
}

Drawable.drawCircle = function(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI*2, false);
  ctx.closePath();
}

var Interactable = Object.create(Drawable, { interact : { 
                                                          value: 
                                                            {
                                                              row: 6,
															  columns: 13,
															  padding: 7,
                                                              doublingColumn: 6,
															  diceColumn: 8, 
														      diceColumns: 4,
															  messageColumn: 1,
															  messageColumns: 4
														    },
														   writable: true, 
														   enumerable: true, 
														   configurable: false 
														  }});
														  
Interactable.getBaseX = function() {
  return 0;
}

Interactable.getBaseY = function() {
  return this.interact.row * this.drawInfo.pieceHeight  - this.drawInfo.pieceHeight/2;
}

Interactable.getTotalWidthPix = function() {
  return this.drawInfo.pieceWidth * 13;
}

Interactable.getTotalHeightPix = function() {
  return this.drawInfo.pieceHeight;
}


var DrawableBoard = Object.create(Drawable);

DrawableBoard.drawBoard = function(ctx, triangles, bars, bearoffs) {
  ctx.fillStyle = ctx.createPattern(this.patterns.bg.image,'repeat');
  ctx.fillRect(0, 0, this.drawInfo.pixelWidth, this.drawInfo.pixelHeight);	      
		
  var spaces = triangles.concat( bars ).concat( bearoffs );
  for ( var i = 0; i < spaces.length; i++ ) {
    spaces[i].draw(ctx);
  }
}

DrawableBoard.patterns.bg = { image: new Image(), loaded: false};
DrawableBoard.patterns.bg.image.src = 'woodbg.jpg';
DrawableBoard.patterns.bg.image.onload = function() {
  DrawableBoard.patterns.bg.loaded = true;
}
DrawableBoard.patterns.oddTri = { image: new Image(), loaded: false};
DrawableBoard.patterns.oddTri.image.src = 'woodlight-min.gif';
DrawableBoard.patterns.oddTri.image.onload = function() {
  DrawableBoard.patterns.oddTri.loaded = true;
}
DrawableBoard.patterns.evenTri = { image: new Image(), loaded: false};
DrawableBoard.patterns.evenTri.image.src = 'wooddark-min.gif';
DrawableBoard.patterns.evenTri.image.onload = function() {
  DrawableBoard.patterns.evenTri.loaded = true;
}
DrawableBoard.patterns.bearoff = { image: new Image(), loaded: false};
DrawableBoard.patterns.bearoff.image.src = 'woodbar.gif';
DrawableBoard.patterns.bearoff.image.onload = function() {
  DrawableBoard.patterns.bearoff.loaded = true;
}


var Checker = Object.create(Drawable, { row    :  { value :  -1 }, 
                                        column :  { value :  -1 },
                                        player :  { value :  -1 } });

Checker.findTriangleNum = function(b) {
  var x = this.column;
  var y = this.row;
  var tnum = -1;
  if (x != b.specs.barColumn) { 
    if (y < b.specs.maxPiecesPerTriangle) { // top 
      tnum = (b.specs.totalTriangles/2) - x + 1;
      if (x < b.specs.barColumn) tnum -= 1;
    } else if (y > b.specs.boardHeight - b.specs.maxPiecesPerTriangle - 1) { // bottom
      tnum = (b.specs.totalTriangles/2) + x + 1;
      if (x > b.specs.barColumn) tnum -=1;
    } else {
      tnum = -1;
    }  
  } else {
    tnum = -1;
  } 
  return tnum;  
}

Checker.findBarNum = function (b) {
  var x = this.column;
  var y = this.row;
  var bnum = -1;
  if (x == b.specs.barColumn) {
    if (y < b.specs.maxPiecesPerTriangle) bnum = 1;
    else if (y > b.specs.boardHeight - b.specs.maxPiecesPerTriangle - 1) bnum = 2;
    else bnum = -1;
  } else {
    bnum = -1;
  }
  return bnum;	 
}
  
Checker.getX = function() {
  return (this.column * this.drawInfo.pieceWidth) + (this.drawInfo.pieceWidth/2);
}   
  
Checker.getY = function() {
  return (this.row * this.drawInfo.pieceHeight) + (this.drawInfo.pieceHeight/2);
}
  
Checker.draw = function(ctx, selected) {
  ctx.save();
  var x = this.getX(); //(this.column * this.drawInfo.pieceWidth) + (this.drawInfo.pieceWidth/2);
  var y = this.getY(); //(this.row * this.drawInfo.pieceHeight) + (this.drawInfo.pieceHeight/2);
  var radius = (this.drawInfo.pieceWidth/2) - (this.drawInfo.pieceWidth/9);
  this.drawCircle(ctx, x, y, radius);
  
  // make radial glare
  var color = this.player == 1 ? this.drawInfo.p1color : this.drawInfo.p2color;
  //var grd = ctx.createRadialGradient(x, y, radius, x + 3, y - 5, radius-3);
  //grd.addColorStop(0, "white");
  //grd.addColorStop(1, color);
  //ctx.fillStyle = grd;
  ctx.fillStyle = color;
  ctx.fill();
  
  if ( selected ) {
    ctx.lineWidth = this.settings.selectWidth;
    ctx.strokeStyle = this.settings.selectColor; 
    ctx.stroke();
  }
  ctx.restore();
}

Checker.drawBear = function(ctx) {
  var kappa = .5522848;
  var x = this.drawInfo.pieceWidth * this.column;
  var y = this.row;
  var w = this.drawInfo.bearOffWidth;
  var h = this.drawInfo.bearOffHeight;
  ox = (w / 2) * kappa, // control point offset horizontal
  oy = (h / 2) * kappa, // control point offset vertical
  xe = x + w,           // x-end
  ye = y + h,           // y-end
  xm = x + w / 2,       // x-middle
  ym = y + h / 2;       // y-middle

  ctx.save(); 
  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
  ctx.stroke();    
  
  ctx.fillStyle = this.player == 1 ?  this.drawInfo.p1color : this.drawInfo.p2color;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.fill(); 

  ctx.restore();  
}   

var CheckerXY = Object.create(Checker, { row    :  { value :  -1 }, 
                                          column :  { value :  -1 },
                                          player :  { value :  -1 },
                                          x      :  { value :  -1 },
                                          y      :  { value :  -1 } });      

CheckerXY.getX = function() {
  return this.x;
}

CheckerXY.getY = function() { 
  return this.y;
}										  
                                        
var Space = Object.create(Drawable, {  num          :   { value : -1 }, 
                                       player       :   { value : -1, writable : true },
                                       numCheckers  :   { value : -1, writable : true },
                                       column       :   { value : -1 },
                     highlighted  :   { value : false },
                                       type         :   { value : "Space" } });
                      
Space.isTop = function() {}
Space.isEmpty = function() {return this.numCheckers <= 0 };

//****
//**** Selectable
//****
var Selectable = Object.create(Space, { type     : { value : "Selectable" },
                                        selected : { value : false, writeable: true } } );

Selectable.validMoveTo = function(to) {
  var isValid = false;
  if (to) {
    if (to.numCheckers == 0) isValid = true;
    if (to.numCheckers == 1) isValid = true;
    if (to.numCheckers >= 2) {
      if (this.player == to.player) isValid = true;
    } 
  }
  return isValid;  
}

Selectable.select = function(ctx) {
  this.selected = true;
  this.draw( ctx );
}    

Selectable.draw = function(ctx) { 
  var ch;
  var thresh = this.drawInfo.maxPiecesPerTriangle; // limit number of actual checkers drawn
  var num = (this.numCheckers <= thresh) ? this.numCheckers : thresh;
 
  this.drawShape(ctx);
 
  for (var i = 0; i <= num - 1; i++) {
    var r = this.isTop() ? i : this.drawInfo.boardHeight - i - 1;
    ch = Object.create(Checker, { row : { value : r }, column : { value : this.column }, player : { value : this.player } });
    ch.draw(ctx, false);
  }
  
  if ( this.selected ) { 
    ch.draw( ctx, true ); // will the the top most checker
  }  
  
  if ( this.numCheckers > thresh ) {
    var row = this.isTop() ? thresh - 1 : this.drawInfo.boardHeight - thresh;
    var x = (this.column * this.drawInfo.pieceWidth) + (this.drawInfo.pieceWidth/2) - 5;
    var y = (row * this.drawInfo.pieceHeight) + (this.drawInfo.pieceHeight/2) + 5;  
    ctx.font = "15pt Arial";
    ctx.fillStyle = "#FF4040";
    ctx.fillText(this.numCheckers, x, y);
  }
}  

Selectable.highlight = function(ctx) {
  this.highlighted = true;
  
  // same for bar, triange... different for bearOff
  var base, x;
  x = this.column * this.drawInfo.pieceWidth;
  base = this.isTop() ? 0 : this.drawInfo.pixelHeight;

  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x + this.drawInfo.pieceWidth/2, Math.abs(base - (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight)));
  ctx.lineTo(x + this.drawInfo.pieceWidth, base);
  ctx.lineTo(x, base);
  ctx.stroke();

  ctx.lineWidth = this.settings.highlightWidth;
  ctx.strokeStyle = this.settings.highlightColor;
  ctx.stroke();      
}

//**** bar
function createBar( pplayer, pnum, pcolumn, pnumCheckers ) {
  return Object.create( Bar, 
                  { player      : { value : pplayer }, 
				    num         : { value : pnum }, 
				    column      : { value : pcolumn }, 
				    numCheckers : { value : pnumCheckers, writable: true  } });
}
var Bar = Object.create(Selectable, { type : { value: "bar" } });
Bar.entry = function() { return this.player == 1 ? 0 : 25; };
Bar.isTop = function() { return this.player == 1; };
Bar.drawShape = function(ctx) {
  ctx.save(); 
  if ( this.patterns.bearoff.loaded ) {
    ctx.fillStyle = ctx.createPattern(this.patterns.bearoff.image,'repeat');
  } else {
    ctx.fillStyle = 'white';
  }

  var top = this.isTop() ? 0 : this.drawInfo.pixelHeight - ( this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight );
  if ( this.isTop() ) {
    ctx.fillRect(this.drawInfo.pieceWidth * this.drawInfo.barColumn , top, this.drawInfo.pieceWidth, this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight);
  } else {
    ctx.fillRect(this.drawInfo.pieceWidth * this.drawInfo.barColumn , top, this.drawInfo.pieceWidth, this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight);
  }
  ctx.restore();
}

//**** triangle
function createTriangle( pnum, pcolumn, pplayer, pnumCheckers) {
  return Object.create(Triangle, 
                  { num         : { value : pnum }, 
				    column      : { value : pcolumn } , 
					player      : { value : pplayer, writable : true  }, 
					numCheckers : { value : pnumCheckers, writable : true } });
}

var Triangle = Object.create(Selectable, { type : { value: "triangle" } });
Triangle.isTop = function() { return this.num <= 12; };
Triangle.entry = function() { return this.num };
Triangle.drawShape = function(ctx) {
  ctx.save();
  var x = this.column * this.drawInfo.pieceWidth;
  var base = this.isTop() ? 0 : this.drawInfo.pixelHeight;

  var height = (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight) ;
  var topPixel = this.isTop() ? 0 : base -  height;  

  ctx.drawImage(this.canvasEls.nakedCanvas, x, topPixel, this.drawInfo.pieceWidth, height, x, topPixel, this.drawInfo.pieceWidth, height)

  // draw triangle
  ctx.lineWidth =  1;
  ctx.fillStyle = "white";
  if ( this.num % 2 == 0 && this.patterns.evenTri.loaded ) {
    ctx.fillStyle = ctx.createPattern(this.patterns.evenTri.image,'repeat');
  } else if (  this.num % 2 == 1 && this.patterns.oddTri.loaded ) {
    ctx.fillStyle = ctx.createPattern(this.patterns.oddTri.image,'repeat');
  }
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x + this.drawInfo.pieceWidth/2, Math.abs( base - height ) );
  ctx.lineTo(x + this.drawInfo.pieceWidth, base);
  ctx.lineTo(x, base);
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.globalAlpha = .3;
  ctx.stroke();
  ctx.restore();  
}

//**** bearoff
function createBearoff( pplayer, pnum, pcolumn, pnumCheckers) {
  return Object.create(Bearoff, 
                   { player      : { value : pplayer }, 
				     num         : { value : pnum }, 
					 column      : { value : pcolumn }, 
					 numCheckers : { value : pnumCheckers, writable : true  } });
}
var Bearoff = Object.create(Space, { type : { value: "bearoff" } });
Bearoff.entry = function() { return this.num; };
Bearoff.isTop = function() { return this.player == 2; };
Bearoff.isFull = function() { return false; };
Bearoff.draw = function(ctx) { 
  var ch;

  this.drawShape(ctx);
  for (var i = 0; i <= this.numCheckers - 1; i++) {
    var r = this.isTop() ? i * this.drawInfo.bearOffHeight : (this.drawInfo.boardHeight * this.drawInfo.pieceHeight) - ((i+1) * this.drawInfo.bearOffHeight) - 1;
    ch = Object.create(Checker, { row : { value : r }, column : { value : this.column }, player : { value : this.player } });
    ch.drawBear(ctx);
  }
}

Bearoff.drawShape = function(ctx) {
  ctx.save();
  var top = this.isTop() ? 0 : this.drawInfo.pixelHeight/2;
  if ( this.patterns.bearoff.loaded ) {
    ctx.fillStyle = ctx.createPattern(this.patterns.bearoff.image,'repeat');
  } else {
    ctx.fillStyle = 'white';
  }
  ctx.fillRect(this.drawInfo.pieceWidth * this.drawInfo.bearOffColumn , top, this.drawInfo.bearOffWidth, this.drawInfo.pixelHeight / 2);
  ctx.restore();
}  

Bearoff.highlight = function(ctx) {
  this.highlighted = true;
  
  var base, x, offset;
  x = this.column * this.drawInfo.pieceWidth;
  base = this.isTop() ? 0 : this.drawInfo.pixelHeight;
  offset = 2;
  
  ctx.save();
  
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x, Math.abs(base - (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight)));
  ctx.lineTo(x + this.drawInfo.bearOffWidth - offset, Math.abs(base - (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight)));
  ctx.lineTo(x + this.drawInfo.bearOffWidth - offset, base);
  ctx.lineTo(x, base);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#a020f0";
  ctx.stroke();
  
  ctx.restore();  
}