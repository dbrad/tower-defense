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
                    duration: 0
                }],
                "blink": [{
                    texture: "cursor_light",
                    duration: 250
                },
                {
                    texture: "cursor",
                    duration: 250
                },
                {
                    texture: "cursor_dark",
                    duration: 250
                },
                {
                    texture: "cursor",
                    duration: 250
                }
                ]
            }
        }
    ];
    //#endregion
    export interface GameState {
        version: string;
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
            0xFFff6777,
            true
        );

        // 0xAABBGGRR
        Engine.Tile.CreateAndStore(
            "wall",
            Assets.TextureStore['brick'],
            0xFFff6777,
            true
        );

        Engine.Tile.CreateAndStore(
            "floor",
            Assets.TextureStore['brick'],
            0xFF2d2d2d,
            false
        );

        Gfx.SpriteStore["cursor"].play("blink", true);

        let dialog: Gfx.NinePatch = {
            tl: Assets.TextureStore["dialog_tl"], tc: Assets.TextureStore["dialog_t"], tr: Assets.TextureStore["dialog_tr"],
            ml: Assets.TextureStore["dialog_ml"], mc: Assets.TextureStore["dialog_m"], mr: Assets.TextureStore["dialog_mr"],
            bl: Assets.TextureStore["dialog_bl"], bc: Assets.TextureStore["dialog_b"], br: Assets.TextureStore["dialog_br"]
        }

        Gfx.NinePatchStore["dialog"] = dialog;

        Core.pushScene("TitleMenu");
    }
}