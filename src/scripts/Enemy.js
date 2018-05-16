import MD2Character from './Character';
import { config } from './Constants';

export default class Enemy {
	constructor(scene, data) {
		this.character = new MD2Character();
		this.character.scale = 0.4;
		this.character.loadParts(config);
		this.character.onLoadComplete(() => {
			this.character.setSkin(1);
			this.character.setAnimation(this.character.meshBody.geometry.animations[1].name);
			this.character.setWeapon(0);
		});
		this.character.root.position.y = data.position.y;
		this.character.root.position.x = data.position.x;
		this.character.root.position.z = data.position.z;
		scene.add(this.character.root);
	}

	update(data) {
		if(data.position) {
			this.character.root.position.y = data.position.y;
			this.character.root.position.x = data.position.x;
			this.character.root.position.z = data.position.z;
		}
		if (data.rotation) {
			this.character.root.rotation.y = data.rotation.y;
		}
	}
}
