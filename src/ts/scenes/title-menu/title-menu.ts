/// <reference path="../../engine/core.ts" />
/// <reference path="../../engine/gl.ts" />
/// <reference path="../../engine/assets.ts" />
/// <reference path="../../engine/graphics.ts" />
/// <reference path="../../engine/input.ts" />
/// <reference path="../../systems/save-manager.ts" />

namespace Scenes {
    import E = Engine;
    import Core = E.Core;
    import Input = E.Input;
    import Gfx = E.Graphics;
    import Assets = E.Assets;
    import GL = E.GL;

    let sel = 0;
    let options: string[];

    export let TitleMenu: E.Scene = new E.Scene({
        name: "TitleMenu",
        transitionIn() {
            
            if (SaveManager.saveExists()) {
                options = ["Continue", "New Game", "Settings"];
            } else {
                options = ["New Game", "Settings"];
            }

            Input.bindControl("DOWN", () => { sel += 1; if (sel > options.length - 1) sel = 0; });
            Input.bindControl("UP", () => { sel -= 1; if (sel < 0) sel = options.length - 1; });
            Input.bindControl("ACTION", () => {
                switch (options[sel]) {
                    case "Continue":
                        SaveManager.load();
                        Core.pushScene("Game");
                        break;
                    case "New Game":
                        SaveManager.newGame();
                        Core.pushScene("Game");
                        break;
                    case "Settings":
                        Core.pushScene("SettingsMenu");
                        break;
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

            gl.col = 0xFFFF0000;
            Gfx.NinePatch.draw(gl, Gfx.NinePatchStore["dialog"], 0, 0, 32, 18);

            gl.col = 0xFFFFFFFF;
            let hw = ~~(Core.WIDTH / 2);
            let hh = ~~(Core.HEIGHT / 2);

            Gfx.Text.draw(gl, "Tower Defense", 16, 16, Gfx.Text.Alignment.LEFT);

            options.forEach((value, index, array) => {
                Gfx.Text.draw(gl, value, 32, hh + (16 * index), Gfx.Text.Alignment.LEFT);
            });

            Gfx.Texture.draw({
                renderer: gl,
                texture: Assets.TextureStore["cursor"],
                position: {
                    x: 16,
                    y: hh - 2 + (16 * sel)
                }
            });
        }
    });
}