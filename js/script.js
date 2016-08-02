/*
* Phaser Game Initialization
*/
var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game');
var PhaserGame = function () {
    this.background = null;
    this.foreground = null;

    this.player = null;
    this.cursors = null;
    this.speed = 300;

    this.weapons = [];
    this.currentWeapon = 0;
};

/*
* Begin Missile Logic
*/
var Missile = function (game, key) {
    Phaser.Sprite.call(this, game, 0, 50, key);

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.tracking = false;
    this.scaleSpeed = 0;
};
Missile.prototype = Object.create(Phaser.Sprite.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.fire = function (x, y, angle, speed, gx, gy) {
    gx = gx || 0;
    gy = gy || 0;

    this.reset(x, y);
    this.scale.set(1);
    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);
    this.angle = angle;
    this.body.gravity.set(gx, gy);
};
Missile.prototype.update = function () {
    if (this.scaleSpeed > 0){
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
    }
};
/*
* End Missile Logic
*/

/*
* Begin Weapon Logic
*/
var Weapon = {};

Weapon.SingleMissile = function (game) {
    Phaser.Group.call(this, game, game.world, 'Single Missile', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 100;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Missile(game, 'missile'), true);
    }

    return this;

};

Weapon.SingleMissile.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleMissile.prototype.constructor = Weapon.SingleBullet;

Weapon.SingleMissile.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire) {
      return;
    }

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.nextFire = this.game.time.time + this.fireRate;
};

/*
* End Weapon Logic
*/


PhaserGame.prototype = {
    init: function () {
        this.game.renderer.renderSession.roundPixels = true;
        this.physics.startSystem(Phaser.Physics.ARCADE);
    },
    preload: function () {
        //Preload the sprite images
        //For live
        this.load.baseURL = '/PracticeShooter';

        //For dev
        //this.load.baseURL = '/';
        this.load.image('background', '/img/cool-space-background2.jpg');
        this.load.image('player', '/img/ship1.png');
        this.load.image('missile', '/img/missile.png');
    },
    create: function () {
        //Add background image
        this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.autoScroll(-40, 0);

        //Add weapons
        this.weapons.push(new Weapon.SingleMissile(this.game));

        //Add player
        this.player = this.add.sprite(64, 200, 'player');
        this.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;

        //Capture keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        //var changeKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        //changeKey.onDown.add(this.nextWeapon, this);
    },

    update: function () {
        this.player.body.velocity.set(0);

        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.speed;
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.speed;
        }
        if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -this.speed;
        }
        else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = this.speed;
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
          //FIRE DEFAULT EQUIPPED WEAPON
          this.weapons[this.currentWeapon].fire(this.player);
        }
    }
};

game.state.add('Game', PhaserGame, true);
