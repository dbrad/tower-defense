/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/gl.ts" />
/// <reference path="../../engine/assets.ts" />
/// <reference path="../../engine/graphics.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../engine/entity.ts" />
/// <reference path="../../engine/camera.ts" />
/// <reference path="../../systems.ts" />

namespace Scenes {
    import E = Engine;
    import ECS = E.ECS;
    import Component = ECS.Component;
    import Core = E.Core;
    import GL = E.GL;
    import Input = E.Input;
    import Gfx = E.Graphics;
    import Assets = E.Assets;

    export let Game: E.Scene = new E.Scene({
        name: "Game",
        transitionIn() {
            let self: E.Scene = this as E.Scene;

            self.attach<number>("cameraGap", 8 * 6);
            self.attach<Engine.Camera>("camera", Engine.Camera.create({ x: 0, y: 0 }, { x: 24 * 8, y: 18 * 8 }));

            let tileMap =
                self.attach<E.TileMap>("tileMap", {
                    mapSize: { x: 64, y: 36 },
                    tileSize: 8,
                    tiles: []
                });

            let ecsManager = self.attach<ECS.Manager>("ecsManager", new ECS.Manager());
            let player = ecsManager.addEntity();

            player.addComponent(new Component.Tag("player"));
            player.addComponent(new Component.Position("tilePos", { x: 5, y: 5 }));
            player.addComponent(new Component.Position("renderPos", { x: 5 * 8, y: 5 * 8 }));
            player.addComponent(new Component.Position("targetTile", { x: 5, y: 5 }));
            player.addComponent(new Component.Flag("moving", false));
            player.addComponent(new Component.Flag("movingLeft", false));
            player.addComponent(new Component.Flag("movingRight", false));
            player.addComponent(new Component.Flag("movingUp", false));
            player.addComponent(new Component.Flag("movingDown", false));

            for (let x = 0; x < 64; x++) {
                for (let y = 0; y < 36; y++) {
                    if (x === 63 || x === 0 || y === 35) {
                        Engine.TileMap.addTile(tileMap, Engine.TileStorage["wall"], { x, y });
                    } else if (y === 0) {
                        Engine.TileMap.addTile(tileMap, Engine.TileStorage["north_wall"], { x, y });
                    } else {
                        Engine.TileMap.addTile(tileMap, Engine.TileStorage["floor"], { x, y });
                    }
                }
            }

            Input.bindControl("RIGHT", () => {
                player["movingRight"].value = true;
            }, () => {
                player["movingRight"].value = false;
            });
            Input.bindControl("LEFT", () => {
                player["movingLeft"].value = true;
            }, () => {
                player["movingLeft"].value = false;
            });
            Input.bindControl("DOWN", () => {
                player["movingDown"].value = true;
            }, () => {
                player["movingDown"].value = false;
            });
            Input.bindControl("UP", () => {
                player["movingUp"].value = true;
            }, () => {
                player["movingUp"].value = false;
            });
            Input.bindControl("ACTION", () => { Core.pushScene("PostGame"); });
        },
        transitionOut() {
            Input.unbindControl("RIGHT");
            Input.unbindControl("LEFT");
            Input.unbindControl("DOWN");
            Input.unbindControl("UP");
            Input.unbindControl("ACTION");
        },
        update(now: number, delta: number): void {
            let self: E.Scene = this as E.Scene;
            let ecs = self.fetch<ECS.Manager>("ecsManager");
            let player = ecs.getFirst("player");
            let tileMap = self.fetch<E.TileMap>("tileMap");
            let camera = self.fetch<E.Camera>("camera");
            let cameraGap = self.fetch<number>("cameraGap");

            Gfx.SpriteStore["dude02"].update(now, delta);

            System.handlePlayerInput(player);
            if (player["moving"].value === true) {
                System.handleCollision(player, tileMap);
                if (player["moving"].value === true) {
                    System.moveEntity(player, now);
                }
            }
            if (!camera.moving) {
                let gapX = player["renderPos"].value.x - (camera.position.x + ~~(camera.size.x / 2));
                let gapY = player["renderPos"].value.y - (camera.position.y + ~~(camera.size.y / 2));
                if (gapX >= cameraGap || gapX <= -cameraGap || gapY >= cameraGap || gapY <= -cameraGap) {
                    let targetX = player["renderPos"].value.x - ~~(camera.size.x / 2);
                    let targetY = player["renderPos"].value.y - ~~(camera.size.y / 2);
                    Engine.Camera.move(camera, { x: targetX, y: targetY }, now, 1500, Easing.outQuart);
                }
            }
            Engine.Camera.update(camera, now);
        },
        render(gl: GL.Renderer, now: number, delta: number): void {
            let self: E.Scene = this as E.Scene;
            let ecs = self.fetch<ECS.Manager>("ecsManager");
            let player = ecs.getFirst("player");
            let tileMap = self.fetch<E.TileMap>("tileMap");
            let camera = self.fetch<E.Camera>("camera");

            gl.bkg(0, 0, 0);

            Gfx.TileMap.draw(gl, camera, tileMap);

            gl.col = 0xFFFFFFFF;
            Gfx.Texture.draw({
                renderer: gl,
                texture: Gfx.SpriteStore["dude02"].currentFrame.texture,
                position: V2.sub(player["renderPos"].value, camera.position)
            });

            gl.col = 0xFFFF8888;
            Gfx.NinePatch.draw(gl, Gfx.NinePatchStore["dialog"], 24, 0, 8, 18);
        }
    });
}