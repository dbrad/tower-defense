/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../engine/entity.ts" />

namespace Scenes.Game.SubScenes {
    import Input = Engine.Input;
    import ECS = Engine.ECS;
    import Component = ECS.Component;
    import Gfx = Engine.Graphics;
    export let Move = new Engine.Scene({
        name: "Move",
        transitionIn(parentScene: Engine.Scene) {
            let self = this as Engine.Scene;
            self.attach<Engine.Scene>("parentScene", parentScene);

            let ecs = parentScene.ecsManager;
            let player = ecs.getFirst("player");
            let tileMap =
                ecs.getFirst("levelMap").getValue<Engine.TileMap>("tileMap");

            {
                let text = self.ecsManager.addEntity();
                text.addComponent<V2>("renderPos", { x: 28 * 16, y: 8 });
                text.addComponent<Gfx.Text.Data>(
                    "text",
                    {
                        text: "Move Mode",
                        textAlign: Gfx.Text.Alignment.CENTER,
                        wrapWidth: 0,
                        colour: 0xFFFFFFFF,
                    });
                text.addComponent("sort", 10);
                text.addTag("renderable");
            }

            {
                let text = self.ecsManager.addEntity();
                text.addComponent<V2>("renderPos", { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 16 });
                text.addComponent<Gfx.Text.Data>(
                    "text",
                    {
                        text: "Space: Build",
                        textAlign: Gfx.Text.Alignment.LEFT,
                        wrapWidth: 0,
                        colour: 0xFFFFFFFF,
                    });
                text.addComponent("sort", 10);
                text.addTag("renderable");
            }

            Input.bindControl("RIGHT",
                () => {
                    player.getComponent<boolean>("movingRight").value = true;
                },
                () => {
                    player.getComponent<boolean>("movingRight").value = false;
                });

            Input.bindControl("LEFT",
                () => {
                    player.getComponent<boolean>("movingLeft").value = true;
                },
                () => {
                    player.getComponent<boolean>("movingLeft").value = false;
                });

            Input.bindControl("DOWN",
                () => {
                    player.getComponent<boolean>("movingDown").value = true;
                },
                () => {
                    player.getComponent<boolean>("movingDown").value = false;
                });

            Input.bindControl("UP",
                () => {
                    player.getComponent<boolean>("movingUp").value = true;
                },
                () => {
                    player.getComponent<boolean>("movingUp").value = false;
                });

            Input.bindControl("ACTION",
                () => {
                    player.getComponent<boolean>("movingUp").value = false;
                    player.getComponent<boolean>("movingDown").value = false;
                    player.getComponent<boolean>("movingLeft").value = false;
                    player.getComponent<boolean>("movingRight").value = false;
                    if (!player.getComponent<boolean>("moving").value) {
                        let tilePos = player.getComponent<V2>("tilePos").value;
                        let entities = Engine.TileMap.getEntities(tileMap, tilePos);
                        let blocking = entities.filter(entity => entity.hasComponent("blockBuilding"));
                        if (blocking.length === 0) {
                            let stateManager = parentScene.subSceneManager;
                            stateManager.push("Build", parentScene);
                        }
                    } else {
                        window.setTimeout(() => {
                            let tilePos = player.getComponent<V2>("tilePos").value;
                            let entities = Engine.TileMap.getEntities(tileMap, tilePos);
                            let blocking = entities.filter(entity => entity.hasComponent("blockBuilding"));
                            if (blocking.length === 0 && !player.getComponent<boolean>("moving").value) {
                                let stateManager = parentScene.subSceneManager;
                                stateManager.push("Build", parentScene);
                            }
                        }, 160);
                    }
                }, () => { });

            Input.bindKey(73,
                () => { },
                () => {
                    console.log(self.ecsManager);
                });
        },
        transitionOut() {
            Input.unbindAll();
        },
        update() { },
        render() { },
    });
}
