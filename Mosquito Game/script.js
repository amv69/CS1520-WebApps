// USERNAME:
// FULL NAME:

// this makes the browser catch a LOT more runtime errors. leave it here!
"use strict";

// arr.removeItem(obj) finds and removes obj from arr.
Array.prototype.removeItem = function (item) {
    let i = this.indexOf(item);

    if (i > -1) {
        this.splice(i, 1);
        return true;
    }

    return false;
}

// gets a random int in the range [min, max) (lower bound inclusive, upper bound exclusive)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// ------------------------------------------------------------------------------------
// Add your code below!
// ------------------------------------------------------------------------------------

// constants for you.
const IMG_W = 120; // width of the mosquito image
const IMG_H = 88; // height of the mosquito image
const SCREEN_W = 640; // width of the playfield area
const SCREEN_H = 480; // height of the playfield area

// global variables. add more here as you need them.
let gameMessage
let round
let mosquitoesLeft
let misses
let score
let mosquitoArray = []
let playfield

window.onload = function () {
    // here is where you put setup code.

    // this way, we can write gameMessage.innerHTML or whatever in your code.
    gameMessage = document.getElementById('gameMessage')
    round = document.getElementById('roundDisplay')
    mosquitoesLeft = document.getElementById('mosquitoDisplay')
    misses = document.getElementById('missesDisplay')
    score = document.getElementById('scoreDisplay')
    gameMessage.onclick = function () {
        gameMessage.style.display = "none"; //Hides the text
        round.innerHTML = 0
        mosquitoesLeft.innerHTML = 10
        misses.innerHTML = 0
        score.innerHTML = 0
        startGame()
        startSpawning()
    }


};

function startGame() {
    requestAnimationFrame(gameLoop)
}

function gameLoop() {

    mosquitoArray.forEach(function (m) {
        m.update()
    })


    // 2. update the score/misses/etc. displays
    // 3. check if the user won or lost

    // this is sort of the "loop condition."
    // we call requestAnimationFrame again with gameLoop.
    // this isn't recursive; the browser will call us again
    // at some future point in time.
    if (misses.innerHTML != 5 && mosquitoesLeft != 0) {
        requestAnimationFrame(gameLoop)
    }
}

function startSpawning() {
    // 1000 ms (1 second) from now, spawnMosquito() will be called.
    window.setTimeout(spawnMosquito, 1000)
}

function spawnMosquito() {
    let [x, y, vx, vy] = pickPointAndVector()

    console.log("spawning a mosquito at " + x + ", " + y + " (remove this log statement)")

    mosquitoArray.push(new Mosquito(x, y, vx, vy))

    if (true) {
        //spawn another one a second from now
        window.setTimeout(spawnMosquito, 1000)
    }
}
// given a side (0, 1, 2, 3 = T, R, B, L), returns a 2-item array containing the x and y
// coordinates of a point off the edge of the screen on that side.
function randomPointOnSide(side) {
    switch (side) {
        /* top    */
        case 0:
            return [getRandomInt(0, SCREEN_W - IMG_W), -IMG_H];
            /* right  */
        case 1:
            return [SCREEN_W, getRandomInt(0, SCREEN_H - IMG_H)];
            /* bottom */
        case 2:
            return [getRandomInt(0, SCREEN_W - IMG_W), SCREEN_H];
            /* left   */
        case 3:
            return [-IMG_W, getRandomInt(0, SCREEN_H - IMG_H)];
    }
}

// returns a 4-item array containing the x, y, x direction, and y direction of a mosquito.
// use it like:
// let [x, y, vx, vy] = pickPointAndVector()
// then you can multiply vx and vy by some number to change the speed.
function pickPointAndVector() {
    let side = getRandomInt(0, 4); // pick a side...
    let [x, y] = randomPointOnSide(side); // pick where to place it...
    let [tx, ty] = randomPointOnSide((side + 2) % 4); // pick a point on the opposite side...
    let [dx, dy] = [tx - x, ty - y]; // find the vector to that other point...
    let mag = Math.hypot(dx, dy); // and normalize it.
    let [vx, vy] = [(dx / mag), (dy / mag)];
    return [x, y, vx, vy];
}

function Mosquito(x, y, vx, vy) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    

    let graphic = document.createElement('img')
    graphic.src = 'mosquito.png'
    let playfield = document.getElementById('playfield')
    playfield.appendChild(graphic)
    graphic.style.position = 'absolute'
    graphic.style.left = x + 'px'
    graphic.style.top = y + 'px'

    graphic.onmousedown = function (event) {
        if (event.button === 0) {
            event.target.style.display = "none"
            graphic.parentNode.removeChild(graphic)
            score.innerHTML += 100
            event.stopPropagation()
        }
        
    }
}
Mosquito.prototype.update = function(){
    console.log(this.x)
        this.x += this.vx * 2;
        this.y += this.vy * 2;
        this.graphic.style.left = x + 'px'
        this.graphic.style.top = y + 'px'
}
