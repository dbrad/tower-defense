/// <reference path="./engine/entity.ts" />
/// <reference path="./engine/graphics.ts" />
/// <reference path="./engine/util.ts" />

namespace EntityFactory {
    import ECS = Engine.ECS;
    import Component = Engine.ECS.Component;
    import Gfx = Engine.Graphics;

    export function Text(position: V2, textData: Gfx.Text.Data, sort: number = 10): ECS.Entity {
        let text = new ECS.Entity();
        text.addComponent("renderPos", position);
        text.addComponent("text", textData);
        text.addComponent("sort", sort);
        text.addTag("renderable");
        return text;
    }
}