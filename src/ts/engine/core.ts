/// <reference path="state.ts" />
/// <reference path="gl.ts" />
/// <reference path="graphics.ts" />
/// <reference path="input.ts" />
// @ifdef DEBUG
/// <reference path="debug.ts" />
/// <reference path="stats.ts" />
// @endif

namespace Engine {
    export class Scene implements State {
        public name: string;
        public transitionIn: (...args: any[]) => void;
        public transitionOut: () => void;
        public update: (now: number, delta: number) => void;
        public render: (gl: GL.Renderer, now: number, delta: number) => void;

        constructor(definition: Scene.Definition) {
            this.transitionIn = definition.transitionIn;
            this.transitionOut = () => {
                this._storage = {};
                definition.transitionOut();
            };
            this.update = definition.update;
            this.render = definition.render;
            this.name = definition.name;
        }

        protected _storage: { [key: string]: any } = {};
        public attach<T>(name: string, object: T): T {
            //@ifdef DEBUG
            DEBUG.assert(this._storage[name] == null, `${name} is already attached.`);
            //@endif
            this._storage[name] = object;
            return object;
        }
        public fetch<T>(name: string): T {
            return this._storage[name] as T;
        }
    }

    export namespace Scene {
        export interface Definition extends State {
            update(now: number, delta: number): void;
            render(gl: GL.Renderer, now: number, delta: number): void;
        }
    }

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
            let scene = _scenes.current as Scene;
            if (scene) {
                scene.update(now, delta);
            }
        }

        function render(now: number, delta: number): void {
            let scene = _scenes.current as Scene;
            _gl.cls();
            if (!paused) {
                if (scene) {
                    scene.render(_gl, now, delta);
                }
            } else {
                let hw = ~~(WIDTH / 2);
                let hh = ~~(HEIGHT / 2);
                _gl.col = 0xFFFFFFFF;
                Graphics.Text.draw(_gl, "game paused", hw, hh - 8, Graphics.Text.Alignment.CENTER);
                Graphics.Text.draw(_gl, "click here to resume", hw, hh + 8, Graphics.Text.Alignment.CENTER);
            }
            _gl.flush();
        }

        /* ------------------------------------------------------------------------- */

        let _previous: number;
        function loop(now: number): void {
            if (running) {
                let delta = now - _previous;
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