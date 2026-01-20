/// <reference types="phaser" />

import Phaser from 'phaser'
const config = {
    width: 800,
    height: 600,
    backgroundColor: 0xffffff,
    scene: {
        preload,
        create,
        update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
}

const game = new Phaser.Game(config)

/**
 * @this {Phaser.Scene}
 */
function preload() {
    this.load.image('ground', 'big-floor.png')
    this.load.image('island', 'small-tile.png')
    this.load.image('star', 'star.png')
    this.load.image('portal', 'Portal.png')
    this.load.image('welcome', 'welcome.png')
    this.load.image('fakeout', 'Wfakeout.png')
    this.load.image('wall', 'small-wall.png')
    this.load.image('spikes', 'spikes.png')
    this.load.image('u-button', 'button_unpressed.png')
    this.load.image('p-button', 'button_pressed.png')
    this.load.spritesheet('player', 'player.png', {
        frameWidth: 22,
        frameHeight: 20
    })
}
let player
let cursors
let portal1
let buttonDistCrossed = false;
let level1SetupDone = false;
let level2SetupDone = false;
/**
 * @this {Phaser.Scene}
 */
function create() {
    this.level1 = {};
    this.level2 = {}; // Store level 1 objects here
    let platforms = this.physics.add.staticGroup()
    let objects = this.physics.add.staticGroup()

    platforms.create(400, 698, "ground")
    platforms.create(1600, 698, "ground")
    platforms.create(600, 450, "island")
    platforms.create(50, 250, "island")
    platforms.create(650, 220, "island")
    platforms.create(250, 520, "island")
    platforms.create(300, 320, "island")
    objects.create(400, 600, "welcome").setScale(2)
    objects.create(1000, 600, "fakeout").setScale(2)


    this.add.text(1150, 570, 'Level 1: The Button', { color: '#000' }).setScale(2);

    this
    player = this.physics.add.sprite(380, 500, "player");
    player.setScale(2);
    portal1 = objects.create(700, 150, "portal").setScale(3);
    // player.setBounce(0.2)
    player.setCollideWorldBounds(false)
    this.physics.add.collider(player, platforms)
    cursors = this.input.keyboard.createCursorKeys()
    player.body.setGravityY(600);
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    this.physics.add.overlap(player, portal1, function () {
        if (!teleporting) {
            portalTransition.call(this, 1000, 550);
        }
    });
    // Level 1 handled in doLevel1()
}

/**
 * @this {Phaser.Scene}
 */
function update() {

    const left = cursors.left.isDown;
    const right = cursors.right.isDown;
    const up = cursors.up.isDown;

    if (left) {
        player.setVelocityX(-200);
        player.anims.play('left', true);
    } else if (right) {
        player.setVelocityX(200);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);

        player.anims.stop();
    }

    if (up && player.body.touching.down) {
        player.setVelocityY(-560);
    }
    moveCamera.call(this);
    checkDeathBarrier();
    this.input.once('pointerup', getmousepos);
    doLevel1.call(this);
    doLevel2.call(this);

}

function moveCamera() {
    const camera = this.cameras.main;
    camera.startFollow(player);
    camera.setZoom(1);
}

let teleporting = false;

function portalTransition(x, y) {
    player.setPosition(x, y);
    player.setVelocity(0, 0);
    setTimeout(() => { teleporting = false; }, 1000); //
}

function getmousepos() {
    setTimeout(() => {
        console.log(player.x, player.y);
    }, 1000);
}

function checkDeathBarrier() {
    if (player.y > 1000) {
        //add death animation (mario type shi)
        player.setVelocity(0, 0);
        setTimeout(() => {
            player.setPosition(100, 500);
            player.setVelocity(0, 0);
        }, 1000);
    }
}

/**
 * @this {Phaser.Scene}
 */
function spawnButton(x, y, functionOnPress) {
    let button = this.physics.add.sprite(x, y, 'u-button');
    button.body.setAllowGravity(false);
    button.setImmovable(true);
    this.physics.add.overlap(player, button, function () {
        console.log("Button Pressed");
        functionOnPress();
    });
    return button;
}

/**
 * @this {Phaser.Scene}
 */
function spawnWall(x, y) {
    let wall = this.physics.add.staticGroup().create(x, y, 'wall');
    // wall.body.setAllowGravity(false);
    wall.setImmovable(true);
    this.physics.add.collider(player, wall);
    return wall;
}

function spawnFloor(x,y) {
    let floor = this.physics.add.staticGroup().create(x, y, 'ground');
    // wall.body.setAllowGravity(false);
    floor.setImmovable(true);
    this.physics.add.collider(player, floor);
    return floor;
}

function spawnText(x, y, text) {
    return this.add.text(x, y, text, { color: '#000' }).setScale(2);
}

/**
 * @this {Phaser.Scene}
 */
function doLevel1() {  //each level now has its own function and local variables,
                       //for ease of management and readability
    // one-time setup

    if (!level1SetupDone) {
        this.level1.wall = spawnWall.call(this, 1500, 380).setScale(2).refreshBody();
        this.level1.button2 = spawnButton.call(this, 1700, 552, () => {
            this.level1.button2.setTexture('p-button');
            spawnWall.call(this, 1900, 520).setScale(2).refreshBody();
        });
        level1SetupDone = true;
    }

    //loop

    if (!buttonDistCrossed && player.x > 1200) {
        buttonDistCrossed = true;
        this.level1.buttonMain = spawnButton.call(this, 40, 232, () => {
            if (this.level1.wall) this.level1.wall.destroy();
            this.level1.buttonMain.setTexture('p-button');
        });
    }
}

function doLevel2() {
    // one-time setup
    if (!level2SetupDone) {
        this.level2.floor = spawnFloor.call(this, 2700, 698);
        this.level2.text = spawnText.call(this, 1900, 640, 'Level 2: Spikes');
        
        level2SetupDone = true;
    }
    // loop
    // Level 2 loop code here
}