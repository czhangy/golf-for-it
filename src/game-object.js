import { defs, tiny } from "../examples/common.js";
import {
	applyFriction,
	calculatePosition,
	calculateVelocity,
} from "./physics.js";

import { isColliding } from "./collision.js";

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

export class GameObject {
	constructor(shapes, materials, hasPhysics, hasCollision) {
		this.is_enabled = true;

		this.transform = {
			position: vec3(0, 0, 0),
			rotation: vec3(0, 0, 0),
			scale: vec3(1, 1, 1),
			model_transform: Mat4.identity(),
		};

		this.physics = {
			is_enabled: hasPhysics,
			velocity: vec3(0, 0, 0),
			acceleration: vec3(0, 0, 0),
			direction: 0,
			update: (dt) => this.#physics_update(dt),
		};

		this.collider = {
			is_enabled: hasCollision,
			colliding_game_objects: null,
			update: (gameObjects) => this.#collider_update(gameObjects),
		};

		this.logic = {
			is_enabled: true,
			update: () => {},
		};

		this.shapes = shapes;

		this.materials = materials;

		this.renderer = {
			is_enabled: true,
			shape: this.shapes.cube,
			material: this.materials.default,
			update: (context, program_state, model_transform) =>
				this.#renderer_update(context, program_state, model_transform),
		};
	}

	#physics_update(dt) {
		if (this.physics.is_enabled) {
			applyFriction(this);
			calculateVelocity(this, dt);
			calculatePosition(this, dt);
		}
	}

	#collider_update(gameObjects) {
		if (this.collider.is_enabled) {
			Object.values(gameObjects).forEach((object) => {
				if (object !== this && isColliding(this, object)) {
					console.log("collide!");
				}
			});
		}
	}

	#renderer_update(context, program_state, model_transform) {
		if (this.is_enabled && this.renderer.is_enabled) {
			model_transform = model_transform
				.times(
					Mat4.translation(
						this.transform.position[0],
						this.transform.position[1],
						this.transform.position[2]
					)
				)
				.times(Mat4.rotation(this.transform.rotation[0], 1, 0, 0))
				.times(Mat4.rotation(this.transform.rotation[1], 0, 1, 0))
				.times(Mat4.rotation(this.transform.rotation[2], 0, 0, 1))
				.times(
					Mat4.scale(
						this.transform.scale[0],
						this.transform.scale[1],
						this.transform.scale[2]
					)
				);
			this.transform.model_transform = model_transform;
			this.renderer.shape.draw(
				context,
				program_state,
				model_transform,
				this.renderer.material
			);
		}
	}
}
