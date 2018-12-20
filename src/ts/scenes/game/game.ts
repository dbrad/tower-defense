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
        import GL = E.GL;
        import Gfx = E.Graphics;

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

                //#region Entity Creation
                ecs.on("renderable", "added",
                    (entity, collection, event) => {
                        collection.sort(
                            (entityA: ECS.Entity, entityB: ECS.Entity): number => {
                                const sortA = ECS.Component.coalesceValue(entityA.getComponent<number>("sort"), 0);
                                const sortB = ECS.Component.coalesceValue(entityB.getComponent<number>("sort"), 0);
                                return sortA - sortB;
                            });
                    });

                const tileMap: E.TileMap = {
                    mapSize: { x: 25, y: 25 },
                    tileSize: 16,
                    tiles: [],
                };

                self.attach("cameraGap", tileMap.tileSize * 7);
                Engine.Camera.current =
                    Engine.Camera.create(
                        { x: 0, y: 0 },
                        { x: 24 * tileMap.tileSize, y: 18 * tileMap.tileSize },
                    );

                makeMap(tileMap);

                {
                    const tileMapEntity = ecs.addEntity();
                    tileMapEntity.addTag("levelMap");
                    tileMapEntity.addComponent<Engine.TileMap>("tileMap", tileMap);
                    tileMapEntity.addComponent("sort", 1);
                    tileMapEntity.addTag("renderable");
                }

                {
                    const ninePatch = ecs.addEntity();
                    ninePatch.addComponent<V2>("tilePos", { x: 24, y: 0 });
                    ninePatch.addComponent<Gfx.NinePatch.Data>(
                        "9patch",
                        {
                            colour: 0xFFFF8888,
                            name: "dialog",
                            tileSize: { x: 8, y: 18 },
                        });
                    ninePatch.addComponent("sort", 9);
                    ninePatch.addTag("renderable");
                }

                const cursor = ecs.addEntity();
                {
                    cursor.addTag("player");
                    const tilePos = cursor.addComponent<V2>("tilePos", { x: 1, y: 1 });
                    cursor.addComponent<V2>("renderPos", TileToPixel(tilePos.value, tileMap.tileSize));
                    cursor.addComponent<V2>("targetTile", CopyV2(tilePos.value));
                    cursor.addComponent("moving", false);
                    cursor.addComponent("movingLeft", false);
                    cursor.addComponent("movingRight", false);
                    cursor.addComponent("movingUp", false);
                    cursor.addComponent("movingDown", false);
                    {
                        const sprite: Gfx.Sprite = Gfx.SpriteStore["cursor"].clone();
                        sprite.play("blink", true);
                        sprite.setColourHex(0xFF00FF00);
                        cursor.addComponent("sprite", sprite);
                    }
                    cursor.addComponent("sort", 8);
                    cursor.addTag("renderable");
                    E.TileMap.mapEntity(cursor, tileMap, tilePos.value);
                }

                const spawner = ecs.addEntity();
                {
                    spawner.addTag("blockBuilding");
                    spawner.addTag("spawnPoint");
                    const tilePos = spawner.addComponent<V2>("tilePos", { x: 2, y: 1 });
                    spawner.addComponent<V2>("renderPos", TileToPixel(tilePos.value, tileMap.tileSize));
                    spawner.addComponent<V2>("targetTile", CopyV2(tilePos.value));
                    {
                        const sprite: Gfx.Sprite = Gfx.SpriteStore["spawner"].clone();
                        sprite.setColourHex(0xFF0000FF);
                        spawner.addComponent("sprite", sprite);
                    }
                    spawner.addComponent("sort", 3);
                    spawner.addTag("renderable");
                    E.TileMap.mapEntity(spawner, tileMap, tilePos.value);
                }

                {
                    const waypoint = EntityFactory.WayPoint({ x: 2, y: 12 }, tileMap, 1);
                    waypoint.setManager(ecs);
                }

                {
                    const waypoint = EntityFactory.WayPoint({ x: 22, y: 12 }, tileMap, 2);
                    waypoint.setManager(ecs);
                }

                {
                    const waypoint = EntityFactory.WayPoint({ x: 22, y: 2 }, tileMap, 3);
                    waypoint.setManager(ecs);
                }

                {
                    const waypoint = EntityFactory.WayPoint({ x: 12, y: 2 }, tileMap, 4);
                    waypoint.setManager(ecs);
                }

                {
                    const waypoint = EntityFactory.WayPoint({ x: 12, y: 22 }, tileMap, 5);
                    waypoint.setManager(ecs);
                }

                const endpoint = EntityFactory.EndPoint({ x: 23, y: 22 }, tileMap);
                endpoint.setManager(ecs);
                //#endregion

                const waypoints = ecs.getAll("waypoint");
                const path = PathGenerator.generate(spawner, waypoints, endpoint, tileMap);

                path.forEach((position) => {
                    Engine.TileMap.addTile(tileMap, Engine.TileStorage["path"], position);
                });

                // 0xAABBGGRR
                self.subSceneManager.register(SubScenes.Move);
                self.subSceneManager.register(SubScenes.Build);
                self.subSceneManager.register(SubScenes.Defend);
                self.subSceneManager.push("Move", this);
            },
            transitionOut(): void {
            },
            update(now: number, delta: number): void {
                const self = this as E.Scene;
                const ecs = self.ecsManager;

                const player = ecs.getFirst("player");
                const tileMap = ecs.getFirst("levelMap").getComponent<E.TileMap>("tileMap").value;
                const camera = Engine.Camera.current;
                const cameraGap = self.fetch<number>("cameraGap");

                System.handlePlayerInput(player);

                const spriteEntities = ecs.getAll("sprite");
                spriteEntities.forEach((entity) => {
                    const sprite = entity.getComponent<Gfx.Sprite>("sprite").value;
                    sprite.update(now, delta);
                });

                const moving = player.getComponent<boolean>("moving");
                if (moving.value) {
                    System.handleCollision(player, tileMap);
                    if (moving.value) {
                        System.moveEntity(player, tileMap, now);
                    }
                }

                if (!camera.moving) {
                    const renderPos = player.getComponent<V2>("renderPos").value;
                    const gapX = renderPos.x - (camera.position.x + ~~(camera.size.x / 2));
                    const gapY = renderPos.y - (camera.position.y + ~~(camera.size.y / 2));
                    if (gapX >= cameraGap || gapX <= -cameraGap ||
                        gapY >= cameraGap || gapY <= -cameraGap) {
                        const targetX = renderPos.x - ~~(camera.size.x / 2);
                        const targetY = renderPos.y - ~~(camera.size.y / 2);
                        Engine.Camera.move(camera, { x: targetX, y: targetY }, now, 1200, Easing.outCubic);
                    }
                }

                Engine.Camera.update(camera, now);
            },
            render(gl: GL.Renderer, now: number, delta: number): void { },
        });
    }
}
