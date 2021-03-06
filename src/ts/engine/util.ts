interface V2 {
    x: number;
    y: number;
}

function CopyV2(v2: V2): V2 {
    return { x: v2.x, y: v2.y };
}

function TileToPixel(v2: V2, tileSize: number): V2 {
    return { x: v2.x * tileSize, y: v2.y * tileSize };
}

function PixelToTile(v2: V2, tileSize: number): V2 {
    return { x: ~~(v2.x / tileSize), y: ~~(v2.y / tileSize) };
}

namespace V2 {
    export function add(a: V2, b: V2) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    export function sub(a: V2, b: V2) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
}

interface Position {
    pixel: V2;
    tile: V2;
}

interface V3 {
    x: number;
    y: number;
    z: number;
}

interface Colour {
    r: number;
    g: number;
    b: number;
}

const Easing = {
    // no easing, no acceleration
    linear: function (t: number): number {
        return t
    },
    // accelerating from zero velocity
    inQuad: function (t: number): number {
        return t * t
    },
    // decelerating to zero velocity
    outQuad: function (t: number): number {
        return t * (2 - t)
    },
    // acceleration until halfway, then deceleration
    inOutQuad: function (t: number): number {
        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    },
    // accelerating from zero velocity 
    inCubic: function (t: number): number {
        return t * t * t
    },
    // decelerating to zero velocity 
    outCubic: function (t: number): number {
        return (--t) * t * t + 1
    },
    // acceleration until halfway, then deceleration 
    inOutCubic: function (t: number): number {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },
    // accelerating from zero velocity 
    inQuart: function (t: number): number {
        return t * t * t * t
    },
    // decelerating to zero velocity 
    outQuart: function (t: number): number {
        return 1 - (--t) * t * t * t
    },
    // acceleration until halfway, then deceleration
    inOutQuart: function (t: number): number {
        return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    },
    // accelerating from zero velocity
    inQuint: function (t: number): number {
        return t * t * t * t * t
    },
    // decelerating to zero velocity
    outQuint: function (t: number): number {
        return 1 + (--t) * t * t * t * t
    },
    // acceleration until halfway, then deceleration 
    inOutQuint: function (t: number): number {
        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
    }
}

function* Interpolator(startTime: number, duration: number, easingFn: Function) {
    let start = startTime;
    let now = startTime;
    let dur = duration;
    now = yield 0;
    while (now - start < dur) {
        let p = (now - start) / dur;
        let val = easingFn(p);
        now = yield val;
    }
    if (now - start >= dur) {
        return (1);
    }
}