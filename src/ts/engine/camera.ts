/// <reference path="util.ts" />

namespace Engine {
    export interface Camera {
        position: V2;
        origin: V2;
        target: V2;
        size: V2;
        moving: boolean;
        interpolator: IterableIterator<any>;
    }

    export namespace Camera {

        export let current: Camera;

        export function create(position: V2, size: V2): Camera {
            return {
                position: position,
                origin: position,
                target: position,
                size: size,
                moving: false,
                interpolator: null
            }
        }

        export function update(camera: Camera, now: number) {
            if (camera.moving) {
                interpolate(camera, now);
            }
        }

        export function move(camera: Camera, target: V2, now: number, duration: number = 0, easingFn: Function = (p: number) => { return p; }) {
            camera.target = CopyV2(target);
            //if(camera.target.x < 0) camera.target.x = 0;
            //if(camera.target.y < 0) camera.target.y = 0;
            camera.origin = CopyV2(camera.position);
            camera.interpolator = Interpolator(now, duration, easingFn);
            camera.moving = true;
        }

        export function interpolate(camera: Camera, now: number) {
            let interp = camera.interpolator.next(now);
            let o = camera.origin;
            let d = camera.target;

            camera.position.x = o.x + Math.round((d.x - o.x) * interp.value);
            camera.position.y = o.y + Math.round((d.y - o.y) * interp.value);

            if (interp.done == true) {
                camera.moving = false;
                camera.position = CopyV2(camera.target);
                camera.origin = CopyV2(camera.target);
                camera.interpolator = null;
            }
        }
    }
}