import { defs, tiny } from "./examples/common.js";

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

import { GolfBall } from "./src/golf-ball.js";
import { Ground } from "./src/ground.js";

import { hitBall } from "./src/physics.js";

export class GolfForIt extends Scene {
	constructor() {
		// constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
		super();

		// At the beginning of our program, load one of each of these shape definitions onto the GPU.
		this.shapes = {
			cube: new defs.Cube(),
			sphere: new defs.Subdivision_Sphere(4),
		};

		// *** Materials
		this.materials = {
			default: new Material(new defs.Phong_Shader(), {
				ambient: 0.4,
				diffusivity: 0.6,
				color: hex_color("#ffffff"),
			}),
			ground: new Material(new defs.Phong_Shader(), {
				ambient: 0.4,
				diffusivity: 0.6,
				specularity: 0,
				color: hex_color("#348c31"),
			}),
		};

		this.initial_camera_location = Mat4.look_at(
			vec3(0, 10, 30),
			vec3(0, 0, 0),
			vec3(0, 1, 0)
		);

		// GameObjects
		this.game_objects = {
			golf_ball: new GolfBall(this.shapes, this.materials, true),
			ground: new Ground(this.shapes, this.materials, false),
		};

		this.game_objects.ground.transform.position = vec3(0, -2, 0);
	}

	make_control_panel() {
		// Disable controls when ball is in motion
		this.key_triggered_button("Hit ball", [" "], () => {
			if (this.game_objects.golf_ball.physics.velocity.norm() === 0) {
				hitBall(this.game_objects.golf_ball, 1000);
			}
		});
		this.key_triggered_button("Aim left", ["a"], () => {
			if (this.game_objects.golf_ball.physics.velocity.norm() === 0) {
				this.game_objects.golf_ball.physics.direction += Math.PI / 6;
			}
		});
		this.key_triggered_button("Aim right", ["d"], () => {
			if (this.game_objects.golf_ball.physics.velocity.norm() === 0) {
				this.game_objects.golf_ball.physics.direction -= Math.PI / 6;
			}
		});
	}

	display(context, program_state) {
		// display():  Called once per frame of animation.
		// Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
		if (!context.scratchpad.controls) {
			this.children.push(
				(context.scratchpad.controls = new defs.Movement_Controls())
			);
			// Define the global camera and projection matrices, which are stored in program_state.
			program_state.set_camera(this.initial_camera_location);
		}

		program_state.projection_transform = Mat4.perspective(
			Math.PI / 4,
			context.width / context.height,
			0.1,
			1000
		);

		// The parameters of the Light are: position, color, size
		const light_position = vec4(0, 5, 5, 1);
		program_state.lights = [
			new Light(light_position, color(1, 1, 1, 1), 1000),
		];

		const t = program_state.animation_time / 1000,
			dt = program_state.animation_delta_time / 1000;
		let model_transform = Mat4.identity();

		Object.values(this.game_objects).forEach((val) =>
			val.physics.update(dt)
		);
		Object.values(this.game_objects).forEach((val) =>
			val.collider.update()
		);
		Object.values(this.game_objects).forEach((val) => val.logic.update());
		Object.values(this.game_objects).forEach((val) =>
			val.renderer.update(context, program_state, model_transform)
		);
	}
}
