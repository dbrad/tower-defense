/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/gl.ts" />
/// <reference path="../../engine/graphics.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../engine/entity.ts" />

namespace Scenes {
    import E = Engine;
    import Core = Engine.Core;
    import Input = Engine.Input;
    import Gfx = Engine.Graphics;
    import GL = Engine.GL;
    import Component = Engine.ECS.Component;

    export let SettingsMenu: E.Scene = new E.Scene({
        name: "SettingsMenu",
        transitionIn() {
            let self = this as E.Scene;
            let sel = 0;
            let options: string[] = ["Back"];

            let hh = ~~(Core.HEIGHT / 2);
            let hw = ~~(Core.WIDTH / 2);

            let ecs = self.ecsManager;
            {
                let ninePatch = ecs.addEntity();
                ninePatch.addComponent(new Component.Position("tilePos", { x: 0, y: 0 }));
                ninePatch.addComponent(
                    new Component.Object<Gfx.NinePatch.Data>("9patch",
                        {
                            name: "dialog",
                            colour: 0xFFFF0000,
                            tileSize: { x: 32, y: 18 }
                        }));
                ninePatch.addComponent(new Component.Number("sort", 0));
                ninePatch.addComponent(new Component.Tag("renderable"));
            }
            {
                let text = ecs.addEntity();
                text.addComponent(new Component.Position("renderPos", { x: hw, y: 16 }));
                text.addComponent(
                    new Component.Object<Gfx.Text.Data>("text",
                        {
                            text: "Settings",
                            textAlign: Gfx.Text.Alignment.CENTER,
                            wrapWidth: 0,
                            colour: 0xFFFFFFFF
                        }));
                text.addComponent(new Component.Number("sort", 10));
                text.addComponent(new Component.Tag("renderable"));
            }

            options.forEach((value, index, array) => {
                let text = ecs.addEntity();
                text.addComponent(new Component.Position("renderPos", { x: hw, y: hh + (16 * index) }));

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
            Input.bindControl("ACTION", () => {
                switch (options[sel]) {
                    case "Back":
                        Core.popScene();
                        break;
                }
            });
        },
        transitionOut() {
            Input.unbindAll();
        },
        update(now: number, delta: number): void { },
        render(gl: GL.Renderer, now: number, delta: number): void { }
    });
}