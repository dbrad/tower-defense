/// <reference path="./engine/entity.ts" />
/// <reference path="./engine/graphics.ts" />
/// <reference path="./engine/util.ts" />

namespace EntityFactory {
    import ECS = Engine.ECS;
    import Component = Engine.ECS.Component;
    import Gfx = Engine.Graphics;

    export function Text(position: V2, textData: Gfx.Text.Data, sort: number = 10): ECS.Entity {
        let text = new ECS.Entity();
        text.addComponent(new Component.Position("renderPos", position));
        text.addComponent(new Component.Object<Gfx.Text.Data>("text", textData));
        text.addComponent(new Component.Number("sort", sort));
        text.addComponent(new Component.Tag("renderable"));
        return text;
    }
}