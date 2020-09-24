let WINDOW_LENGTH = 800;
const FOOD_AMOUNT = 1;
let gridCB;
let g;
let frameRateSlider;
let bodys = [];
let food = [];
let running = 1;
let gamemodeCB; // 1 = endless, 0 = death on touch

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
      this.heading = createVector(prev.oldHeading.x, prev.oldHeading.y);
      this.position = this.prev.oldPosition;
    } else {
      this.position = g.getMiddle();
    }
    bodys.push(this);
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

  collisionWithBody() {
    for (let i = 1; i < bodys.length; i++) {
      if (this.position.x === bodys[i].position.x && this.position.y === bodys[i].position.y) {
        this.collision_index = i;
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
    }
    if (this.position.x < 1) this.position.x = g.getBlocksPerRow();
    if (this.position.x > g.getBlocksPerRow()) this.position.x = 1;
    if (this.position.y > -1) this.position.y = - g.getBlocksPerRow();
    if (this.position.y < - g.getBlocksPerRow()) this.position.y = -1;

    this.oldPosition = createVector(this.position.x - this.heading.x, this.position.y - this.heading.y);

    if (this.prev == null) {
      // collision check
      if (this.collisionWithFood()) {
        let zw = this;
        while (zw.next != null) {
          zw = zw.next;
        }
        let neu = new Body(null, zw);
        zw.setNext(neu);
        food.splice(this.food_index, 1);
        food.push(new Food());
      }
    }
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
    this.blen = WINDOW_LENGTH / this.blocksPerRow;
    this.bhei = WINDOW_LENGTH / this.blocksPerRow;
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
  WINDOW_LENGTH = (windowWidth > windowHeight ? windowHeight : windowWidth) - 50;

  createCanvas(WINDOW_LENGTH, WINDOW_LENGTH);
  g = new Grid(20);
  new Body(null, null);

  for (let i = 0; i < FOOD_AMOUNT; i++) {
    food.push(new Food());
  }

  frameRateSlider = createSlider(1, 100, 4, 1);
  gridCB = createCheckbox("Raster", false);
  gamemodeCB = createCheckbox("Endless mode", false);
}

function draw() {
  
  frameRate(frameRateSlider.value());
  if (running === 0) noLoop();
  background(220);

  if (gridCB.checked()) g.draw();

  for (let i = 0; i < bodys.length; i++) { // move loop
    bodys[i].move();
  }

  if (bodys[0].collisionWithBody()) {
    if (!gamemodeCB.checked()) {
      running = 0;
    } else {
      let spliced = bodys.splice(bodys[0].collision_index);
      for (let e in spliced) {
        e = null;
      }
      bodys[bodys.length - 1].next = null;
    }
  }
  for (let i = bodys.length - 1; i >= 0; i--) { // draw loop (back to front)
    if (running === 1) {
      if (i == 0) {
        fill(color(0, 255, 0)); // Head green
      } else {
        fill(color(255, 255, 255));
      }
      bodys[i].draw();
    } else { // ded
      fill(color(0, 0, 0));
      bodys[i].draw();
    }
  }
  for (let i = 0; i < food.length; i++) {
    fill(color(255, 0, 0));
    food[i].draw();
  }

  textSize(40);
  text("FrameRate: " + frameRateSlider.value(), WINDOW_LENGTH / 2, - (WINDOW_LENGTH / 2));

}
