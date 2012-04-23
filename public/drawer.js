function Drawer(s) {
  this.specs = s;

  this.canvasElement = document.getElementById('bg_canvas');
  this.canvasElement.addEventListener("click", bgOnClick, false);		  
  this.drawingContext = this.canvasElement.getContext("2d")
  this.currentDiceElement = document.getElementById('current-dice');
  this.confirmButtonElement = document.getElementById('confirm');
  this.undoButtonElement = document.getElementById('undo');
  this.rollButtonElement = document.getElementById('roll');
  this.doubleButtonElement = document.getElementById('double');
  
  this.drawBoard = function() {
    this.drawingContext.clearRect(0, 0, this.specs.pixelWidth, this.specs.pixelHeight);
    this.drawingContext.beginPath();
    this.drawingContext.lineWidth =  1;
    
    /* vertical lines */
    for (var x = 0; x <= this.specs.pixelWidth; x += this.specs.pieceWidth) {
      this.drawingContext.moveTo(0.5 + x, 0);
      this.drawingContext.lineTo(0.5 + x, this.specs.pixelHeight);
    }

    /* horizontal lines */
    for (var y = 0; y <= this.specs.pixelHeight; y += this.specs.pieceHeight) {
     this.drawingContext.moveTo(0, 0.5 + y);
      this.drawingContext.lineTo(this.specs.pixelWidth, 0.5 +  y);
    }
    
    /* draw it! */
    this.drawingContext.strokeStyle = "#ccc";
    this.drawingContext.stroke();
  
    /* bar */
    this.drawingContext.fillStyle = "#ccc";
    for (var y = 0; y <= this.specs.pixelHeight; y += this.specs.pieceHeight) {
      this.drawingContext.fillRect(this.specs.pieceWidth * Math.floor(this.specs.boardWidth/2), y, this.specs.pieceWidth, this.specs.pieceHeight);
    }
    
    /* bear off area */
    this.drawingContext.fillStyle = "#0f0";
    for (var y = 0; y <= this.specs.pixelHeight; y += this.specs.pieceHeight) {
      this.drawingContext.fillRect(this.specs.boardWidth * this.specs.pieceWidth + 1, y, this.specs.bearOffWidth, this.specs.pieceHeight);
    }
  }

  this.drawTriangles = function(theTriangles) {  
    /* draw pieces in each triangle */
    for (var i = 0; i < theTriangles.length; i++) {
      this.drawTriangle(theTriangles[i]);
    }
  }

  this.drawBars = function(theBars) {
    /* draw hit pieces */
    for (var j = 0; j < theBars.length; j++) {
      this.drawBar(theBars[j]);
    }
  }
  
  this.drawBearOffs = function(theBOs) {
    /* draw bear off area pieces */
    for (var k = 0; k < theBOs.length; k++) {
      this.drawBearOff(theBOs[k]);
    }
  }  

  this.highlight = function(space, width, isPotential) {
    var color, l, base, height, tx;
    tx = space.column * this.specs.pieceWidth;
    base = space.isTop() ? 0 : this.specs.pixelHeight;
    l = ( space.type == "bearoff" ) ? this.specs.bearOffWidth : this.specs.pieceWidth;
    isPotential ? color =  "#a020f0" : "#00ff00";
    height = isPotential ? 0 : space.numCheckers * this.specs.pieceHeight;
    if ( !space.isTop() ) {
      height = this.specs.pixelHeight - height;
    }

    this.drawingContext.beginPath();
    this.drawingContext.moveTo( 0.5 + tx, base );
    this.drawingContext.lineTo( 0.5 + tx, height );
    this.drawingContext.lineTo( 0.5 + tx + l, height );
    this.drawingContext.lineTo( 0.5 + tx + l, base );

    this.drawingContext.lineWidth = width;
    this.drawingContext.strokeStyle = color;
    this.drawingContext.stroke();      
  }

  this.highlightTriangles = function(selected, potentials) {
    this.highlight(selected, 3, false);
    for (var i = 0; i < potentials.length; i++) this.highlight(potentials[i], 3, true)
  }  
  
  this.highlightBars = function(selected, potentials) {
    this.highlight(selected, 3, false);
    for (var i = 0; i < potentials.length; i++) this.highlight(potentials[i], 3, true)
  }      
  
  this.highlightBearOff = function (bo) {
    this.highlight(bo, 10, true);
  }
  
  this.drawTriangle = function(t) {
    for (var i = 0; i < t.numCheckers; i++) 
      t.isTop() ? this.drawPiece(new Checker(i, t.column, t.player), false) : this.drawPiece(new Checker(this.specs.boardHeight - i - 1, t.column, t.player), false);
  }  

  this.drawBar = function(b) {
    for (var k = 0; k < b.numCheckers; k++) 
      b.isTop() ? this.drawPiece(new Checker(k, b.column, b.player), false) : this.drawPiece(new Checker(this.specs.boardHeight - k - 1, b.column, b.player), false);	
  }  
  
  this.drawBearOff = function(b) {
    for (var k = 0; k < b.numCheckers; k++) 
      b.isTop() ? this.drawBearPiece(new Checker(k * this.specs.bearOffHeight, b.column, b.player)) : this.drawBearPiece(new Checker((this.specs.boardHeight * this.specs.pieceHeight) - ((k+1) * this.specs.bearOffHeight) - 1, b.column, b.player));	
  }  
  
  this.drawPiece = function(ch, selected) {
    var x = (ch.column * this.specs.pieceWidth) + (this.specs.pieceWidth/2);
    var y = (ch.row * this.specs.pieceHeight) + (this.specs.pieceHeight/2);
    var radius = (this.specs.pieceWidth/2) - (this.specs.pieceWidth/9);
    this.drawingContext.beginPath();
    this.drawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    this.drawingContext.closePath();
    this.drawingContext.strokeStyle = "#000";
    this.drawingContext.stroke();
    ch.player == 1 ? this.drawingContext.fillStyle = this.specs.p1color : this.drawingContext.fillStyle = this.specs.p2color;
    this.drawingContext.fill();   
  }

  this.drawBearPiece = function(ch) {
    var kappa = .5522848;
    var x = this.specs.pieceWidth * ch.column;
    var y = ch.row;
    var w = this.specs.bearOffWidth;
    var h = this.specs.bearOffHeight;
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

    this.drawingContext.beginPath();
    this.drawingContext.moveTo(x, ym);
    this.drawingContext.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.drawingContext.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.drawingContext.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.drawingContext.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.drawingContext.closePath();
    this.drawingContext.stroke();    
    
    ch.player == 1 ? this.drawingContext.fillStyle = this.specs.p1color : this.drawingContext.fillStyle = this.specs.p2color;
    this.drawingContext.fill();   
  }   
}