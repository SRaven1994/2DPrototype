class FirstScene extends BaseScene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {CustomSprite} */
    player
    /** @type {object} */
    playerStartPoint
    /** @type {object} */
    bulletsPlayer
    /** @type  {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors
    /** @type  {Phaser.Cameras.Scene2D.Camera} */
    camera
    /**@type {Phaser.Physics.Arcade.StaticGroup} */
    coins
    /**@type {Phaser.Physics.Arcade.StaticGroup} */
    pistolAmmoBox
    /**@type {Phaser.Physics.Arcade.StaticGroup} */
    smgAmmoBox
    /**@type {Phaser.Physics.Arcade.StaticGroup} */
    shotgunAmmoBox        
    /** @type {Phaser.Physics.Arcade.Group} */
    normalEnemies
    /** @type {Phaser.Physics.Arcade.Group} */
    flyingEnemies
    /** @type {Phaser.Physics.Arcade.Collider} */
    EnemiesCollider
    /** @type {Phaser.GameObjects.Text} */
    scoreText
    /** @type {Phaser.GameObjects.Text} */
    healthText
    /** @type {Phaser.GameObjects.Text} */
    gameOverText
    /** @type {Phaser.GameObjects.Text} */
    ammoText
    /** @type {Phaser.GameObjects.Image} */
    instructionScreen
    /** @type {Phaser.GameObjects.Image} */
    endScreen
    /** @type {Phaser.GameObjects.Image} */
    hasKey
    /** @type {Phaser.GameObjects.Image} */
    pistolIcon
    /** @type {Phaser.GameObjects.Image} */
    smgIcon
    /** @type {Phaser.GameObjects.Image} */
    shotgunIcon
    /** @type {number}*/
    pistolAmmo = 10
    /** @type {number}*/
    smgAmmo = 0
    /** @type {number}*/
    shotgunAmmo = 0
    /** @type {number}*/
    score = 0
    /** @type {number}*/
    health = 3
    /** @type {number}*/
    firingMode = 1
    /** @type {boolean} */
    keyCollected = false
    /** @type {boolean} */
    startGame = false
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
    /** @type {Phaser.Input.Keyboard.Key} */
    Key1
    /** @type {Phaser.Input.Keyboard.Key} */
    Key2
    /** @type {Phaser.Input.Keyboard.Key} */
    Key3
    constructor() {
        super('Scene1')
    }
    preload() {
        super.preload()
        // Load json tile
        this.load.tilemapTiledJSON("level1", "assets/level1.json")
    }
    create() {
        // Create Tiles
        this.map = this.make.tilemap({ key: "level1" })
        const landscape = this.map.addTilesetImage("grass-building-tileset", "grass-building-tileset")
        const sky = this.map.addTilesetImage("grass-sky-tileset", "grass-sky-tileset")
        const props = this.map.addTilesetImage("props-tileset", "props-tileset")
        const pickuplayer = this.map.addTilesetImage("items", "items")
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        // Create background/platform layers
        this.map.createLayer("background", [landscape, sky, props, pickuplayer], 0, 0)
        this.map.createLayer("midground", [landscape, sky, props, pickuplayer], 0, 0)
        this.map.createLayer("platforms", [landscape, sky, props, pickuplayer], 0, 0)
        // Create player
        this.playerStartPoint = FirstScene.FindPoint(this.map, "objects", "player", "playerSpawn")
        this.player = new CustomSprite(this, this.playerStartPoint.x, this.playerStartPoint.y, 'player')
        this.player.setSize(16, 16);
        // Collison
        const collisionLayer = this.map.getLayer("platforms").tilemapLayer
        collisionLayer.setCollisionBetween(0, 1000)
        this.physics.add.collider(this.player, collisionLayer)
        // Ammo Spawning
        let pistolPoints = FirstScene.FindPoints(this.map, "objects", "pistol")
        this.pistolAmmoBox = this.physics.add.staticGroup()
        for (let point, i = 0; i < pistolPoints.length; i++) {
            point = pistolPoints[i]
            this.pistolAmmoBox.create(point.x, point.y, "pistolAmmobox")
        }
        this.physics.add.overlap(this.player, this.pistolAmmoBox, this.collectPistolAmmo, null, this)
        let smgPoints = FirstScene.FindPoints(this.map, "objects", "smg")
        this.smgAmmoBox = this.physics.add.staticGroup()
        for (let point, i = 0; i < smgPoints.length; i++){
            point = smgPoints[i]
            this.smgAmmoBox.create(point.x, point.y, "smgAmmobox")
        }
        this.physics.add.overlap(this.player, this.smgAmmoBox, this.collectSmgAmmo, null, this)
        let shotgunPoints = FirstScene.FindPoints(this.map, "objects", "shotgun")
        this.shotgunAmmoBox = this.physics.add.staticGroup()
        for (let point, i = 0; i < shotgunPoints.length; i++){
            point = shotgunPoints[i]
            this.shotgunAmmoBox.create(point.x, point.y, "shotgunAmmobox")
        }
        this.physics.add.overlap(this.player, this.shotgunAmmoBox, this.collectShotgunAmmo, null, this)
        // Bullet
        this.bulletsPlayer = this.physics.add.group({
            defaultKey: "bullet",
            collideWorldBounds: true,
            maxSize: 10000
        })
        this.physics.add.collider(this.bulletsPlayer, collisionLayer, this.destoryBulletCollide, null, this)
        this.physics.world.on('worldbounds', this.worldBoundsBullet, this)
        // Enemy Animations
        this.anims.create({
            key: 'enemywalk',
            frames: this.anims.generateFrameNumbers('normalEnemy', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: "enemyFly",
            frames: this.anims.generateFrameNumbers('flyingEnemy', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        })
        // Spawn Normal Enemies
        this.normalEnemies = this.physics.add.group()
        let normalPoints = FirstScene.FindPoints(this.map, "objects", "normalEnemy")
        let normalLen = normalPoints.length / 2
        let normalSpawn
        let normalDest
        let normalLine
        let normal
        for (let i = 1; i <= normalLen; i++) {
            normalSpawn = FirstScene.FindPoint(this.map, "objects", "normalEnemy", "normalSpawn" + i)
            normalDest = FirstScene.FindPoint(this.map, "objects", "normalEnemy", "normalDest" + i)
            normalLine = new Phaser.Curves.Path(normalSpawn.x, normalSpawn.y).lineTo(normalDest.x, normalDest.y)
            normal = this.add.follower(normalLine, normalSpawn.x, normalSpawn.y, "normalEnemy")
            normal.startFollow({
                duration: Phaser.Math.Between(1500, 2500),
                repeat: -1,
                yoyo: true,
                onYoyo: function () { this.flipX = !this.flipX },
                onRepeat: function () { this.flipX = !this.flipX },
                callbackScope: normal,
                ease: "Sine.easeInOut"
            })
            normal.anims.play("enemywalk", true)
            this.normalEnemies.add(normal)
            normal.body.allowGravity = false
        }
        this.physics.add.overlap(this.bulletsPlayer, this.normalEnemies, this.destoryNormalEnemy, null, this)
        this.EnemiesCollider = this.physics.add.overlap(this.player, this.normalEnemies, this.triggerDamage, null, this)
        // Spawn Flying Enemeis
        this.flyingEnemies = this.physics.add.group()
        let flyingPoints = FirstScene.FindPoints(this.map, "objects", "flyingEnemy")
        let flyingLen = flyingPoints.length / 2
        let flyingSpawn
        let flyingDest
        let flyingLine
        let flying
        for (let i = 1; i <= flyingLen; i++) {
            flyingSpawn = FirstScene.FindPoint(this.map, "objects", "flyingEnemy", "flyingSpawn" + i)
            flyingDest = FirstScene.FindPoint(this.map, "objects", "flyingEnemy", "flyingDest" + i)
            flyingLine = new Phaser.Curves.Path(flyingSpawn.x, flyingSpawn.y).lineTo(flyingDest.x, flyingDest.y)
            flying = this.add.follower(flyingLine, flyingSpawn.x, flyingSpawn.y, "flyingEnemy")
            flying.startFollow({
                duration: Phaser.Math.Between(1500, 2500),
                repeat: -1,
                yoyo: true,
                ease: "Sine.easeInOut"
            })
            flying.anims.play("enemyFly", true)
            this.flyingEnemies.add(flying)
            flying.body.allowGravity = false
        }
        this.EnemiesCollider = this.physics.add.overlap(this.player, this.flyingEnemies, this.triggerDamage, null, this)
        this.physics.add.overlap(this.bulletsPlayer, this.flyingEnemies, this.destoryFlyingEnemy, null, this)
        // Score Items
        let coinPoints = FirstScene.FindPoints(this.map, "objects", "coin")
        this.coins = this.physics.add.staticGroup()
        for (let point, i = 0; i < coinPoints.length; i++) {
            point = coinPoints[i]
            this.coins.create(point.x, point.y, "Coin")
        }
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this)
        // Add Layer
        this.foregroundlayer = this.map.createLayer("foreground", [landscape, sky, props, pickuplayer], 0, 0)
        // Spike Damage Layer
        this.foregroundlayer.setTileIndexCallback(799, this.triggerDamage, this)
        // Exit Level Layer
        this.foregroundlayer.setTileIndexCallback(656, this.exitDoor, this)
        // Collect Key item Layer
        this.foregroundlayer.setTileIndexCallback(634, this.collectKey, this)
        // Collect Speed Up Item Layer
        this.foregroundlayer.setTileIndexCallback(466, this.gainSpeedUp, this)
        // Collect Health Item Layer
        this.foregroundlayer.setTileIndexCallback(467, this.gainHealth, this)
        // Debugging for TileIndex
        this.physics.add.overlap(this.player, this.foregroundlayer)
        this.physics.add.overlap(this.player, this.foregroundlayer, this.getOverlapTileIndex, null, this)
        // Speed Up Default to False
        this.speedup = false
        // Player Animations
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
        // World Boundary
        this.player.setCollideWorldBounds(true)
        // Camera
        this.camera = this.cameras.getCamera("")
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.camera.startFollow(this.player)
        // UI
        this.scoreText = this.add.text(25, 5, "Score: 0", {
            fontSize: "16px",
            color: "#000000",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        this.healthText = this.add.text(25, 45, "Health: 3", {
            fontSize: "16px",
            color: "#000000",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        this.gameOverText = this.add.text(155, 125, "", {
            fontSize: "24px",
            color: "#000000",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        this.ammoText = this.add.text(25, 25, "Ammo : 10", {
            fontSize: "16px",
            color: "#000000",
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontStyle: "bold"
        }).setScrollFactor(0)
        this.add.image(12, 12, "Coin").setScrollFactor(0)
        this.pistolIcon = this.add.image(16, 32, "pistol").setScrollFactor(0)
        this.smgIcon = this.add.image(16, 32, "smg").setScrollFactor(0)
        this.smgIcon.setVisible(false)
        this.shotgunIcon = this.add.image(16, 32, "shotgun").setScrollFactor(0)
        this.shotgunIcon.setVisible(false)
        this.add.image(12, 52, "health").setScrollFactor(0)
        this.instructionScreen = this.add.image(225, 190, "instruction").setScrollFactor(0)
        this.endScreen = this.add.image(225, 190, "endscreen").setScrollFactor(0)
        this.endScreen.setVisible(false)
        this.hasKey = this.add.image(12, 72, "keyUI").setScrollFactor(0)
        this.hasKey.setVisible(false)
        //Assign Keys/Controls
        this.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        this.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.KeyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        this.Key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE)
        this.Key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO)
        this.Key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
        this.input.on('pointerdown', this.fireBullet, this)
        this.cursors = this.input.keyboard.createCursorKeys()
    }


    update() {
        //Check arrow keys
        //Speed Active
        if (this.speedup && !this.gameOver && this.startGame) {
            if (this.cursors.right.isDown || this.KeyD.isDown) {
                this.player.setVelocityX(200)
                this.player.anims.play('walk', true)
                this.player.flipX = false
                this.player.setOffset(0, 0);
            } else if (this.cursors.left.isDown || this.KeyA.isDown) {
                this.player.setVelocityX(-200)
                this.player.anims.play('walk', true)
                this.player.flipX = true
                this.player.setOffset(0, 0);
            } else {
                this.player.setVelocityX(0)
                this.player.anims.play('idle', true)
            }
        }
        // Speed not Active
        if (!this.speedup && !this.gameOver && this.startGame) {
            if (this.cursors.right.isDown || this.KeyD.isDown) {
                this.player.setVelocityX(100)
                this.player.anims.play('walk', true)
                this.player.flipX = false
                this.player.setOffset(0, 0);
            } else if (this.cursors.left.isDown || this.KeyA.isDown) {
                this.player.setVelocityX(-100)
                this.player.anims.play('walk', true)
                this.player.flipX = true
                this.player.setOffset(0, 0);
            } else {
                this.player.setVelocityX(0)
                this.player.anims.play('idle', true)
            }
        }
        //Start Game
        if (this.KeyEnter.isDown && !this.startGame) {
            this.instructionScreen.setVisible(false)
            this.startGame = true
        }
        // Weapon Switching
        if (this.Key1.isDown && this.startGame) {
            this.pistolIcon.setVisible(true)
            this.smgIcon.setVisible(false)
            this.shotgunIcon.setVisible(false)
            this.ammoText.setText("Ammo: " + this.pistolAmmo)
            this.firingMode = 1
        }
        if (this.Key2.isDown && this.startGame) {
            this.pistolIcon.setVisible(false)
            this.smgIcon.setVisible(true)
            this.shotgunIcon.setVisible(false)
            this.ammoText.setText("Ammo: " + this.smgAmmo)
            this.firingMode = 2
        }
        if (this.Key3.isDown && this.startGame) {
            this.pistolIcon.setVisible(false)
            this.smgIcon.setVisible(false)
            this.shotgunIcon.setVisible(true)
            this.ammoText.setText("Ammo: " + this.shotgunAmmo)
            this.firingMode = 3
        }
        // Speed Up Effects
        if (!this.speedup) {
            this.player.setTint(0xffffff)
        }
        if (this.speedup) {
            this.player.setTint(0x33FFFF)
        }
        // Check for space bar press
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.jumpCount < 1 && !this.gameOver) {
            this.player.jumpCount++;
            this.player.setVelocityY(-200);
        }
        // Reset jumpCount. Important for double jumping.
        if (this.player.body.touching.down || this.player.body.blocked.down) {
            this.player.jumpCount = 0
        }
        // Display jumping or falling animations
        if (this.player.body.velocity.y < 0) {
            this.player.anims.play('jump', true);
        } else if (this.player.body.velocity.y > 0) {
            this.player.anims.play('fall', true);
        }
        // Game Over
        if (this.health <= 0) {
            this.gameOver = true
            this.physics.pause()
            this.player.setTint(0xFF0000)
            this.player.anims.play("fall")
            this.gameOverText.setText("Game Over")
        }
    }
    // Add Score
    collectCoin(player, coins) {
        coins.disableBody(true, true)
        this.score += 1
        this.scoreText.setText("Score: " + this.score)
    }
    // Debugging Purposes for foreground tiles
    getOverlapTileIndex(player, tile) {
        console.log(tile.index)
    }
    // Collect Ammo
    collectPistolAmmo(player, pistolAmmoBox) {
        pistolAmmoBox.disableBody(true, true)
        this.pistolAmmo += 5
        if (this.firingMode == 1){
            this.ammoText.setText("Ammo: " + this.pistolAmmo)
        }
        
    }
    collectSmgAmmo(player, smgAmmoBox) {
        smgAmmoBox.disableBody(true, true)
        this.smgAmmo += 5
        if (this.firingMode == 2){
            this.ammoText.setText("Ammo: " + this.smgAmmo)
        }
        
    }
    collectShotgunAmmo(player, shotgunAmmoBox) {
        shotgunAmmoBox.disableBody(true, true)
        this.shotgunAmmo += 5
        if (this.firingMode == 3){
            console.log("Hello")
            this.ammoText.setText("Ammo: " + this.shotgunAmmo)
        }
        
    }
    // Collect Key
    collectKey(player, tile) {
        this.foregroundlayer.removeTileAt(tile.x, tile.y)
        this.keyCollected = true
        this.hasKey.setVisible(true)
    }
    // Add Health
    gainHealth(player, tile) {
        if (this.health < 3) {
            this.foregroundlayer.removeTileAt(tile.x, tile.y)
            this.health += 1
            this.healthText.setText("Health: " + this.health)
        }

    }
    // Fire Bullets
    fireBullet() {
        let bulletPlayer = this.bulletsPlayer.get(this.player.x, this.player.y)
        // Fire Right
        if (bulletPlayer && !this.player.flipX && this.pistolAmmo >= 1 && this.startGame) {
            bulletPlayer.enableBody(false)
            bulletPlayer.setActive(true);
            bulletPlayer.setVisible(true);
            this.physics.velocityFromRotation(bulletPlayer.rotation, 200, bulletPlayer.body.velocity);
            this.pistolAmmo -= 1
            this.ammoText.setText("Ammo: " + this.pistolAmmo)
            bulletPlayer.body.onWorldBounds = true;
            bulletPlayer.body.allowGravity = false
            setTimeout(() => { bulletPlayer.body.allowGravity = true }, 500);
            
            // Fire Left    
        } else if (this.pistolAmmo >= 1 && this.startGame) {
            bulletPlayer.enableBody(false)
            bulletPlayer.setActive(true);
            bulletPlayer.setVisible(true);
            this.physics.velocityFromRotation(bulletPlayer.rotation, -200, bulletPlayer.body.velocity);
            this.pistolAmmo -= 1
            this.ammoText.setText("Ammo: " + this.pistolAmmo)
            bulletPlayer.body.onWorldBounds = true;
            bulletPlayer.body.allowGravity = false
            setTimeout(() => { bulletPlayer.body.allowGravity = true }, 500);
            
        }
    }
    // Decrease Health
    triggerDamage(player, tile) {
        if (!this.player.takeDamage) {
            this.health -= 1
            this.healthText.setText("Health: " + this.health)
            this.player.takeDamage = true
            setTimeout(() => { this.player.takeDamage = false }, 1000);
        }
    }
    // Enable Speed Up
    gainSpeedUp(player, tile) {
        if (!this.speedup) {
            this.foregroundlayer.removeTileAt(tile.x, tile.y)
            this.speedup = true
            setTimeout(() => { this.speedup = false }, 5000);
        }

    }
    // Destory Enemies
    destoryNormalEnemy(bulletPlayer, normalEnemies) {
        bulletPlayer.disableBody(true, true)
        this.bulletsPlayer.killAndHide(bulletPlayer)
        this.normalEnemies.remove(normalEnemies, true, true)
    }
    destoryFlyingEnemy(bulletPlayer, flyingEnemies) {
        bulletPlayer.disableBody(true, true)
        this.bulletsPlayer.killAndHide(bulletPlayer)
        this.flyingEnemies.remove(flyingEnemies, true, true)
    }
    // Destory Bullet on Platform
    destoryBulletCollide(bulletPlayer, collisionLayer) {
        bulletPlayer.disableBody(true, true)
    }
    // Destory Bullet on World Bound
    worldBoundsBullet(body) {
        body.gameObject.disableBody(true, true)
    }
    // Level Complete
    exitDoor() {
        if (this.KeyEnter.isDown && this.keyCollected) {
            this.gameOver = true
            this.endScreen.setVisible(true)
            this.hasKey.setVisible(false)
            this.keyCollected = false
        }
    }
    // Spawn Objects on Point
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