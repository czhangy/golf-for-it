// Constants
const epsilon = 0.4;
const frictionForce = -2;

export const calculatePosition = (gameObject, dt) => {
	for (let i = 0; i < 3; i++) {
		// xf = xo + vt
		gameObject.transform.position[i] =
			gameObject.transform.position[i] +
			gameObject.physics.velocity[i] * dt;
	}
};

export const calculateVelocity = (gameObject, dt) => {
	for (let i = 0; i < 3; i++) {
		// vf = vo + at
		gameObject.physics.velocity[i] =
			gameObject.physics.velocity[i] +
			gameObject.physics.acceleration[i] * dt;
		// Clamp to 0 velocity when the object is close to stopped
		if (Math.abs(gameObject.physics.velocity[i]) < epsilon)
			gameObject.physics.velocity[i] = 0;
	}
};

export const applyFriction = (gameObject) => {
	// Apply x-friction if the ball is in motion in the x-direction
	if (gameObject.physics.velocity[0] !== 0) {
		gameObject.physics.acceleration[0] =
			-frictionForce * Math.sin(gameObject.physics.direction);
	}
	// Apply z-friction if the ball is in motion in the z-direction
	if (gameObject.physics.velocity[2] !== 0) {
		gameObject.physics.acceleration[2] =
			-frictionForce * Math.cos(gameObject.physics.direction);
	}
};

export const hitBall = (gameObject, force) => {
	// Get x-component
	gameObject.physics.acceleration[0] =
		-force * Math.sin(gameObject.physics.direction);
	// Get z-component
	gameObject.physics.acceleration[2] =
		-force * Math.cos(gameObject.physics.direction);
};
