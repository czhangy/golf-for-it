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
			golf_ball: new GolfBall(this.shapes, this.materials, true, true),
			ground: new Ground(this.shapes, this.materials, false, false),
			wall: new Ground(this.shapes, this.materials, false, false),
		};

		this.game_objects.wall.transform.scale = vec3(1, 1, 1);
		this.game_objects.wall.transform.position = vec3(0, 0, -2);

		this.game_objects.ground.transform.position = vec3(0, -2, 0);

		// Settings
		this.aimSensitivity = Math.PI / 6;
		this.power = 1000;
	}

	make_control_panel() {
		// Disable controls when ball is in motion
		this.key_triggered_button("Hit ball", [" "], () => {
			if (this.game_objects.golf_ball.physics.velocity.norm() === 0) {
				hitBall(this.game_objects.golf_ball, this.power);
			}
		});
		this.key_triggered_button("Aim left", ["a"], () => {
			if (this.game_objects.golf_ball.physics.velocity.norm() === 0) {
				this.game_objects.golf_ball.transform.rotation[1] +=
					this.aimSensitivity;
				this.game_objects.golf_ball.physics.direction +=
					this.aimSensitivity;
			}
		});
		this.key_triggered_button("Aim right", ["d"], () => {
			if (this.game_objects.golf_ball.physics.velocity.norm() === 0) {
				this.game_objects.golf_ball.transform.rotation[1] -=
					this.aimSensitivity;
				this.game_objects.golf_ball.physics.direction -=
					this.aimSensitivity;
			}
		});
		this.new_line();
		this.new_line();
		const power_controls = this.control_panel.appendChild(
			document.createElement("span")
		);
		power_controls.style.margin = "30px";
		this.key_triggered_button(
			"Decrease power",
			["s"],
			() => (this.power = Math.max(0, this.power - 100))
		);
		this.live_string((box) => {
			box.textContent = "Power: " + this.power;
		}, power_controls);
		this.key_triggered_button(
			"Increase power",
			["w"],
			() => (this.power = Math.min(2000, this.power + 100))
		);
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
			val.collider.update(this.game_objects)
		);
		Object.values(this.game_objects).forEach((val) => val.logic.update());
		Object.values(this.game_objects).forEach((val) =>
			val.renderer.update(context, program_state, model_transform)
		);

		// Follow ball with camera
		let camera = Mat4.inverse(
			this.game_objects.golf_ball.transform.model_transform.times(
				Mat4.rotation(0.3, -1, 0, 0).times(Mat4.translation(0, 0, 20))
			)
		);
		camera = camera.map((x, i) =>
			Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)
		);
		program_state.set_camera(camera);
	}
}
