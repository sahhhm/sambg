
/*
* -------------------------------------------
* DRAWABLE CLASS
* -------------------------------------------
*/
var Drawable = Class.extend({
    init: function() {
      var bgCanvas = document.getElementById('bg_canvas');
      var nakedCanvas = document.getElementById('bg_naked');
      var bgCtx = document.getElementById('bg_canvas').getContext("2d");
      var nakedCtx = document.getElementById('bg_naked').getContext("2d");
  
      this.ctxs = { ctx  : bgCtx,
                    nctx : nakedCtx };
					
      this.canvasEls = { canvas		: bgCanvas,
                         nakedCanvas: nakedCanvas}; 
                        
      this.canvasEls.canvas.addEventListener("click", bgOnClick, false);
      if (this.canvasEls.canvas.width != CONSTANT_SPECS.boardPixelWidth) {
        this.canvasEls.canvas.width = CONSTANT_SPECS.boardPixelWidth;
        this.canvasEls.canvas.height = CONSTANT_SPECS.totalPixelHeight;
        this.canvasEls.nakedCanvas.width = CONSTANT_SPECS.boardPixelWidth;
        this.canvasEls.nakedCanvas.height = CONSTANT_SPECS.totalPixelHeight;
      }
      
      this.drawInfo = { pieceWidth : CONSTANT_SPECS.pieceWidth,
                        pieceHeight: CONSTANT_SPECS.pieceHeight,
                        p1color: CONSTANT_SPECS.p1color,
                        p2color: CONSTANT_SPECS.p2color,
                        bearOffWidth : CONSTANT_SPECS.bearOffWidth,
                        bearOffHeight : CONSTANT_SPECS.bearOffHeight,
                        boardHeight: CONSTANT_SPECS.boardHeight,
                        barColumn : CONSTANT_SPECS.barColumn,
                        bearOffColumn : CONSTANT_SPECS.bearOffColumn,
                        maxPiecesPerTriangle : CONSTANT_SPECS.maxPiecesPerTriangle,
                        boardPixelHeight : CONSTANT_SPECS.boardPixelHeight,
                        boardPixelWidth : CONSTANT_SPECS.boardPixelWidth,
                        infoMenuPixelHeight : CONSTANT_SPECS.infoMenuPixelHeight,
                        totalPixelHeight : CONSTANT_SPECS.totalPixelHeight,
                        totalTriangles : CONSTANT_SPECS.totalTriangles                        
                      };
                      
      this.settings = {
                        highlightWidth : 3,
                        selectWidth : 3,
                        selectColor : "#75c938",
                        highlightColor : "#8D38C9"
                      };                        
    }, 
});
