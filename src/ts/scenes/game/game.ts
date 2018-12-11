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
                let ecs = self.ecsManager;

                ecs.on("renderable", "added",
                    (entity, collection, event) => {
                        collection.sort(
                            (entityA: ECS.Entity, entityB: ECS.Entity): number => {
                                let sortA = ECS.Component.coalesceValue(entityA.getComponent<ECS.Component.Number>("sort"), 0);
                                let sortB = ECS.Component.coalesceValue(entityB.getComponent<ECS.Component.Number>("sort"), 0);
                                return sortA - sortB;
                            });
                    });

                let tileMap: E.TileMap = {
                    mapSize: { x: 24, y: 24 },
                    tileSize: 16,
                    tiles: []
                };

                self.attach("cameraGap", tileMap.tileSize * 6);
                Engine.Camera.current = Engine.Camera.create({ x: 0, y: 0 }, { x: 24 * tileMap.tileSize, y: 18 * tileMap.tileSize })

                makeMap(tileMap);

                let tileMapEntity = ecs.addEntity();
                {
                    tileMapEntity.addComponent(new Component.Tag("levelMap"));
                    tileMapEntity.addComponent(new Component.Object("tileMap", tileMap));
                    tileMapEntity.addComponent(new Component.Number("sort", 1));
                    tileMapEntity.addComponent(new Component.Tag("renderable"));
                }

                let player = ecs.addEntity();
                {
                    player.addComponent(new Component.Tag("player"));
                    let tilePos = player.addComponent(new Component.Position("tilePos", { x: 1, y: 1 }));
                    player.addComponent(new Component.Position("renderPos", TileToPixel(tilePos.value, tileMap.tileSize)));
                    player.addComponent(new Component.Position("targetTile", CopyV2(tilePos.value)));
                    player.addComponent(new Component.Flag("moving", false));
                    player.addComponent(new Component.Flag("movingLeft", false));
                    player.addComponent(new Component.Flag("movingRight", false));
                    player.addComponent(new Component.Flag("movingUp", false));
                    player.addComponent(new Component.Flag("movingDown", false));
                    {
                        let sprite: Gfx.Sprite = Gfx.SpriteStore["cursor"].clone();
                        sprite.play("blink", true);
                        sprite.setColour(0xFF00FF00);
                        player.addComponent(new Component.Object("sprite", sprite));
                    }
                    player.addComponent(new Component.Number("sort", 2));
                    player.addComponent(new Component.Tag("renderable"));
                    E.TileMap.mapEntity(player, tileMap, tilePos.value);
                }

                let spawner = ecs.addEntity();
                {
                    spawner.addComponent(new Component.Tag("blocking"));
                    let tilePos = spawner.addComponent(new Component.Position("tilePos", { x: 1, y: 1 }));
                    spawner.addComponent(new Component.Position("renderPos", TileToPixel(tilePos.value, tileMap.tileSize)));
                    spawner.addComponent(new Component.Position("targetTile", CopyV2(tilePos.value)));
                    {
                        let sprite: Gfx.Sprite = Gfx.SpriteStore["spawner"].clone();
                        sprite.setColour(0xFF0000FF);
                        spawner.addComponent(new Component.Object("sprite", sprite));
                    }
                    spawner.addComponent(new Component.Number("sort", 2));
                    spawner.addComponent(new Component.Tag("renderable"));
                    E.TileMap.mapEntity(spawner, tileMap, tilePos.value);
                }

                // 0xAABBGGRR
                for (let i = 0; i < 10; i++) {
                    let testCursor = ecs.addEntity();
                    let tilePos = testCursor.addComponent(new Component.Position("tilePos", { x: -2, y: i + 1 }));
                    testCursor.addComponent(new Component.Position("renderPos", TileToPixel(tilePos.value, tileMap.tileSize)));
                    {
                        let sprite: Gfx.Sprite = Gfx.SpriteStore["cursor"].clone();
                        let col = colourToNumber(randomInt(50, 255), randomInt(50, 255), randomInt(50, 255), randomInt(175, 255));
                        (i % 2 == 0) ? sprite.play("blink", true) : sprite.play("quick-blink", true);
                        sprite.setColour(col);
                        testCursor.addComponent(new Component.Object("sprite", sprite));
                    }
                    testCursor.addComponent(new Component.Number("sort", 3));
                    testCursor.addComponent(new Component.Tag("renderable"));
                }

                for (let i = 0; i < 10; i++) {
                    let testCursor = ecs.addEntity();
                    let tilePos = testCursor.addComponent(new Component.Position("tilePos", { x: 1, y: i + 2 }));
                    testCursor.addComponent(new Component.Position("renderPos", TileToPixel(tilePos.value, tileMap.tileSize)));
                    {
                        let sprite: Gfx.Sprite = Gfx.SpriteStore["arrow"].clone()
                        sprite.setRotation(Math.PI);
                        sprite.play("blink", true);
                        testCursor.addComponent(new Component.Object("sprite", sprite));
                    }
                    testCursor.addComponent(new Component.Number("sort", 4));
                    testCursor.addComponent(new Component.Tag("renderable"));
                }

                for (let i = 0; i < 10; i++) {
                    let testCursor = ecs.addEntity();
                    let tilePos = testCursor.addComponent(new Component.Position("tilePos", { x: i + 2, y: i + 2 }));
                    testCursor.addComponent(new Component.Position("renderPos", TileToPixel(tilePos.value, tileMap.tileSize)));
                    {
                        let sprite: Gfx.Sprite = Gfx.SpriteStore["arrow_diag"].clone()
                        sprite.setRotation(Math.PI);
                        sprite.play("blink", true);
                        testCursor.addComponent(new Component.Object("sprite", sprite));
                    }
                    testCursor.addComponent(new Component.Number("sort", 4));
                    testCursor.addComponent(new Component.Tag("renderable"));
                }

                self.subSceneManager.register(SubScenes.Move);
                self.subSceneManager.register(SubScenes.Build);
                self.subSceneManager.register(SubScenes.Defend);
                self.subSceneManager.push("Move", this);
            },
            transitionOut() {
            },
            update(now: number, delta: number): void {
                let self = this as E.Scene;
                let ecs = self.ecsManager;

                let player = ecs.getFirst("player");
                let tileMap = ecs.getFirst("levelMap").getComponent<ECS.Component.Object<E.TileMap>>("tileMap").value;
                let camera = Engine.Camera.current
                let cameraGap = self.fetch<number>("cameraGap");

                System.handlePlayerInput(player);

                let spriteEntities = ecs.getAll("sprite");
                spriteEntities.forEach(entity => {
                    let sprite = entity.getComponent<Component.Object<Gfx.Sprite>>("sprite").value;
                    sprite.update(now, delta);
                });

                let moving = player.getComponent<Component.Flag>("moving");
                if (moving.value) {
                    System.handleCollision(player, tileMap);
                    if (moving.value) {
                        System.moveEntity(player, tileMap, now);
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
                gl.col = 0xFFFF8888;
                Gfx.NinePatch.draw(gl, Gfx.NinePatchStore["dialog"], 24, 0, 8, 18);
            }
        });
    }
}