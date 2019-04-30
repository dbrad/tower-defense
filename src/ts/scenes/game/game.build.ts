/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/pathing.ts" />
/// <reference path="../../engine/entity.ts" />
/// <reference path="../../entity-factory.ts" />
/// <reference path="../../systems/path-generator.ts" />

namespace Scenes.Game.SubScenes {
    import Input = Engine.Input;
    import ECS = Engine.ECS;
    import Component = ECS.Component;
    import Gfx = Engine.Graphics;

    /*
    arrow
        0 = up (x: 0, y: -)
        PI/2 = right (x: +, y: 0)
        PI = down (x: 0, y: +)
        1.5 PI = left (x: -, y: 0)

    arrow_diag
        0 = up-left (x: -, y: -)
        PI/2 = up-right (x: +, y: -)
        PI = down-right (x: +, y: +)
        1.5 PI = down-left (x: -, y: +)
    */
    function getArrowRotation(v2: V2): number {
        if (v2.x > 0) { // +x
            if (v2.y > 0) { // +y
                return Math.PI;
            } else if (v2.y < 0) { // -y
                return Math.PI / 2;
            } else { // y === 0
                return Math.PI / 2;
            }
        } else if (v2.x < 0) { // -x
            if (v2.y > 0) { // +y
                return Math.PI * 1.5;
            } else if (v2.y < 0) { // -y
                return 0;
            } else { // y === 0
                return Math.PI * 1.5;
            }
        } else { // x === 0
            if (v2.y > 0) { // +y
                return Math.PI;
            } else if (v2.y < 0) { // -y
                return 0;
            } else { // y === 0
                return 0;
            }
        }
    }

