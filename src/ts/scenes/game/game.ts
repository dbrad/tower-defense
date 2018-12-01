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

    let entities: ECS.Entity[] = [];
    let player: ECS.Entity = new ECS.Entity();
    entities.push(player);
    player.addComponent(new Component.Position("tilePos", { x: 5, y: 5 }));
    player.addComponent(new Component.Position("renderPos", { x: 5 * 8, y: 5 * 8 }));
    player.addComponent(new Component.Position("targetTile", { x: 5, y: 5 }));
    player.addComponent(new Component.Flag("moving", false));
    player.addComponent(new Component.Flag("movingLeft", false));
    player.addComponent(new Component.Flag("movingRight", false));
    player.addComponent(new Component.Flag("movingUp", false));
    player.addComponent(new Component.Flag("movingDown", false));

    let tileMap: Engine.TileMap = {
        mapSize: { x: 64, y: 36 },
        tileSize: 8,
        tiles: []
    };
    const CameraGap: number = 8 * 6;

    let camera: Engine.Camera =
        Engine.Camera.create({ x: 0, y: 0 }, { x: 24 * 8, y: 18 * 8 });

    export let Game: E.Scene = {
        name: "Game",
        transitionIn() {
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
            Input.bindControl("ACTION", () => { Core.popScene(); });
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
        },
        transitionOut() {
            Input.unbindControl("RIGHT");
            Input.unbindControl("LEFT");
            Input.unbindControl("DOWN");
            Input.unbindControl("UP");
            Input.unbindControl("ACTION");
        },
        update(now: number, delta: number): void {
            Gfx.SpriteStore["dude01"].update(now, delta);
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
                if (gapX >= CameraGap || gapX <= -CameraGap || gapY >= CameraGap || gapY <= -CameraGap) {
                    let targetX = player["renderPos"].value.x - ~~(camera.size.x / 2);
                    let targetY = player["renderPos"].value.y - ~~(camera.size.y / 2);
                    Engine.Camera.move(camera, { x: targetX, y: targetY }, now, 1500, Easing.outQuart);
                }
            }
            Engine.Camera.update(camera, now);
        },
        render(gl: GL.Renderer, now: number, delta: number): void {
            gl.bkg(0, 0, 0);
            let s: Assets.Texture;

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
    };
}