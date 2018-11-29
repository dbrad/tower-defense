/// <reference path="engine/core.ts" />
/// <reference path="engine/assets.ts" />
/// <reference path="engine/graphics.ts" />
/// <reference path="scenes/mainmenu.ts" />
/// <reference path="scenes/main.ts" />
/// <reference path="engine/util.ts" />

namespace Game {
    import Core = Engine.Core;
    import Gfx = Engine.Graphics;
    import Assets = Engine.Assets;

    let spriteData: Gfx.SpriteDef[] = [{
        name: "dude01",
        animations: {
            "DEFAULT": [{
                texture: "guy_stand",
                duration: 0
            }],
            "walk": [{
                texture: "guy_01",
                duration: 250
            },
            {
                texture: "guy_02",
                duration: 250
            },
            ]
        }
    },
    {
        name: "dude02",
        animations: {
            "DEFAULT": [{
                texture: "guy_stand",
                duration: 0
            }],
            "walk": [{
                texture: "guy_02",
                duration: 250
            },
            {
                texture: "guy_stand",
                duration: 250
            },
            {
                texture: "guy_01",
                duration: 250
            },
            {
                texture: "guy_stand",
                duration: 250
            }
            ]
        }
    }
    ];

    export function setup(): void {
        Core.addScene(Scenes.MainMenu);
        Core.addScene(Scenes.Main);

        for(let sprite of spriteData) {
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

        Gfx.SpriteStore["dude01"].play("walk", true);
        Gfx.SpriteStore["dude02"].play("walk", true);

        let dialog: Gfx.NinePatch = {
            tl: Assets.TextureStore["dialog_tl"], tc: Assets.TextureStore["dialog_t"], tr: Assets.TextureStore["dialog_tr"],
            ml: Assets.TextureStore["dialog_ml"], mc: Assets.TextureStore["dialog_m"], mr: Assets.TextureStore["dialog_mr"],
            bl: Assets.TextureStore["dialog_bl"], bc: Assets.TextureStore["dialog_b"], br: Assets.TextureStore["dialog_br"]
        }

        Gfx.NinePatchStore["dialog"] = dialog;

        Core.pushScene("MainMenu");
    }
}