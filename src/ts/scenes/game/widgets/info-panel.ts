/// <reference path="../../../engine/graphics.ts" />

namespace Scenes {
    export namespace Game {
        export namespace Widgets {
            export class InfoPanel {
                public texture: Engine.Assets.Texture;
                public name: string;
                public info: string[];
            }
            export namespace InfoPanel {
                export function draw(gl: Engine.GL.Renderer, infoPanel: InfoPanel, position: V2) {
                    Engine.Graphics.Texture.draw({
                        renderer: gl,
                        texture: infoPanel.texture,
                        position: V2.add(position, { x: 0, y: 0 })
                    });

                    Engine.Graphics.Text.draw(gl, infoPanel.name, V2.add(position, { x: 0, y: 0 }), Engine.Graphics.Text.Alignment.CENTER);
                }
            }
        }
    }
}