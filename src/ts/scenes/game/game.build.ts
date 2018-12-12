/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/entity.ts" />
/// <reference path="../../entity-factory.ts" />

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

                    //#region Non Menu Text
                    let titleText = EntityFactory.Text(
                        { x: 28 * 16, y: 8 },
                        {
                            text: "Build Mode",
                            textAlign: Gfx.Text.Alignment.CENTER,
                            wrapWidth: 0,
                            colour: 0xFFFFFFFF
                        });
                    ecs.addEntity(titleText);

                    let instructionTextBack = EntityFactory.Text(
                        { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 16 },
                        {
                            text: "Esc: Back",
                            textAlign: Gfx.Text.Alignment.LEFT,
                            wrapWidth: 0,
                            colour: 0xFFFFFFFF
                        });
                    ecs.addEntity(instructionTextBack);

                    let instructionTextConfirm = EntityFactory.Text(
                        { x: (24 * 16) + 8, y: Engine.Core.HEIGHT - 24 },
                        {
                            text: "Space: Confirm",
                            textAlign: Gfx.Text.Alignment.LEFT,
                            wrapWidth: 0,
                            colour: 0xFFFFFFFF
                        });
                    ecs.addEntity(instructionTextConfirm);
                    //#endregion

                    let options: string[] = ["Build Wall", "Build Tower", "Close"];
                    let sel: number = 0;
                    options.forEach((value, index, array) => {
                        let text = ecs.addEntity();
                        text.addComponent(new Component.Position("renderPos", { x: 28 * 16, y: 32 + (16 * index) }));

                        let initVal = value;
                        if (sel === index) { initVal = `(${initVal})`; }
                        let data = text.addComponent(
                            new Component.Object<Gfx.Text.Data>("text",
                                {
                                    text: initVal,
                                    textAlign: Gfx.Text.Alignment.CENTER,
                                    wrapWidth: 0,
                                    colour: 0xFFFFFFFF
                                }));

                        text.addComponent(new Component.Number("sort", 10));
                        text.addComponent(new Component.Tag("renderable"));

                        Engine.Events.on(
                            self.eventManager,
                            "sel",
                            "change",
                            (selectedIndex) => {
                                if (index == selectedIndex) {
                                    data.value.text = `(${value})`;
                                } else {
                                    data.value.text = value;
                                }
                            });
                    });

                    Input.bindControl("DOWN", () => {
                        sel += 1;
                        if (sel > options.length - 1) sel = 0;
                        Engine.Events.emit(self.eventManager, "sel", "change", sel);
                    });

                    Input.bindControl("UP", () => {
                        sel -= 1;
                        if (sel < 0) sel = options.length - 1;
                        Engine.Events.emit(self.eventManager, "sel", "change", sel);
                    });

                    Input.bindControl("ACTION",
                        () => {
                            switch (options[sel]) {
                                case "Build Wall":
                                    break;
                                case "Build Tower":
                                    break;
                                case "Close":
                                    let stateManager = parentScene.subSceneManager;
                                    stateManager.pop(parentScene);
                                    break;
                            }
                        }, () => { });

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