Tile = Entity.extend({
    position: {},
    size: {
        w: 32,
        h: 32
    },
    bmp: null,

    material: '',

    init: function(material, position) {
        this.material = material;
        this.position = position;
        var img;
        if (material == 'grass') {
            img = gGameEngine.tilesImgs.grass;
        } else if (material == 'wall') {
            img = gGameEngine.tilesImgs.wall;
        } else if (material == 'wood') {
            img = gGameEngine.tilesImgs.wood;
        } else if (material == 'cactus') {
            img = gGameEngine.tilesImgs.cactus;
        } else if (material == 'cactus2') {
            img = gGameEngine.tilesImgs.cactus2;
        } else if (material == 'cactus3') {
            img = gGameEngine.tilesImgs.cactus3;
        }
        this.bmp = new createjs.Bitmap(img);
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
    },

    update: function() {
    },

    remove: function() {
        gGameEngine.stage.removeChild(this.bmp);
        for (var i = 0; i < gGameEngine.tiles.length; i++) {
            var tile = gGameEngine.tiles[i];
            if (this == tile) {
                gGameEngine.tiles.splice(i, 1);
            }
        }
    }
});