import { tiny } from "../examples/common.js";

const { vec3 } = tiny;

import { Shapes } from "./game-object.js";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function test_collision(game_object_1, game_object_2) {
	if (
		!game_object_1.collider.is_enabled ||
		!game_object_2.collider.is_enabled
	) {
		return null;
	}

	if (
		game_object_1.renderer.shape == Shapes.cube &&
		game_object_2.renderer.shape == Shapes.sphere
	) {
		return test_box_sphere_collision(game_object_1, game_object_2);
	}

	if (
		game_object_1.renderer.shape == Shapes.sphere &&
		game_object_2.renderer.shape == Shapes.cube
	) {
		return test_box_sphere_collision(game_object_2, game_object_1);
	}

	return null;
}

function test_box_sphere_collision(box, sphere) {
	let pos_delta = sphere.transform.position.minus(box.transform.position);
	let closest_point_on_aabb = vec3(
		clamp(pos_delta[0], -box.transform.size[0], box.transform.size[0]),
		clamp(pos_delta[1], -box.transform.size[1], box.transform.size[1]),
		clamp(pos_delta[2], -box.transform.size[2], box.transform.size[2])
	);
	let collision_delta = pos_delta.minus(closest_point_on_aabb);
	let distance = collision_delta.norm();

	if (distance < sphere.transform.size[0]) {
		return collision_delta.normalized();
	}

	return null;
}
