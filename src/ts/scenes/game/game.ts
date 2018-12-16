/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/gl.ts" />
/// <reference path="../../engine/assets.ts" />
/// <reference path="../../engine/graphics.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../engine/entity.ts" />
/// <reference path="../../engine/camera.ts" />
/// <reference path="../../systems.ts" />
/// <reference path="./game.move.ts" />
/// <reference path="./game.build.ts" />
/// <reference path="./game.defend.ts" />

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

        function makeMap(tileMap: Engine.TileMap): void {
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
            transitionIn(): void {
                const self = this as E.Scene;
                const ecs = self.ecsManager;

                ecs.on("renderable", "added",
                    (entity, collection, event) => {
                        collection.sort(
                            (entityA: ECS.Entity, entityB: ECS.Entity): number => {
                                const sortA = ECS.Component.coalesceValue(entityA.getComponent<number>("sort"), 0);
                                let sortB = ECS.Component.coalesceValue(entityB.getComponent<number>("sort"), 0);
                                return sortA - sortB;
                            });
                    });

                let tileMap: E.TileMap = {
                    mapSize: { x: 24, y: 24 },
                    tileSize: 16,
                    tiles: [],
                };

                self.attach("cameraGap", tileMap.tileSize * 7);
                Engine.Camera.current = Engine.Camera.create({ x: 0, y: 0 }, { x: 24 * tileMap.tileSize, y: 18 * tileMap.tileSize });

                makeMap(tileMap);

                let tileMapEntity = ecs.addEntity();
                {
                    tileMapEntity.addTag("levelMap");
                    tileMapEntity.addComponent<Engine.TileMap>("tileMap", tileMap);
                    tileMapEntity.addComponent("sort", 1);
                    tileMapEntity.addTag("renderable");
                }

                {
                    let ninePatch = ecs.addEntity();
                    ninePatch.addComponent<V2>("tilePos", { x: 24, y: 0 });
                    ninePatch.addComponent<Gfx.NinePatch.Data>(
                        "9patch",
                        {
                            name: "dialog",
                            colour: 0xFFFF8888,
                            tileSize: { x: 8, y: 18 },
                        });
                    ninePatch.addComponent("sort", 9);
                    ninePatch.addTag("renderable");
                }

                let player = ecs.addEntity();
                {
                    player.addTag("player");
                    let tilePos = player.addComponent<V2>("tilePos", { x: 1, y: 1 });
                    player.addComponent<V2>("renderPos", TileToPixel(tilePos.value, tileMap.tileSize));
                    player.addComponent<V2>("targetTile", CopyV2(tilePos.value));
                    player.addComponent("moving", false);
                    player.addComponent("movingLeft", false);
                    player.addComponent("movingRight", false);
                    player.addComponent("movingUp", false);
                    player.addComponent("movingDown", false);
                    {
                        let sprite: Gfx.Sprite = Gfx.SpriteStore["cursor"].clone();
                        sprite.play("blink", true);
                        sprite.setColour(0xFF00FF00);
                        player.addComponent("sprite", sprite);
                    }
                    player.addComponent("sort", 2);
                    player.addTag("renderable");
                    E.TileMap.mapEntity(player, tileMap, tilePos.value);
                }

                let spawner = ecs.addEntity();
                {
                    spawner.addTag("blocking");
                    let tilePos = spawner.addComponent<V2>("tilePos", { x: 1, y: 1 });
                    spawner.addComponent<V2>("renderPos", TileToPixel(tilePos.value, tileMap.tileSize));
                    spawner.addComponent<V2>("targetTile", CopyV2(tilePos.value));
                    {
                        let sprite: Gfx.Sprite = Gfx.SpriteStore["spawner"].clone();
                        sprite.setColour(0xFF0000FF);
                        spawner.addComponent("sprite", sprite);
                    }
                    spawner.addComponent("sort", 3);
                    spawner.addTag("renderable");
                    E.TileMap.mapEntity(spawner, tileMap, tilePos.value);
                }

                // 0xAABBGGRR
                self.subSceneManager.register(SubScenes.Move);
                self.subSceneManager.register(SubScenes.Build);
                self.subSceneManager.register(SubScenes.Defend);
                self.subSceneManager.push("Move", this);
            },
            transitionOut(): void {
            },
            update(now: number, delta: number): void {
                let self = this as E.Scene;
                let ecs = self.ecsManager;

                let player = ecs.getFirst("player");
                let tileMap = ecs.getFirst("levelMap").getComponent<E.TileMap>("tileMap").value;
                let camera = Engine.Camera.current;
                let cameraGap = self.fetch<number>("cameraGap");

                System.handlePlayerInput(player);

                let spriteEntities = ecs.getAll("sprite");
                spriteEntities.forEach(entity => {
                    let sprite = entity.getComponent<Gfx.Sprite>("sprite").value;
                    sprite.update(now, delta);
                });

                let moving = player.getComponent<boolean>("moving");
                if (moving.value) {
                    System.handleCollision(player, tileMap);
                    if (moving.value) {
                        System.moveEntity(player, tileMap, now);
                    }
                }

                if (!camera.moving) {
                    let renderPos = player.getComponent<V2>("renderPos").value;
                    let gapX = renderPos.x - (camera.position.x + ~~(camera.size.x / 2));
                    let gapY = renderPos.y - (camera.position.y + ~~(camera.size.y / 2));
                    if (gapX >= cameraGap || gapX <= -cameraGap || gapY >= cameraGap || gapY <= -cameraGap) {
                        let targetX = renderPos.x - ~~(camera.size.x / 2);
                        let targetY = renderPos.y - ~~(camera.size.y / 2);
                        Engine.Camera.move(camera, { x: targetX, y: targetY }, now, 1200, Easing.outCubic);
                    }
                }

                Engine.Camera.update(camera, now);
            },
            render(gl: GL.Renderer, now: number, delta: number): void { },
        });
    }
}
