/// <reference path="engine/core.ts" />
/// <reference path="engine/assets.ts" />
/// <reference path="engine/graphics.ts" />
/// <reference path="scenes/title-menu/title-menu.ts" />
/// <reference path="scenes/game/game.ts" />
/// <reference path="scenes/settings-menu/settings-menu.ts" />
/// <reference path="scenes/post-game/post-game.ts" />
/// <reference path="engine/util.ts" />

// @ifdef DEBUG
/// <reference path="scenes/debug/debug.ts" />
// @endif

namespace Game {
    import Core = Engine.Core;
    import Gfx = Engine.Graphics;
    import Assets = Engine.Assets;

    //#region Sprite Data
    let spriteData: Gfx.SpriteDef[] = [
        {
            name: "cursor",
            animations: {
                "DEFAULT": [{
                    texture: "cursor",
                    duration: 0,
                }],
                "blink": [{
                    texture: "cursor_light",
                    duration: 250,
                },
                {
                    texture: "cursor",
                    duration: 250,
                },
                {
                    texture: "cursor_dark",
                    duration: 250,
                },
                {
                    texture: "cursor",
                    duration: 250,
                }],
                "quick-blink": [{
                    texture: "cursor_light",
                    duration: 150,
                },
                {
                    texture: "cursor",
                    duration: 150,
                },
                {
                    texture: "cursor_dark",
                    duration: 150,
                },
                {
                    texture: "cursor",
                    duration: 150,
                }],
            },
        },
        {
            name: "spawner",
            animations: {
                "DEFAULT": [{
                    texture: "spawner",
                    duration: 0,
                }],
            },
        },
        {
            name: "arrow",
            animations: {
                "DEFAULT": [{
                    colour: Colour.argb(0, 0, 0, 0),
                    duration: 0,
                    texture: "arrow_cart",
                }],
                "blink": [{
                    colour: Colour.argb(50, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_cart",
                },
                {
                    colour: Colour.argb(75, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_cart",
                },
                {
                    colour: Colour.argb(100, 200, 55, 55),
                    duration: 750,
                    texture: "arrow_cart",
                },
                {
                    colour: Colour.argb(75, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_cart",
                },
                {
                    colour: Colour.argb(50, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_cart",
                }],
            },
        },
        {
            name: "arrow_diag",
            animations: {
                "DEFAULT": [{
                    colour: Colour.argb(0, 0, 0, 0),
                    duration: 0,
                    texture: "arrow_diag",
                }],
                "blink": [{
                    colour: Colour.argb(50, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_diag",
                },
                {
                    colour: Colour.argb(75, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_diag",
                },
                {
                    colour: Colour.argb(100, 200, 55, 55),
                    duration: 750,
                    texture: "arrow_diag",
                },
                {
                    colour: Colour.argb(75, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_diag",
                },
                {
                    colour: Colour.argb(50, 200, 55, 55),
                    duration: 150,
                    texture: "arrow_diag",
                }],
            },
        },
    ];
    //#endregion

    export interface GameState {
        version: string;
        wallPoints: number;
        towerPoints: number;
        upgradePoint: number;
    }

    export let gameState: GameState = null;

    export function setup(): void {
        // @ifdef DEBUG
        Core.addScene(Scenes.Debug);
        // @endif
        Core.addScene(Scenes.TitleMenu);
        Core.addScene(Scenes.SettingsMenu);
        Core.addScene(Scenes.Game.scene);
        Core.addScene(Scenes.PostGame);

        for (let sprite of spriteData) {
            Gfx.Sprite.CreateAndStore(sprite);
        }

        Engine.Tile.CreateAndStore(
            "north_wall",
            Assets.TextureStore['brick'],
            0xFF2d2d2d,
            true,
        );

        // 0xAABBGGRR
        Engine.Tile.CreateAndStore(
            "wall",
            Assets.TextureStore['brick'],
            0xFF2d2d2d,
            true,
        );

        Engine.Tile.CreateAndStore(
            "floor",
            Assets.TextureStore['brick'],
            0xFF050505,
            false,
        );

        let dialog: Gfx.NinePatch = {
            tl: Assets.TextureStore["dialog_tl"], tc: Assets.TextureStore["dialog_t"], tr: Assets.TextureStore["dialog_tr"],
            ml: Assets.TextureStore["dialog_ml"], mc: Assets.TextureStore["dialog_m"], mr: Assets.TextureStore["dialog_mr"],
            bl: Assets.TextureStore["dialog_bl"], bc: Assets.TextureStore["dialog_b"], br: Assets.TextureStore["dialog_br"],
        };

        Gfx.NinePatchStore["dialog"] = dialog;

        Core.pushScene("TitleMenu");
    }
}
