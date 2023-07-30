const canvas = document.querySelector("canvas")
const c = canvas.getContext('2d')

canvas.height = 576
canvas.width = 1024

c.fillRect(0, 0, canvas.width, canvas.height)

const gameSettings = {
  height: 512,
  gravity: 1.0,
  birdJump: 7,
  gapHeight: 300,
  control: true,
  numberOfBarriers: 2,
  barrierWidth: 100,
  barrierSpeed: 5,
  isRestartable: false,
  isLaunchable: true,
  reset: () => {
    gameSettings.gameOver = false,
    gameSettings.isRestartable = false,
    gameSettings.isLaunchable = true
  },
  setMode: (mode) => {
    if (mode === 'easy') {
      gameSettings.gapHeight = 300
      gameSettings.numberOfBarriers = 2
      gameSettings.barrierSpeed = 5
      gameSettings.birdJump = 7
      gameSettings.gravity = 1.0
    } else if (mode === 'normal') {
      gameSettings.gapHeight = 250
      gameSettings.numberOfBarriers = 3
      gameSettings.barrierSpeed = 6
      gameSettings.birdJump = 7
      gameSettings.gravity = 1.0
    } else if (mode === 'hard') {
      gameSettings.gapHeight = 200
      gameSettings.numberOfBarriers = 3
      gameSettings.barrierSpeed = 8
      gameSettings.birdJump = 10
      gameSettings.gravity = 1.5
    }
    console.log("Game mode is changed to", mode)
  }
}

const Bird = {
  height: 70,
  width: 70,
  color: 'red',
  score: 0,
  image: new Image(),
  scale: 1.0,
  currentFrame: 0,
  updatedFrame: 0,
  repeatedFrame: 5,
  maxFrame: 3,
  position: {
    x: 100,
    y: 250
  },
  velocity: {
    x: 0,
    y: 0
  },
  isTop: () => {
    return Bird.position.y <= 0 ? true : false
  },
  draw: () => {
    Bird.image.src = "./assets/game_objects/bird_wings.png"
    c.drawImage(
      Bird.image,
      (Bird.image.width / Bird.maxFrame) * Bird.currentFrame,
      0,
      Bird.image.width / Bird.maxFrame,
      Bird.image.height,
      Bird.position.x,
      Bird.position.y,
      Bird.width * Bird.scale,
      Bird.height * Bird.scale
    )
  },
  update: () => {
    Bird.position.x += Bird.velocity.x
    Bird.position.y += Bird.velocity.y

    // Adding wing animation
    Bird.updatedFrame++
    if (Bird.updatedFrame / Bird.repeatedFrame >= 1) {
      if (Bird.currentFrame < Bird.maxFrame-1) {
        Bird.currentFrame++
      } else {
        Bird.currentFrame = 0
      }
      Bird.updatedFrame = 0
    }

    // Checking the borders & setting gravity
    if(Bird.position.y+Bird.height+Bird.velocity.y >= gameSettings.height) {
      Bird.velocity.y = 0
    } else if (Bird.position.y+Bird.velocity.y <= 0) {
      Bird.velocity.y = 0
      Bird.velocity.y += gameSettings.gravity
    } else {
      Bird.velocity.y += gameSettings.gravity
    }
  },
  jump: () => {
    if (!gameSettings.control) return
    if(!Bird.isTop()){
      Bird.velocity.y = -gameSettings.birdJump
    }
  },
  box: (position) => {
    let offset = {top: 0, bottom: 0, right: 0, left: 0}
    let leftSide = position.x
    let rightSide = position.x + gameSettings.barrierWidth
    if (
      (leftSide >= 100 && leftSide <= 170) ||
      (rightSide >= 100 && rightSide <= 170)
    ) {
      if (leftSide <= 104 || rightSide <= 104) {
        offset.top = 22
        offset.bottom = -28
      } else if (leftSide <= 108 || rightSide <= 108) {
        offset.top = 16
        offset.bottom = -22
      } else if (leftSide <= 112 || rightSide <= 112) {
        offset.top = 16
        offset.bottom = -10
      } else if (leftSide <= 116 || rightSide <= 116) {
        offset.top = 10
        offset.bottom = -5
      } else if (leftSide <= 120 || rightSide <= 120) {
        offset.top = 4
        offset.bottom = -5
      } else if (leftSide <= 124 || rightSide <= 124) {
        offset.top = 4
        offset.bottom = 0
      } else if (leftSide <= 142 || rightSide <= 142) {
        offset.top = 0
        offset.bottom = 0
      } else if (leftSide <= 150 || rightSide <= 150) {
        offset.top = 0
        offset.bottom = -5
      } else if (leftSide <= 154 || rightSide <= 154) {
        offset.top = 4
        offset.bottom = -5
      } else if (leftSide <= 158 || rightSide <= 158) {
        offset.top = 10
        offset.bottom = -5
      } else if (leftSide <= 162 || rightSide <= 162) {
        offset.top = 16
        offset.bottom = -5
      } else if (leftSide <= 166 || rightSide <= 166) {
        offset.top = 36
        offset.bottom = -10
      } else if (leftSide <= 170 || rightSide <= 170) {
        offset.top = 40
        offset.bottom = -24
      }
    } 
    return {
      top: Bird.position.y + offset.top,
      bottom: Bird.position.y + Bird.height + offset.bottom,
      right: Bird.position.x + Bird.width + offset.right,
      left: Bird.position.x + offset.left
    }
  },
  setScore: () => {
    Bird.score++
    document.querySelector("#score").innerHTML = Bird.score
  },
  reset: () => {
    Bird.position = {
      x: 100,
      y: 250
    },
    Bird.velocity = {
      x: 0,
      y: 0
    }
    Bird.color = 'red'
    Bird.score = 0
    document.querySelector("#score").innerHTML = Bird.score
  }
}

