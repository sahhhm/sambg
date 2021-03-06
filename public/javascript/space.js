/*
* -------------------------------------------
* CHECKER CLASS
* -------------------------------------------
*/
var Checker = Drawable.extend({
    init: function(row, column, player) {
      this._super();
      this.row = row;
      this.column = column;
      this.player = player;
    },
    findTriangleNum: function(b) {
      var x = this.column;
      var y = this.row;
      var tnum = -1;
      if (x != b.drawInfo.barColumn) { 
        if (y < b.drawInfo.maxPiecesPerTriangle) { // top 
          tnum = (b.drawInfo.totalTriangles/2) - x + 1;
          if (x < b.drawInfo.barColumn) tnum -= 1;
        } else if (y > b.drawInfo.boardHeight - b.drawInfo.maxPiecesPerTriangle - 1) { // bottom
          tnum = (b.drawInfo.totalTriangles/2) + x + 1;
          if (x > b.drawInfo.barColumn) tnum -=1;
        } else {
          tnum = -1;
        }  
      } else {
        tnum = -1;
      } 
      return tnum;  
    },
    findBarNum: function (b) {
      var x = this.column;
      var y = this.row;
      var bnum = -1;
      if (x == b.drawInfo.barColumn) {
        if (y < b.drawInfo.maxPiecesPerTriangle) bnum = 1;
        else if (y > b.drawInfo.boardHeight - b.drawInfo.maxPiecesPerTriangle - 1) bnum = 2;
        else bnum = -1;
      } else {
        bnum = -1;
      }
      return bnum;	 
    },
    getX: function() {
      return (this.column * this.drawInfo.pieceWidth) + (this.drawInfo.pieceWidth/2);
    },
    getY: function() {
      return (this.row * this.drawInfo.pieceHeight) + (this.drawInfo.pieceHeight/2);
    },
    draw: function(ctx, selected) {
      ctx.save();
      var x = this.getX();
      var y = this.getY();
      var radius = (this.drawInfo.pieceWidth/2) - (this.drawInfo.pieceWidth/9);
      var color = this.player == 1 ? this.drawInfo.p1color : this.drawInfo.p2color;
      
      // draw circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI*2, false);
      ctx.closePath();
      
      ctx.fillStyle = color;
      ctx.fill();
  
      if ( selected ) {
        ctx.lineWidth = this.settings.selectWidth;
        ctx.strokeStyle = this.settings.selectColor; 
        ctx.stroke();
      }
      ctx.restore();
    },     
    drawBear: function(ctx) {
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
    },   
});


/*
* -------------------------------------------
* CHECKERXY CLASS
* -------------------------------------------
*/
var CheckerXY = Checker.extend({
    init: function(x, y, player) {
      this._super(-1, -1, player);
      this.x = x;
      this.y = y;
    },
    getX: function() {
      return this.x;
    },
    getY: function() { 
      return this.y;
    },			
});								  

/*
* -------------------------------------------
* SPACE CLASS
* -------------------------------------------
*/
var Space = Drawable.extend({
    init: function(num, player, numCheckers, column, highlighted ) {
      this._super();
      this.num = num; 
      this.player = player;
      this.numCheckers = numCheckers;
      this.column = column;
      this.highlighted = highlighted;
      this.type = "space";
    },
    isTop: function() {},
    isEmpty: function() {return this.numCheckers <= 0 },
    pipCount: function() { return 0; },
});								 


