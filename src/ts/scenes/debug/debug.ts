/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/gl.ts" />
/// <reference path="../../engine/assets.ts" />
/// <reference path="../../engine/graphics.ts" />

namespace Scenes {
    import E = Engine;
    import Core = E.Core;
    import Gfx = E.Graphics;
    import Assets = E.Assets;
    import GL = E.GL;

    export let Debug: E.Scene = new E.Scene({
        name: "Debug",
        transitionIn(...args: string[]) {
            let self: E.Scene = this as E.Scene;
            self.attach<string>("message", args[0]);
        },
        transitionOut() {
        },
        update(now: number, delta: number): void {
        },
        render(gl: GL.Renderer, now: number, delta: number): void {
            gl.col = 0xFF0000FF;
            Gfx.NinePatch.draw(gl, Gfx.NinePatchStore["dialog"], 0, 0, 32, 18);

            gl.col = 0xFF0000FF;
            let hw = ~~(Core.WIDTH / 2);

            let self: E.Scene = this as E.Scene;
            Gfx.Text.draw(gl, "Assertion failed.", hw, 16, Gfx.Text.Alignment.CENTER);
            Gfx.Text.draw(gl, "Check the console for details.", hw, 24, Gfx.Text.Alignment.CENTER);
            Gfx.Text.draw(gl, self.fetch<string>("message"), hw, 48, Gfx.Text.Alignment.CENTER, 240);
        }
    });
}