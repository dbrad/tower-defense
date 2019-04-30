/// <reference path="engine/core.ts" />
/// <reference path="engine/assets.ts" />
/// <reference path="engine/input.ts" />
/// <reference path="tower-defense.ts" />
// @ifdef DEBUG
/// <reference path="engine/stats.ts" />
// @endif

namespace TowerDefense {
    import Core = Engine.Core;
    import Input = Engine.Input;
    import Assets = Engine.Assets;
    // @ifdef DEBUG
    import Stats = Engine.Stats;
    // @endif

    const assetData: { [key: string]: Assets.TextureAtlas } = {
        alpha: {
            loc: "res/alpha.png",
            sWidth: 5,
            sHeight: 5,
            textures: [
                ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
                ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "!", "?", "#", "(", ")", "-", "^", "+", "=", "/", "\\", ":", ",", "'", '"'],
            ],
        },
        tiles: {
            loc: "res/test.png",
            sWidth: 16,
            sHeight: 16,
            textures: [
                ["brick", "cursor", "cursor_dark", "cursor_light", "spawner"],
                ["dialog_tl", "dialog_t", "dialog_tr", "arrow_cart", "wall"],
                ["dialog_ml", "dialog_m", "dialog_mr", "arrow_diag", ""],
                ["dialog_bl", "dialog_b", "dialog_br", "point", ""],
                ["slime_rest", "slime_jump_1", "slime_jump_2", "slime_jump_3", "slime_jump_end"],
            ],
        },
        irreg: {
            loc: "res/irreg.png",
            textures: [
                {
                    name: "test",
                    x: 0,
                    y: 0,
                    width: 32,
                    height: 32,
                },
            ],
        },

    };

    export function onload(): void {
        function onResize(): void {
            const c = Core._gl.canvas;
            let scaleToFit: number = Math.min((window.innerWidth / c.width), (window.innerHeight / c.height)) | 0;
            scaleToFit = (scaleToFit <= 0) ? 1 : scaleToFit;
            const size: number[] = [c.width * scaleToFit, c.height * scaleToFit];
            const offset: number[] = [(window.innerWidth - size[0]) / 2, (window.innerHeight - size[1]) / 2];
            const rule: string = `translate(${~~offset[0]}px, ${~~offset[1]}px) scale(${~~scaleToFit})`;
            const stage: HTMLDivElement = document.getElementById("stage") as HTMLDivElement;
            stage.style.transform = rule;
            stage.style.webkitTransform = rule;
        }

        Core.init(document.getElementById("canvas") as HTMLCanvasElement);

        SaveManager.setStorage(window.localStorage);

        // Defining and binding Controls
        Input.Controls["UP"] = [38, 87];
        Input.Controls["DOWN"] = [40, 83];
        Input.Controls["LEFT"] = [37, 65];
        Input.Controls["RIGHT"] = [39, 68];
        Input.Controls["ACTION"] = [13, 32];
        Input.Controls["BACK"] = [27];

        // @ifdef DEBUG
        Stats.init(
            document.getElementById("fps"),
            document.getElementById("ms"));
        // @endif

        Assets.load(assetData,
            (): void => {
                window.onresize = onResize;
                onResize();
                window.onblur = () => {
                    Core.pause();
                };
                window.onfocus = () => {
                    Core.unpause();
                };
                Core.start();
                TowerDefense.setup();
            });
    }
}

window.onload = TowerDefense.onload;
