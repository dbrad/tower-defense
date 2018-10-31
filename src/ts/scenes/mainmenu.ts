/// <reference path="../engine/core.ts" />
/// <reference path="../engine/gl.ts" />
/// <reference path="../engine/assets.ts" />
/// <reference path="../engine/graphics.ts" />
/// <reference path="../engine/input.ts" />

namespace Scenes {
    import E = Engine;
    import Core = E.Core;
    import Input = E.Input;
    import Gfx = E.Graphics;
    import Assets = E.Assets;
    import GL = E.GL;

    let sel = 0;
    export let MainMenu: E.Scene = {
        name: "MainMenu",
        transitionIn() {
            Input.bindControl("DOWN", () => { sel += 1; if (sel > 2) sel = 0; });
            Input.bindControl("UP", () => { sel -= 1; if (sel < 0) sel = 2; });
            Input.bindControl("ACTION", () => { Core.pushScene("Main"); });
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

            Gfx.Text.draw(gl, "Start", hw - 16, hh, Gfx.Text.Alignment.LEFT);
            Gfx.Text.draw(gl, "Also Start", hw - 16, hh + 16, Gfx.Text.Alignment.LEFT);
            Gfx.Text.draw(gl, "They All Start", hw - 16, hh + 32, Gfx.Text.Alignment.LEFT);
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