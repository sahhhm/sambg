function Checker(row, column, player) {
  this.row = row;
  this.column = column;
  this.player = player;
  
  this.findTriangleNum = function(b) {
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

  this.findBarNum = function (b) {
    var x = this.column;
    var y = this.row;
    var bnum = -1;
    if (x == b.specs.barColumn) 
      if (y < b.specs.maxPiecesPerTriangle) bnum = 1;
      else if (y > b.specs.boardHeight - b.specs.maxPiecesPerTriangle - 1) bnum = 2;
      else bnum = -1;
    else bnum = -1;
    return bnum;	 
  }
  
  this.draw = function(ctx, selected) {
    var x = (this.column * this.drawInfo.pieceWidth) + (this.drawInfo.pieceWidth/2);
    var y = (this.row * this.drawInfo.pieceHeight) + (this.drawInfo.pieceHeight/2);
    var radius = (this.drawInfo.pieceWidth/2) - (this.drawInfo.pieceWidth/9);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, false);
    ctx.closePath();

    // make radial glare
    var color = this.player == 1 ? this.drawInfo.p1color : this.drawInfo.p2color;
    var grd = ctx.createRadialGradient(x, y, radius, x + 3, y - 5, radius-3);
    grd.addColorStop(0, "white");
    grd.addColorStop(1, color);
    ctx.fillStyle = grd;
    ctx.fill();
    
    if ( selected ) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#0f0";
      ctx.stroke();
    }
  }

  this.drawBear = function(ctx) {
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

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.closePath();
    ctx.stroke();    
    
    ctx.fillStyle = this.player == 1 ?  this.drawInfo.p1color : this.drawInfo.p2color;
    ctx.fill();   
  }
  
}
