const pageConstants = {
    // HTML element ids
    _elements: {
        enemyScore: 'enemy-score',
        playerScore: 'player-score',
        resultBoard: 'announcement'
    },
    // graphic elements config
    gEConfig: {
        player: {
            distanceX: 101,
            distanceY: 49,
            startX: 0, //maximum distance right
            endX: 405,
            startY: -30,
            endY: 435,
            height: 50,
            width: 40,
            finishLine: -6,
            avatar: 'images/char-boy.png'
        },
        enemy: {
            speedLow: 10,
            speedLevel: 30,
            totalEnemies: 3,
            distanceBetweenEnemey: 80,
            startX: -80,
            StartY: 120,
            endX: 500,
            width: 80,
            height: 60,
            avatar: 'images/enemy-bug.png'
        }
    },
    _touchLineScore: 3,
    congrats: "Hail Developer !",
    criticize: "You are Fired !"
};

/**
 * @description player Object, Manages player properties and acitivities
 */
let player = {
    sprite: pageConstants.gEConfig.player.avatar,
    // player initial location
    x: pageConstants.gEConfig.player.endX,
    y: pageConstants.gEConfig.player.endY,
    // player wid & hig
    width: pageConstants.gEConfig.player.width,
    height: pageConstants.gEConfig.player.height,
    /**
     * @description used to draw the player in the canvas context
     */
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.strokeRect(100, 100, 250, 100);
    },
    /**
     * @description moves the player position based onthe direction string
     * @param  {String} inputKey key stoke matched from Number to String
     */
    handleInput(inputKey) {
        if (inputKey == 'left') {
            if ((this.x - pageConstants.gEConfig.player.distanceX) > pageConstants.gEConfig.player.startX)
                this.x = this.x - pageConstants.gEConfig.player.distanceX;

        } else if (inputKey == 'up') {
            if ((this.y - pageConstants.gEConfig.player.distanceY) > pageConstants.gEConfig.player.startY)
                this.y = this.y - pageConstants.gEConfig.player.distanceY;
        } else if (inputKey == 'right') {
            if ((this.x + pageConstants.gEConfig.player.distanceX) <= pageConstants.gEConfig.player.endX)
                this.x = this.x + pageConstants.gEConfig.player.distanceX;
        } else if (inputKey == 'down') {
            if (this.y + pageConstants.gEConfig.player.distanceY <= pageConstants.gEConfig.player.endY)
                this.y = this.y + pageConstants.gEConfig.player.distanceY;
        }
        console.log(`X: ${this.x},  Y: ${this.y}`)
    },
    /**
     * @description used to check collustion of enemy and player 
     * @param {Enemy} enemy //Enemy instance
     */
    collustionCheck(enemy) {
        if (enemy.x < this.x + this.width &&
            enemy.x + enemy.width > this.x &&
            enemy.y < this.y + this.height &&
            enemy.height + enemy.y > this.y) {
            // collision detected!
            this.playerReset();
            scoreBoard.updateScore(false);
            return true;
        }
    },
     /**
      * @description checks whethe rthe player crossed the bugs reached touch line
      */
    crossedObstacles() {
        if (this.y <= pageConstants.gEConfig.player.finishLine) {
            this.playerReset();
            scoreBoard.updateScore(true);
        }
    },
    /**
      * @description resets player to starting position, invoked upon collusion or when the player crossed touch line
      */
    playerReset() {
        this.x = pageConstants.gEConfig.player.endX;
        this.y = pageConstants.gEConfig.player.endY;
    }
};

/**
 * @description Enemy Object Constructor
 * @param  {Number} xAxis
 * @param  {Number} yAxis
 * @param  {Number} speed
 */
class Enemy {
    constructor(xAxis, yAxis, speed) {
        this.sprite = pageConstants.gEConfig.enemy.avatar;
        this.x = xAxis;
        this.y = yAxis;
        this.speed = speed;
        this.width = pageConstants.gEConfig.enemy.width;
        this.height = pageConstants.gEConfig.enemy.height;
    }

    /**
     * @description Update the enemy's position
     * @param  {Number} dt a time delta between ticks
     */
    update(dt) {
        if (this.x % 100 == 0) {
            console.log(this.x);
        }

        this.x = (this.x + this.speed * 100 * dt);
        if (this.x > pageConstants.gEConfig.enemy.endX) {
            this.x = pageConstants.gEConfig.enemy.startX;
            this.speed = (Math.floor(Math.random() * pageConstants.gEConfig.enemy.speedLevel) + pageConstants.gEConfig.enemy.speedLow) / 10;
        }

        if (!player.collustionCheck(this)) {
            player.crossedObstacles();
        }
    }

    /**
     * @description Renders Enemy instance in canvas
     */
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

/**
 * @description scoreBoard Object which maintans score board properties and functions
 */
let scoreBoard = {
    playerScore: 0,
    enemyScore: 0,
    /**
     * @param {Boolean} crossed Whether a player crossed the touch line or not
     */
    updateScore(crossed) {
        if (crossed) {
            this.playerScore++;
            this.updateHtml(pageConstants._elements.playerScore, this.playerScore)
        } else {
            this.enemyScore++;
            this.updateHtml(pageConstants._elements.enemyScore, this.enemyScore)
        }
        this.checkWinner();
    },
    /**
     * @param  {Object} elementId DOM Object of either enemy score or player score
     * @param  {String} text Score to be updated
     */
    updateHtml(elementId, text) {
        document.getElementById(elementId).innerText = text;
    },
    checkWinner() {
        if (this.playerScore == pageConstants._touchLineScore || this.enemyScore == pageConstants._touchLineScore) {
            if (this.playerScore == pageConstants._touchLineScore) {
                this.updateHtml(pageConstants._elements.resultBoard, pageConstants.congrats)
            } else {
                this.updateHtml(pageConstants._elements.resultBoard, pageConstants.criticize)
            }
            setTimeout(() => {
                this.updateHtml(pageConstants._elements.resultBoard, "")
            }, 3000)
            this.resetScore();
        }
    },
    resetScore() {
        this.playerScore = 0;
        this.enemyScore = 0;
        this.updateHtml(pageConstants._elements.playerScore, this.playerScore)
        this.updateHtml(pageConstants._elements.enemyScore, this.enemyScore)
    },
}
const allEnemies = []; // Holds all the enemy instances
for (i = 0; i < pageConstants.gEConfig.enemy.totalEnemies; i++) {
    let speed = Math.floor(Math.random() * pageConstants.gEConfig.enemy.speedLevel) + pageConstants.gEConfig.enemy.speedLow;
    let enemy = new Enemy(pageConstants.gEConfig.enemy.startX, (pageConstants.gEConfig.enemy.distanceBetweenEnemey * i) + 60, (speed / 10));
    allEnemies.push(enemy);
}
// Keyboard input lisnters
document.addEventListener('keyup', e => {
    const allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});