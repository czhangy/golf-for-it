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
    Texture
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
			obstacle2: new GameObject({
				size: vec3(2, 2, 5), 
				position: vec3(12, 1, -25),
				material: this.materials.obstacle,
			}),
			left_wall: new GameObject({
				size: vec3(1, 2, 35),
				position: vec3(-10, 1, -10),
				material: this.materials.obstacle,
			}),
			right_wall: new GameObject({
				size: vec3(1, 2, 17),
				position: vec3(10, 1, 7),
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
				size: vec3(1, 2, 18),
				position: vec3(50, 1, -27),
				material: this.materials.obstacle,
			}),
			front_wall: new GameObject({
				size:vec3(11, 2, 1),
				position: vec3(0, 1, 25),
				material: this.materials.obstacle,
			}),
      sky_north: new GameObject({
                size: vec3(100, 100, 1),
                position: vec3(0, 0, -100),
                material: this.materials.sky,
                has_collider: false
            }),
            sky_east: new GameObject({
                size: vec3(1, 100, 100),
                position: vec3(100, 0, 0),
                material: this.materials.sky,
                has_collider: false
            }),
            sky_south: new GameObject({
                size: vec3(100, 100, 1),
                position: vec3(0, 0, 100),
                material: this.materials.sky,
                has_collider: false
            }),
            sky_west: new GameObject({
                size: vec3(1, 100, 100),
                position: vec3(-100, 0, 0),
                material: this.materials.sky,
                has_collider: false
            }),
            goal: new GameObject({
                size: vec3(1.5, 1.5, 1.5),
                position: vec3(20, 0.75, -25),
                material: this.materials.goal,
                is_trigger: true
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
		this.first_score_string = "No scores yet! Be the first!";
		this.second_score_string = null;
		this.third_score_string = null;
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

			// Score strings
			if (this.first_score > 1){
				this.first_score_string =  `#1: ${this.first_score} strokes`;
				}
				else if (this.first_score == 1){
					this.first_score_string =  `#1: ${this.first_score} stroke`;
				}
			else{
				this.first_score_string = "";
			}
			if (this.second_score > 1){
				this.second_score_string =  `\n#2: ${this.second_score} strokes`;
				}
			else if (this.second_score == 1){
					this.second_score_string =  `\n#2: ${this.second_score} stroke`;
				}
			else{
				this.second_score_string = "";
			}
			if (this.third_score > 1){
				this.third_score_string =  `\n#3: ${this.third_score} strokes`;
				}
			else if (this.third_score == 1){
					this.third_score_string =  `\n#3: ${this.third_score} stroke`;
				}
			else{
				this.third_score_string = "";
			}

        };
    }

    make_control_panel() {
        // Stroke count
        const stroke_count = this.control_panel.appendChild(
            document.createElement("span")
        );
        stroke_count.style.margin = "25px";
        stroke_count.style.display = "flex";
        stroke_count.style.justifyContent = "center";
        this.live_string((box) => {
            box.textContent = "Strokes: " + this.strokeCount;
        }, stroke_count);


        // Hitting + aiming controls
        const hitting_controls = this.control_panel.appendChild(
            document.createElement("span")
        );
        hitting_controls.style.margin = "0 25px";
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
		power_controls.style.margin = "25px";
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
		
		// Reset control
		const reset_control = this.control_panel.appendChild(document.createElement("span"));
		reset_control.style.margin = "25px";
		reset_control.style.display = "flex";
		reset_control.style.justifyContent = "center";
		this.key_triggered_button(
			"Reset ball",
			["r"],
			() => (this.game_objects.golf_ball = new GameObject({
				has_rigidbody: true,
				shape: this.shapes.sphere,
			})),
			undefined,
			undefined,
			undefined,
			reset_control
		);


        // Scoreboard
        const scoreboard = this.control_panel.appendChild(
            document.createElement("div")
        );
        scoreboard.style.display = "flex";
        scoreboard.style.flexDirection = "column";
        scoreboard.style.alignItems = "center";
        scoreboard.style.margin = "0 25px";
        scoreboard.style.border = "2px solid black";
        scoreboard.style.padding = "10px";
        this.live_string((box) => {
            box.textContent = "Scoreboard";
            box.style.marginBottom = "10px";
        }, scoreboard);
		this.live_string((box) => {
			box.textContent = this.first_score_string;
			box.style.marginBottom = "5px";
		}, scoreboard);
		this.live_string((box) => {
			box.textContent = this.second_score_string;
			box.style.marginBottom = "5px";
		}, scoreboard);
		this.live_string((box) => {
			box.textContent = this.third_score_string;
			box.style.marginBottom = "5px";
		}, scoreboard);
       

        // Game status
        this.is_game_done = false;
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

        if (!this.is_game_done) {
            if (test_collision(this.game_objects.golf_ball, this.game_objects.goal) != null) {
                this.end_game();
            }
        } else {
            this.celebrate(dt);
        }
	

		// Zoom out texture
		this.game_objects.ground.renderer.shape.arrays.texture_coord.forEach(
             (v, i, l) => l[i] = vec(v[0]*20, v[1]*20)
            );


        update_physics(this.game_objects, dt);
        render_game_objects(context, program_state, this.game_objects);

        this.make_camera_follow_ball(program_state);
    }


    end_game() {
        this.is_game_done = true;
		this.computeScoreboard(this.strokeCount);

    }

    celebrate(dt) {
        let goal = this.game_objects.goal;
        goal.transform.position = vec3(goal.transform.position[0], goal.transform.position[1] + dt * 0.25, goal.transform.position[2]);
        goal.transform.rotation = vec3(goal.transform.rotation[0], goal.transform.rotation[1] + dt * 20, goal.transform.rotation[2]);
        if (goal.transform.size[0] > 0.01) {
            goal.transform.size = vec3(goal.transform.size[0] - dt * 0.2, goal.transform.size[0] - dt * 0.2, goal.transform.size[0] - dt * 0.2);
        } else {
            goal.is_enabled = false;
			// reset ball
		this.game_objects.golf_ball = new GameObject({
				has_rigidbody: true,
				shape: this.shapes.sphere,
			});
		// reset goal - wait for animation to end, + new goal not appearing
		this.game_objects.goal = new GameObject({
                size: vec3(1.5, 1.5, 1.5),
                position: vec3(20, 0.75, -25),
                material: this.materials.goal,
                is_trigger: true
		});

		//reset stroke count
		this.strokeCount = 0

		// reset power level
		this.power = 2000;

		// reset game
		this.is_game_done = false;
        }
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
