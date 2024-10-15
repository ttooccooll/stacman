Menu = Class.extend({
    visible: true,

    views: [],

    init: function() {
        gGameEngine.botsCount = 9;
        gGameEngine.playersCount = 0;

        this.showLoader();
    },

    show: function(text) {
        this.visible = true;

        this.draw(text);
    },

    hide: function() {
        this.visible = false;

        for (var i = 0; i < this.views.length; i++) {
            gGameEngine.stage.removeChild(this.views[i]);
        }

        this.views = [];
    },

    update: function() {
        if (this.visible) {
            for (var i = 0; i < this.views.length; i++) {
                gGameEngine.moveToFront(this.views[i]);
            }
        }
    },

    setHandCursor: function(btn) {
        btn.addEventListener('mouseover', function() {
            document.body.style.cursor = 'pointer';
        });
        btn.addEventListener('mouseout', function() {
            document.body.style.cursor = 'auto';
        });
    },

    setMode: function(mode) {
        this.hide();

        if (mode == 'single') {
            gGameEngine.botsCount = 9;
            gGameEngine.playersCount = 1;
        } else {
            gGameEngine.botsCount = 9;
            gGameEngine.playersCount = 2;
        }

        gGameEngine.playing = true;
        gGameEngine.restart();
    },

    draw: function(text) {
        var that = this;

        var bgGraphics = new createjs.Graphics().beginFill("rgba(0, 0, 0, 0.5)").drawRect(0, 0, gGameEngine.size.w, gGameEngine.size.h);
        var bg = new createjs.Shape(bgGraphics);
        gGameEngine.stage.addChild(bg);
        this.views.push(bg);

        // game title
        text = text || [{text: 'Stac', color: '#969696'}, {text: 'man', color: '#5c8001'}];

        var title1 = new createjs.Text(text[0].text, "bold 35px Helvetica", text[0].color);
        var title2 = new createjs.Text(text[1].text, "bold 35px Helvetica", text[1].color);

        var titleWidth = title1.getMeasuredWidth() + title2.getMeasuredWidth();

        title1.x = gGameEngine.size.w / 2 - titleWidth / 2;
        title1.y = gGameEngine.size.h / 2 - title1.getMeasuredHeight() / 2 - 200;
        gGameEngine.stage.addChild(title1);
        this.views.push(title1);

        title2.x = title1.x + title1.getMeasuredWidth();
        title2.y = gGameEngine.size.h / 2 - title1.getMeasuredHeight() / 2 - 200;
        gGameEngine.stage.addChild(title2);
        this.views.push(title2);

        var paragraphText = "It is a dark day in Texas. The fed has decended upon the town of Austin, intent to confiscate everyone's cowboy hats. You alone have the power to accumulate enough sats to properly discourage them.\n\nGrab your six shooter for invincibility. You can find it clearly on the ground (unlike the new ones on sn that I'm still convinced may have no friggin' rhyme or reason to them). Grab the roadrunner for speed. Whatever you do, don't get caught up in fed-tomfoolery.\n\nThis game in total probably lasts as long as it's taken you to read this, you overzealously literate dork. I really only put this here to give the music time to pick up before you start playing. Anyway, get in there and stack like you're life depends on it! This may be your last chance to save all of Texas before I put up a paywall and you have to pay 100 real sats just to play this stupid game. It's basically pacman.";
        var paragraph = new createjs.Text(paragraphText, "12px monospace", "#black");
        paragraph.lineHeight = 13;
        paragraph.lineWidth = 400;
        paragraph.x = gGameEngine.size.w / 2 - 200;
        paragraph.y = title1.y + title1.getMeasuredHeight() + 20;
        
        var bounds = paragraph.getBounds();
        var paragraphBgGraphics = new createjs.Graphics().beginFill("rgba(90, 90, 90, 0.5)").drawRect(paragraph.x - 10, paragraph.y - 10, bounds.width + 20, bounds.height + 20);
        var paragraphBg = new createjs.Shape(paragraphBgGraphics);
        gGameEngine.stage.addChild(paragraphBg);
        this.views.push(paragraphBg);
        
        gGameEngine.stage.addChild(paragraph);
        this.views.push(paragraph);

        var modeSize = 110;
        var modesDistance = 20;
        var modesY = title1.y + title1.getMeasuredHeight() + 300;

        // singleplayer button
        var singleX = gGameEngine.size.w / 2 - modeSize - modesDistance;
        var singleBgGraphics = new createjs.Graphics().beginFill("rgba(90, 90, 90, 0.5)").drawRect(singleX, modesY, modeSize, modeSize);
        var singleBg = new createjs.Shape(singleBgGraphics);
        gGameEngine.stage.addChild(singleBg);
        this.views.push(singleBg);
        this.setHandCursor(singleBg);
        singleBg.addEventListener('click', function() {
            that.setMode('single');
        });

        var singleTitle1 = new createjs.Text("single", "16px Helvetica", "#969696");
        var singleTitle2 = new createjs.Text("stacker", "16px Helvetica", "#5c8001");
        var singleTitleWidth = singleTitle1.getMeasuredWidth() + singleTitle2.getMeasuredWidth();
        var modeTitlesY = modesY + modeSize - singleTitle1.getMeasuredHeight() - 20;

        singleTitle1.x = singleX + (modeSize - singleTitleWidth) / 2;
        singleTitle1.y = modeTitlesY;
        gGameEngine.stage.addChild(singleTitle1);
        this.views.push(singleTitle1)

        singleTitle2.x = singleTitle1.x + singleTitle1.getMeasuredWidth();
        singleTitle2.y = modeTitlesY;
        gGameEngine.stage.addChild(singleTitle2);
        this.views.push(singleTitle2)

        var iconsY = modesY + 13;
        var singleIcon = new createjs.Bitmap("img/cowboy.png");
        singleIcon.sourceRect = new createjs.Rectangle(0, 0, 48, 48);
        singleIcon.x = singleX + (modeSize - 48) / 2;
        singleIcon.y = iconsY;
        gGameEngine.stage.addChild(singleIcon);
        this.views.push(singleIcon);

        // multiplayer button
        var multiX = gGameEngine.size.w / 2 + modesDistance;
        var multiBgGraphics = new createjs.Graphics().beginFill("rgba(90, 90, 90, 0.5)").drawRect(multiX, modesY, modeSize, modeSize);
        var multiBg = new createjs.Shape(multiBgGraphics);
        gGameEngine.stage.addChild(multiBg);
        this.views.push(multiBg);
        this.setHandCursor(multiBg);
        multiBg.addEventListener('click', function() {
            that.setMode('multi');
        });

        var multiTitle1 = new createjs.Text("multi", "16px Helvetica", "#969696");
        var multiTitle2 = new createjs.Text("stacker", "16px Helvetica", "#5c8001");
        var multiTitleWidth = multiTitle1.getMeasuredWidth() + multiTitle2.getMeasuredWidth();

        multiTitle1.x = multiX + (modeSize - multiTitleWidth) / 2;
        multiTitle1.y = modeTitlesY;
        gGameEngine.stage.addChild(multiTitle1);
        this.views.push(multiTitle1)

        multiTitle2.x = multiTitle1.x + multiTitle1.getMeasuredWidth();
        multiTitle2.y = modeTitlesY;
        gGameEngine.stage.addChild(multiTitle2);
        this.views.push(multiTitle2)

        var multiIconGirl = new createjs.Bitmap("img/cowboy.png");
        multiIconGirl.sourceRect = new createjs.Rectangle(0, 0, 48, 48);
        multiIconGirl.x = multiX + (modeSize - 48) / 2 - 48/2 + 8;
        multiIconGirl.y = iconsY;
        gGameEngine.stage.addChild(multiIconGirl);
        this.views.push(multiIconGirl);

        var multiIconBoy = new createjs.Bitmap("img/darth.png");
        multiIconBoy.sourceRect = new createjs.Rectangle(0, 0, 48, 48);
        multiIconBoy.x = multiX + (modeSize - 48) / 2 + 48/2 - 8;
        multiIconBoy.y = iconsY;
        gGameEngine.stage.addChild(multiIconBoy);
        this.views.push(multiIconBoy);
    },

    showLoader: function() {
        var bgGraphics = new createjs.Graphics().beginFill("#000000").drawRect(0, 0, gGameEngine.size.w, gGameEngine.size.h);
        var bg = new createjs.Shape(bgGraphics);
        gGameEngine.stage.addChild(bg);

        var loadingText = new createjs.Text("Loading...", "20px Helvetica", "#FFFFFF");
        loadingText.x = gGameEngine.size.w / 2 - loadingText.getMeasuredWidth() / 2;
        loadingText.y = gGameEngine.size.h / 2 - loadingText.getMeasuredHeight() / 2;
        gGameEngine.stage.addChild(loadingText);
        gGameEngine.stage.update();
    }
});