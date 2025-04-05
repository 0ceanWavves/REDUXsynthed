// src/scripts/utils/smoothstep.js
export function smoothstep(min, max, value) {
    var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    // Use the Hermite polynomial formula 3x^2 - 2x^3
    return x * x * (3 - 2 * x);
}; 