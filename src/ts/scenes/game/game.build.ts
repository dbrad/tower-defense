/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/pathing.ts" />
/// <reference path="../../engine/entity.ts" />
/// <reference path="../../entity-factory.ts" />

namespace Scenes.Game.SubScenes {
    import Input = Engine.Input;
    import ECS = Engine.ECS;
    import Component = ECS.Component;
    import Gfx = Engine.Graphics;
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

            const options: string[] = ["Build Wall", "Build Tower", "Close"];
            let sel: number = 0;
            options.forEach((value, index, array) => {
                const text = ecs.addEntity();
                text.addComponent<V2>("renderPos", { x: 28 * 16, y: 32 + (16 * index) });

                let initVal = value;
                if (sel === index) { initVal = `(${initVal})`; }
                const data = text.addComponent<Gfx.Text.Data>(
                    "text",
                    {
                        colour: 0xFFFFFFFF,
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
                            data.value.text = `(${value})`;
                        } else {
                            data.value.text = value;
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
                    switch (options[sel]) {
                        case "Build Wall":
                            const tileMap =
                                parentScene.ecsManager
                                    .getFirst("levelMap")
                                    .getValue<Engine.TileMap>("tileMap");

                            const player = parentScene.ecsManager.getFirst("player");
                            const position = player.getValue<V2>("tilePos");

                            //#region Pathing
                            const spawnPoint = parentScene.ecsManager.getFirst("spawnPoint");
                            const wayPoints = parentScene.ecsManager.getAll("waypoint");
                            const endpoint = parentScene.ecsManager.getFirst("endpoint");

                            let path: V2[] = [];

                            let from = spawnPoint;
                            let to: ECS.Entity;
                            for (const waypoint of wayPoints) {
                                to = waypoint;

                                const fromPos = from.getValue<V2>("tilePos");
                                const toPos = to.getValue<V2>("tilePos");

                                const cellMap = Engine.TileMap.convertToCellMap(tileMap);
                                const index = position.x + (position.y * tileMap.mapSize.x);
                                cellMap.cells[index] = null;

                                const currentPath = Engine.Pathing.generatePath(
                                    cellMap,
                                    fromPos,
                                    toPos,
                                );

                                if (currentPath.length === 0) {
                                    path.length = 0;
                                    break;
                                } else {
                                    path = path.concat(currentPath);
                                    from = to;
                                }
                            }

                            if (path.length !== 0) {
                                to = endpoint;

                                const fromPos = from.getValue<V2>("tilePos");
                                const toPos = to.getValue<V2>("tilePos");

                                const cellMap = Engine.TileMap.convertToCellMap(tileMap);
                                const index = position.x + (position.y * tileMap.mapSize.x);
                                cellMap.cells[index] = null;

                                const currentPath = Engine.Pathing.generatePath(
                                    cellMap,
                                    fromPos,
                                    toPos,
                                );
                                if (currentPath.length === 0) {
                                    path.length = 0;
                                } else {
                                    path = path.concat(currentPath);
                                }
                            }
                            //#endregion

                            if (path.length !== 0) {
                                //#region Add Wall Entity
                                const wall = parentScene.ecsManager.addEntity();
                                wall.addTag("blockBuilding");
                                wall.addTag("blockMovement");
                                const tilePos = wall.addComponent<V2>("tilePos", CopyV2(position));
                                wall.addComponent<V2>(
                                    "renderPos",
                                    TileToPixel(tilePos.value, tileMap.tileSize),
                                );
                                {
                                    const sprite: Gfx.Sprite = Gfx.SpriteStore["spawner"].clone();
                                    sprite.setColour(0xFF00FF00);
                                    wall.addComponent("sprite", sprite);
                                }
                                wall.addComponent("sort", 2);
                                wall.addTag("renderable");
                                Engine.TileMap.mapEntity(wall, tileMap, tilePos.value);
                                //#endregion

                                //#region Draw Pathing
                                const pathing = parentScene.ecsManager.getAll("pathing");

                                pathing.forEach((entity) => {
                                    parentScene.ecsManager.removeEntity(entity);
                                });

                                path.forEach((position) => {
                                    const path = parentScene.ecsManager.addEntity();
                                    path.addTag("pathing");
                                    const tilePos = path.addComponent<V2>("tilePos", CopyV2(position));
                                    path.addComponent<V2>(
                                        "renderPos",
                                        TileToPixel(tilePos.value, tileMap.tileSize),
                                    );
                                    {
                                        const sprite: Gfx.Sprite = Gfx.SpriteStore["arrow_diag"].clone();
                                        sprite.setColour(0xFFFF0000);
                                        path.addComponent("sprite", sprite);
                                    }
                                    path.addComponent("sort", 2);
                                    path.addTag("renderable");
                                });
                                //#endregion
                            }

                            parentScene.subSceneManager.pop(parentScene);
                            break;
                        case "Build Tower":
                            break;
                        case "Close":
                            const stateManager = parentScene.subSceneManager;
                            stateManager.pop(parentScene);
                            break;
                    }
                }, () => { });

            Input.bindControl("BACK",
                () => {

                },
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