/*
* -------------------------------------------
* SELECTABLE CLASS
* -------------------------------------------
*/
var Selectable = Space.extend({
    init: function(num, player, numCheckers, column, highlighted ) {
      this._super(num, player, numCheckers, column, highlighted);
      this.type = "Selectable";
      this.selected = false;     
    },
    validMoveTo: function(to) {
      var isValid = false;
      if (to && to.num > 0) {
        if (to.numCheckers == 0) isValid = true;
        if (to.numCheckers == 1) isValid = true;
        if (to.numCheckers >= 2) {
          if (this.player == to.player) isValid = true;
        } 
      }
      return isValid;  
    },
    select: function(ctx) {
      this.selected = true;
      this.draw( ctx );
    },
    draw: function(ctx) { 
      var ch;
      var thresh = this.drawInfo.maxPiecesPerTriangle; // limit number of actual checkers drawn
      var num = (this.numCheckers <= thresh) ? this.numCheckers : thresh;
     
      this.drawShape(ctx);
     
      for (var i = 0; i <= num - 1; i++) {
        var r = this.isTop() ? i : this.drawInfo.boardHeight - i - 1;
        ch = new Checker (r, this.column, this.player);
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
    },  
    highlight: function(ctx) {
      this.highlighted = true;
      
      // same for bar, triange... different for bearOff
      var base, x;
      x = this.column * this.drawInfo.pieceWidth;
      base = this.isTop() ? 0 : this.drawInfo.boardPixelHeight;

      ctx.beginPath();
      ctx.moveTo(x, base);
      ctx.lineTo(x + this.drawInfo.pieceWidth/2, Math.abs(base - (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight)));
      ctx.lineTo(x + this.drawInfo.pieceWidth, base);
      ctx.lineTo(x, base);
      ctx.stroke();

      ctx.lineWidth = this.settings.highlightWidth;
      ctx.strokeStyle = this.settings.highlightColor;
      ctx.stroke();      
    },    
});								 

//**** bar
function createBar( pplayer, pnum, pcolumn, pnumCheckers ) {
  return new Bar( pnum, pplayer, pnumCheckers, pcolumn, false );
}

/*
* -------------------------------------------
* BAR CLASS
* -------------------------------------------
*/
var Bar = Selectable.extend({
    init: function(num, player, numCheckers, column, highlighted ) {
      this._super(num, player, numCheckers, column, highlighted);
      this.type = "bar";    
    },
    entry: function() { return this.player == 1 ? 0 : 25; },
    isTop: function() { return this.player == 1; },
    drawShape: function(ctx) {
      ctx.save(); 
      if ( IMAGES.bearoff.loaded ) {
        ctx.fillStyle = ctx.createPattern(IMAGES.bearoff.image,'repeat');
      } else {
        ctx.fillStyle = 'white';
      }

      var top = this.isTop() ? 0 : this.drawInfo.boardPixelHeight - ( this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight );
      if ( this.isTop() ) {
        ctx.fillRect(this.drawInfo.pieceWidth * this.drawInfo.barColumn , top, this.drawInfo.pieceWidth, this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight);
      } else {
        ctx.fillRect(this.drawInfo.pieceWidth * this.drawInfo.barColumn , top, this.drawInfo.pieceWidth, this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight);
      }
      ctx.restore();
    },
    pipCount: function() {
      return this.numCheckers * 24;
    },    
});		


//**** triangle
function createTriangle( pnum, pcolumn, pplayer, pnumCheckers) {
  return new Triangle(pnum, pplayer, pnumCheckers, pcolumn, false); 
}

/*
* -------------------------------------------
* TRIANGLE CLASS
* -------------------------------------------
*/
var Triangle = Selectable.extend({
    init: function(num, player, numCheckers, column, highlighted ) {
      this._super(num, player, numCheckers, column, highlighted);
      this.type = "triangle";    
    },
    isTop: function() { return this.num <= 12; },
    entry: function() { return this.num },
    drawShape: function(ctx) {
      ctx.save();
      var x = this.column * this.drawInfo.pieceWidth;
      var base = this.isTop() ? 0 : this.drawInfo.boardPixelHeight;

      var height = (this.drawInfo.maxPiecesPerTriangle * this.drawInfo.pieceHeight) ;
      var topPixel = this.isTop() ? 0 : base -  height;  

      var off = 3;
      ctx.drawImage(this.canvasEls.nakedCanvas, 
                    x - off, Math.max(topPixel, topPixel - off), this.drawInfo.pieceWidth + off*2, height + off*2, 
                    x - off, Math.max(topPixel, topPixel - off), this.drawInfo.pieceWidth + off*2, height + off*2)

      // draw triangle
      ctx.lineWidth =  1;
      ctx.fillStyle = "white";
      if ( this.num % 2 == 0 && IMAGES.evenTri.loaded ) {
        ctx.fillStyle = ctx.createPattern(IMAGES.evenTri.image,'repeat');
      } else if (  this.num % 2 == 1 && IMAGES.oddTri.loaded ) {
        ctx.fillStyle = ctx.createPattern(IMAGES.oddTri.image,'repeat');
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
    },
    pipCount: function() {
      var count = 0; 
      if ( this.numCheckers ) {
        if ( this.player == 1 ) {
          count = this.numCheckers * ( 24 - this.num + 1 );	
        } else if ( this.player == 2 ) {
          count = this.numCheckers * this.num;
        } else {
          console.log("pipCount: Invalid player number");
        }
      }
      return count;
    },
});		


//**** bearoff
function createBearoff( pplayer, pnum, pcolumn, pnumCheckers) {
  return new Bearoff( pnum, pplayer, pnumCheckers, pcolumn, false);
}

/*
* -------------------------------------------
* BEAROFF CLASS
* -------------------------------------------
*/
var Bearoff = Space.extend({
    init: function(num, player, numCheckers, column, highlighted ) {
      this._super(num, player, numCheckers, column, highlighted);
      this.type = "bearoff";    
    },
    entry: function() { return this.num; },
    isTop: function() { return this.player == 2; },
    isFull: function() { return false; },
    draw: function(ctx) { 
      var ch;

      this.drawShape(ctx);
      for (var i = 0; i <= this.numCheckers - 1; i++) {
        var r = this.isTop() ? i * this.drawInfo.bearOffHeight : (this.drawInfo.boardHeight * this.drawInfo.pieceHeight) - ((i+1) * this.drawInfo.bearOffHeight) - 1;
        ch = new Checker(r, this.column, this.player); 
        ch.drawBear(ctx);
      }
    },
    drawShape: function(ctx) {
      ctx.save();
      var top = this.isTop() ? 0 : this.drawInfo.boardPixelHeight/2;
      if ( IMAGES.bearoff.loaded ) {
        ctx.fillStyle = ctx.createPattern(IMAGES.bearoff.image,'repeat');
      } else {
        ctx.fillStyle = 'white';
      }
      ctx.fillRect(this.drawInfo.pieceWidth * this.drawInfo.bearOffColumn , top, this.drawInfo.bearOffWidth, this.drawInfo.boardPixelHeight / 2);
      ctx.restore();
    },
    highlight: function(ctx) {
      this.highlighted = true;
      
      var base, x, offset;
      x = this.column * this.drawInfo.pieceWidth;
      base = this.isTop() ? 0 : this.drawInfo.boardPixelHeight;
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
    },
});		