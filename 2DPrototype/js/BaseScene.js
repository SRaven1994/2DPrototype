class BaseScene extends Phaser.Scene{
    constructor(id){
        super(id)
    }
    preload(){
            //Load assets
            this.load.image("grass-building-tileset", "assets/grass-building-tileset.png")
            this.load.image("grass-sky-tileset", "assets/grass-sky-tileset.png")
            this.load.image("props-tileset", "assets/props-tileset.png")
            this.load.spritesheet("player", "assets/player2.png", { frameWidth: 16, frameHeight: 16})
            this.load.image("Coin", "assets/coin.png")
            this.load.image("bullet", "assets/bullet.png")
            this.load.spritesheet("flyingEnemy", "assets/flying-enemy.png", { frameWidth: 16, frameHeight: 16})
            this.load.image("health", "assets/health.png")
            this.load.image("items", "assets/items.png")
            this.load.spritesheet("normalEnemy", "assets/normal-enemy.png", { frameWidth: 16, frameHeight: 16})
            this.load.image("pistol", "assets/pistol.png")
            this.load.image("pistolAmmobox", "assets/pistol-ammobox.png")
            this.load.image("shotgun", "assets/shotgun.png")
            this.load.image("shotgunAmmobox", "assets/shotgun-ammobox.png")
            this.load.image("smg", "assets/smg.png")
            this.load.image("smgAmmobox", "assets/smg-ammobox.png")
            this.load.image("turret", "assets/turret.png")
    }
    CreateBaseLayer(){
        
    }

}