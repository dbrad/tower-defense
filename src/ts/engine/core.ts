/// <reference path="state.ts" />
/// <reference path="gl.ts" />
// @ifdef DEBUG
/// <reference path="debug.ts" />
/// <reference path="stats.ts" />
// @endif

namespace Engine {
    export interface Scene extends State {
        update(now: number, delta: number): void;
        render(gl: GL.Renderer, now: number, delta: number): void;
    }

    export namespace Core {
        let _glCanvas: HTMLCanvasElement;
        export let _gl: GL.Renderer;

        export let WIDTH: number = 0;
        export let HEIGHT: number = 0;

        let _scenes: StateMachine;

        /* ------------------------------------------------------------------------- */

        export function addScene(scene: Scene): void {
            _scenes.register(scene);
        }

        export function pushScene(name: string): void {
            _scenes.push(name);
        }

        export function popScene(): void {
            _scenes.pop();
        }

        /* ------------------------------------------------------------------------- */

        function update(now: number, delta: number): void {
            let scene = _scenes.current as Scene;
            if (scene) {
                scene.update(now, delta);
            }
        }

        function render(now: number, delta: number): void {
            let scene = _scenes.current as Scene;
            _gl.cls();
            if (scene) {
                scene.render(_gl, now, delta);
            }
            _gl.flush();
        }

        /* ------------------------------------------------------------------------- */

        let _previous: number;
        function loop(now: number): void {
            let delta = now - _previous;
            _previous = now;
            // @ifdef DEBUG
            Stats.tick(delta);
            // @endif
            update(now, delta);
            render(now, delta);
            requestAnimationFrame(loop);
        }

        /* ------------------------------------------------------------------------- */

        export function init(glCanvas: HTMLCanvasElement): void {
            _glCanvas = glCanvas;
            _gl = GL.Renderer(_glCanvas);

            _scenes = new StateMachine();
            WIDTH = _gl.canvas.width;
            HEIGHT = _gl.canvas.height;
        }

        export function start(): void {
            _previous = performance.now();
            _gl.bkg(25, 25, 25);
            requestAnimationFrame(loop);
        }
    }
}