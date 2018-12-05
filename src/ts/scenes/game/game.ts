/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/gl.ts" />
/// <reference path="../../engine/assets.ts" />
/// <reference path="../../engine/graphics.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../engine/entity.ts" />
/// <reference path="../../engine/camera.ts" />
/// <reference path="../../systems.ts" />
/// <reference path="game.move.ts" />
/// <reference path="game.build.ts" />
/// <reference path="game.defend.ts" />

namespace Scenes {
    export namespace Game {
        import E = Engine;
        import ECS = E.ECS;
        import Component = ECS.Component;
        import Core = E.Core;
        import GL = E.GL;
        import Input = E.Input;
        import Gfx = E.Graphics;
        import Assets = E.Assets;

        function makeMap(tileMap: Engine.TileMap) {
            // Stubbed in TileMap
            for (let x = 0; x < tileMap.mapSize.x; x++) {
                for (let y = 0; y < tileMap.mapSize.y; y++) {
                    if (x === tileMap.mapSize.x - 1 || x === 0 || y === tileMap.mapSize.y - 1) {
                        Engine.TileMap.addTile(tileMap, Engine.TileStorage["wall"], { x, y });
                    } else if (y === 0) {
                        Engine.TileMap.addTile(tileMap, Engine.TileStorage["north_wall"], { x, y });
                    } else {
                        Engine.TileMap.addTile(tileMap, Engine.TileStorage["floor"], { x, y });
                    }
                }
            }
        }

        export let scene = new E.Scene({
            name: "Game",
            transitionIn() {
                let self = this as E.Scene;

                self.attach("cameraGap", 8 * 6);
                self.attach("camera", Engine.Camera.create({ x: 0, y: 0 }, { x: 24 * 8, y: 18 * 8 }));

                let tileMap =
                    self.attach<E.TileMap>("tileMap", {
                        mapSize: { x: 32, y: 16 },
                        tileSize: 8,
                        tiles: []
                    });

                makeMap(tileMap);

                let ecsManager = self.attach("ecsManager", new ECS.Manager());

                let player = ecsManager.addEntity();
                {
                    player.addComponent(new Component.Tag("player"));
                    player.addComponent(new Component.Position("tilePos", { x: 5, y: 5 }));
                    player.addComponent(new Component.Position("renderPos", { x: 5 * 8, y: 5 * 8 }));
                    player.addComponent(new Component.Position("targetTile", { x: 5, y: 5 }));
                    player.addComponent(new Component.Flag("moving", false));
                    player.addComponent(new Component.Flag("movingLeft", false));
                    player.addComponent(new Component.Flag("movingRight", false));
                    player.addComponent(new Component.Flag("movingUp", false));
                    player.addComponent(new Component.Flag("movingDown", false));
                    player.addComponent(new Component.Object("sprite", Gfx.SpriteStore["cursor"]));
                }

                let subSceneManager = self.attach("subSceneManager", new Engine.StateMachine<Engine.Scene>());
                subSceneManager.register(SubScenes.Move);
                subSceneManager.register(SubScenes.Build);
                subSceneManager.register(SubScenes.Defend);
                subSceneManager.push("Move", this);
            },
            transitionOut() {
            },
            update(now: number, delta: number): void {
                let self = this as E.Scene;
                let ecs = self.fetch<ECS.Manager>("ecsManager");

                let player = ecs.getFirst("player");
                let tileMap = self.fetch<E.TileMap>("tileMap");
                let camera = self.fetch<E.Camera>("camera");
                let cameraGap = self.fetch<number>("cameraGap");

                Gfx.SpriteStore["cursor"].update(now, delta);

                System.handlePlayerInput(player);
                let moving = player.getComponent<Component.Flag>("moving");
                if (moving.value) {
                    System.handleCollision(player, tileMap);
                    if (moving.value) {
                        System.moveEntity(player, now);
                    }
                }

                if (!camera.moving) {
                    let renderPos = player.getComponent<Component.Position>("renderPos").value;
                    let gapX = renderPos.x - (camera.position.x + ~~(camera.size.x / 2));
                    let gapY = renderPos.y - (camera.position.y + ~~(camera.size.y / 2));
                    if (gapX >= cameraGap || gapX <= -cameraGap || gapY >= cameraGap || gapY <= -cameraGap) {
                        let targetX = renderPos.x - ~~(camera.size.x / 2);
                        let targetY = renderPos.y - ~~(camera.size.y / 2);
                        Engine.Camera.move(camera, { x: targetX, y: targetY }, now, 1500, Easing.outQuart);
                    }
                }

                Engine.Camera.update(camera, now);
            },
            render(gl: GL.Renderer, now: number, delta: number): void {
                let self = this as E.Scene;
                let ecs = self.fetch<ECS.Manager>("ecsManager");
                let player = ecs.getFirst("player");
                let tileMap = self.fetch<E.TileMap>("tileMap");
                let camera = self.fetch<E.Camera>("camera");

                gl.bkg(0, 0, 0);

                Gfx.TileMap.draw(gl, camera, tileMap);

                gl.col = 0xFFFFFFFF;
                let sprite = player.getComponent<Component.Object<Gfx.Sprite>>("sprite").value;
                let renderPos = player.getComponent<Component.Position>("renderPos").value;

                Gfx.Texture.draw({
                    renderer: gl,
                    texture: sprite.currentFrame.texture,
                    position: V2.sub(renderPos, camera.position)
                });

                gl.col = 0xFFFF8888;
                Gfx.NinePatch.draw(gl, Gfx.NinePatchStore["dialog"], 24, 0, 8, 18);
            }
        });
    }
}