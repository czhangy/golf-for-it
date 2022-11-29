import test_collision from "./collision";

// Constants
const epsilon = 0.4;
const frictionForce = -0.02;
const forceFactor = 500;

const calculateVelocity = (gameObject) => {
	return (
		gameObject.rigidbody.velocity[0] ** 2 +
		gameObject.rigidbody.velocity[2] ** 2
	);
};

const calculatePosition = (gameObject, dt) => {
	// x-pos
	gameObject.transform.position[0] +=
		gameObject.rigidbody.velocity[0] * dt * 2 * Math.PI;
	// z-pos
	gameObject.transform.position[2] +=
		gameObject.rigidbody.velocity[2] * dt * 2 * Math.PI;
};

const applyFriction = (gameObject) => {
	// Apply x-friction if the ball is in motion in the x-direction
	if (gameObject.rigidbody.velocity[0] !== 0) {
		gameObject.rigidbody.velocity[0] -=
			frictionForce * Math.sin(gameObject.rigidbody.direction);
	}
	// Apply z-friction if the ball is in motion in the z-direction
	if (gameObject.rigidbody.velocity[2] !== 0) {
		gameObject.rigidbody.velocity[2] -=
			frictionForce * Math.cos(gameObject.rigidbody.direction);
	}
	// Clamp velocity to 0
	if (calculateVelocity(gameObject) < epsilon ** 2) {
		gameObject.rigidbody.velocity[0] = 0;
		gameObject.rigidbody.velocity[2] = 0;
	}
};

export const hitBall = (gameObject, force) => {
	// Get x-component
	gameObject.rigidbody.velocity[0] =
		-(force / forceFactor) * Math.sin(gameObject.rigidbody.direction);
	// Get z-component
	gameObject.rigidbody.velocity[2] =
		-(force / forceFactor) * Math.cos(gameObject.rigidbody.direction);
};

export function update_physics(game_objects, dt) {
	Object.values(game_objects).forEach((val) => update(val, dt));
}

function update(gameObject, dt) {
	if (gameObject.rigidbody.is_enabled) {
		applyFriction(gameObject);
		calculatePosition(gameObject, dt);
	}
}
