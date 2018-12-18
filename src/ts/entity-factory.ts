/// <reference path="./engine/entity.ts" />
/// <reference path="./engine/graphics.ts" />
/// <reference path="./engine/util.ts" />

namespace EntityFactory {
    import ECS = Engine.ECS;
    import Component = Engine.ECS.Component;
    import Gfx = Engine.Graphics;

    export function Text(position: V2, textData: Gfx.Text.Data, sort: number = 10): ECS.Entity {
        const text = new ECS.Entity();
        text.addComponent("renderPos", position);
        text.addComponent("text", textData);
        text.addComponent("sort", sort);
        text.addTag("renderable");
        return text;
    }

    export function WayPoint(
        position: V2,
        tileMap: Engine.TileMap,
        waypointNumber: number,
        sort: number = 3,
    ): ECS.Entity {
        const waypoint = new ECS.Entity();
        waypoint.addTag("blockBuilding");
        waypoint.addTag("waypoint");
        waypoint.addComponent("waypointNumber", waypointNumber);
        const tilePos = waypoint.addComponent<V2>("tilePos", position);
        waypoint.addComponent<V2>("renderPos", TileToPixel(tilePos.value, tileMap.tileSize));
        waypoint.addComponent<V2>("targetTile", CopyV2(tilePos.value));
        {
            const sprite: Gfx.Sprite = Gfx.SpriteStore["spawner"].clone();
            sprite.setColourHex(0xFF663366);
            waypoint.addComponent("sprite", sprite);
        }
        waypoint.addComponent("sort", sort);
        waypoint.addTag("renderable");
        Engine.TileMap.mapEntity(waypoint, tileMap, tilePos.value);
        return waypoint;
    }

    export function EndPoint(
        position: V2,
        tileMap: Engine.TileMap,
        sort: number = 3,
    ): ECS.Entity {
        const endpoint = new ECS.Entity();
        endpoint.addTag("blockBuilding");
        endpoint.addTag("endpoint");
        const tilePos = endpoint.addComponent<V2>("tilePos", position);
        endpoint.addComponent<V2>("renderPos", TileToPixel(tilePos.value, tileMap.tileSize));
        endpoint.addComponent<V2>("targetTile", CopyV2(tilePos.value));
        {
            const sprite: Gfx.Sprite = Gfx.SpriteStore["spawner"].clone();
            sprite.setColourHex(0xFF336666);
            endpoint.addComponent("sprite", sprite);
        }
        endpoint.addComponent("sort", sort);
        endpoint.addTag("renderable");
        Engine.TileMap.mapEntity(endpoint, tileMap, tilePos.value);
        return endpoint;
    }
}
