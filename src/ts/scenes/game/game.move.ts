/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../engine/entity.ts" />

namespace Scenes {
    export namespace Game {
        export namespace SubScenes {
            import Input = Engine.Input;
            import ECS = Engine.ECS;
            import Component = ECS.Component;
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
                            
                        },
                        () => {
                            let tilePos = player.getComponent<Component.Position>("tilePos").value;
                            let entities = Engine.TileMap.getEntities(tileMap, tilePos);
                            let blocking = entities.filter(entity => entity.hasComponent("blocking"));
                            if(blocking.length === 0) {
                                let stateManager = parentScene.subSceneManager;
                                stateManager.push("Build", parentScene);
                            }
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