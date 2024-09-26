var Utils = {};

Utils.comparePositions = function(pos1, pos2) {
    return pos1.x == pos2.x && pos1.y == pos2.y;
};

Utils.convertToEntityPosition = function(pixels) {
    var position = {};
    position.x = Math.round(pixels.x / gGameEngine.tileSize);
    position.y = Math.round(pixels.y /gGameEngine.tileSize);
    return position;
};

Utils.convertToBitmapPosition = function(entity) {
    var position = {};
    position.x = entity.x * gGameEngine.tileSize;
    position.y = entity.y * gGameEngine.tileSize;
    return position;
};

Utils.removeFromArray = function(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (item == array[i]) {
            array.splice(i, 1);
        }
    }
    return array;
};