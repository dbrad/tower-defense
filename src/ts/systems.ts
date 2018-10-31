/// <reference path="./engine/entity.ts" />
/// <reference path="./engine/tilemap.ts" />
/// <reference path="./engine/camera.ts" />
// @ifdef DEBUG
/// <reference path="./engine/debug.ts" />
// @endif

namespace System {
    import ECS = Engine.ECS;

    let ECSStorage: { [key: number]: { [key: string]: any } } = {};

    export function handlePlayerInput(entity: ECS.Entity): void {
        // @ifdef DEBUG
        DEBUG.assert(entity["tilePos"] != null, "Entity must have a 'tilePos' Position to move.");
        DEBUG.assert(entity["targetTile"] != null, "Entity must have a 'targetTile' Position to move.");
        DEBUG.assert(entity["moving"] != null, "Entity must have a 'moving' Flag to move.");
        DEBUG.assert(entity["movingRight"] != null, "Entity must have a 'movingRight' Flag to move.");
        DEBUG.assert(entity["movingLeft"] != null, "Entity must have a 'movingLeft' Flag to move.");
        DEBUG.assert(entity["movingUp"] != null, "Entity must have a 'movingUp' Flag to move.");
        DEBUG.assert(entity["movingDown"] != null, "Entity must have a 'movingDown' Flag to move.");
        // @endif

        if (entity["moving"].value == false) {
            if (entity["movingRight"].value) {
                entity["targetTile"].value.x++;
            }
            if (entity["movingLeft"].value) {
                entity["targetTile"].value.x--;
            }
            if (entity["movingUp"].value) {
                entity["targetTile"].value.y--;
            }
            if (entity["movingDown"].value) {
                entity["targetTile"].value.y++;
            }

            if (entity["tilePos"].value.x != entity["targetTile"].value.x ||
                entity["tilePos"].value.y != entity["targetTile"].value.y) {
                entity["moving"].value = true;
            }
        }
    }

    export function handleCollision(entity: ECS.Entity, tileMap: Engine.TileMap) {
        // @ifdef DEBUG
        DEBUG.assert(entity["tilePos"] != null, "Entity must have a 'tilePos' Position to move.");
        DEBUG.assert(entity["targetTile"] != null, "Entity must have a 'targetTile' Position to move.");
        DEBUG.assert(entity["moving"] != null, "Entity must have a 'moving' Flag to move.");
        DEBUG.assert(entity["movingRight"] != null, "Entity must have a 'movingRight' Flag to move.");
        DEBUG.assert(entity["movingLeft"] != null, "Entity must have a 'movingLeft' Flag to move.");
        DEBUG.assert(entity["movingUp"] != null, "Entity must have a 'movingUp' Flag to move.");
        DEBUG.assert(entity["movingDown"] != null, "Entity must have a 'movingDown' Flag to move.");
        // @endif

        if (entity["movingRight"].value || entity["movingLeft"].value) {
            let tile = Engine.TileMap.getTile(tileMap, { x: entity["targetTile"].value.x, y: entity["tilePos"].value.y });
            if (tile.hasCollision) {
                entity["movingRight"].value = entity["movingLeft"].value = false;
                entity["targetTile"].value.x = entity["tilePos"].value.x;
            }
        }
        if (entity["movingUp"].value || entity["movingDown"].value) {
            let tile = Engine.TileMap.getTile(tileMap, { x: entity["tilePos"].value.x, y: entity["targetTile"].value.y });
            if (tile.hasCollision) {
                entity["movingUp"].value = entity["movingDown"].value = false;
                entity["targetTile"].value.y = entity["tilePos"].value.y;
            }
        }
        if (entity["tilePos"].value.x === entity["targetTile"].value.x &&
            entity["tilePos"].value.y === entity["targetTile"].value.y) {
            entity["moving"].value = false;
        }
    }

    export function moveEntity(entity: ECS.Entity, now: number) {
        // @ifdef DEBUG
        DEBUG.assert(entity["tilePos"] != null, "Entity must have a 'tilePos' Position to move.");
        DEBUG.assert(entity["targetTile"] != null, "Entity must have a 'targetTile' Position to move.");
        DEBUG.assert(entity["renderPos"] != null, "Entity must have a 'renderPos' Position to move.");
        DEBUG.assert(entity["moving"] != null, "Entity must have a 'moving' Flag to move.");
        // @endif

        if (ECSStorage[entity.id] == null) {
            ECSStorage[entity.id] = {};
        }
        if (ECSStorage[entity.id]["moveFn"] == null) {
            ECSStorage[entity.id]["moveFn"] = Interpolator(now, 200, Easing.linear);
        }
        let interp = ECSStorage[entity.id]["moveFn"].next(now);
        let o = TileToPixel(entity["tilePos"].value, 8);
        let d = TileToPixel(entity["targetTile"].value, 8);

        entity["renderPos"].value.x = o.x + Math.round((d.x - o.x) * interp.value);
        entity["renderPos"].value.y = o.y + Math.round((d.y - o.y) * interp.value);

        if (interp.done == true) {
            entity["moving"].value = false;
            entity["tilePos"].value = CopyV2(entity["targetTile"].value);
            entity["renderPos"].value = TileToPixel(entity["tilePos"].value, 8);
            delete ECSStorage[entity.id]["moveFn"];
        }
    }
}