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
            gravity: { y: 350 },
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
    this.load.image('lava', 'lava.png')
    this.load.image('portal-b', 'portal-blue.png')
    this.load.image('portal-o', 'portal-orange.png')
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
let level3SetupDone = false;
/**
 * @this {Phaser.Scene}
 */
function create() {
    this.level1 = {};
    this.level2 = {}; // Store level 2 objects here
    this.level3 = {}; // Store level 3 objects here
    this.level4 = {}; // Store level 4 objects here
    this.level5 = {}; // Store level 5 objects here
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
}

/**
 * @this {Phaser.Scene}
 */
function update() {

    const left = cursors.left.isDown;
    const right = cursors.right.isDown;
    const up = cursors.up.isDown;

    if (left) {
        player.setVelocityX(-300);
        player.anims.play('left', true);
    } else if (right) {
        player.setVelocityX(300);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);

        player.anims.stop();
    }

    if (up && player.body.touching.down) {
        player.setVelocityY(-520);
    }

    moveCamera.call(this);
    checkDeathBarrier();
    this.input.once('pointerup', getmousepos);
    doLevel1.call(this);
    doLevel2.call(this);
    doLevel3.call(this);
    doLevel4.call(this);
    doLevel5.call(this);
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

function enforceMaxYVelocity(maxYVelocity) {
    if (player.body.velocity.y > maxYVelocity) {
        player.setVelocityY(maxYVelocity);
    }
}

function checkDeathBarrier() {
    if (player.y > 1000) {
        //add death animation (mario type shi)
        killPlayer();
    }
}

function killPlayer() {
    player.setVelocity(0, 0);
    setTimeout(() => {
        player.setPosition(100, 500);
        player.setVelocity(0, 0);
    }, 1000);
}

function spawnIsland(x, y) {
    let island = this.physics.add.staticGroup().create(x, y, 'island');
    island.setImmovable(true);
    this.physics.add.collider(player, island);
    return island;
}

/**
 * @this {Phaser.Scene}
 */
