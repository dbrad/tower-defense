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

    export let PostGame: E.Scene = new E.Scene({
        name: "PostGame",
        transitionIn() {
            Input.bindControl("ACTION", () => {
                Core.popScene();
                Core.popScene();
            });
        },
        transitionOut() {
            Input.unbindControl("ACTION");
        },
        update(now: number, delta: number): void {

        },
        render(gl: GL.Renderer, now: number, delta: number): void {
            let s: Assets.Texture;

            gl.col = 0xFFdd2222;
            Gfx.NinePatch.draw(gl, Gfx.NinePatchStore["dialog"], 0, 0, 32, 18);

            gl.col = 0xFFFFFFFF;
            let hw = ~~(Core.WIDTH / 2);
            let hh = ~~(Core.HEIGHT / 2);

            Gfx.Text.draw(gl, "Winner is you.", hw, hh, Gfx.Text.Alignment.CENTER);
        }
    });
}