Player = Entity.extend({
    id: 0,
    velocity: 2,
    invincible: false,
    invincibleTimer: 0,
    position: {},
    size: {
        w: 48,
        h: 48
    },
    playerNum: 0,
    bmp: null,
    alive: true,
    controls: {
        'up': 'up',
        'left': 'left',
        'down': 'down',
        'right': 'right'
    },
    deadTimer: 0,

    init: function(position, controls, id) {

        if (id) {
            this.id = id;
        }
         
        this.playerNum = gGameEngine.playerNum;
        if (controls) {
            this.controls = controls;
        }

        var img = gGameEngine.playerBoyImg;
        if (!(this instanceof Bot)) {
            if (this.id == 0) {
                img = gGameEngine.playerGirlImg;
            } else {
                img = gGameEngine.playerGirl2Img;
            }
        }

        var spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 10, regY: 12 },
            animations: {
                idle: [0, 0, 'idle'],
                down: [0, 3, 'down', 0.1],
                left: [4, 7, 'left', 0.1],
                up: [8, 11, 'up', 0.1],
                right: [12, 15, 'right', 0.1],
                dead: [16, 16, 'dead', 0.1]
            }
        });
        this.bmp = new createjs.Sprite(spriteSheet);

        this.position = position;
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);
    },

    update: function() {
        if (!this.alive) {
            return;
        }
        if (gGameEngine.menu.visible) {
            return;
        }
        var playerGlowDiv = document.getElementById('player-glow');
        var position = { x: this.bmp.x, y: this.bmp.y };

        var dirX = 0;
        var dirY = 0;
        if (gInputEngine.actions[this.controls.up]) {
            this.animate('up');
            position.y -= this.velocity;
            dirY = -1;
        } else if (gInputEngine.actions[this.controls.down]) {
            this.animate('down');
            position.y += this.velocity;
            dirY = 1;
        } else if (gInputEngine.actions[this.controls.left]) {
            this.animate('left');
            position.x -= this.velocity;
            dirX = -1;
        } else if (gInputEngine.actions[this.controls.right]) {
            this.animate('right');
            position.x += this.velocity;
            dirX = 1;
        } else {
            this.animate('idle');
        }

        if (position.x != this.bmp.x || position.y != this.bmp.y) {
                if (this.detectWallCollision(position)) {
                    var cornerFix = this.getCornerFix(dirX, dirY);
                    if (cornerFix) {
                        var fixX = 0;
                        var fixY = 0;
                        if (dirX) {
                            fixY = (cornerFix.y - this.bmp.y) > 0 ? 1 : -1;
                        } else {
                            fixX = (cornerFix.x - this.bmp.x) > 0 ? 1 : -1;
                        }
                        this.bmp.x += fixX * this.velocity;
                        this.bmp.y += fixY * this.velocity;
                        this.updatePosition();
                    }
                } else {
                    this.bmp.x = position.x;
                    this.bmp.y = position.y;
                    this.updatePosition();
                }
        }

        if (this.invincible) {
            this.invincibleTimer--;
            if (Math.floor(this.invincibleTimer / 10) % 2 === 0) {
                this.bmp.alpha = 0.5;
                playerGlowDiv.style.display = 'block';
                playerGlowDiv.style.left = this.bmp.x + 'px';
                playerGlowDiv.style.top = this.bmp.y + 'px';
            } else {
                this.bmp.alpha = 1;
            }
    
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.invincibleTimer = 0;
                playerGlowDiv.style.display = 'none';
                this.bmp.alpha = 1;
            }
        } else {
            this.bmp.alpha = 1;
        }
    
    if (this.detectBotCollision()) {
        if (this.invincible) {
            this.killCollidingBots();
        } else {
            this.die();
        }
    }

    this.handleBonusCollision();
    },

    killCollidingBots: function() {
        var bots = gGameEngine.bots;
        var playerBox = {
            left: this.bmp.x,
            top: this.bmp.y,
            right: this.bmp.x + this.size.w,
            bottom: this.bmp.y + this.size.h
        };
    
        for (var i = bots.length - 1; i >= 0; i--) {
            var bot = bots[i];
            var botBox = {
                left: bot.bmp.x + 30,
                top: bot.bmp.y + 30,
                right: bot.bmp.x + bot.size.w - 30,
                bottom: bot.bmp.y + bot.size.h - 30
            };
    
            if (gGameEngine.intersectRect(playerBox, botBox)) {
                bot.die();
                this.removeBot(bot);
            }
        }
    },
    
    getCornerFix: function(dirX, dirY) {
        var edgeSize = 30;
        var position = {};

        var pos1 = { x: this.position.x + dirY, y: this.position.y + dirX };
        var bmp1 = Utils.convertToBitmapPosition(pos1);

        var pos2 = { x: this.position.x - dirY, y: this.position.y - dirX };
        var bmp2 = Utils.convertToBitmapPosition(pos2);

        if (gGameEngine.getTileMaterial({ x: this.position.x + dirX, y: this.position.y + dirY }) == 'grass') {
            position = this.position;
        }
        else if (gGameEngine.getTileMaterial(pos1) == 'grass'
            && Math.abs(this.bmp.y - bmp1.y) < edgeSize && Math.abs(this.bmp.x - bmp1.x) < edgeSize) {
            if (gGameEngine.getTileMaterial({ x: pos1.x + dirX, y: pos1.y + dirY }) == 'grass') {
                position = pos1;
            }
        }
        else if (gGameEngine.getTileMaterial(pos2) == 'grass'
            && Math.abs(this.bmp.y - bmp2.y) < edgeSize && Math.abs(this.bmp.x - bmp2.x) < edgeSize) {
            if (gGameEngine.getTileMaterial({ x: pos2.x + dirX, y: pos2.y + dirY }) == 'grass') {
                position = pos2;
            }
        }

        if (position.x &&  gGameEngine.getTileMaterial(position) == 'grass') {
            return Utils.convertToBitmapPosition(position);
        }
    },

    updatePosition: function() {
        this.position = Utils.convertToEntityPosition(this.bmp);
    },

    detectWallCollision: function(position) {
        var player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + this.size.w;
        player.bottom = player.top + this.size.h;

        var tiles = gGameEngine.tiles;
        for (var i = 0; i < tiles.length; i++) {
            var tilePosition = tiles[i].position;

            var tile = {};
            tile.left = tilePosition.x * gGameEngine.tileSize + 25;
            tile.top = tilePosition.y * gGameEngine.tileSize + 20;
            tile.right = tile.left + gGameEngine.tileSize - 30;
            tile.bottom = tile.top + gGameEngine.tileSize - 30;

            if(gGameEngine.intersectRect(player, tile)) {
                return true;
            }
            if (!this.invincible && !this.alive) {
                if (this.invincibleTimer === 0 && this.alive) {
                }
            }
            
        }
        return false;
    },

    detectBotCollision: function() {
        var bots = gGameEngine.bots;
    
        for (var i = 0; i < bots.length; i++) {
            var bot = bots[i];
    
            var playerBox = {
                left: this.bmp.x,
                top: this.bmp.y,
                right: this.bmp.x + this.size.w,
                bottom: this.bmp.y + this.size.h
            };
    
            var botBox = {
                left: bot.bmp.x + 30,
                top: bot.bmp.y + 30,
                right: bot.bmp.x + bot.size.w - 30,
                bottom: bot.bmp.y + bot.size.h - 30
            };
    
            if (this.invincible) {
                this.killCollidingBots();
                return false;
            }
    
            if (gGameEngine.intersectRect(playerBox, botBox)) {
                console.log('Bot collision detected, player is not invincible.');
                return true;
            }
        }
    
        return false;
    },
    
    removeBot: function(bot) {
        console.log("Removing bot:", bot);
        var index = gGameEngine.bots.indexOf(bot);
        if (index > -1) {
            console.log("Bot removed:", bot);
            gGameEngine.bots.splice(index, 1);
        }
        if (bot.botbox) {
            this.removeBotbox(bot.botbox);
        }
    },
    
    removeBotbox: function(botbox) {
        console.log("Removing botbox:", botbox);
        var index = gGameEngine.botboxes.indexOf(botbox);
        if (index > -1) {
            console.log("Botbox removed:", botbox);
            gGameEngine.botboxes.splice(index, 1);
        }
    },
    
    handleBonusCollision: function() {
        if (this instanceof Bot) {
            return;
        }
        for (var i = 0; i < gGameEngine.bonuses.length; i++) {
            var bonus = gGameEngine.bonuses[i];
            if (Utils.comparePositions(bonus.position, this.position)) {
                this.applyBonus(bonus);
                bonus.destroy();
            }
        }

        for (var i = 0; i < gGameEngine.bitcoins.length; i++) {
            var bitcoin = gGameEngine.bitcoins[i];
            if (Utils.comparePositions(bitcoin.position, this.position)) {
                this.applyBonus(bitcoin);
                bitcoin.destroy();
            }
        }
    },

    applyBonus: function(bonus) {
        if (bonus.type == 'speed') {
            if (!createjs.Sound.play("rr")) {
                var rrSound = createjs.Sound.play("rr");
                rrSound.setVolume(0.5);
            }
            this.velocity += 0.8;
        } else if (bonus.type == 'sixs') {
            if (gGameEngine.gameSoundInstance) {
                gGameEngine.gameSoundInstance.muted = true;
                setTimeout(function() {
                    gGameEngine.gameSoundInstance.muted = false;
                }, 19000);
            }
            if (!createjs.Sound.play("sixs")) {
                var sixsSound = createjs.Sound.play("sixs");
                sixsSound.setVolume(0.5);
            }
            this.invincible = true;
            this.invincibleTimer = 1080;
            this.bmp.alpha = 0.2;
        } else if (bonus.type == 'bitcoin') {console.log(this.playerNum);
           if(this.playerNum == 1){
            gGameEngine.totalSats += config.BITCOIN_VALUE;
            document.getElementById('satsLabel').innerHTML = gGameEngine.totalSats+" sats";
            gGameEngine.collectedBitcoins++;
           }
        }
    },

    animate: function(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    },

    die: function() {
        if (this.invincible) {
            return;
        }
        this.alive = false;
    
        if (!(this instanceof Bot)) { 
            gGameEngine.totalSats = 0;
            gGameEngine.collectedBitcoins = 0;
            document.getElementById('satsLabel').innerHTML = gGameEngine.totalSats + " sats";
        }
    
        if (gGameEngine.countPlayersAlive() == 1 && gGameEngine.playersCount == 2) {
            gGameEngine.gameOver('win');
        } else if (gGameEngine.countPlayersAlive() == 0) {
            gGameEngine.gameOver('lose');
        }
    
        this.bmp.gotoAndPlay('dead');
        this.fade();
    },    

    fade: function() {
        var timer = 0;
        var bmp = this.bmp;
        var fade = setInterval(function() {
            timer++;

            if (timer > 30) {
                bmp.alpha -= 0.05;
            }
            if (bmp.alpha <= 0) {
                clearInterval(fade);
            }

        }, 30);
    }
});