import { defs, tiny } from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

import { GameObject } from './game-object.js';

export class Ground extends GameObject {
    constructor(shapes, materials) {
        super(shapes, materials);

        this.renderer.shape = this.shapes.cube;
        this.renderer.material = this.materials.ground;
        this.transform.scale = vec3(100, 1, 100);
    }
}