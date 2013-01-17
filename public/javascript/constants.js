var socket = io.connect(window.location.hostname);
var selectedRoom = -1;
var me = {};  
var bbgame = null; //global game

var CONSTANT_SPECS = {
  boardWidth : 13,
  boardHeight : 12,
  pieceWidth : 50,
  pieceHeight : 45,
  hitPieceWidth : 50,
  hitPieceHeight : 20,
  totalTriangles : 24,
  totalPiecesPerPlayer : 15,
  maxPiecesPerTriangle : 5,
  barColumn : 6,
  bearOffColumn : 13,
  bearOffWidth : 65,
  bearOffHeight: 15,
};
CONSTANT_SPECS.boardPixelWidth = CONSTANT_SPECS.boardWidth * CONSTANT_SPECS.pieceWidth + 1 + CONSTANT_SPECS.bearOffWidth;
CONSTANT_SPECS.boardPixelHeight = CONSTANT_SPECS.boardHeight * CONSTANT_SPECS.pieceHeight + 1;
CONSTANT_SPECS.infoMenuPixelHeight = 25;
CONSTANT_SPECS.totalPixelHeight = CONSTANT_SPECS.boardPixelHeight + CONSTANT_SPECS.infoMenuPixelHeight;
CONSTANT_SPECS.p1color = "#FFFFFF";
CONSTANT_SPECS.p2color = "#262626";
      
var IMAGES = {};
IMAGES.bg = { image: new Image(), loaded: false};
IMAGES.bg.image.src = 'woodbg.jpg';
IMAGES.bg.image.onload = function() {
  IMAGES.bg.loaded = true;
  console.log("img 1 loaded");
} 
IMAGES.oddTri = { image: new Image(), loaded: false};
IMAGES.oddTri.image.src = 'woodlight-min.gif';
IMAGES.oddTri.image.onload = function() {
  IMAGES.oddTri.loaded = true;
    console.log("img 2 loaded");
  
}
IMAGES.evenTri = { image: new Image(), loaded: false};
IMAGES.evenTri.image.src = 'wooddark-min.gif';
IMAGES.evenTri.image.onload = function() {
  IMAGES.evenTri.loaded = true;
    console.log("img 3 loaded");
}
IMAGES.bearoff = { image: new Image(), loaded: false};
IMAGES.bearoff.image.src = 'woodbar.gif';
IMAGES.bearoff.image.onload = function() {
  IMAGES.bearoff.loaded = true;
    console.log("img 4 loaded");
}     
      