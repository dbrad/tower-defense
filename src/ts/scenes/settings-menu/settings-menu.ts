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
        transitionIn(): void {
            const self = this as E.Scene;
            let sel = 0;
            const options: string[] = ["Back"];

            const hh = ~~(Core.HEIGHT / 2);
            const hw = ~~(Core.WIDTH / 2);

            const ecs = self.ecsManager;
            {
                const  ninePatch = ecs.addEntity();
                ninePatch.addComponent<V2>("tilePos", { x: 0, y: 0 });
                ninePatch.addComponent<Gfx.NinePatch.Data>(
                    "9patch",
                    {
                        name: "dialog",
                        colour: 0xFFFF0000,
                        tileSize: { x: 32, y: 18 },
                    });
                ninePatch.addComponent("sort", 0);
                ninePatch.addTag("renderable");
            }
            {
                const textEntity = ecs.addEntity();
                textEntity.addComponent<V2>("renderPos", { x: hw, y: 16 });
                textEntity.addComponent<Gfx.Text.Data>(
                    "text",
                    {
                        text: "Settings",
                        textAlign: Gfx.Text.Alignment.CENTER,
                        wrapWidth: 0,
                        colour: 0xFFFFFFFF,
                    });
                textEntity.addComponent("sort", 10);
                textEntity.addTag("renderable");
            }

            options.forEach((value, index, array) => {
                const textEntity = ecs.addEntity();
                textEntity.addComponent<V2>("renderPos", { x: hw, y: hh + (16 * index) });

                let initVal = value;
                if (sel === index) { initVal = `(${initVal})`; }
                const data = textEntity.addComponent<Gfx.Text.Data>(
                    "text",
                    {
                        text: initVal,
                        textAlign: Gfx.Text.Alignment.CENTER,
                        wrapWidth: 0,
                        colour: 0xFFFFFFFF,
                    });

                textEntity.addComponent("sort", 10);
                textEntity.addTag("renderable");

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
            Input.bindControl("ACTION", () => {
                switch (options[sel]) {
                    case "Back":
                        Core.popScene();
                        break;
                }
            });
        },
        transitionOut(): void {
            Input.unbindAll();
        },
        update(now: number, delta: number): void { },
        render(gl: GL.Renderer, now: number, delta: number): void { },
    });
}
