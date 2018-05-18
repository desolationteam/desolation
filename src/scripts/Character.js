import * as THREE from 'three';
import MD2Loader from './CharacterLoader';

const MD2Character = function () {

	let scope = this;

	this.scale = 1;
	this.animationFPS = 6;

	this.root = new THREE.Object3D();

	this.meshBody = null;
	this.meshWeapon = null;

	this.skinsBody = [];
	this.skinsWeapon = [];

	this.weapons = [];

	this.activeAnimation = null;

	this.mixer = null;

	this.onLoadComplete = function () {};

	this.loadCounter = 0;

	this.loadParts = function ( config) {
		this.loadCounter = config.weapons.length * 2 + config.skins.length + 1;

		let weaponsTextures = [];
		for ( let i = 0; i < config.weapons.length; i ++ ) weaponsTextures[ i ] = config.weapons[ i ][ 1 ];
		// SKINS

		this.skinsBody = loadTextures( './textures/', config.skins );
		this.skinsWeapon = loadTextures('./textures/', weaponsTextures );

		// BODY

		let loader = new MD2Loader();

		loader.load('./models/' + config.body, function( geo ) {

			geo.computeBoundingBox();


			let mesh = createPart( geo, scope.skinsBody[ 0 ] );
			mesh.scale.set( scope.scale, scope.scale, scope.scale );

			scope.root.add( mesh );

			scope.meshBody = mesh;

			scope.meshBody.clipOffset = 0;
			scope.activeAnimationClipName = mesh.geometry.animations[0].name;

			scope.mixer = new THREE.AnimationMixer( mesh );

			checkLoadingComplete();

		} );

		// WEAPONS

		let generateCallback = function ( index, name ) {
			return function( geo ) {

				let mesh = createPart( geo, scope.skinsWeapon[ index ] );
				mesh.scale.set( scope.scale, scope.scale, scope.scale );
				mesh.visible = false;

				mesh.name = name;

				scope.root.add( mesh );

				scope.weapons[ index ] = mesh;
				scope.meshWeapon = mesh;

				checkLoadingComplete();
			};
		};

		for ( let i = 0; i < config.weapons.length; i ++ ) {
			loader.load('./models/' + config.weapons[ i ][ 0 ], generateCallback( i, config.weapons[ i ][ 0 ] ) );
		}
	};

	this.setPlaybackRate = function ( rate ) {

		if( rate !== 0 ) {
			this.mixer.timeScale = 1 / rate;
		}
		else {
			this.mixer.timeScale = 0;
		}

	};

	this.setWireframe = function ( wireframeEnabled ) {

		if ( wireframeEnabled ) {

			if ( this.meshBody ) this.meshBody.material = this.meshBody.materialWireframe;
			if ( this.meshWeapon ) this.meshWeapon.material = this.meshWeapon.materialWireframe;

		} else {

			if ( this.meshBody ) this.meshBody.material = this.meshBody.materialTexture;
			if ( this.meshWeapon ) this.meshWeapon.material = this.meshWeapon.materialTexture;

		}

	};

	this.setSkin = function( index ) {

		if ( this.meshBody && this.meshBody.material.wireframe === false ) {

			this.meshBody.material.map = this.skinsBody[ index ];

		}

	};

	this.setWeapon = function ( index ) {

		for ( let i = 0; i < this.weapons.length; i ++ ) this.weapons[ i ].visible = false;

		let activeWeapon = this.weapons[ index ];

		if ( activeWeapon ) {

			activeWeapon.visible = true;
			this.meshWeapon = activeWeapon;

			scope.syncWeaponAnimation();

		}

	};

	this.setAnimation = function ( clipName ) {

		if ( this.meshBody ) {

			if( this.meshBody.activeAction ) {
				this.meshBody.activeAction.stop();
				this.meshBody.activeAction = null;
			}

			let action = this.mixer.clipAction( clipName, this.meshBody );
			if( action ) {

				this.meshBody.activeAction = action.play();

			}

		}

		scope.activeClipName = clipName;

		scope.syncWeaponAnimation();

	};

	this.syncWeaponAnimation = function() {

		let clipName = scope.activeClipName;

		if ( scope.meshWeapon ) {

			if( this.meshWeapon.activeAction ) {
				this.meshWeapon.activeAction.stop();
				this.meshWeapon.activeAction = null;
			}

			let action = this.mixer.clipAction( clipName, this.meshWeapon );
			if( action ) {

				this.meshWeapon.activeAction =
					action.syncWith( this.meshBody.activeAction ).play();

			}

		}

	};

	this.update = function ( delta ) {

		if( this.mixer ) this.mixer.update( delta );

	};

	function loadTextures( baseUrl, textureUrls ) {

		let textureLoader = new THREE.TextureLoader();
		let textures = [];

		for ( let i = 0; i < textureUrls.length; i ++ ) {

			textures[ i ] = textureLoader.load( baseUrl + textureUrls[ i ], checkLoadingComplete );
			textures[ i ].mapping = THREE.UVMapping;
			textures[ i ].name = textureUrls[ i ];

		}

		return textures;

	}

	function createPart( geometry, skinMap ) {

		let materialWireframe = new THREE.MeshLambertMaterial( { color: 0xffaa00, wireframe: true, morphTargets: true, morphNormals: true } );
		let materialTexture = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false, map: skinMap, morphTargets: true, morphNormals: true } );

		//

		let mesh = new THREE.Mesh( geometry, materialTexture );
		mesh.rotation.y = - Math.PI / 2;

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		//

		mesh.materialTexture = materialTexture;
		mesh.materialWireframe = materialWireframe;

		return mesh;

	}

	function checkLoadingComplete() {

		scope.loadCounter -= 1;

		if ( scope.loadCounter === 0 ) scope.onLoadComplete();

	}

};

export default MD2Character;
