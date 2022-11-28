// Constants
const epsilon = 0.4;
const frictionForce = -4;

export const calculatePosition = (gameObject, dt) => {
    for (let i = 0; i < 3; i++) {
        // xf = xo + vt
        gameObject.transform.position[i] =
            gameObject.transform.position[i] +
            gameObject.rigidbody.velocity[i] * dt;
    }
};

export const calculateVelocity = (gameObject, dt) => {
    for (let i = 0; i < 3; i++) {
        // vf = vo + at
        gameObject.rigidbody.velocity[i] =
            gameObject.rigidbody.velocity[i] +
            gameObject.rigidbody.acceleration[i] * dt;
        // Clamp to 0 velocity when the object is close to stopped
        if (Math.abs(gameObject.rigidbody.velocity[i]) < epsilon)
            gameObject.rigidbody.velocity[i] = 0;
    }
};

export const applyFriction = (gameObject) => {
    // Apply x-friction if the ball is in motion in the x-direction
    if (gameObject.rigidbody.velocity[0] !== 0) {
        gameObject.rigidbody.acceleration[0] =
            -frictionForce * Math.sin(gameObject.rigidbody.direction);
    }
    // Apply z-friction if the ball is in motion in the z-direction
    if (gameObject.rigidbody.velocity[2] !== 0) {
        gameObject.rigidbody.acceleration[2] =
            -frictionForce * Math.cos(gameObject.rigidbody.direction);
    }
};

export const hitBall = (gameObject, force) => {
    // Get x-component
    gameObject.rigidbody.acceleration[0] =
        -force * Math.sin(gameObject.rigidbody.direction);
    // Get z-component
    gameObject.rigidbody.acceleration[2] =
        -force * Math.cos(gameObject.rigidbody.direction);
};

export function update_physics(game_objects, dt) {
    Object.values(game_objects).forEach((val) =>
        update(val, dt)
    );
}

function update(gameObject, dt) {
    if (gameObject.rigidbody.is_enabled) {
        applyFriction(gameObject);
        calculateVelocity(gameObject, dt);
        calculatePosition(gameObject, dt);
    }
}
