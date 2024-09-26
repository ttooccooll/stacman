GameEngine = Class.extend({
    totalSats: 0,
    tileSize: 32,
    tilesX: 19,
    tilesY: 19,
    size: {},
    fps: 60,
    botsCount: 9,
    playersCount: 2,
    bonusesPercent: 40,
    playerNum:0,
    stage: null,
    menu: null,
    players: [],
    bots: [],
    tiles: [],
    bonuses: [],

    playerBoyImg: null,
    playerGirlImg: null,
    playerGirl2Img: null,
    tilesImgs: {},
    bitcoinImg: null,
    bonusesImg: null,

    totalBitcoins: 178,
    collectedBitcoins: 0,

    playing: false,
    soundtrackLoaded: false,
    soundtrackPlaying: false,
    soundtrack: null,

    init: function() {
        this.size = {
            w: this.tileSize * this.tilesX,
            h: this.tileSize * this.tilesY,
        };
    },

    load: function() {
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();

        var queue = new createjs.LoadQueue();
        var that = this;
        queue.addEventListener("complete", function() {
            that.playerBoyImg = queue.getResult("playerBoy");
            that.playerGirlImg = queue.getResult("playerGirl");
            that.playerGirl2Img = queue.getResult("playerGirl2");
            that.tilesImgs.grass = queue.getResult("tile_grass");
            that.tilesImgs.wall = queue.getResult("tile_wall");
            that.tilesImgs.cactus = queue.getResult("tile_cactus");
            that.tilesImgs.cactus2 = queue.getResult("tile_cactus2");
            that.tilesImgs.cactus3 = queue.getResult("tile_cactus3");
            that.bitcoinImg = queue.getResult("bitcoin");
            that.bonusesImg = queue.getResult("bonuses");
            that.setup();
        });
        queue.loadManifest([
            {id: "playerBoy", src: "img/fbi.png"},
            {id: "playerGirl", src: "img/cowboy.png"},
            {id: "playerGirl2", src: "img/darth.png"},
            {id: "tile_grass", src: "img/sand.jpg"},
            {id: "tile_wall", src: "img/crate.jpg"},
            {id: "tile_cactus", src: "img/cactus.png"},
            {id: "tile_cactus2", src: "img/cactus2.png"},
            {id: "tile_cactus3", src: "img/cactus3.png"},
            {id: "bitcoin", src: "img/small_bitcoin.png"},
            {id: "bonuses", src: "img/bonuses.png"}
        ]);

        createjs.Sound.addEventListener("fileload", this.onSoundLoaded);
        createjs.Sound.registerSound("sound/rr.m4a", "rr");
        createjs.Sound.registerSound(url="https://audio.nostr.build/6e1ff3c5cf9d2c4c6b3ae3c4fb21c14c3b2f79fd64958504e9f5f0493e27e88b.mp3", "game");
        createjs.Sound.registerSound("sound/invincible.mp3", "sixs");

        this.menu = new Menu();
    },

    setup: function() {
        if (!gInputEngine.bindings.length) {
            gInputEngine.setup();
        }

        this.tiles = [];
        this.bonuses = [];
        this.bitcoins = [];

        this.drawTiles();
        this.drawBonuses();
        this.spawnBots();
        this.spawnPlayers();

        setTimeout(function() {
            gInputEngine.addListener('restart', function() {
                if (gGameEngine.playersCount == 0) {
                    gGameEngine.menu.setMode('single');
                } else {
                    gGameEngine.menu.hide();
                    gGameEngine.restart();
                }
            });
        }, 200);

        gInputEngine.addListener('escape', function() {
            if (!gGameEngine.menu.visible) {
                gGameEngine.menu.show();
            }
        });

        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.setFPS(this.fps);
        }

        if (!this.playing) {
            this.menu.show();
        }
    },

    onSoundLoaded: function(sound) {
        if (sound.id == 'game') {
            gGameEngine.soundtrackLoaded = true;
                gGameEngine.playSoundtrack();
        }
    },

    playSoundtrack: function() {
        this.gameSoundInstance = createjs.Sound.play("game", {loop: -1});
    },

    update: function() {
        for (var i = 0; i < gGameEngine.players.length; i++) {
            var player = gGameEngine.players[i];
            player.update();
        }

        for (var i = 0; i < gGameEngine.bots.length; i++) {
            var bot = gGameEngine.bots[i];
            bot.update();
        }

        gGameEngine.menu.update();

        if (gGameEngine.collectedBitcoins >= gGameEngine.totalBitcoins) {
            gGameEngine.gameOver('win');
        }

        gGameEngine.stage.update();
    },

    drawTiles: function() {

        const mazeLayout = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 4, 2, 3, 2, 3, 2, 0, 3, 2, 0, 2, 3, 2, 0, 4, 0, 1],
            [1, 0, 0, 0, 0, 2, 0, 2, 0, 3, 4, 0, 2, 3, 4, 0, 3, 0, 1],
            [1, 0, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 1],
            [1, 0, 2, 0, 0, 2, 3, 2, 0, 3, 2, 0, 2, 3, 0, 2, 4, 0, 1],
            [1, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 4, 2, 2, 0, 1, 1, 1, 0, 1, 0, 3, 2, 2, 3, 0, 1],
            [1, 0, 0, 0, 0, 3, 0, 1, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 1],
            [1, 0, 3, 2, 0, 2, 0, 1, 0, 0, 0, 1, 0, 2, 2, 3, 2, 0, 1],
            [1, 0, 2, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 3, 2, 4, 2, 0, 1, 0, 1, 1, 1, 0, 2, 2, 3, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1],
            [1, 0, 3, 2, 0, 2, 2, 3, 0, 2, 3, 2, 0, 2, 2, 2, 4, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 3, 3, 2, 0, 4, 0, 2, 4, 0, 2, 0, 3, 0, 3, 0, 1],
            [1, 0, 4, 0, 4, 2, 3, 2, 0, 3, 2, 0, 3, 0, 2, 0, 4, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        this.tiles = [];

        for (var i = 0; i < mazeLayout.length; i++) {
            for (var j = 0; j < mazeLayout[i].length; j++) {
                var grassTile = new Tile('grass', { x: j, y: i });
                this.stage.addChild(grassTile.bmp);
                if (mazeLayout[i][j] == 1) {
                    var tile = new Tile('wall', { x: j, y: i });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else if (mazeLayout[i][j] == 0) {
                    var tile = new Tile('wood', { x: j, y: i });
                    this.stage.addChild(tile.bmp);
    
                    // Place bitcoin and bonuses
                    if (!(i <= 1 && j <= 1)
                        && !(i >= this.tilesY - 2 && j >= this.tilesX - 2)) {
                        if (Math.random() < 1) {
                            if (mazeLayout[i][j] === 0) {
                                var bitcoin = new Bitcoin({ x: j, y: i });
                                this.bonuses.push(bitcoin);
                                this.stage.addChild(bitcoin.bmp);
                            }
                        }
                        if (Math.random() < 0.03) {
                            var bonus = new Bonus({ x: j, y: i });
                            this.bonuses.push(bonus);
                            this.stage.addChild(bonus.bmp);
                        }
                    }
                } else if (mazeLayout[i][j] == 2) {
                    // Cactus tiles
                    var tile = new Tile('cactus', { x: j, y: i });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else if (mazeLayout[i][j] == 3) {
                    // Cactus tiles
                    var tile = new Tile('cactus2', { x: j, y: i });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else if (mazeLayout[i][j] == 4) {
                    // Cactus tiles
                    var tile = new Tile('cactus3', { x: j, y: i });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                }
            }
        }
    },

    drawBonuses: function() {
        // Cache woods tiles
        var woods = [];
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (tile.material == 'wood') {
                woods.push(tile);
            }
        }
        // Distribute bonuses to quarters of map precisely fairly
        for (var j = 0; j < 4; j++) {
            var bonusesCount = Math.round(woods.length * this.bonusesPercent * 0.01 / 4);
            var placedCount = 0;
            for (var i = 0; i < woods.length; i++) {
                var tile = woods[i];
                if ((j == 0 && tile.position.x < this.tilesX / 2 && tile.position.y < this.tilesY / 2)
                    || (j == 1 && tile.position.x < this.tilesX / 2 && tile.position.y > this.tilesY / 2)
                    || (j == 2 && tile.position.x > this.tilesX / 2 && tile.position.y < this.tilesX / 2)
                    || (j == 3 && tile.position.x > this.tilesX / 2 && tile.position.y > this.tilesX / 2)) {
                        if (placedCount >= bonusesCount) {
                            break;
                        }
                        if(Math.random() < 0.5){
                        var bitcoin = new Bitcoin(tile.position);
                        this.bonuses.push(bitcoin);
                        this.stage.addChild(bitcoin.bmp);
                    }else{
                        var typePosition = placedCount % 3;
                        var bonus = new Bonus(tile.position, typePosition);
                        this.bonuses.push(bonus);
                        this.stage.addChild(bonus.bmp);
                        placedCount++;
                    }
                }
            }
        }
    },

    spawnBots: function() {
        this.bots = [];

        if (this.botsCount >= 1) {
            var bot2 = new Bot({ x: 8, y: this.tilesY - 9 });
            this.bots.push(bot2);
        }

        if (this.botsCount >= 2) {
            var bot3 = new Bot({ x: this.tilesX - 9, y: 10 });
            this.bots.push(bot3);
        }

        if (this.botsCount >= 3) {
            var bot4 = new Bot({ x: this.tilesX - 9, y: this.tilesY - 10 });
            this.bots.push(bot4);
        }

        if (this.botsCount >= 4) {
            var bot5 = new Bot({ x: this.tilesX - 10, y: this.tilesY - 9 });
            this.bots.push(bot5);
        }

        if (this.botsCount >= 5) {
            var bot6 = new Bot({ x: this.tilesX - 10, y: this.tilesY - 10 });
            this.bots.push(bot6);
        }

        if (this.botsCount >= 6) {
            var bot7 = new Bot({ x: this.tilesX - 11, y: this.tilesY - 10 });
            this.bots.push(bot7);
        }

        if (this.botsCount >= 7) {
            var bot8 = new Bot({ x: this.tilesX - 11, y: this.tilesY - 11 });
            this.bots.push(bot8);
        }

        if (this.botsCount >= 8) {
            var bot9 = new Bot({ x: this.tilesX - 9, y: this.tilesY - 11 });
            this.bots.push(bot9);
        }

        if (this.botsCount >= 9) {
            var bot10 = new Bot({ x: this.tilesX - 10, y: this.tilesY - 11 });
            this.bots.push(bot10);
        }
    },

    spawnPlayers: function() {
        this.players = [];

        if (this.playersCount >= 1) {
            this.playerNum++;
           var player = new Player({ x: 1, y: 1 });
        
            this.players.push(player); 
        }

        if (this.playersCount >= 2) {
            var controls = {
                'up': 'up2',
                'left': 'left2',
                'down': 'down2',
                'right': 'right2'
            };
           var player2 = new Player({ x: this.tilesX - 2, y: this.tilesY - 2 }, controls, 1);
            this.players.push(player2);

            
        }
    },

    /**
     * Checks whether two rectangles intersect.
     */
    intersectRect: function(a, b) {
        return (a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom);
    },

    /**
     * Returns tile at given position.
     */
    getTile: function(position) {
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                return tile;
            }
        }
    },

    /**
     * Returns tile material at given position.
     */
    getTileMaterial: function(position) {
        var tile = this.getTile(position);
        return (tile) ? tile.material : 'grass' ;
    },

    gameOver: function(status) {
        if (gGameEngine.menu.visible) { return; }

        if (status == 'win') {
            var winText = "You won!";
            if (gGameEngine.playersCount > 1) {
                var winner = gGameEngine.getWinner();
                winText = winner == 0 ? "Stacker 1 won!" : "DarthCoin won!";
            }
            this.menu.show([{text: winText, color: '#ddd'}, {text: ' ;D', color: '#ddd'}]);
        } else {
            this.menu.show([{text: 'You lost your cowboy hat.', color: '#ddd'}, {text: ' :(', color: '#ddd'}]);
        }
        gGameEngine.collectedBitcoins = 0;
    },

    getWinner: function() {
        for (var i = 0; i < gGameEngine.players.length; i++) {
            var player = gGameEngine.players[i];
            if (player.alive) {
                return i;
            }
        }
    },

    restart: function() {
        gInputEngine.removeAllListeners();
        gGameEngine.stage.removeAllChildren();
        gGameEngine.setup();
    },

    moveToFront: function(child) {
        var children = gGameEngine.stage.numChildren;
        gGameEngine.stage.setChildIndex(child, children - 1);
    }, 

    countPlayersAlive: function() {
        var playersAlive = 0;
        for (var i = 0; i < gGameEngine.players.length; i++) {
            if (gGameEngine.players[i].alive) {
                playersAlive++;
            }
        }
        return playersAlive;
    },

    getPlayersAndBots: function() {
        var players = [];

        for (var i = 0; i < gGameEngine.players.length; i++) {
            players.push(gGameEngine.players[i]);
        }

        for (var i = 0; i < gGameEngine.bots.length; i++) {
            players.push(gGameEngine.bots[i]);
        }

        return players;
    }
});

gGameEngine = new GameEngine();