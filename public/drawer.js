function Drawer(s) {
  this.specs = s;

  this.canvasElement = document.getElementById('bg_canvas');
  this.canvasElement.addEventListener("click", bgOnClick, false);		  
  this.drawingContext = this.canvasElement.getContext("2d")
  this.currentDiceElement = document.getElementById('current-dice');
  this.confirmButtonElement = document.getElementById('confirm');
  this.undoButtonElement = document.getElementById('undo');
  this.rollButtonElement = document.getElementById('roll');
  
  // initialize interacting row
  this.interact =
    {
      row: 6,
      columns: 13,
      doubling: 
      {
        column: 6
      }
    }
  this.interact.pieceWidthPix = this.specs.pieceWidth;
  this.interact.pieceHeightPix = this.specs.pieceHeight;
  this.interact.startX = 0;
  this.interact.startY = this.interact.row * this.interact.pieceHeightPix  - this.interact.pieceHeightPix/2;
  this.interact.totalWidthPix = this.interact.pieceWidthPix * this.interact.columns;
  this.interact.totalHeightPix = this.interact.pieceHeightPix;
  this.interact.doubling.padding = 7;
  this.interact.doubling.startX = this.interact.doubling.column * this.interact.pieceWidthPix +this.interact.doubling.padding
  this.interact.doubling.startY = this.interact.startY + this.interact.doubling.padding;
  this.interact.doubling.widthPix = this.interact.pieceWidthPix - this.interact.doubling.padding * 2;
  this.interact.doubling.heightPix =  this.interact.pieceHeightPix - this.interact.doubling.padding * 2;
  this.interact.doubling.activeColor = "rgba(238, 213, 210, 1)";
  this.interact.doubling.inactiveColor = "rgba(238, 213, 210, 0.1)"; 
  
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
    
    /* interact area... doubling dice, regular dice, etc. */
    //this.drawingContext.fillStyle = "#f0f";
    //this.drawingContext.fillRect(this.interact.startX, this.interact.startY, this.interact.totalWidthPix,  this.interact.totalHeightPix);  
    //this.drawingContext.fillStyle = "#D2B48C";
    //this.drawingContext.fillRect(this.interact.doubling.startX, this.interact.doubling.startY, this.interact.doubling.widthPix,  this.interact.doubling.heightPix);    
  }
  
  this.drawDoublingDice = function(opts) {
    var fs = opts.isActive ? this.interact.doubling.activeColor : this.interact.doubling.inactiveColor;
    this.drawingContext.fillStyle = fs;
    this.drawingContext.clearRect(this.interact.doubling.startX, this.interact.doubling.startY, this.interact.doubling.widthPix,  this.interact.doubling.heightPix); 
    this.drawingContext.fillRect(this.interact.doubling.startX, this.interact.doubling.startY, this.interact.doubling.widthPix,  this.interact.doubling.heightPix);    
    this.drawingContext.font = "15pt Arial";
    this.drawingContext.fillStyle = "rgba(0, 0, 0, .3)";
    this.drawingContext.fillText(opts.value, this.interact.doubling.startX + this.interact.doubling.widthPix/2 - this.interact.doubling.padding, this.interact.doubling.startY + this.interact.doubling.heightPix/2 + this.interact.doubling.padding);
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
    var modNumCheckers = space.numCheckers > this.specs.maxPiecesPerTriangle ? this.specs.maxPiecesPerTriangle : space.numCheckers;
    tx = space.column * this.specs.pieceWidth;
    base = space.isTop() ? 0 : this.specs.pixelHeight;
    l = ( space.type == "bearoff" ) ? this.specs.bearOffWidth : this.specs.pieceWidth;
    isPotential ? color =  "#a020f0" : "#00ff00";
    height = isPotential ? 0 : modNumCheckers * this.specs.pieceHeight;
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
    var thresh = this.specs.maxPiecesPerTriangle; // limit number of actual checkers drawn
    var num = (t.numCheckers <= thresh) ? t.numCheckers : thresh;

    for (var i = 0; i <= num - 1; i++) {
      t.isTop() ? this.drawPiece(new Checker(i, t.column, t.player), false) : this.drawPiece(new Checker(this.specs.boardHeight - i - 1, t.column, t.player), false);
    }
    
    if (t.numCheckers > (thresh)) {
      t.isTop() ? this.drawTextGTThresh( { column: t.column, row: thresh - 1, isTop: t.isTop(), numCheckers: t.numCheckers } ) : 
                  this.drawTextGTThresh( { column: t.column, row: this.specs.boardHeight - thresh, isTop: t.isTop(), numCheckers: t.numCheckers } ) ;
    }
  }  

  this.drawBar = function(b) {
    for (var k = 0; k < b.numCheckers; k++) 
      b.isTop() ? this.drawPiece(new Checker(k, b.column, b.player), false) : this.drawPiece(new Checker(this.specs.boardHeight - k - 1, b.column, b.player), false);	
  }  
  
  this.drawBearOff = function(b) {
    for (var k = 0; k < b.numCheckers; k++) 
      b.isTop() ? this.drawBearPiece(new Checker(k * this.specs.bearOffHeight, b.column, b.player)) : this.drawBearPiece(new Checker((this.specs.boardHeight * this.specs.pieceHeight) - ((k+1) * this.specs.bearOffHeight) - 1, b.column, b.player));	
  }  
  
  this.drawTextGTThresh = function(opts) {
    var x = (opts.column * this.specs.pieceWidth) + (this.specs.pieceWidth/2) - 5;
    var y = (opts.row * this.specs.pieceHeight) + (this.specs.pieceHeight/2) + 5;  
    this.drawingContext.font = "15pt Arial";
    this.drawingContext.fillStyle = "white";
    this.drawingContext.fillText(opts.numCheckers, x, y);
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