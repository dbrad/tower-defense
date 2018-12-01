/// <reference path="engine/core.ts" />
/// <reference path="engine/assets.ts" />
/// <reference path="engine/input.ts" />
/// <reference path="game.ts" />
// @ifdef DEBUG
/// <reference path="engine/stats.ts" />
// @endif

namespace Game {
    import Core = Engine.Core;
    import Input = Engine.Input;
    import Assets = Engine.Assets;
    // @ifdef DEBUG
    import Stats = Engine.Stats;
    // @endif

    let assetData: { [key: string]: Assets.TextureAtlas } = {
        'alpha': {
            loc: 'res/alpha.png',
            sWidth: 5,
            sHeight: 5,
            textures: [
                ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '!', '?', '#', '(', ')', '-', '^', '+', '=', '/', '\\', ':', ',', "'", '"']
            ]
        },
        'tiles': {
            loc: 'res/test.png',
            sWidth: 8,
            sHeight: 8,
            textures: [
                ['brick', 'guy_stand', 'guy_01', 'guy_02'],
                ['dialog_tl', 'dialog_t', 'dialog_tr', 'blank03'],
                ['dialog_ml', 'dialog_m', 'dialog_mr', 'blank04'],
                ['dialog_bl', 'dialog_b', 'dialog_br', 'blank05']
            ]
        },
        'irreg': {
            loc: 'res/irreg.png',
            textures: [
                {
                    name: "test",
                    x: 0,
                    y: 0,
                    width: 32,
                    height: 32
                },
                {
                    name: "test2",
                    x: 16,
                    y: 32,
                    width: 16,
                    height: 32
                },
                {
                    name: "test3",
                    x: 32,
                    y: 0,
                    width: 64,
                    height: 64
                }
            ]
        },

    };

    export function onload() {
        function onResize(): void {
            let c = Core._gl.canvas;
            let scaleToFit: number = Math.min((window.innerWidth / c.width), (window.innerHeight / c.height)) | 0;
            scaleToFit = (scaleToFit <= 0) ? 1 : scaleToFit;
            let size: number[] = [c.width * scaleToFit, c.height * scaleToFit];
            let offset: number[] = [(window.innerWidth - size[0]) / 2, (window.innerHeight - size[1]) / 2];
            let rule: string = "translate(" + (~~offset[0]) + "px, " + (~~offset[1]) + "px) scale(" + (~~scaleToFit) + ")";
            let stage: HTMLDivElement = <HTMLDivElement>document.getElementById("stage");
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

        // @ifdef DEBUG
        Stats.init(
            document.getElementById("fps"),
            document.getElementById("ms"));
        // @endif

        Assets.load(assetData,
            (): void => {
                window.onresize = onResize;
                onResize();
                Core.start();
                Game.setup();
            });
    }
}

window.onload = Game.onload;