class CustomSprite extends Phaser.Physics.Arcade.Sprite {
  jumpCount = 0
  takeDamage = false
  /**
    * @param {Phaser.Scene} scene
    * @param {number} x
    * @param {number} y
    * @param {string} texture
  */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)
    scene.add.existing(this)
    scene.physics.add.existing(this)
  }
}
class Bullet extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y) {
    super(scene, x, y, "bullet")
    scene.physics.add.existing(this)
  }
  fire(x, y) {
    this.body.reset;
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(-300)
  }
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y <= -32) {
      this.setActive(false);
      this.setVisible(false)
    }

  }


}
class Bullets extends Phaser.Physics.Arcade.Group
{
  constructor (scene){
    super(scene.physics.world, scene)
    scene.physics.add.existing(this)

    this.createMultiple({
      frameQuantity: 10,
      key: "bullet",
      active: false,
      visible: false,
      classType: Bullet

    })
  }
  fireBullet (x, y){
    let bullet = this.getFirstDead(false)
    if (bullet){
      bullet.fire(x, y)
    }
  }

}