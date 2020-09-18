const WINDOW_LENGTH = 800; // 8====D
const FOOD_AMOUNT = 1;
let g;
let bodys = [];
let food = [];

class Food {
  constructor() {
    this.position = g.getRandomPosition();
  }

  getPosition() {
    return this.position;
  }

  draw() {
    const blocklength = WINDOW_LENGTH / g.getBlocksPerRow();
    const x = (this.position.x - 1) * blocklength + blocklength / 2;
    const y = (- (this.position.y + 1)) * blocklength + blocklength / 2;
    ellipse(x, y, blocklength - 10);
  }
}

class Body {
  constructor (next, prev) {
    this.next = next;
    this.prev = prev;
    this.lastmove = createVector(1, 0);
    if (this.prev != null) {
      //const prevPos = this.prev.position;
      this.heading = createVector(prev.oldHeading.x, prev.oldHeading.y);
      //const newPos = createVector(prevPos.x - this.prev.getHeading().x, prevPos.y + this.prev.getHeading().y);
      this.position = this.prev.oldPosition;
    } else {
      this.position = g.getMiddle();
    }
  }

  setNext(next) {
    this.next = next;
  }

  collisionWithFood() {
    for (let i = 0; i < food.length; i++) {
      if (this.position.x === food[i].position.x && this.position.y === food[i].position.y) {
        this.food_index = i;
        return true;
      }
    }
    return false;
  }

  setPrev(prev) {
    this.prev = prev;
  }
  
  move() {
    if (this.prev != null) {
      this.oldHeading = this.heading;
      this.heading = this.prev.oldHeading;
      this.position = this.prev.oldPosition;
      this.oldPosition = createVector(this.position.x - this.heading.x, this.position.y - this.heading.y);
      
    } else {
      this.oldHeading = this.heading;
      if (keyIsDown(LEFT_ARROW)) {
        this.heading = createVector(-1, 0);
      } else if (keyIsDown(RIGHT_ARROW)) {
        this.heading = createVector(1, 0);
      } else if (keyIsDown(UP_ARROW)) {
        this.heading = createVector(0, 1);
      } else if (keyIsDown(DOWN_ARROW)) {
        this.heading = createVector(0, -1);
      } else {
        this.heading = this.lastmove;
      }
      this.lastmove = this.heading;
      this.position.add(this.heading);

      this.oldPosition = createVector(this.position.x - this.lastmove.x, this.position.y - this.lastmove.y);
      
    
      // collision check
      if (this.collisionWithFood()) {
        let zw = this;
        while (zw.next != null) {
          zw = zw.next;
        }
        let neu = new Body(null, zw);
        bodys.push(neu);
        zw.setNext(neu);
        food.splice(this.food_index);
        food.push(new Food());
      }
    }
    if (this.position.x < 1) this.position.x = g.getBlocksPerRow();
    if (this.position.x > g.getBlocksPerRow()) this.position.x = 1;
    if (this.position.y > -1) this.position.y = - g.getBlocksPerRow();
    if (this.position.y < - g.getBlocksPerRow()) this.position.y = -1;

  }

  draw() {
    const blocklength = WINDOW_LENGTH / g.getBlocksPerRow();
    const x = (this.position.x - 1) * blocklength + blocklength / 2;
    const y = (- (this.position.y + 1)) * blocklength + blocklength / 2;
    ellipse(x, y, blocklength - 5);
  }
    
}

class Grid {
  constructor(blocksPerRow) {
    this.blocksPerRow = blocksPerRow;
    this.blen = Math.floor(WINDOW_LENGTH / this.blocksPerRow);
    this.bhei = Math.floor(WINDOW_LENGTH / this.blocksPerRow);
  }

   getMiddle() {
    return createVector(Math.floor(this.blocksPerRow / 2), - Math.floor(this.blocksPerRow / 2));
  }

  getRandomPosition() {
    return createVector(Math.floor(Math.random()*this.blocksPerRow)+1, - Math.floor(Math.random()*this.blocksPerRow)-1);
  }

  getBlocksPerRow() {
    return this.blocksPerRow;
  }

  draw() {
    for(let i = 0; i<(this.blocksPerRow); i++){
      line(0, this.bhei*i, WINDOW_LENGTH, this.bhei*i);
      line(this.blen * i, 0 , this.blen*i, WINDOW_LENGTH);
    }
  }
}


function setup() {
  createCanvas(WINDOW_LENGTH, WINDOW_LENGTH);
  g = new Grid(20);
  bodys.push(new Body(null, null));

  for (let i = 0; i < FOOD_AMOUNT; i++) {
    food.push(new Food());
  }
}

function draw() {
  frameRate(4);
  background(220);

  // g.draw();

  for (let i = 0; i < bodys.length; i++) { // move loop
    bodys[i].move();
  }
  
  for (let i = 0; i < bodys.length; i++) { // draw loop
    fill(color(255, 255, 255));
    bodys[i].draw();
  }
  for (let i = 0; i < food.length; i++) {
    fill(color(255, 0, 0));
    food[i].draw();
  }

}
