function Player(num, color, bRow, bColumn, homeMinNum, homeMaxNum, oppMinNum, oppMaxNum, direction) {
  this.num = num;
  this.color = color;
  this.bar = new Bar(num, bRow, bColumn, 0); 
  this.isHit = function() { return this.bar.numCheckers > 0; }
  this.homeMinNum = homeMinNum;
  this.homeMaxNum = homeMaxNum;
  this.oppMinNum = oppMinNum;
  this.oppMaxNum = oppMaxNum;
  this.direction = direction;
}