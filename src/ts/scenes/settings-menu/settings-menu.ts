/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/gl.ts" />
/// <reference path="../../engine/assets.ts" />
/// <reference path="../../engine/graphics.ts" />
/// <reference path="../../engine/input.ts" />

namespace Scenes {
    import E = Engine;
    import Core = E.Core;
    import Input = E.Input;
    import Gfx = E.Graphics;
    import Assets = E.Assets;
    import GL = E.GL;

    let sel = 0;
    let options: string[];

    export let SettingsMenu: E.Scene = {
        name: "SettingsMenu",
        transitionIn() {
            options = ["Back"];
            Input.bindControl("DOWN", () => { sel += 1; if (sel > options.length - 1) sel = 0; });
            Input.bindControl("UP", () => { sel -= 1; if (sel < 0) sel = options.length - 1; });
            Input.bindControl("ACTION", () => {
                switch (options[sel]) {
                    case "Back":
                        Core.popScene();
                }
            });
        },
        transitionOut() {
            Input.unbindControl("DOWN");
            Input.unbindControl("UP");
            Input.unbindControl("ACTION");
        },
        update(now: number, delta: number): void {

        },
        render(gl: GL.Renderer, now: number, delta: number): void {
            let s: Assets.Texture;

            gl.col = 0xFF0000FF;
            Gfx.NinePatch.draw(gl, Gfx.NinePatchStore["dialog"], 0, 0, 32, 18);

            gl.col = 0xFFFFFFFF;
            let hw = ~~(Core.WIDTH / 2);
            let hh = ~~(Core.HEIGHT / 2);

            options.forEach((value, index, array) => {
                Gfx.Text.draw(gl, value, hw - 16, hh + (16 * index), Gfx.Text.Alignment.LEFT);
            });

            Gfx.Texture.draw({
                renderer: gl,
                texture: Assets.TextureStore["guy_stand"],
                position: {
                    x: hw - 32,
                    y: hh - 2 + (16 * sel)
                }
            });
        }
    };
}