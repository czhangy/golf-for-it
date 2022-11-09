import { defs, tiny } from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class GameObject {
    constructor() {
        this.is_enabled = true;

        this.transform = {
            position: vec3(0, 0, 0),
            rotation: vec3(0, 0, 0),
            scale: vec3(1, 1, 1)
        };

        this.physics = {
            is_enabled: true,
            velocity: vec3(0, 0, 0),
            acceleration: vec3(0, 0, 0)
        };

        this.collider = {
            is_enabled: true,
            colliding_game_objects: null
        };

        this.logic = {
            is_enabled: true,
            update: () => null
        };

        this.renderer = {
            is_enabled: true,
            shape: null,
            material: null,
            color: hex_color("#ffffff"),
            ambient: 0.4,
            diffusivity: 0.6,
            specularity: 0.6,
            smoothness: 40
        };
    }
}