class Barrier {
  constructor (position, id, hasChecked, isClosest) {
    this.position = position
    this.id = id
    this.height = gameSettings.gapHeight
    this.width = gameSettings.barrierWidth
    this.hasChecked = hasChecked
    this.isClosest = isClosest
    this.image = {
      top: new Image(),
      bottom: new Image()
    }
    this.image.top.src = './assets/game_objects/pipe_top.png'
    this.image.bottom.src = './assets/game_objects/pipe_bottom.png'
    this.velocity = {
      x: -gameSettings.barrierSpeed,
      y: 0
    }
  }
  draw () {
    c.drawImage(
      this.image.top,
      this.position.x,
      this.position.y-this.image.top.height,
      this.width,
      this.image.top.height
    )
    c.drawImage(
      this.image.bottom,
      this.position.x,
      this.position.y+this.height,
      this.width,
      this.image.bottom.height
    )
  }
  update () {
    this.position.x += this.velocity.x

    if(this.position.x+this.velocity.x <= -(this.width)){
      this.hasChecked = false
      this.position.x = canvas.width
      this.position.y = Math.floor(Math.random()*(gameSettings.height-40-this.height+1))+20
    }
  }
  box () {
    return {
      left: this.position.x,
      right: this.position.x + this.width,
      top: this.position.y,
      bottom: this.position.y + this.height
    }
  }
}

class Sprite {
  constructor (position, velocity = {x: 0, y: 0}, imageSource, repeat = false){
    this.defaultPosition = {...position}
    this.position = position
    this.velocity = velocity
    this.image = new Image()
    this.image.src = imageSource
    this.repeat = repeat
  }
  draw () {
    let ratio = 0
    if (this.repeat) {
      ratio = Math.floor(canvas.width / this.image.width) + 1
    }
    for (let i = 0; i <= (ratio + 1); i++) {
      c.drawImage (
        this.image,
        this.position.x + (this.image.width * i),
        this.position.y,
      )
    }
  }
  update () {
    this.position.x -= this.velocity.x
    this.position.y -= this.velocity.y

    if (this.defaultPosition.x - this.position.x >= this.image.width) {
      this.reset()
    }

    if (this.defaultPosition.y - this.position.y >= this.image.height) {
      this.reset()
    }

    this.draw ()
  }
  reset () {
    this.position = {...this.defaultPosition}
  }
}

const background = new Sprite(
  {x: 0, y: 0},
  {x: 1, y: 0},
  './assets/game_objects/background.jpg',
  true
)

const floor = new Sprite(
  {x: 0, y: gameSettings.height},
  {x: 2, y: 0},
  './assets/game_objects/base.png',
  true
)

const keys = {
  ArrowUp : {
    pressed : false
  },
  Space : {
    pressed : false
  }
}

document.onkeydown = document.onkeyup = (event) => {
  if(event.key == "ArrowUp"){
    keys.ArrowUp.pressed = event.type == 'keydown' ? true : false
  } else if (event.key == " ") {
    keys.Space.pressed = event.type == 'keydown' ? true : false
  }
}

let listOfBarriers = []

function createBarrier(num){
  let startPosition = canvas.width
  const gap = (canvas.width+gameSettings.barrierWidth) / num
  for (let i=0; i<num; i++){
    let randomNum = Math.floor(Math.random()*(gameSettings.height-40-gameSettings.gapHeight+1))+20
    listOfBarriers.push(new Barrier(
      {x: startPosition, y: randomNum},
      i,
      false,
      i == 0 ? true : false
    ))
    startPosition += gap
  }
}

