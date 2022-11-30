import { tiny } from "../examples/common.js";

const { vec3 } = tiny;

import { test_collision } from "./collision.js";

// Constants
const epsilon = 0.4;
const frictionForce = 0.04;
const forceFactor = 300;

const calculatePosition = (ball, dt) => {
    // x-pos
    ball.transform.position[0] += ball.rigidbody.velocity[0] * dt * 2 * Math.PI;
    // z-pos
    ball.transform.position[2] += ball.rigidbody.velocity[2] * dt * 2 * Math.PI;
};

const applyFriction = (ball) => {
    const dx = frictionForce * Math.abs(Math.sin(ball.transform.rotation[1]));
    const dz = frictionForce * Math.abs(Math.cos(ball.transform.rotation[1]));
    // Apply x-friction if the ball is in motion in the x-direction
    if (ball.rigidbody.velocity[0] !== 0) {
        if (ball.rigidbody.velocity[0] > 0) {
            ball.rigidbody.velocity[0] -= dx;
        } else {
            ball.rigidbody.velocity[0] += dx;
        }
    }
    // Apply z-friction if the ball is in motion in the z-direction
    if (ball.rigidbody.velocity[2] !== 0) {
        if (ball.rigidbody.velocity[2] > 0) {
            ball.rigidbody.velocity[2] -= dz;
        } else {
            ball.rigidbody.velocity[2] += dz;
        }
    }
    // Clamp velocity to 0
    if (ball.rigidbody.velocity.norm() < epsilon ** 2) {
        ball.rigidbody.velocity[0] = 0;
        ball.rigidbody.velocity[2] = 0;
    }
};

const calculateBounce = (ball, normal) => {
    // Calc new velocity
    const v = ball.rigidbody.velocity;
    ball.rigidbody.velocity = v.minus(normal.times(2 * v.dot(normal)));
    // Calc new angle
    const vp = ball.rigidbody.velocity;
    const dot = v[0] * normal[0] + v[0] * normal[2];
    const det = v[0] * normal[2] - v[2] * normal[0];
    const angle = Math.atan2(det, dot);
    if (angle > 0) {
        ball.transform.rotation[1] -= Math.acos(
            v.dot(vp) / (v.norm() * vp.norm())
        );
    } else {
        ball.transform.rotation[1] += Math.acos(
            v.dot(vp) / (v.norm() * vp.norm())
        );
    }
};

export const hitBall = (ball, force) => {
    // Get x-component
    ball.rigidbody.velocity[0] =
        -(force / forceFactor) * Math.sin(ball.transform.rotation[1]);
    // Get z-component
    ball.rigidbody.velocity[2] =
        -(force / forceFactor) * Math.cos(ball.transform.rotation[1]);
};

export function update_physics(game_objects, dt) {
    update(game_objects.golf_ball, dt);
    Object.values(game_objects).forEach((obj) => {
        if (!obj.collider.is_trigger) {
            const normal = test_collision(game_objects.golf_ball, obj);
            if (normal) {
                calculateBounce(game_objects.golf_ball, normal);
            }
        }
    });
}

function update(ball, dt) {
    applyFriction(ball);
    calculatePosition(ball, dt);
}
