function RNG() {
  // implement later....
  this.getADie = function()  {
    return Math.floor(Math.random()*6 + 1);
  }
  
}	

exports.RNG = RNG
