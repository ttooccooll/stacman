Bot = Player.extend({
    direction: 'up',
    lastDirection: '',
    excludeDirections: [],
    dirX: 0,
    dirY: 0,
    previousPosition: {},
    targetPosition: {},
    targetBitmapPosition: {},
    wait: false,

    startTimerMax: 60,
    startTimer: 0,
    started: false,

    init: function(position) {
        this._super(position);
        this.findTargetPosition();
        this.startTimerMax = Math.random() * 60;
    },

    update: function() {
         if (!this.alive) {
            this.fade();
            return;
        }

        this.wait = false;

        if (!this.started && this.startTimer < this.startTimerMax) {
            this.startTimer++;
            if (this.startTimer >= this.startTimerMax) {
                this.started = true;
            }
            this.animate('idle');
            this.wait = true;
        }

        if (this.targetBitmapPosition.x == this.bmp.x && this.targetBitmapPosition.y == this.bmp.y) {

            if (!this.wait) {
                this.findTargetPosition();
            }
        }

        if (!this.wait) {
            this.moveToTargetPosition();
        }

    },

    findTargetPosition: function() {
        var target = { x: this.position.x, y: this.position.y };
        target.x += this.dirX;
        target.y += this.dirY;

        var targets = this.getPossibleTargets();
        if (targets.length > 1) {
            var previousPosition = this.getPreviousPosition();
            for (var i = 0; i < targets.length; i++) {
                var item = targets[i];
                if (item.x == previousPosition.x && item.y == previousPosition.y) {
                    targets.splice(i, 1);
                }
            }
        }
        this.targetPosition = this.getRandomTarget(targets);
        if (this.targetPosition && this.targetPosition.x) {
            this.loadTargetPosition(this.targetPosition);
            this.targetBitmapPosition = Utils.convertToBitmapPosition(this.targetPosition);
        }
    },

    moveToTargetPosition: function() {
        this.animate(this.direction);

        var velocity = this.velocity;
        var distanceX = Math.abs(this.targetBitmapPosition.x - this.bmp.x);
        var distanceY = Math.abs(this.targetBitmapPosition.y - this.bmp.y);
        if (distanceX > 0 && distanceX < this.velocity) {
            velocity = distanceX;
        } else if (distanceY > 0 && distanceY < this.velocity) {
            velocity = distanceY;
        }

        var targetPosition = { x: this.bmp.x + this.dirX * velocity, y: this.bmp.y + this.dirY * velocity };
        if (!this.detectWallCollision(targetPosition)) {
            this.bmp.x = targetPosition.x;
            this.bmp.y = targetPosition.y;
        }

        this.updatePosition();
    },

    getPossibleTargets: function() {
        var targets = [];
        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            var position = { x: this.position.x + dirX, y: this.position.y + dirY };
            if (gGameEngine.getTileMaterial(position) == 'grass') {
                targets.push(position);
            }
        }

        var safeTargets = [];
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
        }

        var isLucky = Math.random() > 0.3;
        return safeTargets.length > 0 && isLucky ? safeTargets : targets;
    },

    loadTargetPosition: function(position) {
        this.dirX = position.x - this.position.x;
        this.dirY = position.y - this.position.y;
        if (this.dirX == 1 && this.dirY == 0) {
            this.direction = 'right';
        } else if (this.dirX == -1 && this.dirY == 0) {
            this.direction = 'left';
        } else if (this.dirX == 0 && this.dirY == 1) {
            this.direction = 'down';
        } else if (this.dirX == 0 && this.dirY == -1) {
            this.direction = 'up';
        }
    },

    getPreviousPosition: function() {
        var previous = { x: this.targetPosition.x, y: this.targetPosition.y };
        previous.x -= this.dirX;
        previous.y -= this.dirY;
        return previous;
    },

    getRandomTarget: function(targets) {
        return targets[Math.floor(Math.random() * targets.length)];
    },

    getNearWood: function() {
        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            var position = { x: this.position.x + dirX, y: this.position.y + dirY };
            if (gGameEngine.getTileMaterial(position) == 'wood') {
                return gGameEngine.getTile(position);
            }
        }
    },

    wantKillPlayer: function() {
        var isNear = false;

        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            var position = { x: this.position.x + dirX, y: this.position.y + dirY };
            for (var j = 0; j < gGameEngine.players.length; j++) {
                var player = gGameEngine.players[j];
                if (player.alive && Utils.comparePositions(player.position, position)) {
                    isNear = true;
                    break;
                }
            }
        }

        var isAngry = Math.random() > 0.5;
        if (isNear && isAngry) {
            return true;
        }
    },
});