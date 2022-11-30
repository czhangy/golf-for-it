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

export const Shapes = {
    cube: new defs.Cube(),
    sphere: new defs.Subdivision_Sphere(4),
};

export const Materials = {
    default: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
    }),
    obstacle: new Material(new defs.Textured_Phong(), {
        ambient: 0.4,
        diffusivity: 0.6,
        specularity: 0,
        color: hex_color("#964B00"),
        texture: new Texture("assets/wall.jpg")
    }),
    golf_ball: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff")
    }),
    ground: new Material(new defs.Textured_Phong(), {
        ambient: 0.4,
        diffusivity: 0.6,
        specularity: 0,
        color: hex_color("#008000"),
        texture: new Texture("assets/grass2.jpg"),
    })
}

export function GameObject({
    is_enabled = true,
    position = vec3(0, 0, 0),
    rotation = vec3(0, 0, 0),
    size = vec3(1, 1, 1),
    has_rigidbody = false,
    velocity = vec3(0, 0, 0),
    acceleration = vec3(0, 0, 0),
    has_collider = true,
    is_trigger = false,
    has_renderer = true,
    shape = Shapes.cube,
    material = Materials.default
}) {

    this.is_enabled = is_enabled;
    this.transform = {
        position: position,
        rotation: rotation,
        size: size
    };
    this.rigidbody = {
        is_enabled: has_rigidbody,
        velocity: velocity,
        acceleration: acceleration,
        direction: 0
    };
    this.collider = {
        is_enabled: has_collider,
        is_trigger: is_trigger
    };
    this.renderer = {
        is_enabled: has_renderer,
        shape: shape,
        material: material
    }
}
