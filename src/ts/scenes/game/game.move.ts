/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/input.ts" />

namespace Scenes {
    export namespace Game {
        export namespace SubScenes {
            import Input = Engine.Input;
            import ECS = Engine.ECS;
            import Component = ECS.Component;
            export let Move = new Engine.Scene({
                name: "Move",
                transitionIn (parentScene: Engine.Scene) { 
                    let self = this as Engine.Scene;
                    self.attach<Engine.Scene>("parentScene", parentScene);

                    let ecs = parentScene.fetch<ECS.Manager>("ecsManager");
                    let player = ecs.getFirst("player");

                    Input.bindControl("RIGHT", () => {
                        player.getComponent<Component.Flag>("movingRight").value = true;
                    }, () => {
                        player.getComponent<Component.Flag>("movingRight").value = false;
                    });
                    Input.bindControl("LEFT", () => {
                        player.getComponent<Component.Flag>("movingLeft").value = true;
                    }, () => {
                        player.getComponent<Component.Flag>("movingLeft").value = false;
                    });
                    Input.bindControl("DOWN", () => {
                        player.getComponent<Component.Flag>("movingDown").value = true;
                    }, () => {
                        player.getComponent<Component.Flag>("movingDown").value = false;
                    });
                    Input.bindControl("UP", () => {
                        player.getComponent<Component.Flag>("movingUp").value = true;
                    }, () => {
                        player.getComponent<Component.Flag>("movingUp").value = false;
                    });
                },
                transitionOut () { 
                    Input.unbindAll();
                },
                update () { },
                render () { }
            });
        }
    }
}