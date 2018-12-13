/// <reference path="graphics.ts" />
/// <reference path="entity.ts" />
/// <reference path="tilemap.ts" />
/// <reference path="gl.ts" />
/// <reference path="events.ts" />

namespace Engine {
    import Gfx = Engine.Graphics;
    import Component = Engine.ECS.Component;

    export class Scene implements State {
        public name: string;
        public transitionIn: (...args: any[]) => void;
        public transitionOut: () => void;
        public update: (now: number, delta: number) => void;
        public render: (gl: GL.Renderer, now: number, delta: number) => void;

        public ecsManager: ECS.Manager = new ECS.Manager();

        public eventManager: Events.Manager = new Events.Manager();

        public subSceneManager: StateMachine<Scene> = new StateMachine<Scene>();

        constructor(definition: Scene.Definition) {
            this.transitionIn = definition.transitionIn;
            this.transitionOut = () => {
                this._storage = {};
                this.ecsManager.reset();
                this.eventManager.reset();
                this.subSceneManager.reset();
                definition.transitionOut();
            };
            this.update = definition.update;
            this.render = (gl, now, delta) => {
                let camera = Camera.current;

                gl.bkg(0, 0, 0);
                gl.col = 0xFFFFFFFF;

                let entities = this.ecsManager.getAll("renderable");

                // 9Patch
                entities.forEach(
                    (entity) => {
                        if (entity.hasComponent("tileMap")) {
                            let tileMap = entity.getComponent<TileMap>("tileMap").value;
                            Gfx.TileMap.draw(gl, camera, tileMap);
                        } else if (entity.hasComponent("sprite")) {
                            let sprite = entity.getComponent<Gfx.Sprite>("sprite").value;
                            let renderPos = entity.getComponent<V2>("renderPos").value;
                            Gfx.Sprite.draw(gl, sprite, renderPos, camera.position);
                        } else if (entity.hasComponent("text")) {
                            let data = entity.getComponent<Gfx.Text.Data>("text").value;
                            let renderPos = entity.getComponent<V2>("renderPos").value;
                            gl.col = data.colour;
                            Gfx.Text.draw(gl, data.text, renderPos, data.textAlign, data.wrapWidth);
                        } else if (entity.hasComponent("9patch")) {
                            let data = entity.getComponent<Gfx.NinePatch.Data>("9patch").value;
                            let tilePos = entity.getComponent<V2>("tilePos").value;
                            gl.col = data.colour;
                            Gfx.NinePatch.draw(gl, Gfx.NinePatchStore[data.name], tilePos.x, tilePos.y, data.tileSize.x, data.tileSize.y);
                        }
                    });

                definition.render(gl, now, delta);

                if (this.subSceneManager.current) {
                    this.subSceneManager.current.render(gl, now, delta);
                }
            }
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
        public modify<T>(name: string, object: T): T {
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
}