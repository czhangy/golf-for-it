import { defs, tiny } from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

import { GameObject } from './game-object.js';

export class GolfForIt extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            sphere: new defs.Subdivision_Sphere(4),
            cube: new defs.Cube()
        };

        // *** Materials
        this.materials = {
            phong: new Material(new defs.Phong_Shader())
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        // For testing
        let golf_ball = new GameObject();
        golf_ball.renderer.shape = this.shapes.sphere;

        let platform = new GameObject();
        platform.renderer.shape = this.shapes.cube;
        platform.transform.position = vec3(0, -2, 0);
        platform.transform.scale = vec3(10, 1, 10);

        this.game_objects = [golf_ball, platform];
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // The parameters of the Light are: position, color, size
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        for (let i = 0; i < this.game_objects.length; i++) {
            this.physics_update(this.game_objects[i]);
        }

        for (let i = 0; i < this.game_objects.length; i++) {
            this.collider_update(this.game_objects[i]);
        }

        for (let i = 0; i < this.game_objects.length; i++) {
            this.game_objects[i].logic.update();
        }

        for (let i = 0; i < this.game_objects.length; i++) {
            this.renderer_update(context, program_state, model_transform, this.game_objects[i]);
        }

    }

    physics_update(game_object) {

    }

    collider_update(game_object) {

    }

    renderer_update(context, program_state, model_transform, game_object) {
        if (game_object.is_enabled && game_object.renderer.is_enabled) {
            const shape = (game_object.renderer.shape != null) ? game_object.renderer.shape : this.shapes.sphere;
            const material = (game_object.renderer.material != null) ? game_object.renderer.material : this.materials.phong;

            model_transform = model_transform
                .times(Mat4.translation(game_object.transform.position[0], game_object.transform.position[1], game_object.transform.position[2]))
                .times(Mat4.rotation(game_object.transform.rotation[0], 1, 0, 0))
                .times(Mat4.rotation(game_object.transform.rotation[1], 0, 1, 0))
                .times(Mat4.rotation(game_object.transform.rotation[2], 0, 0, 1))
                .times(Mat4.scale(game_object.transform.scale[0], game_object.transform.scale[1], game_object.transform.scale[2]));

            shape.draw(context, program_state, model_transform, material.override({
                color: game_object.renderer.color,
                ambient: game_object.renderer.ambient,
                diffusivity: game_object.renderer.diffusivity,
                specularity: game_object.renderer.specularity,
                smoothness: game_object.renderer.smoothness
            }));
        }
    }
}
