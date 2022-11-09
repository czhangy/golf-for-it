import { defs, tiny } from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class GameObject {
    constructor(shapes, materials) {
        this.is_enabled = true;

        this.transform = {
            position: vec3(0, 0, 0),
            rotation: vec3(0, 0, 0),
            scale: vec3(1, 1, 1)
        };

        this.physics = {
            is_enabled: true,
            velocity: vec3(0, 0, 0),
            acceleration: vec3(0, 0, 0),
            update: () => this.#physics_update()
        };

        this.collider = {
            is_enabled: true,
            colliding_game_objects: null,
            update: () => this.#collider_update()
        };

        this.logic = {
            is_enabled: true,
            update: () => { }
        };

        this.shapes = shapes;

        this.materials = materials;

        this.renderer = {
            is_enabled: true,
            shape: this.shapes.cube,
            material: this.materials.default,
            update: (context, program_state, model_transform) => this.#renderer_update(context, program_state, model_transform)
        };
    }

    #physics_update() {

    }

    #collider_update() {

    }

    #renderer_update(context, program_state, model_transform) {
        if (this.is_enabled && this.renderer.is_enabled) {
            model_transform = model_transform
                .times(Mat4.translation(this.transform.position[0], this.transform.position[1], this.transform.position[2]))
                .times(Mat4.rotation(this.transform.rotation[0], 1, 0, 0))
                .times(Mat4.rotation(this.transform.rotation[1], 0, 1, 0))
                .times(Mat4.rotation(this.transform.rotation[2], 0, 0, 1))
                .times(Mat4.scale(this.transform.scale[0], this.transform.scale[1], this.transform.scale[2]));

            this.renderer.shape.draw(context, program_state, model_transform, this.renderer.material);
        }
    }
}