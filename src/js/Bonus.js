Bonus = Entity.extend({
    types: ['speed', 'sixs'],

    type: '',
    position: {},
    bmp: null,

    init: function(position, typePosition) {
        if (typeof typePosition === 'number' && this.types[typePosition]) {
            this.type = this.types[typePosition];
        } else {
            var randomIndex = Math.floor(Math.random() * this.types.length);
            this.type = this.types[randomIndex];
        }

        this.position = position;

        this.bmp = new createjs.Bitmap(gGameEngine.bonusesImg);
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
        this.bmp.sourceRect = new createjs.Rectangle(this.types.indexOf(this.type) * 32, 0, 32, 32);
        gGameEngine.stage.addChild(this.bmp);
    },

    destroy: function() {
        gGameEngine.stage.removeChild(this.bmp);
        Utils.removeFromArray(gGameEngine.bonuses, this);
    }
});