    export let Build = new Engine.Scene({
        name: "Build",
        transitionIn(parentScene: Engine.Scene): void {
            const self = this as Engine.Scene;
            self.attach<Engine.Scene>("parentScene", parentScene);

            const ecs = self.ecsManager;

            //#region Non Menu Text
            const titleText = EntityFactory.Text(
                { x: 28 * 16, y: 8 },
                {
                    colour: 0xFFFFFFFF,
                    text: "Build Mode",
                    textAlign: Gfx.Text.Alignment.CENTER,
                    wrapWidth: 0,
                });
            ecs.addEntity(titleText);

            const instructionTextBack = EntityFactory.Text(
                { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 16 },
                {
                    colour: 0xFFFFFFFF,
                    text: "Esc: Back",
                    textAlign: Gfx.Text.Alignment.LEFT,
                    wrapWidth: 0,
                });
            ecs.addEntity(instructionTextBack);

            const instructionTextConfirm = EntityFactory.Text(
                { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 24 },
                {
                    colour: 0xFFFFFFFF,
                    text: "Space: Confirm",
                    textAlign: Gfx.Text.Alignment.LEFT,
                    wrapWidth: 0,
                });
            ecs.addEntity(instructionTextConfirm);
            //#endregion

            type Option = {
                text: string;
                available: boolean;
                action: () => void;
            };

            const options: Option[] =
                [
                    {
                        action: () => { },
                        available: false,
                        text: "Build Wall",
                    },
                    {
                        action: () => { },
                        available: false,
                        text: "Build Tower",
                    },
                    {
                        action: () => {
                            parentScene.subSceneManager.pop(parentScene);
                        },
                        available: true,
                        text: "Close",
                    },
                ];

            if (TowerDefense.gameState.wallPoints !== 0) {
                options[0].available = true;
                options[0].action = () => {
                    if (TowerDefense.gameState.wallPoints <= 0) {
                        parentScene.subSceneManager.pop(parentScene);
                        return;
                    }

                    const tileMap =
                        parentScene.ecsManager
                            .getFirst("levelMap")
                            .getValue<Engine.TileMap>("tileMap");

                    const player = parentScene.ecsManager.getFirst("player");
                    const position = player.getValue<V2>("tilePos");

                    const spawnPoint = parentScene.ecsManager.getFirst("spawnPoint");
                    const wayPoints = parentScene.ecsManager.getAll("waypoint");
                    const endpoint = parentScene.ecsManager.getFirst("endpoint");

                    const path: V2[] =
                        PathGenerator.testAndGenerate(
                            spawnPoint,
                            wayPoints,
                            endpoint,
                            tileMap,
                            position,
                        );

                    if (path.length !== 0) {
                        const wall = parentScene.ecsManager.addEntity();
                        wall.addTag("wall");
                        wall.addTag("blockBuilding");
                        wall.addTag("blockMovement");
                        const tilePos = wall.addComponent<V2>("tilePos", CopyV2(position));
                        wall.addComponent<V2>(
                            "renderPos",
                            TileToPixel(tilePos.value, tileMap.tileSize),
                        );
                        {
                            const sprite: Gfx.Sprite = Gfx.SpriteStore["wall"].clone();
                            wall.addComponent("sprite", sprite);
                        }
                        wall.addComponent("sort", 2);
                        wall.addTag("renderable");
                        Engine.TileMap.mapEntity(wall, tileMap, tilePos.value);

                        TowerDefense.gameState.wallPoints -= 1;
                        Engine.Events.emit(parentScene.eventManager, "wallPoints", "update", null);
                    }
                    parentScene.subSceneManager.pop(parentScene);
                };
            }

            if (TowerDefense.gameState.towerPoints !== 0) {
                options[1].available = true;
                options[1].action = () => {
                    if (TowerDefense.gameState.towerPoints <= 0) {
                        parentScene.subSceneManager.pop(parentScene);
                        return;
                    }

                    const tileMap =
                        parentScene.ecsManager
                            .getFirst("levelMap")
                            .getValue<Engine.TileMap>("tileMap");

                    const player = parentScene.ecsManager.getFirst("player");
                    const position = player.getValue<V2>("tilePos");

                    const spawnPoint = parentScene.ecsManager.getFirst("spawnPoint");
                    const wayPoints = parentScene.ecsManager.getAll("waypoint");
                    const endpoint = parentScene.ecsManager.getFirst("endpoint");

                    const path: V2[] =
                        PathGenerator.testAndGenerate(
                            spawnPoint,
                            wayPoints,
                            endpoint,
                            tileMap,
                            position,
                        );

                    if (path.length !== 0) {
                        const tower = parentScene.ecsManager.addEntity();
                        tower.addTag("tower");
                        tower.addTag("blockBuilding");
                        tower.addTag("blockMovement");
                        const tilePos = tower.addComponent<V2>("tilePos", CopyV2(position));
                        tower.addComponent<V2>(
                            "renderPos",
                            TileToPixel(tilePos.value, tileMap.tileSize),
                        );
                        {
                            const sprite: Gfx.Sprite = Gfx.SpriteStore["spawner"].clone();
                            sprite.setColourHex(0xFFFF0000);
                            tower.addComponent("sprite", sprite);
                        }
                        tower.addComponent("sort", 2);
                        tower.addTag("renderable");
                        Engine.TileMap.mapEntity(tower, tileMap, tilePos.value);

                        TowerDefense.gameState.towerPoints -= 1;
                        Engine.Events.emit(parentScene.eventManager, "towerPoints", "update", null);
                    }
                    parentScene.subSceneManager.pop(parentScene);
                };
            }

            let sel: number = 0;
            // TODO(dbrad): replace with non function foreach
            options.forEach((option, index, array) => {
                const text = ecs.addEntity();
                text.addComponent<V2>("renderPos", { x: 28 * 16, y: 32 + (16 * index) });

                let initVal = option.text;
                if (sel === index) { initVal = `(${initVal})`; }
                let colour = 0xFF999999;
                if (option.available) {
                    colour = 0xFFFFFFFF;
                }
                const data = text.addComponent<Gfx.Text.Data>(
                    "text",
                    {
                        colour,
                        text: initVal,
                        textAlign: Gfx.Text.Alignment.CENTER,
                        wrapWidth: 0,
                    });

                text.addComponent<number>("sort", 10);
                text.addTag("renderable");

                Engine.Events.on(
                    self.eventManager,
                    "sel",
                    "change",
                    (selectedIndex) => {
                        if (index === selectedIndex) {
                            data.value.text = `(${option.text})`;
                        } else {
                            data.value.text = option.text;
                        }
                    });
            });

            Input.bindControl("DOWN", () => {
                sel += 1;
                if (sel > options.length - 1) { sel = 0; }
                Engine.Events.emit(self.eventManager, "sel", "change", sel);
            });

            Input.bindControl("UP", () => {
                sel -= 1;
                if (sel < 0) { sel = options.length - 1; }
                Engine.Events.emit(self.eventManager, "sel", "change", sel);
            });

            Input.bindControl("ACTION",
                () => {
                    if (options[sel].available) {
                        options[sel].action();
                    }
                });

            /*
            const pathing = parentScene.ecsManager.getAll("pathing");

            pathing.forEach((entity) => {
                parentScene.ecsManager.removeEntity(entity);
            });

            path.forEach((position, index, array) => {
                if (index === array.length - 1) {
                    return;
                }
                const nextPosition = array[index + 1];
                const directionV2 = V2.sub(nextPosition, position);
                const rotation = getArrowRotation(directionV2);
                const path = parentScene.ecsManager.addEntity();
                path.addTag("pathing");
                const tilePos = path.addComponent<V2>("tilePos", CopyV2(position));
                path.addComponent<V2>(
                    "renderPos",
                    TileToPixel(tilePos.value, tileMap.tileSize),
                );
                {
                    let sprite: Gfx.Sprite;
                    if (directionV2.x !== 0 && directionV2.y !== 0) {
                        sprite = Gfx.SpriteStore["arrow_diag"].clone();
                    } else {
                        sprite = Gfx.SpriteStore["arrow"].clone();
                    }
                    sprite.setRotation(rotation);
                    sprite.delay(16 + index * 32).then("blink").next();
                    path.addComponent("sprite", sprite);
                }
                path.addComponent("sort", 2);
                path.addTag("renderable");
            });
            */
            Input.bindControl("BACK",
                () => { },
                () => {
                    const stateManager = parentScene.subSceneManager;
                    stateManager.pop(parentScene);
                });
        },
        transitionOut(): void {
            Input.unbindAll();
        },
        update(): void { },
        render(): void { },
    });
}