function animate() {

  // Changing velocity based on key state
  if (keys.ArrowUp.pressed || keys.Space.pressed){
    Bird.jump()
  }

  // Adding Background
  background.update()

  // Adding Barriers
  listOfBarriers.forEach((each) => {
    each.update()
    each.draw()
  })

  // Adding Floor
  floor.update()

  // Updating and drawing Bird
  Bird.update()
  Bird.draw()

  // Check any collision
  let checkCollision = true
  listOfBarriers.forEach((each) => {
    if (!each.hasChecked && checkCollision && each.isClosest) {
      let box = Bird.box(each.position)
      if (
        box.right >= each.box().left &&
        (box.bottom >= each.box().bottom || box.top <= each.box().top) &&
        box.left <= each.box().right
      ) {
        Bird.color = 'blue'
        gameSettings.gameOver = true
        gameSettings.isRestartable = true
        checkCollision = false
        Bird.velocity.x = each.velocity.x
        gameOver(Bird.score)
      } else if (
        box.left > each.box().right
      ) {
        each.hasChecked = true
        each.isClosest = false
        if (each.id == listOfBarriers.length-1) {
          listOfBarriers[0].isClosest = true
        } else {
          listOfBarriers[each.id+1].isClosest = true
        }
        Bird.setScore()
      }
    }
  })

  // Requesting an animation frame
  if(!gameSettings.gameOver) { window.requestAnimationFrame(animate) }
}

// Menu & ~buttons
const gameWrapper = document.querySelector("#wrapper")
const startBtn = document.querySelector("#start")
const menuOptionsBtn = document.querySelector("#menuOptions")
const endMenuOptionsBtn = document.querySelector("#endMenuOptions")

// Options
const optionsBox = document.querySelector("#optionsBox")
menuOptionsBtn.onclick = endMenuOptionsBtn.onclick = () => {
  optionsBox.style.display = 'flex'
}
let modes = Array.from(optionsBox.children)
modes.forEach((each) => {
  each.addEventListener("click", () => {
    let smthChanged = false
    switch (each.id) {
      case 'easy':
        gameSettings.setMode("easy")
        optionsBox.style.display = 'none'
        smthChanged = true
        break
      case 'normal':
        gameSettings.setMode("normal")
        optionsBox.style.display = 'none'
        smthChanged = true
        break
      case 'hard':
        gameSettings.setMode("hard")
        optionsBox.style.display = 'none'
        smthChanged = true
        break
      case 'back':
        optionsBox.style.display = 'none'
        break
    }
    if (gameSettings.gameOver && smthChanged) {
      restartGame()
    }
  })
})

// Launch game button
const startGame = document.querySelector("#startGame")
const scoreTable = document.querySelector("#scoreTable")

// Move to gameboard
startBtn.addEventListener("click", () => {
  gameWrapper.style.display = 'none'
  startGame.style.display = 'flex'
  background.update()
  floor.update()
})

// Launch game
startGame.addEventListener("click", launchGame)

function launchGame() {
  if (gameSettings.isLaunchable) {
    startGame.style.display = 'none'
    scoreTable.style.translate = '0% 0%'
    gameSettings.isLaunchable = false
    createBarrier(gameSettings.numberOfBarriers)
    animate()
  }
}

// Game Over Page & ~buttons
const gameOverPage = document.querySelector("#gameOverPage")
const gameOverText = document.querySelector("#gameOverText")
const gameOverScore = document.querySelector("#gameOverScore")
const restartBtn = document.querySelector("#restart")

// Game Over state
function gameOver(score) {
  gameOverScore.innerHTML = ""
  gameOverPage.style.display = 'flex'
  scoreTable.style.translate = '100% 0%'
  gameOverText.innerHTML = 'Game Over! Your score:'
  let scoreArray = score.toString().split("")
  scoreArray.forEach((each) => {
    const num = document.createElement("img")
    num.setAttribute("src", `./assets/numbers/${each}.png`)
    gameOverScore.appendChild(num)
  })
}

// Restart & Launch Game functionality
document.addEventListener("keydown", (event) => {
  if ((event.key == "r") && gameSettings.gameOver) {
    restartGame()
  } else if ((event.key == "o") && gameSettings.gameOver) {
    optionsBox.style.display = 'flex'
  } else if (startGame.style.display == 'flex') {
    launchGame()
  }
})

restartBtn.addEventListener("click", restartGame)

function restartGame () {
  if (gameSettings.isRestartable) {
    console.log("Game restarted")
    Bird.reset()
    gameSettings.reset()
    listOfBarriers = []
    gameOverPage.style.display = 'none'
    startGame.style.display = 'flex'
    background.update()
    floor.update()
    Bird.draw()
  }
}