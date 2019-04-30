/// <reference path="state.ts" />
/// <reference path="scene.ts" />
/// <reference path="gl.ts" />
/// <reference path="input.ts" />
/// <reference path="camera.ts" />
// @ifdef DEBUG
/// <reference path="debug.ts" />
/// <reference path="stats.ts" />
// @endif

namespace Engine {

    export namespace Core {
        let _glCanvas: HTMLCanvasElement;
        export let _gl: GL.Renderer;

        export let WIDTH: number = 0;
        export let HEIGHT: number = 0;

        let _scenes: StateMachine<Scene>;

        /* ------------------------------------------------------------------------- */

        export function addScene(scene: Scene): void {
            _scenes.register(scene);
        }

        export function pushScene(name: string, ...args: any[]): void {
            _scenes.push(name, ...args);
        }

        export function popScene(): void {
            _scenes.pop();
        }

        /* ------------------------------------------------------------------------- */

        function update(now: number, delta: number): void {
            const scene = _scenes.current as Scene;
            if (scene) {
                scene.update(now, delta);
            }
        }

        function render(now: number, delta: number): void {
            const scene = _scenes.current as Scene;
            _gl.cls();
            if (!paused) {
                if (scene) {
                    scene.render(_gl, now, delta);
                }
            } else {
                const hw = ~~(WIDTH / 2);
                const hh = ~~(HEIGHT / 2);
                _gl.col = 0xFFFFFFFF;
                Graphics.Text.draw(_gl, "game paused", { x: hw, y: hh - 8 }, Graphics.Text.Alignment.CENTER);
                Graphics.Text.draw(_gl, "click here to resume", { x: hw, y: hh + 8 }, Graphics.Text.Alignment.CENTER);
            }
            _gl.flush();
        }

        /* ------------------------------------------------------------------------- */

        let _previous: number;
        function loop(now: number): void {
            if (running) {
                const delta = now - _previous;
                _previous = now;
                // @ifdef DEBUG
                Stats.tick(delta);
                // @endif
                if (!paused) {
                    update(now, delta);
                }
                render(now, delta);
                requestAnimationFrame(loop);
            }
        }

        /* ------------------------------------------------------------------------- */

        let loopHandle: number;
        let paused: boolean = false;
        let running: boolean = false;
        export function init(glCanvas: HTMLCanvasElement): void {
            _glCanvas = glCanvas;
            _gl = GL.Renderer(_glCanvas);
            Camera.current = Camera.create({ x: 0, y: 0 }, { x: WIDTH, y: HEIGHT });

            _scenes = new StateMachine<Scene>();
            WIDTH = _gl.canvas.width;
            HEIGHT = _gl.canvas.height;
        }

        export function start(): void {
            _previous = performance.now();
            _gl.bkg(0, 0, 0);
            running = true;
            loopHandle = requestAnimationFrame(loop);
        }

        export function stop(): void {
            running = false;
            cancelAnimationFrame(loopHandle);
        }

        export function pause(): void {
            paused = true;
            Input.disable();
        }

        export function unpause(): void {
            paused = false;
            Input.enable();
        }
    }
}
