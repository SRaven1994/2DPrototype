class SecondScene extends BaseScene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {CustomSprite} */
    player
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
    score
    /**@type {number}*/
    health
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
        super('Scene2')
    }
    /**
     * 
     * @param {object} data 
     */
    init(data) {
        this.score = data.score
        this.health = data.health

    }
    preload() {
        super.preload()
        //load json tile
        this.load.tilemapTiledJSON("level2", "assets/level2.json")
    }
    create() {
        //create tiles
        this.map = this.make.tilemap({ key: "level2" })
        const landscape = this.map.addTilesetImage("landscape-tileset", "landscape-tileset")
        const props = this.map.addTilesetImage("props-tileset", "props-tileset")
        //set world bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        // create background/platform layers
        this.map.createLayer("background", [landscape, props], 0, 0)
        this.map.createLayer("midground", [landscape, props], 0, 0)
        this.map.createLayer("platforms", [landscape, props], 0, 0)
        //Create player
        this.player = new CustomSprite(this, 256, 256, 'player')
        this.player.setSize(14, 24);
        //Collison
        const collisionLayer = this.map.getLayer("platforms").tilemapLayer
        collisionLayer.setCollisionBetween(0, 1000)
        this.physics.add.collider(this.player, collisionLayer)

        //Stars
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
        // add foreground layer
        this.foregroundlayer = this.map.createLayer("foreground", [landscape, props], 0, 0)
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this)
        this.foregroundlayer.setTileIndexCallback(170, this.collectMushroom, this)
        this.foregroundlayer.setTileIndexCallback(167, this.resetPlayerPostition, this)
        this.physics.add.overlap(this.player, this.foregroundlayer)
        this.speedup = false
        //this.physics.add.overlap(this.player, this.foregroundlayer, this.getOverlapTileIndex, null, this)
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 10 }),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 4] }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 3 }],
            frameRate: 15
        });
        this.anims.create({
            key: 'fall',
            frames: [{ key: 'player', frame: 2 }],
            frameRate: 15
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 11, end: 12 }),
            frameRate: 3,
            repeat: -1
        });
        this.player.setCollideWorldBounds(true)
        this.camera = this.cameras.getCamera("")
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.camera.startFollow(this.player)
        this.scoreText = this.add.text(75, 16, "Score: " + this.score, {
            fontSize: "16px",
            color: "#FFFFFF",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        this.healthText = this.add.text(250, 16, "Health: " + this.health, {
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
        //Assign Keys
        this.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        this.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.KeyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        //Enable cursors
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
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.jumpCount < 2 && !this.gameOver) {
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
        if(this.health <= 0){
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

    }
    getOverlapTileIndex(player, tile) {
        console.log(tile.index)

    }
    collectMushroom(player, tile) {
        if (this.KeyEnter.isDown) {
            this.foregroundlayer.removeTileAt(tile.x, tile.y)
            this.speedup = true
            setTimeout(() => { this.speedup = false }, 5000);
        }

    }
    resetPlayerPostition(player, tile) {
        if (!this.player.takeDamage) {
            this.player.setPosition(256, 300)
            this.health -= 1
            this.healthText.setText("Health: " + this.health)
            this.player.takeDamage = true
            setTimeout(() => { this.player.takeDamage = false }, 1000);
        }

    }



}