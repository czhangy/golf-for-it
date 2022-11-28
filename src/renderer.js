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

export function render_game_objects(context, program_state, game_objects) {
    Object.values(game_objects).forEach((val) =>
        render_game_object(context, program_state, val)
    );
}

function render_game_object(context, program_state, game_object) {
    if (game_object.is_enabled && game_object.renderer.is_enabled) {
        let model_transform = Mat4.identity()
            .times(Mat4.translation(
                game_object.transform.position[0],
                game_object.transform.position[1],
                game_object.transform.position[2]
            ))
            .times(Mat4.rotation(game_object.transform.rotation[0], 1, 0, 0))
            .times(Mat4.rotation(game_object.transform.rotation[1], 0, 1, 0))
            .times(Mat4.rotation(game_object.transform.rotation[2], 0, 0, 1))
            .times(
                Mat4.scale(
                    game_object.transform.size[0],
                    game_object.transform.size[1],
                    game_object.transform.size[2]
                )
            );
        game_object.renderer.shape.draw(
            context,
            program_state,
            model_transform,
            game_object.renderer.material
        );
    }
}