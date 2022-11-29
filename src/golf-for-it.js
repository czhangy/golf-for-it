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

import { Shapes, Materials, GameObject } from "./game-object.js";
import { update_physics, hitBall } from "./physics.js";
import { test_collision } from "./collision.js";
import { render_game_objects } from "./renderer.js";

export class GolfForIt extends Scene {
	constructor() {
		// constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
		super();

		// At the beginning of our program, load one of each of these shape definitions onto the GPU.
		this.shapes = Shapes;

		// *** Materials
		this.materials = Materials;

		this.initial_camera_location = Mat4.look_at(
			vec3(0, 10, 30),
			vec3(0, 0, 0),
			vec3(0, 1, 0)
		);

		// GameObjects
		this.game_objects = {
			golf_ball: new GameObject({
				has_rigidbody: true,
				shape: this.shapes.sphere,
			}),
			ground: new GameObject({
				size: vec3(100, 1, 100),
				position: vec3(0, -2, 0),
				material: this.materials.ground,
			}),
			obstacle: new GameObject({
				size: vec3(2, 2, 2),
				position: vec3(0, 1, -20),
				material: this.materials.obstacle,
			}),
			left_wall: new GameObject({
				size: vec3(1, 2, 30),
				position: vec3(-10, 1, -15),
				material: this.materials.obstacle,
			}),
			right_wall: new GameObject({
				size: vec3(1, 2, 12),
				position: vec3(10, 1, 2),
				material: this.materials.obstacle,
			}),
			left_wall2: new GameObject({
				size: vec3(30, 2, 1),
				position: vec3(20, 1, -44),
				material: this.materials.obstacle,
			}),
			right_wall2: new GameObject({
				size: vec3(21, 2, 1),
				position: vec3(30, 1, -10),
				material: this.materials.obstacle,
			}),
			back_wall: new GameObject({
				size: vec3(1, 2, 17),
				position: vec3(50, 1, -27),
				material: this.materials.obstacle,
			}),
		};

		// Settings
		this.aimSensitivity = Math.PI / 60;
		this.power = 2000;
		this.strokeCount = 0;

		// Score tracking
		this.first_score = null;
		this.second_score = null;
		this.third_score = null;
		this.computeScoreboard = (score) => {
			if (!this.first_score || score < this.first_score) {
				this.third_score = this.second_score;
				this.second_score = this.first_score;
				this.first_score = score;
			} else if (!this.second_score || score < this.second_score) {
				this.third_score = this.second_score;
				this.second_score = score;
			} else if (!this.third_score || score < this.third_score) {
				this.third_score = score;
			}
		};
	}

	make_control_panel() {
		// Stroke count
		const stroke_count = this.control_panel.appendChild(
			document.createElement("span")
		);
		stroke_count.style.margin = "30px";
		stroke_count.style.display = "flex";
		stroke_count.style.justifyContent = "center";
		this.live_string((box) => {
			box.textContent = "Strokes: " + this.strokeCount;
		}, stroke_count);

		// Hitting + aiming controls
		const hitting_controls = this.control_panel.appendChild(
			document.createElement("span")
		);
		hitting_controls.style.margin = "0 30px";
		hitting_controls.style.display = "flex";
		hitting_controls.style.justifyContent = "space-between";
		this.key_triggered_button(
			"Aim left",
			["a"],
			() => {
				if (
					this.game_objects.golf_ball.rigidbody.velocity.norm() === 0
				) {
					this.game_objects.golf_ball.transform.rotation[1] +=
						this.aimSensitivity;
				}
			},
			undefined,
			undefined,
			undefined,
			hitting_controls
		);
		this.key_triggered_button(
			"Hit ball",
			[" "],
			() => {
				if (
					this.game_objects.golf_ball.rigidbody.velocity.norm() === 0
				) {
					hitBall(this.game_objects.golf_ball, this.power);
					this.strokeCount++;
				}
			},
			undefined,
			undefined,
			undefined,
			hitting_controls
		);
		this.key_triggered_button(
			"Aim right",
			["d"],
			() => {
				if (
					this.game_objects.golf_ball.rigidbody.velocity.norm() === 0
				) {
					this.game_objects.golf_ball.transform.rotation[1] -=
						this.aimSensitivity;
				}
			},
			undefined,
			undefined,
			undefined,
			hitting_controls
		);

		// Power controls
		const power_controls = this.control_panel.appendChild(
			document.createElement("span")
		);
		power_controls.style.margin = "30px";
		power_controls.style.display = "flex";
		power_controls.style.justifyContent = "space-between";
		power_controls.style.alignItems = "center";
		this.key_triggered_button(
			"Decrease power",
			["s"],
			() => (this.power = Math.max(0, this.power - 100)),
			undefined,
			undefined,
			undefined,
			power_controls
		);
		this.live_string((box) => {
			box.textContent = "Power: " + this.power;
		}, power_controls);
		this.key_triggered_button(
			"Increase power",
			["w"],
			() => (this.power = Math.min(4000, this.power + 100)),
			undefined,
			undefined,
			undefined,
			power_controls
		);

		// Scoreboard
		const scoreboard = this.control_panel.appendChild(
			document.createElement("div")
		);
		scoreboard.style.display = "flex";
		scoreboard.style.flexDirection = "column";
		scoreboard.style.alignItems = "center";
		scoreboard.style.margin = "0 30px";
		scoreboard.style.border = "2px solid black";
		scoreboard.style.padding = "20px";
		this.live_string((box) => {
			box.textContent = "Scoreboard";
			box.style.marginBottom = "10px";
		}, scoreboard);
		if (this.first_score) {
			this.live_string((box) => {
				box.textContent = `#1: ${this.first_score} strokes`;
				box.style.marginBottom = "10px";
			}, scoreboard);
		} else {
			this.live_string((box) => {
				box.textContent = "No scores yet! Be the first!";
			}, scoreboard);
		}
		if (this.second_score) {
			this.live_string((box) => {
				box.textContent = `#2: ${this.second_score} strokes`;
				box.style.marginBottom = "10px";
			}, scoreboard);
		}
		if (this.second_score) {
			this.live_string((box) => {
				box.textContent = `#3: ${this.third_score} strokes`;
			}, scoreboard);
		}
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

		update_physics(this.game_objects, dt);
		render_game_objects(context, program_state, this.game_objects);

		this.make_camera_follow_ball(program_state);
	}

	make_camera_follow_ball(program_state) {
		let golf_ball_transform = this.game_objects.golf_ball.transform;
		let model_transform = Mat4.identity()
			.times(
				Mat4.translation(
					golf_ball_transform.position[0],
					golf_ball_transform.position[1],
					golf_ball_transform.position[2]
				)
			)
			.times(Mat4.rotation(golf_ball_transform.rotation[0], 1, 0, 0))
			.times(Mat4.rotation(golf_ball_transform.rotation[1], 0, 1, 0))
			.times(Mat4.rotation(golf_ball_transform.rotation[2], 0, 0, 1));
		let camera = Mat4.inverse(
			model_transform.times(
				Mat4.rotation(0.3, -1, 0, 0).times(Mat4.translation(0, 0, 20))
			)
		);
		camera = camera.map((x, i) =>
			Vector.from(program_state.camera_inverse[i]).mix(x, 0.3)
		);
		program_state.set_camera(camera);
	}
}
