import * as THREE from 'three';

const MD2Loader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

MD2Loader.prototype = {

	constructor: THREE.MD2Loader,

	load: function ( url, onLoad, onProgress, onError ) {

		let scope = this;

		let loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			onLoad( scope.parse( buffer ) );

		}, onProgress, onError );

	},

	parse: ( function () {

		let normals = [
			[ -0.525731,  0.000000,  0.850651 ], [ -0.442863,  0.238856,  0.864188 ],
			[ -0.295242,  0.000000,  0.955423 ], [ -0.309017,  0.500000,  0.809017 ],
			[ -0.162460,  0.262866,  0.951056 ], [  0.000000,  0.000000,  1.000000 ],
			[  0.000000,  0.850651,  0.525731 ], [ -0.147621,  0.716567,  0.681718 ],
			[  0.147621,  0.716567,  0.681718 ], [  0.000000,  0.525731,  0.850651 ],
			[  0.309017,  0.500000,  0.809017 ], [  0.525731,  0.000000,  0.850651 ],
			[  0.295242,  0.000000,  0.955423 ], [  0.442863,  0.238856,  0.864188 ],
			[  0.162460,  0.262866,  0.951056 ], [ -0.681718,  0.147621,  0.716567 ],
			[ -0.809017,  0.309017,  0.500000 ], [ -0.587785,  0.425325,  0.688191 ],
			[ -0.850651,  0.525731,  0.000000 ], [ -0.864188,  0.442863,  0.238856 ],
			[ -0.716567,  0.681718,  0.147621 ], [ -0.688191,  0.587785,  0.425325 ],
			[ -0.500000,  0.809017,  0.309017 ], [ -0.238856,  0.864188,  0.442863 ],
			[ -0.425325,  0.688191,  0.587785 ], [ -0.716567,  0.681718, -0.147621 ],
			[ -0.500000,  0.809017, -0.309017 ], [ -0.525731,  0.850651,  0.000000 ],
			[  0.000000,  0.850651, -0.525731 ], [ -0.238856,  0.864188, -0.442863 ],
			[  0.000000,  0.955423, -0.295242 ], [ -0.262866,  0.951056, -0.162460 ],
			[  0.000000,  1.000000,  0.000000 ], [  0.000000,  0.955423,  0.295242 ],
			[ -0.262866,  0.951056,  0.162460 ], [  0.238856,  0.864188,  0.442863 ],
			[  0.262866,  0.951056,  0.162460 ], [  0.500000,  0.809017,  0.309017 ],
			[  0.238856,  0.864188, -0.442863 ], [  0.262866,  0.951056, -0.162460 ],
			[  0.500000,  0.809017, -0.309017 ], [  0.850651,  0.525731,  0.000000 ],
			[  0.716567,  0.681718,  0.147621 ], [  0.716567,  0.681718, -0.147621 ],
			[  0.525731,  0.850651,  0.000000 ], [  0.425325,  0.688191,  0.587785 ],
			[  0.864188,  0.442863,  0.238856 ], [  0.688191,  0.587785,  0.425325 ],
			[  0.809017,  0.309017,  0.500000 ], [  0.681718,  0.147621,  0.716567 ],
			[  0.587785,  0.425325,  0.688191 ], [  0.955423,  0.295242,  0.000000 ],
			[  1.000000,  0.000000,  0.000000 ], [  0.951056,  0.162460,  0.262866 ],
			[  0.850651, -0.525731,  0.000000 ], [  0.955423, -0.295242,  0.000000 ],
			[  0.864188, -0.442863,  0.238856 ], [  0.951056, -0.162460,  0.262866 ],
			[  0.809017, -0.309017,  0.500000 ], [  0.681718, -0.147621,  0.716567 ],
			[  0.850651,  0.000000,  0.525731 ], [  0.864188,  0.442863, -0.238856 ],
			[  0.809017,  0.309017, -0.500000 ], [  0.951056,  0.162460, -0.262866 ],
			[  0.525731,  0.000000, -0.850651 ], [  0.681718,  0.147621, -0.716567 ],
			[  0.681718, -0.147621, -0.716567 ], [  0.850651,  0.000000, -0.525731 ],
			[  0.809017, -0.309017, -0.500000 ], [  0.864188, -0.442863, -0.238856 ],
			[  0.951056, -0.162460, -0.262866 ], [  0.147621,  0.716567, -0.681718 ],
			[  0.309017,  0.500000, -0.809017 ], [  0.425325,  0.688191, -0.587785 ],
			[  0.442863,  0.238856, -0.864188 ], [  0.587785,  0.425325, -0.688191 ],
			[  0.688191,  0.587785, -0.425325 ], [ -0.147621,  0.716567, -0.681718 ],
			[ -0.309017,  0.500000, -0.809017 ], [  0.000000,  0.525731, -0.850651 ],
			[ -0.525731,  0.000000, -0.850651 ], [ -0.442863,  0.238856, -0.864188 ],
			[ -0.295242,  0.000000, -0.955423 ], [ -0.162460,  0.262866, -0.951056 ],
			[  0.000000,  0.000000, -1.000000 ], [  0.295242,  0.000000, -0.955423 ],
			[  0.162460,  0.262866, -0.951056 ], [ -0.442863, -0.238856, -0.864188 ],
			[ -0.309017, -0.500000, -0.809017 ], [ -0.162460, -0.262866, -0.951056 ],
			[  0.000000, -0.850651, -0.525731 ], [ -0.147621, -0.716567, -0.681718 ],
			[  0.147621, -0.716567, -0.681718 ], [  0.000000, -0.525731, -0.850651 ],
			[  0.309017, -0.500000, -0.809017 ], [  0.442863, -0.238856, -0.864188 ],
			[  0.162460, -0.262866, -0.951056 ], [  0.238856, -0.864188, -0.442863 ],
			[  0.500000, -0.809017, -0.309017 ], [  0.425325, -0.688191, -0.587785 ],
			[  0.716567, -0.681718, -0.147621 ], [  0.688191, -0.587785, -0.425325 ],
			[  0.587785, -0.425325, -0.688191 ], [  0.000000, -0.955423, -0.295242 ],
			[  0.000000, -1.000000,  0.000000 ], [  0.262866, -0.951056, -0.162460 ],
			[  0.000000, -0.850651,  0.525731 ], [  0.000000, -0.955423,  0.295242 ],
			[  0.238856, -0.864188,  0.442863 ], [  0.262866, -0.951056,  0.162460 ],
			[  0.500000, -0.809017,  0.309017 ], [  0.716567, -0.681718,  0.147621 ],
			[  0.525731, -0.850651,  0.000000 ], [ -0.238856, -0.864188, -0.442863 ],
			[ -0.500000, -0.809017, -0.309017 ], [ -0.262866, -0.951056, -0.162460 ],
			[ -0.850651, -0.525731,  0.000000 ], [ -0.716567, -0.681718, -0.147621 ],
			[ -0.716567, -0.681718,  0.147621 ], [ -0.525731, -0.850651,  0.000000 ],
			[ -0.500000, -0.809017,  0.309017 ], [ -0.238856, -0.864188,  0.442863 ],
			[ -0.262866, -0.951056,  0.162460 ], [ -0.864188, -0.442863,  0.238856 ],
			[ -0.809017, -0.309017,  0.500000 ], [ -0.688191, -0.587785,  0.425325 ],
			[ -0.681718, -0.147621,  0.716567 ], [ -0.442863, -0.238856,  0.864188 ],
			[ -0.587785, -0.425325,  0.688191 ], [ -0.309017, -0.500000,  0.809017 ],
			[ -0.147621, -0.716567,  0.681718 ], [ -0.425325, -0.688191,  0.587785 ],
			[ -0.162460, -0.262866,  0.951056 ], [  0.442863, -0.238856,  0.864188 ],
			[  0.162460, -0.262866,  0.951056 ], [  0.309017, -0.500000,  0.809017 ],
			[  0.147621, -0.716567,  0.681718 ], [  0.000000, -0.525731,  0.850651 ],
			[  0.425325, -0.688191,  0.587785 ], [  0.587785, -0.425325,  0.688191 ],
			[  0.688191, -0.587785,  0.425325 ], [ -0.955423,  0.295242,  0.000000 ],
			[ -0.951056,  0.162460,  0.262866 ], [ -1.000000,  0.000000,  0.000000 ],
			[ -0.850651,  0.000000,  0.525731 ], [ -0.955423, -0.295242,  0.000000 ],
			[ -0.951056, -0.162460,  0.262866 ], [ -0.864188,  0.442863, -0.238856 ],
			[ -0.951056,  0.162460, -0.262866 ], [ -0.809017,  0.309017, -0.500000 ],
			[ -0.864188, -0.442863, -0.238856 ], [ -0.951056, -0.162460, -0.262866 ],
			[ -0.809017, -0.309017, -0.500000 ], [ -0.681718,  0.147621, -0.716567 ],
			[ -0.681718, -0.147621, -0.716567 ], [ -0.850651,  0.000000, -0.525731 ],
			[ -0.688191,  0.587785, -0.425325 ], [ -0.587785,  0.425325, -0.688191 ],
			[ -0.425325,  0.688191, -0.587785 ], [ -0.425325, -0.688191, -0.587785 ],
			[ -0.587785, -0.425325, -0.688191 ], [ -0.688191, -0.587785, -0.425325 ]
		];

		return function ( buffer ) {


			let data = new DataView( buffer );

			// http://tfc.duke.free.fr/coding/md2-specs-en.html

			let header = {};
			let headerNames = [
				'ident', 'version',
				'skinwidth', 'skinheight',
				'framesize',
				'num_skins', 'num_vertices', 'num_st', 'num_tris', 'num_glcmds', 'num_frames',
				'offset_skins', 'offset_st', 'offset_tris', 'offset_frames', 'offset_glcmds', 'offset_end'
			];

			for ( let i = 0; i < headerNames.length; i ++ ) {

				header[ headerNames[ i ] ] = data.getInt32( i * 4, true );

			}

			if ( header.ident !== 844121161 || header.version !== 8 ) {
				return;
			}

			if ( header.offset_end !== data.byteLength ) {
				return;
			}

			let geometry = new THREE.Geometry();
			let uvs = [];
			let offset = header.offset_st;

			for ( let i = 0, l = header.num_st; i < l; i ++ ) {

				let u = data.getInt16( offset + 0, true );
				let v = data.getInt16( offset + 2, true );

				uvs.push( new THREE.Vector2( u / header.skinwidth, 1 - ( v / header.skinheight ) ) );

				offset += 4;

			}

			// triangles

			offset = header.offset_tris;

			for ( let i = 0, l = header.num_tris; i < l; i ++ ) {

				let a = data.getUint16( offset + 0, true );
				let b = data.getUint16( offset + 2, true );
				let c = data.getUint16( offset + 4, true );

				geometry.faces.push( new THREE.Face3( a, b, c ) );

				geometry.faceVertexUvs[ 0 ].push( [
					uvs[ data.getUint16( offset + 6, true ) ],
					uvs[ data.getUint16( offset + 8, true ) ],
					uvs[ data.getUint16( offset + 10, true ) ]
				] );

				offset += 12;

			}

			// frames

			let translation = new THREE.Vector3();
			let scale = new THREE.Vector3();
			let string = [];

			offset = header.offset_frames;

			for ( let i = 0, l = header.num_frames; i < l; i ++ ) {

				scale.set(
					data.getFloat32( offset + 0, true ),
					data.getFloat32( offset + 4, true ),
					data.getFloat32( offset + 8, true )
				);

				translation.set(
					data.getFloat32( offset + 12, true ),
					data.getFloat32( offset + 16, true ),
					data.getFloat32( offset + 20, true )
				);

				offset += 24;

				for ( let j = 0; j < 16; j ++ ) {

					let character = data.getUint8( offset + j, true );
					if ( character === 0 ) break;

					string[ j ] = character;

				}

				let frame = {
					name: String.fromCharCode.apply( null, string ),
					vertices: [],
					normals: []
				};

				offset += 16;

				for ( let j = 0; j < header.num_vertices; j ++ ) {

					let x = data.getUint8( offset ++, true );
					let y = data.getUint8( offset ++, true );
					let z = data.getUint8( offset ++, true );
					let n = normals[ data.getUint8( offset ++, true ) ];

					let vertex = new THREE.Vector3(
						x * scale.x + translation.x,
						z * scale.z + translation.z,
						y * scale.y + translation.y
					);

					let normal = new THREE.Vector3( n[ 0 ], n[ 2 ], n[ 1 ] );

					frame.vertices.push( vertex );
					frame.normals.push( normal );

				}

				geometry.morphTargets.push( frame );

			}

			// Static

			geometry.vertices = geometry.morphTargets[ 0 ].vertices;

			let morphTarget = geometry.morphTargets[ 0 ];

			for ( let j = 0, jl = geometry.faces.length; j < jl; j ++ ) {

				let face = geometry.faces[ j ];

				face.vertexNormals = [
					morphTarget.normals[ face.a ],
					morphTarget.normals[ face.b ],
					morphTarget.normals[ face.c ]
				];

			}


			// Convert to geometry.morphNormals

			for ( let i = 0, l = geometry.morphTargets.length; i < l; i ++ ) {

				let morphTarget = geometry.morphTargets[ i ];
				let vertexNormals = [];

				for ( let j = 0, jl = geometry.faces.length; j < jl; j ++ ) {

					let face = geometry.faces[ j ];

					vertexNormals.push( {
						a: morphTarget.normals[ face.a ],
						b: morphTarget.normals[ face.b ],
						c: morphTarget.normals[ face.c ]
					} );

				}

				geometry.morphNormals.push( { vertexNormals: vertexNormals } );

			}

			geometry.animations = THREE.AnimationClip.CreateClipsFromMorphTargetSequences( geometry.morphTargets, 10 );


			return geometry;

		};

	} )()

};

export default MD2Loader;
