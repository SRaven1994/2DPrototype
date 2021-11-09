class FirstScene extends BaseScene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {CustomSprite} */
    player
    /** @type {CustomSprite} */
    bullet
    /** @type {object} */
    playerStartPoint
    /** @type  {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors
    /** @type  {Phaser.Cameras.Scene2D.Camera} */
    camera
    /**@type {Phaser.Physics.Arcade.Group} */
    coins
    /**@type {Phaser.GameObjects.Text} */
    scoreText
    /**@type {Phaser.GameObjects.Text} */
    healthText
    /**@type {Phaser.GameObjects.Text} */
    gameOverText
    /**@type {number}*/
    score = 0
    /**@type {number}*/
    health = 3
    /** @type {Phaser.Input.Keyboard.Key} */
    KeyW
    /** @type {Phaser.Input.Keyboard.Key} */
    KeyA
    /** @type {Phaser.Input.Keyboard.Key} */
    KeyS
    /** @type {Phaser.Input.Keyboard.Key} */
    KeyD
    /** @type {Phaser.Input.Keyboard.Key} */
    KeyEnter
    constructor() {
        super('Scene1')
    }
    preload() {
        super.preload()
        //load json tile
        this.load.tilemapTiledJSON("level1", "assets/level1a.json")
    }
    create() {
        //create tiles
        this.map = this.make.tilemap({ key: "level1" })
        const landscape = this.map.addTilesetImage("grass-building-tileset", "grass-building-tileset")
        const sky = this.map.addTilesetImage("grass-sky-tileset", "grass-sky-tileset")
        const props = this.map.addTilesetImage("props-tileset", "props-tileset")
        const pickuplayer = this.map.addTilesetImage("items", "items")
        //set world bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        // create background/platform layers
        this.map.createLayer("background", [landscape, sky, props, pickuplayer], 0, 0)
        this.map.createLayer("midground", [landscape, sky, props, pickuplayer], 0, 0)
        this.map.createLayer("platforms", [landscape, sky, props, pickuplayer], 0, 0)
        //Create player
        // this.playerStartPoint = FirstScene.FindPoint(this.map)
        this.player = new CustomSprite(this, 10, 360, 'player')
        this.player.setSize(16, 16);
        //Collison
        const collisionLayer = this.map.getLayer("platforms").tilemapLayer
        collisionLayer.setCollisionBetween(0, 1000)
        this.physics.add.collider(this.player, collisionLayer)
        //AmmoSpawning


        //Coins
        this.coins = this.physics.add.group({
            key: "Coin",
            collideWorldBounds: true,
            repeat: 31,
            setXY: {
                x: 5,
                y: 0,
                stepX: 20
            }
        })
        this.physics.add.collider(this.coins, collisionLayer)
        // add layer
        this.foregroundlayer = this.map.createLayer("foreground", [landscape, sky, props, pickuplayer], 0, 0)
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this)
        // this.foregroundlayer.setTileIndexCallback(167, this.resetPlayerPostition, this)
        // this.foregroundlayer.setTileIndexCallback(208, this.doorToLevel2, this)
        this.physics.add.overlap(this.player, this.foregroundlayer)
        this.speedup = false
        this.physics.add.overlap(this.player, this.foregroundlayer, this.getOverlapTileIndex, null, this)
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { frames: [0] }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 5 }],
            frameRate: 15
        });
        this.anims.create({
            key: 'fall',
            frames: [{ key: 'player', frame: 2 }],
            frameRate: 15
        });
        this.player.setCollideWorldBounds(true)
        this.camera = this.cameras.getCamera("")
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.camera.startFollow(this.player)
        this.scoreText = this.add.text(75, 16, "Score: 0", {
            fontSize: "16px",
            color: "#FFFFFF",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        this.healthText = this.add.text(250, 16, "Health: 3", {
            fontSize: "16px",
            color: "#FFFFFF",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        this.gameOverText = this.add.text(125, 125, "", {
            fontSize: "24px",
            color: "#FFFFFF",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        //Assign Keys/Controls
        this.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        this.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.KeyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        this.cursors = this.input.keyboard.createCursorKeys()
    }


    update() {
        //Check arrow keys
        if (this.speedup && !this.gameOver) {
            if (this.cursors.right.isDown || this.KeyD.isDown) {
                this.player.setVelocityX(200)
                this.player.anims.play('walk', true)
                this.player.flipX = false
                this.player.setOffset(7, 0);
            } else if (this.cursors.left.isDown || this.KeyA.isDown) {
                this.player.setVelocityX(-200)
                this.player.anims.play('walk', true)
                this.player.flipX = true
                this.player.setOffset(3, 0);
            } else {
                this.player.setVelocityX(0)
                this.player.anims.play('idle', true)
            }
        }
        if (!this.speedup && !this.gameOver) {
            if (this.cursors.right.isDown || this.KeyD.isDown) {
                this.player.setVelocityX(100)
                this.player.anims.play('walk', true)
                this.player.flipX = false
                this.player.setOffset(7, 0);
            } else if (this.cursors.left.isDown || this.KeyA.isDown) {
                this.player.setVelocityX(-100)
                this.player.anims.play('walk', true)
                this.player.flipX = true
                this.player.setOffset(3, 0);
            } else {
                this.player.setVelocityX(0)
                this.player.anims.play('idle', true)
            }
        }
        //Power Up Effects
        if (this.speedup) {
            this.player.setTint(0x33FFFF)
        }
        if (!this.speedup) {
            this.player.setTint(0xFFFFFF)
        }
        //Check for space bar press
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.jumpCount < 1 && !this.gameOver) {
            this.player.jumpCount++;
            this.player.setVelocityY(-200);
        }
        //Reset jumpCount. Important for double jumping.
        if (this.player.body.touching.down || this.player.body.blocked.down) {
            this.player.jumpCount = 0
        }
        //Display jumping or falling animations
        if (this.player.body.velocity.y < 0) {
            this.player.anims.play('jump', true);
        } else if (this.player.body.velocity.y > 0) {
            this.player.anims.play('fall', true);
        }
        if (this.health <= 0) {
            this.gameOver = true
            this.physics.pause()
            this.player.setTint(0xFF0000)
            this.player.anims.play("fall")
            this.gameOverText.setText("Game Over")
        }
    }
    /**@param {CustomSprite} player */
    /**@param {Phaser.Physics.Arcade.Image} coins*/
    collectCoin(player, coins) {
        coins.disableBody(true, true)
        this.score += 1
        this.scoreText.setText("Score: " + this.score)
        if (this.coins.countActive(true) === 0) {
            //access scene manager
            this.scene.start("Scene2", { score: this.score, health: this.health })
        }

    }
    getOverlapTileIndex(player, tile) {
        console.log(tile.index)

    }
    // resetPlayerPostition(player, tile) {
    //     if (!this.player.takeDamage) {
    //         this.player.setPosition(256, 300)
    //         this.health -= 1
    //         this.healthText.setText("Health: " + this.health)
    //         this.player.takeDamage = true
    //         setTimeout(() => { this.player.takeDamage = false }, 1000);
    //     }

    // }
    // doorToLevel2() {
    //     if (this.KeyEnter.isDown)
    //         setTimeout(() => { this.scene.start("Scene2", { score: this.score, health: this.health }) }, 100);
    // }
  static FindPoint(map, layer, type, name) {
    var loc = map.findObject(layer, function (object) {
      if (object.type === type && object.name === name) {
        return object
      }
    })
    return loc
  }
  static FindPoints(map, layer, type) {
    var locs = map.filterObjects(layer, function (object) {
      if (object.type === type) {
        return object
      }
    })
    return locs
  }


}