function spawnButton(x, y, functionOnPress) {
    let button = this.physics.add.sprite(x, y, 'u-button');
    button.body.setAllowGravity(false);
    button.setImmovable(false);
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

function spawnFloor(x, y) {
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
function tweenObject(x, y, object, duration) {
    return this.tweens.add({
        targets: object,
        duration: duration,
        // ease: 'Linear',
        x: x,
        y: y,
        repeat: -1,
        yoyo: false
    });
}

function moveObject(x, y, object, duration) {
    while (object.x != x || object.y != y) {
        if (object.x < x) object.x += 1;
        if (object.x > x) object.x -= 1;
        if (object.y < y) object.y += 1;
        if (object.y > y) object.y -= 1;
    }
}

function spawnSpikes(x, y, onTouch) {
    let spikes = this.physics.add.staticGroup().create(x, y, 'spikes');
    spikes.setImmovable(true);
    this.physics.add.overlap(player, spikes, function () {
        onTouch();
    });
    return spikes;
}

function spawnMovingWall(x, y, angle = 0) {
    const wall = this.physics.add.sprite(x, y, 'wall');
    wall.body.setAllowGravity(false);
    wall.setImmovable(true);
    wall.setAngle(angle);
    this.physics.add.collider(player, wall);
    return wall;
}

function spawnPortal(bx, by, ox, oy, s = 1, brot = 0, orot = 0) {
    const portalblue = this.physics.add.sprite(bx, by, 'portal-b').setScale(s).refreshBody();
    const portalorange = this.physics.add.sprite(ox, oy, 'portal-o').setScale(s).refreshBody();
    portalorange.body.setAllowGravity(false);
    portalorange.setImmovable(true);
    portalblue.body.setAllowGravity(false);
    portalblue.setImmovable(true);
    this.physics.add.overlap(player, portalblue, function () {
        player.setPosition(portalorange.x, portalorange.y);
    });
    return { blue: portalblue, orange: portalorange };
}

function spawnLava(x, y, onTouch) {
    let lava = this.physics.add.staticGroup().create(x, y, 'lava');
    lava.setImmovable(true);
    this.physics.add.overlap(player, lava, function () {
        onTouch();
    });
    return lava;
}

function spawnMovingSpikes(x, y, onTouch, angle = 0) {
    const spikes = this.physics.add.sprite(x, y, 'spikes');
    spikes.body.setAllowGravity(false);
    spikes.setImmovable(true);
    spikes.setAngle(angle);
    spikes.body.setSize(spikes.displayWidth, spikes.displayHeight);
    this.physics.add.overlap(player, spikes, function () {
        onTouch();
    });
    return spikes;
}

function startLinearMotion(object, velocityX, velocityY) {
    object.body.setVelocity(velocityX, velocityY);
}

function stopAtY(object, targetY) {
    if ((object.body.velocity.y < 0 && object.y <= targetY) || (object.body.velocity.y > 0 && object.y >= targetY)) {
        object.body.setVelocityY(0);
        object.setY(targetY);
    }
}

function stopAtX(object, targetX) {
    if ((object.body.velocity.x < 0 && object.x <= targetX) || (object.body.velocity.x > 0 && object.x >= targetX)) {
        object.body.setVelocityX(0);
        object.setX(targetX);
    }
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
            spawnText.call(this, 1500, 630, 'Youre softlocked.. Refresh page').setColor('#000000');
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


/**
 * @this {Phaser.Scene}
 */
function doLevel2() {
    // one-time setup
    if (!level2SetupDone) {
        this.level2.floor = spawnFloor.call(this, 2700, 698);
        this.level2.text = spawnText.call(this, 2200, 640, 'Level 2: Spikes');
        this.level2.spikes1 = spawnSpikes.call(this, 2500, 560, () => { killPlayer(); });
        this.level2.spikes2 = spawnSpikes.call(this, 2700, 560, () => { });
        this.level2.spikes2 = spawnSpikes.call(this, 2830, 560, () => { });
        this.level2.spikes2m = spawnSpikes.call(this, 2750, 400, () => { killPlayer(); });
        this.level2.spikes2mw = spawnWall.call(this, 2780, 400).setScale(1.2, 0.6).refreshBody();
        this.level2.spikes2m.setAngle(-90);
        this.level2.spikes2m.setAlpha(0);
        this.level2.spikes2mw.setAlpha(0);
        this.level2.flyingtrapbox = spawnMovingWall.call(this, 3000, -20, 90);
        this.level2.flyingtrapbox.setScale(1.5,1);
        this.level2.flyingtrapspike = spawnMovingSpikes.call(this, 3000, 20, () => { killPlayer(); }, 180);
        this.level2.flyingtrapspike.setScale(1.7);
        this.level2.flyingtrapStarted = false;
        level2SetupDone = true;
    }
    // loop
    if (player.x > 2650) {
        this.level2.spikes2m.setAlpha(1);
        this.level2.spikes2mw.setAlpha(1);
    }
    if (player.x > 2900 && !this.level2.flyingtrapStarted) {
        startLinearMotion.call(this, this.level2.flyingtrapbox, 0, 800);
        startLinearMotion.call(this, this.level2.flyingtrapspike, 0, 800);
        this.level2.flyingtrapStarted = true;
    }
    if (this.level2.flyingtrapStarted) {
        stopAtY(this.level2.flyingtrapbox, 1000);
        stopAtY(this.level2.flyingtrapspike, 1020);
    }

}

/**
 * @this {Phaser.Scene}
 */
function doLevel3() {
    // one-time setup
    if (!level3SetupDone) {
        this.level3.fakefloor = spawnMovingWall.call(this, 3600, 698, 0);
        this.level3.fakefloor.setScale(7, 1.4).refreshBody();
        this.level3.floor = spawnFloor.call(this, 4170, 698);
        this.level3.text = spawnText.call(this, 3500, 640, 'Level 3: Dont trust anything');
        this.level3.movingwall = spawnMovingWall.call(this, 4100, 850, 0);
        this.level3.movingwall.setScale(2);
        this.level3.wallStage = 0; // 0: waiting, 1: moving up, 2: moving left, 3: pull floor
        this.level3.fakewallstage = 0; // 0: up, 1: right 2: down
        this.level3.initialWallX = 4100;
        this.level3.initialWallY = 850;
        this.level3.initialFloorX = 3600;
        this.level3.initialFloorY = 698;
        this.level3.fakewall = this.physics.add.sprite(4500, 500, 'wall');
        this.level3.fakewall.body.setAllowGravity(false);
        this.level3.fakewall.setImmovable(true);
        this.level3.fakewall.setScale(2);
        this.level3.fakewall.refreshBody();
        this.level3.fakebutton = spawnButton.call(this, 4300, 552, () => {
            this.level3.fakebutton.setTexture('spikes');
            killPlayer();
        });
        level3SetupDone = true;
    }
    //loop
    if (player.x > 3800 && this.level3.wallStage === 0) {
        startLinearMotion.call(this, this.level3.movingwall, 0, -500);
        this.level3.wallStage = 1;
    }
    if (this.level3.wallStage === 1) {
        stopAtY(this.level3.movingwall, this.level3.initialWallY - 350);
        if (this.level3.movingwall.y <= this.level3.initialWallY - 350) {
            startLinearMotion.call(this, this.level3.movingwall, -300, 0);
            this.level3.wallStage = 2;
        }
    }
    if (this.level3.wallStage === 2) {
        stopAtX(this.level3.movingwall, this.level3.initialWallX - 400);
        if (this.level3.movingwall.x <= this.level3.initialWallX - 400) {
            startLinearMotion.call(this, this.level3.fakefloor, 0, 900);
            this.level3.wallStage = 3; // pull floor
        }
    }
    if (this.level3.wallStage === 3) {
        stopAtY(this.level3.fakefloor, this.level3.initialFloorY + 500);
        if (this.level3.fakefloor.y >= this.level3.initialFloorY + 500) {
            // Start wall moving back down
            startLinearMotion.call(this, this.level3.movingwall, 0, 300);
            this.level3.wallStage = 4;
        }
    }
    if (this.level3.wallStage === 4) {
        stopAtY(this.level3.movingwall, this.level3.initialWallY);
        if (this.level3.movingwall.y >= this.level3.initialWallY) {
            // Start floor moving back up
            startLinearMotion.call(this, this.level3.fakefloor, 0, -300);
            this.level3.wallStage = 5;
        }
    }
    if (this.level3.wallStage === 5) {
        stopAtY(this.level3.fakefloor, this.level3.initialFloorY);
        this.level3.movingwall.destroy();
    }
    if (player.x > this.level3.fakewall.x + 100 && this.level3.fakewallstage === 0) {
        this.physics.add.collider(player, this.level3.fakewall);
        startLinearMotion.call(this, this.level3.fakewall, 300, 0);
        this.level3.fakewallstage = 1;
    }
    if (this.level3.fakewallstage === 1) {
        stopAtX(this.level3.fakewall, 4650);
        setTimeout(() => {
            this.level3.fakewall.destroy();
            this.level3.fakewallstage = 2;
        }, 5000);
    }
}

let level4SetupDone = false;
/**
 * @this {Phaser.Scene}
 */
function doLevel4() {
    // one-time setup
    if (!level4SetupDone) {
        spawnFloor.call(this, 5300, 698);
        spawnWall.call(this, 5800, 698).setScale(1, 10).refreshBody();

        spawnFloor.call(this, 5250, 500).setScale(0.7, 0.1).refreshBody();
        spawnFloor.call(this, 5400, 400).setScale(0.8, 0.1).refreshBody();
        spawnFloor.call(this, 5250, 300).setScale(0.7, 0.1).refreshBody();
        spawnFloor.call(this, 5400, 200).setScale(0.8, 0.1).refreshBody();
        spawnFloor.call(this, 5250, 100).setScale(0.7, 0.1).refreshBody();
        spawnFloor.call(this, 5400, 0).setScale(0.8, 0.1).refreshBody();
        spawnWall.call(this, 4900, 28).setScale(1, 5).refreshBody();
        spawnText.call(this, 5000, 640, 'Level 4: Catch me if you can');
        this.level4.button1 = spawnButton.call(this, 5750, -20, () => {
            const now = Date.now();
            if (!this.level4.button1LastPressed || now - this.level4.button1LastPressed > 1500) {
                this.level4.button1pressedStage += 1;
                this.level4.button1LastPressed = now;
            }
        });
        this.level4.button1pressedStage = -1;
        this.level4.button1LastPressed = 0;
        level4SetupDone = true;
    }
    //loop
    if (this.level4.button1pressedStage === 0) {
        startLinearMotion.call(this, this.level4.button1, 0, 500);
        this.level4.button1pressedStage = 1;
        this.level4.spikes = spawnMovingSpikes.call(this, 6100, -100, () => { killPlayer(); }, -90);
        this.level4.spikes.setScale(1.5).refreshBody();
        startLinearMotion.call(this, this.level4.spikes, -330, 0);
    }
    if (this.level4.button1pressedStage === 1) {
        stopAtY(this.level4.button1, 380);
        stopAtX(this.level4.spikes, 4800);
    }
    if (this.level4.button1pressedStage === 2) {
        startLinearMotion.call(this, this.level4.button1, -500, 0);
        this.level4.button1.setAngle(90);
        this.level4.button1pressedStage = 3;
    }
    if (this.level4.button1pressedStage === 3) {
        stopAtX(this.level4.button1, 4920);
    }
    if (this.level4.button1pressedStage === 4) {
        startLinearMotion.call(this, this.level4.button1, 300, -500);
        this.level4.button1pressedStage = 5;
    }
    if (this.level4.button1pressedStage === 5) {
        stopAtY(this.level4.button1, -20);
        stopAtX(this.level4.button1, 5450);
        this.level4.button1.setAngle(0);
        this.level4.spikes.setAngle(90);
    }
    if (this.level4.button1pressedStage === 6) {
        startLinearMotion.call(this, this.level4.spikes, 330, 0);
    }
    if (this.level4.button1pressedStage > 5) {
        spawnIsland.call(this, 5600, -75);
        spawnIsland.call(this, 5700, -150);
        stopAtX(this.level4.spikes, 5800);
        this.level4.portals = spawnPortal.call(this, 6000, 0, 6200, 330, 1, 0, -90);
        console.log(this.level4.portals);
        this.level4.portals.orange.setAlpha(0);
        this.level4.button1.texture = 'p-button';
        this.level4.button1pressedStage = -200000; // disable further stages
    }

}

let level5SetupDone = false;
/**
 * @this {Phaser.Scene}
 */
function doLevel5() {
    // one-time setup
    if (!level5SetupDone) {
        //player.setPosition(6200, 400);
        spawnFloor.call(this, 6500, 698);
        spawnFloor.call(this, 7200, 698);
        spawnText.call(this, 6550, 640, 'Level 5: (not) Working with portals');
        spawnWall.call(this, 6183, 600).refreshBody();
        spawnLava.call(this, 6900, 540, () => { killPlayer(); }).setScale(3, 1).refreshBody();
        spawnIsland.call(this, 6200, 450);
        this.level5.portals = spawnPortal.call(this, 6400, 480, 6400, 150, 0.5);
        this.level5.portalblue = this.level5.portals.blue;
        this.level5.portalorange = this.level5.portals.orange;
        this.level5.portalorange.setAngle(90);
        spawnIsland.call(this, 7000, 450);
        spawnIsland.call(this, 8000, 450).setScale(5, 1).refreshBody();
        this.level5.movingspike = spawnMovingSpikes.call(this, 7750, 430, () => { killPlayer(); }).setScale(1, 1);
        this.level5.endportal = this.physics.add.sprite(9290, 430, 'portal');
        this.level5.endportal.body.setAllowGravity(false);
        this.level5.endportal.setScale(3).setImmovable(true).refreshBody();
        spawnText.call(this, 9000, 400, 'The end?');
        spawnIsland.call(this, 9200, 500).setScale(2).refreshBody();
        this.level5.portalstage = 0;
        level5SetupDone = true;
        console.log(this.level5.portalblue, this.level5.portalorange);
        spawnButton.call(this, 7000, 430, () => {
            this.level5.portalstage = 2;
        });
        this.physics.add.overlap(player, this.level5.endportal, function () {
            portalTransition.call(this, 1000, 550);
            setTimeout(() => {
                window.location.href = "/win.html";
            }, 3000);
        }, null, this);
    }
    //loop
    // Clamp fall speed only during level 5 updates
    if (player && player.body) {
        enforceMaxYVelocity(400);
    }
    if (player.x > 6390 && this.level5.portalstage === 0) {
        this.level5.portalstage = 1;
        startLinearMotion.call(this, this.level5.portalblue, 200, 0);
        startLinearMotion.call(this, this.level5.portalorange, 200, 0);
    }
    if (this.level5.portalstage === 1) {
        stopAtX(this.level5.portalorange, 6800);
    }
    if (this.level5.portalstage === 2) {
        startLinearMotion.call(this, this.level5.portalorange, 200, 0);
    }
    if (player.x > 8000) {
        startLinearMotion.call(this, this.level5.movingspike, 500, 0);
        if (player.x < this.level5.movingspike.x) {
            setTimeout(() => {
                startLinearMotion.call(this, this.level5.movingspike, -400, 0);
            }, 1000);
        }
        if (this.level5.movingspike.x > 8300) {
            this.level5.movingspike.x = 8300;
        }
    }
    //spawn end portal- done
}