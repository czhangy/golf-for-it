// Constants
const epsilon = 0.4;
const frictionForce = -0.02;
const forceFactor = 500;

const calculateVelocity = (gameObject) => {
	return (
		gameObject.physics.velocity[0] ** 2 +
		gameObject.physics.velocity[2] ** 2
	);
};

export const calculatePosition = (gameObject, dt) => {
	// x-pos
	gameObject.transform.position[0] +=
		gameObject.physics.velocity[0] * dt * 2 * Math.PI;
	// z-pos
	gameObject.transform.position[2] +=
		gameObject.physics.velocity[2] * dt * 2 * Math.PI;
};

export const applyFriction = (gameObject) => {
	// Apply x-friction if the ball is in motion in the x-direction
	if (gameObject.physics.velocity[0] !== 0) {
		gameObject.physics.velocity[0] -=
			frictionForce * Math.sin(gameObject.physics.direction);
	}
	// Apply z-friction if the ball is in motion in the z-direction
	if (gameObject.physics.velocity[2] !== 0) {
		gameObject.physics.velocity[2] -=
			frictionForce * Math.cos(gameObject.physics.direction);
	}
	// Clamp velocity to 0
	if (calculateVelocity(gameObject) < epsilon ** 2) {
		gameObject.physics.velocity[0] = 0;
		gameObject.physics.velocity[2] = 0;
	}
};

export const hitBall = (gameObject, force) => {
	// Get x-component
	gameObject.physics.velocity[0] =
		-(force / forceFactor) * Math.sin(gameObject.physics.direction);
	// Get z-component
	gameObject.physics.velocity[2] =
		-(force / forceFactor) * Math.cos(gameObject.physics.direction);
};
