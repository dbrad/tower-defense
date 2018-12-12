/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../engine/entity.ts" />

namespace Scenes {
    export namespace Game {
        export namespace SubScenes {
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
                        ecs.getFirst("levelMap")
                            .getComponent<ECS.Component.Object<Engine.TileMap>>("tileMap").value;

                    {
                        let text = self.ecsManager.addEntity();
                        text.addComponent(new Component.Position("renderPos", { x: 28 * 16, y: 8 }));
                        text.addComponent(
                            new Component.Object<Gfx.Text.Data>("text",
                                {
                                    text: "Move Mode",
                                    textAlign: Gfx.Text.Alignment.CENTER,
                                    wrapWidth: 0,
                                    colour: 0xFFFFFFFF
                                }));
                        text.addComponent(new Component.Number("sort", 10));
                        text.addComponent(new Component.Tag("renderable"));
                    }

                    {
                        let text = self.ecsManager.addEntity();
                        text.addComponent(new Component.Position("renderPos", { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 16 }));
                        text.addComponent(
                            new Component.Object<Gfx.Text.Data>("text",
                                {
                                    text: "Space: Build",
                                    textAlign: Gfx.Text.Alignment.LEFT,
                                    wrapWidth: 0,
                                    colour: 0xFFFFFFFF
                                }));
                        text.addComponent(new Component.Number("sort", 10));
                        text.addComponent(new Component.Tag("renderable"));
                    }

                    Input.bindControl("RIGHT",
                        () => {
                            player.getComponent<Component.Flag>("movingRight").value = true;
                        },
                        () => {
                            player.getComponent<Component.Flag>("movingRight").value = false;
                        });

                    Input.bindControl("LEFT",
                        () => {
                            player.getComponent<Component.Flag>("movingLeft").value = true;
                        },
                        () => {
                            player.getComponent<Component.Flag>("movingLeft").value = false;
                        });

                    Input.bindControl("DOWN",
                        () => {
                            player.getComponent<Component.Flag>("movingDown").value = true;
                        },
                        () => {
                            player.getComponent<Component.Flag>("movingDown").value = false;
                        });

                    Input.bindControl("UP",
                        () => {
                            player.getComponent<Component.Flag>("movingUp").value = true;
                        },
                        () => {
                            player.getComponent<Component.Flag>("movingUp").value = false;
                        });

                    Input.bindControl("ACTION",
                        () => {
                            player.getComponent<Component.Flag>("movingUp").value = false;
                            player.getComponent<Component.Flag>("movingDown").value = false;
                            player.getComponent<Component.Flag>("movingLeft").value = false;
                            player.getComponent<Component.Flag>("movingRight").value = false;
                            if (!player.getComponent<Component.Flag>("moving").value) {
                                let tilePos = player.getComponent<Component.Position>("tilePos").value;
                                let entities = Engine.TileMap.getEntities(tileMap, tilePos);
                                let blocking = entities.filter(entity => entity.hasComponent("blocking"));
                                if (blocking.length === 0) {
                                    let stateManager = parentScene.subSceneManager;
                                    stateManager.push("Build", parentScene);
                                }
                            } else {
                                window.setTimeout(() => {
                                    let tilePos = player.getComponent<Component.Position>("tilePos").value;
                                    let entities = Engine.TileMap.getEntities(tileMap, tilePos);
                                    let blocking = entities.filter(entity => entity.hasComponent("blocking"));
                                    if (blocking.length === 0 && !player.getComponent<Component.Flag>("moving").value) {
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
                render() { }
            });
        }
    }
}