import MD2Character from './Character';
import { config } from './Constants';

export default class Enemy {
	constructor(scene, data) {
		this.isAnimated = false;
		this.timer = null;
		this.character = new MD2Character();
		this.character.scale = 0.4;
		this.character.loadParts(config);
		this.character.root.position.y = data.position.y;
		this.character.root.position.x = data.position.x;
		this.character.root.position.z = data.position.z;
		scene.add(this.character.root);
	}

	update(data) {
		if(data.position) {
			if(!data.rotation) {
				clearTimeout(this.timer);
				if (!this.isAnimated) {
					this.character.setAnimation(this.character.meshBody.geometry.animations[1].name);
					this.isAnimated = true;
				}
				this.timer = setTimeout(() => {
					this.character.setAnimation(this.character.meshBody.geometry.animations[0].name);
					this.isAnimated = false;
				}, 110);
			}
			this.character.root.position.y = data.position.y;
			this.character.root.position.x = data.position.x;
			this.character.root.position.z = data.position.z;
		}
		if (data.rotation) {
			this.character.root.rotation.y = data.rotation.y;
		}
	}
}
