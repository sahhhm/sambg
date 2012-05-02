function Drawer(s) {
  this.specs = s;

  this.canvasElement = document.getElementById('bg_canvas');
  this.canvasElement.addEventListener("click", bgOnClick, false);		  
  this.drawingContext = this.canvasElement.getContext("2d")
  this.undoButtonElement = document.getElementById('undo');
  
  // initialize interacting row
  this.interact =
    {
      row: 6,
      columns: 13,
      doubling: 
      {
        column: 6
      },
      dice:
      {
        column: 8,
        columns: 4
      }
    }
  this.interact.pieceWidthPix = this.specs.pieceWidth;
  this.interact.pieceHeightPix = this.specs.pieceHeight;
  this.interact.startX = 0;
  this.interact.startY = this.interact.row * this.interact.pieceHeightPix  - this.interact.pieceHeightPix/2;
  this.interact.totalWidthPix = this.interact.pieceWidthPix * this.interact.columns;
  this.interact.totalHeightPix = this.interact.pieceHeightPix;
  this.interact.padding = 7;
  this.interact.doubling.startX = this.interact.doubling.column * this.interact.pieceWidthPix +this.interact.padding
  this.interact.doubling.startY = this.interact.startY + this.interact.padding;
  this.interact.doubling.widthPix = this.interact.pieceWidthPix - this.interact.padding * 2;
  this.interact.doubling.heightPix =  this.interact.pieceHeightPix - this.interact.padding * 2;
  this.interact.doubling.activeColor = "rgba(238, 213, 210, 1)";
  this.interact.doubling.inactiveColor = "rgba(238, 213, 210, 0.1)"; 
  
  this.interact.dice.startX = this.interact.dice.column * this.interact.pieceWidthPix +this.interact.padding
  this.interact.dice.startY = this.interact.startY + this.interact.padding;
  this.interact.dice.widthPix = this.interact.dice.columns * this.interact.pieceWidthPix - this.interact.padding * 2;
  this.interact.dice.heightPix =  this.interact.pieceHeightPix - this.interact.padding * 2;
  this.interact.dice.pieceWidth = this.interact.dice.heightPix 
  this.interact.dice.pieceHeight = this.interact.dice.heightPix;
  this.interact.dice.piecePadding = Math.abs((this.interact.dice.widthPix - 4*this.interact.dice.pieceWidth) / 5);
  this.interact.dice.alphaUsed = 0.2;
  this.interact.dice.alphaUnused = 0.8;
  
  this.drawBoard = function() {
    this.drawingContext.clearRect(0, 0, this.specs.pixelWidth, this.specs.pixelHeight);
    this.drawingContext.beginPath();
    this.drawingContext.lineWidth =  1;
 
    this.drawingContext.save();
    // board triangles
    for (var x = 0; x <= this.specs.pixelWidth; x += this.specs.pieceWidth) {

      this.drawingContext.globalAlpha = .3;
      this.drawingContext.strokeStyle = "black";
      
      // top triangles
      this.drawingContext.beginPath();
      this.drawingContext.moveTo(x, 0);
      this.drawingContext.lineTo(x + this.specs.pieceWidth/2, this.specs.maxPiecesPerTriangle * this.specs.pieceHeight);
      this.drawingContext.lineTo(x + this.specs.pieceWidth, 0);
      this.drawingContext.lineTo(x, 0);
      this.drawingContext.stroke();
    
      //botton triangles
      this.drawingContext.beginPath();
      this.drawingContext.moveTo(x, this.specs.pixelHeight);
      this.drawingContext.lineTo(x + this.specs.pieceWidth/2, this.specs.pixelHeight - (this.specs.maxPiecesPerTriangle * this.specs.pieceHeight));
      this.drawingContext.lineTo(x + this.specs.pieceWidth, this.specs.pixelHeight);
      this.drawingContext.lineTo(x, this.specs.pixelHeight);
      this.drawingContext.stroke();
    }    
    this.drawingContext.restore();
    
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
  
  this.drawDoublingDice = function(opts) {
    var fs = opts.isActive ? this.interact.doubling.activeColor : this.interact.doubling.inactiveColor;
    this.drawingContext.fillStyle = fs;
    this.drawingContext.clearRect(this.interact.doubling.startX, this.interact.doubling.startY, this.interact.doubling.widthPix,  this.interact.doubling.heightPix); 
    this.drawingContext.fillRect(this.interact.doubling.startX, this.interact.doubling.startY, this.interact.doubling.widthPix,  this.interact.doubling.heightPix);    
    this.drawingContext.font = "15pt Arial";
    this.drawingContext.fillStyle = "rgba(0, 0, 0, .3)";
    this.drawingContext.fillText(opts.value, this.interact.doubling.startX + this.interact.doubling.widthPix/2 - this.interact.padding, this.interact.doubling.startY + this.interact.doubling.heightPix/2 + this.interact.padding);
  }

  this.drawDice = function(opts) {
  //{ dice: Dice (array of DicePieces), currentPlayer: Player, mePlayer: Player, otherPlayer: Player, pCanConfirm: boolean, pCanRoll: boolean } 
    
    this.drawingContext.save();    
    
    // clear entire dice area
    this.drawingContext.clearRect(this.interact.dice.startX, this.interact.dice.startY, this.interact.dice.widthPix,  this.interact.dice.heightPix); 

    // draw each individual dice
    var fs  = ( opts.dice.isRolled ) ? opts.currentPlayer.color : opts.otherPlayer.color;
    for ( var d = 0; d < opts.dice.dice.length; d++ ) {
      var pos = ( d + 1 ) % 4; // center the dice when there are only two... current looks funny when you have doubles and you move one at a time...
      this.drawingContext.globalAlpha = ( opts.dice.dice[d].isUsed ) ? this.interact.dice.alphaUsed : this.interact.dice.alphaUnused;
      this.drawingContext.fillStyle = fs;
      this.drawingContext.fillRect(this.interact.dice.startX + this.interact.dice.piecePadding +  pos * (this.interact.dice.pieceWidth  + this.interact.dice.piecePadding), 
                                   this.interact.dice.startY, 
                                   this.interact.dice.pieceWidth, this.interact.dice.pieceHeight);
      
      // display dice value
      this.drawingContext.fillStyle = "white";
      this.drawingContext.globalAlpha = 1;
      this.drawingContext.font = "12pt Arial";
      this.drawingContext.fillText(opts.dice.dice[d].value, 
                                  this.interact.dice.startX + this.interact.dice.piecePadding +  pos * (this.interact.dice.pieceWidth  + this.interact.dice.piecePadding) + ((this.interact.dice.pieceWidth - this.interact.dice.piecePadding )/2) , 
                                  this.interact.dice.startY + ( (this.interact.dice.pieceHeight + this.interact.padding) / 2 ));       
    }
    this.drawingContext.restore();
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
    var base, x;
    x = space.column * this.specs.pieceWidth;
    base = space.isTop() ? 0 : this.specs.pixelHeight;

    this.drawingContext.beginPath();
    this.drawingContext.moveTo(x, base);
    this.drawingContext.lineTo(x + this.specs.pieceWidth/2, Math.abs(base - (this.specs.maxPiecesPerTriangle * this.specs.pieceHeight)));
    this.drawingContext.lineTo(x + this.specs.pieceWidth, base);
    this.drawingContext.lineTo(x, base);
    this.drawingContext.stroke();

    this.drawingContext.lineWidth = 3;
    this.drawingContext.strokeStyle = "#a020f0";
    this.drawingContext.stroke();      
  }

  this.highlightTriangles = function(selected, potentials) {
    this.highlightSelectedSpace(selected);
    for (var i = 0; i < potentials.length; i++) this.highlight(potentials[i], 3, true)
  }  
  
  this.highlightBars = function(selected, potentials) {
    this.highlightSelectedSpace(selected);
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
      t.isTop() ? this.drawThreshNum( { column: t.column, row: thresh - 1, isTop: t.isTop(), numCheckers: t.numCheckers } ) : 
                  this.drawThreshNum( { column: t.column, row: this.specs.boardHeight - thresh, isTop: t.isTop(), numCheckers: t.numCheckers } ) ;
    }
  }  

  this.drawThreshNum = function(opts) {
    var x = (opts.column * this.specs.pieceWidth) + (this.specs.pieceWidth/2) - 5;
    var y = (opts.row * this.specs.pieceHeight) + (this.specs.pieceHeight/2) + 5;  
    this.drawingContext.font = "15pt Arial";
    this.drawingContext.fillStyle = "white";
    this.drawingContext.fillText(opts.numCheckers, x, y);
  }  
  
  this.drawBar = function(b) {
    for (var k = 0; k < b.numCheckers; k++) 
      b.isTop() ? this.drawPiece(new Checker(k, b.column, b.player), false) : this.drawPiece(new Checker(this.specs.boardHeight - k - 1, b.column, b.player), false);	
  }  
  
  this.drawBearOff = function(b) {
    for (var k = 0; k < b.numCheckers; k++) 
      b.isTop() ? this.drawBearPiece(new Checker(k * this.specs.bearOffHeight, b.column, b.player)) : this.drawBearPiece(new Checker((this.specs.boardHeight * this.specs.pieceHeight) - ((k+1) * this.specs.bearOffHeight) - 1, b.column, b.player));	
  }  
  
  this.highlightSelectedSpace = function(sp) {
    sp.isTop() ? 
      this.drawPiece(new Checker(sp.numCheckers - 1, sp.column, sp.player), true) : 
      this.drawPiece(new Checker(this.specs.boardHeight - sp.numCheckers, sp.column, sp.player), true);
  }
  
  this.drawPiece = function(ch, selected) {
    var x = (ch.column * this.specs.pieceWidth) + (this.specs.pieceWidth/2);
    var y = (ch.row * this.specs.pieceHeight) + (this.specs.pieceHeight/2);
    var radius = (this.specs.pieceWidth/2) - (this.specs.pieceWidth/9);
    this.drawingContext.beginPath();
    this.drawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    this.drawingContext.closePath();

    // make radial glare
    var color = ch.player == 1 ? this.specs.p1color : this.specs.p2color;
    var grd = this.drawingContext.createRadialGradient(x, y, radius, x + 3, y - 5, radius-3);
    grd.addColorStop(0, "white");
    grd.addColorStop(1, color);
    this.drawingContext.fillStyle = grd;
    this.drawingContext.fill();
    
    if ( selected ) {
      this.drawingContext.lineWidth = 4;
      this.drawingContext.strokeStyle = "#0f0";
      this.drawingContext.stroke();
    }
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