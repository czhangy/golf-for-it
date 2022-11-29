import { defs, tiny } from "../examples/common.js";

const {
	Vector,
	Vector3,
	vec,
	vec3,
	vec4,
	color,
	hex_color,
	Shader,
	Matrix,
	Mat4,
	Light,
	Shape,
	Material,
	Scene,
} = tiny;

import { GameObject } from "./game-object.js";

export class GolfBall extends GameObject {
	constructor(shapes, materials, hasPhysics, hasCollision) {
		super(shapes, materials, hasPhysics, hasCollision);
		this.renderer.shape = this.shapes.sphere;
	}
}
