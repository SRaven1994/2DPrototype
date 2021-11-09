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
            this.load.image("flying-enemy", "assets/flying-enemy.png")
            this.load.image("health", "assets/health.png")
            this.load.image("items", "assets/items.png")
            this.load.image("normal-enemy", "assets/normal-enemy.png")
            this.load.image("pistol", "assets/pistol.png")
            this.load.image("pistol-ammobox", "assets/pistol-ammobox.png")
            this.load.image("shotgun", "assets/shotgun.png")
            this.load.image("shotgun-ammobox", "assets/shotgun-ammobox.png")
            this.load.image("smg", "assets/smg.png")
            this.load.image("smg-ammobox", "assets/smg-ammobox.png")
            this.load.image("turret", "assets/turret.png")
    }
    CreateBaseLayer(){
        
    }

}