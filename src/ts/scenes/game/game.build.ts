/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/entity.ts" />

namespace Scenes {
    export namespace Game {
        export namespace SubScenes {
            import Input = Engine.Input;
            import ECS = Engine.ECS;
            import Component = ECS.Component;
            import Gfx = Engine.Graphics;
            export let Build = new Engine.Scene({
                name: "Build",
                transitionIn(parentScene: Engine.Scene) {
                    let self = this as Engine.Scene;
                    self.attach<Engine.Scene>("parentScene", parentScene);

                    let ecs = self.ecsManager;
                    {
                        let text = ecs.addEntity();
                        text.addComponent(new Component.Position("renderPos", { x: 28 * 16, y: 8 }));
                        text.addComponent(
                            new Component.Object<Gfx.Text.Data>("text",
                                {
                                    text: "Build Mode",
                                    textAlign: Gfx.Text.Alignment.CENTER,
                                    wrapWidth: 0,
                                    colour: 0xFFFFFFFF
                                }));
                        text.addComponent(new Component.Number("sort", 10));
                        text.addComponent(new Component.Tag("renderable"));
                    }

                    {
                        let text = ecs.addEntity();
                        text.addComponent(new Component.Position("renderPos", { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 16 }));
                        text.addComponent(
                            new Component.Object<Gfx.Text.Data>("text",
                                {
                                    text: "Esc: Back",
                                    textAlign: Gfx.Text.Alignment.LEFT,
                                    wrapWidth: 0,
                                    colour: 0xFFFFFFFF
                                }));
                        text.addComponent(new Component.Number("sort", 10));
                        text.addComponent(new Component.Tag("renderable"));
                    }

                    {
                        let text = ecs.addEntity();
                        text.addComponent(new Component.Position("renderPos", { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 24 }));
                        text.addComponent(
                            new Component.Object<Gfx.Text.Data>("text",
                                {
                                    text: "Space: Confirm",
                                    textAlign: Gfx.Text.Alignment.LEFT,
                                    wrapWidth: 0,
                                    colour: 0xFFFFFFFF
                                }));
                        text.addComponent(new Component.Number("sort", 10));
                        text.addComponent(new Component.Tag("renderable"));
                    }

                    Input.bindControl("BACK",
                        () => {

                        },
                        () => {
                            let stateManager = parentScene.subSceneManager;
                            stateManager.pop(parentScene);
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