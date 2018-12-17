/// <reference path="./engine/entity.ts" />
/// <reference path="./engine/tilemap.ts" />
/// <reference path="./engine/camera.ts" />
// @ifdef DEBUG
/// <reference path="./engine/debug.ts" />
// @endif

namespace System {
    import ECS = Engine.ECS;
    import Component = ECS.Component;

    export function handlePlayerInput(entity: ECS.Entity): void {
        const tilePos = entity.getComponent<V2>("tilePos");
        const targetTile = entity.getComponent<V2>("targetTile");
        const moving = entity.getComponent<boolean>("moving");
        const movingRight = entity.getComponent<boolean>("movingRight");
        const movingLeft = entity.getComponent<boolean>("movingLeft");
        const movingUp = entity.getComponent<boolean>("movingUp");
        const movingDown = entity.getComponent<boolean>("movingDown");

        // @ifdef DEBUG
        DEBUG.assert(tilePos != null, "Entity must have a 'tilePos' Position to move.");
        DEBUG.assert(targetTile != null, "Entity must have a 'targetTile' Position to move.");
        DEBUG.assert(moving != null, "Entity must have a 'moving' Flag to move.");
        DEBUG.assert(movingRight != null, "Entity must have a 'movingRight' Flag to move.");
        DEBUG.assert(movingLeft != null, "Entity must have a 'movingLeft' Flag to move.");
        DEBUG.assert(movingUp != null, "Entity must have a 'movingUp' Flag to move.");
        DEBUG.assert(movingDown != null, "Entity must have a 'movingDown' Flag to move.");
        // @endif

        if (moving.value === false) {
            if (movingRight.value) {
                targetTile.value.x++;
            }
            if (movingLeft.value) {
                targetTile.value.x--;
            }
            if (movingUp.value) {
                targetTile.value.y--;
            }
            if (movingDown.value) {
                targetTile.value.y++;
            }

            if (tilePos.value.x !== targetTile.value.x ||
                tilePos.value.y !== targetTile.value.y) {
                moving.value = true;
            }
        }
    }

    export function handleCollision(entity: ECS.Entity, tileMap: Engine.TileMap) {
        const tilePos = entity.getComponent<V2>("tilePos");
        const targetTile = entity.getComponent<V2>("targetTile");
        const moving = entity.getComponent<boolean>("moving");
        const movingRight = entity.getComponent<boolean>("movingRight");
        const movingLeft = entity.getComponent<boolean>("movingLeft");
        const movingUp = entity.getComponent<boolean>("movingUp");
        const movingDown = entity.getComponent<boolean>("movingDown");

        // @ifdef DEBUG
        DEBUG.assert(tilePos != null, "Entity must have a 'tilePos' Position to move.");
        DEBUG.assert(targetTile != null, "Entity must have a 'targetTile' Position to move.");
        DEBUG.assert(moving != null, "Entity must have a 'moving' Flag to move.");
        DEBUG.assert(movingRight != null, "Entity must have a 'movingRight' Flag to move.");
        DEBUG.assert(movingLeft != null, "Entity must have a 'movingLeft' Flag to move.");
        DEBUG.assert(movingUp != null, "Entity must have a 'movingUp' Flag to move.");
        DEBUG.assert(movingDown != null, "Entity must have a 'movingDown' Flag to move.");
        // @endif

        if (movingRight.value || movingLeft.value) {
            let tile = Engine.TileMap.getTile(tileMap, { x: targetTile.value.x, y: tilePos.value.y });
            if (tile && tile.hasCollision) {
                movingRight.value = movingLeft.value = false;
                targetTile.value.x = tilePos.value.x;
            }
        }
        if (movingUp.value || movingDown.value) {
            let tile = Engine.TileMap.getTile(tileMap, { x: tilePos.value.x, y: targetTile.value.y });
            if (tile && tile.hasCollision) {
                movingUp.value = movingDown.value = false;
                targetTile.value.y = tilePos.value.y;
            }
        }
        if (tilePos.value.x === targetTile.value.x &&
            tilePos.value.y === targetTile.value.y) {
            moving.value = false;
        }
    }

    let ECSStorage: { [key: number]: { [key: string]: any } } = {};

    export function moveEntity(entity: ECS.Entity, tileMap: Engine.TileMap, now: number) {
        let tilePos = entity.getComponent<V2>("tilePos");
        let targetTile = entity.getComponent<V2>("targetTile");
        let renderPos = entity.getComponent<V2>("renderPos");
        let moving = entity.getComponent<boolean>("moving");

        // @ifdef DEBUG
        DEBUG.assert(tilePos != null, "Entity must have a 'tilePos' Position to move.");
        DEBUG.assert(targetTile != null, "Entity must have a 'targetTile' Position to move.");
        DEBUG.assert(renderPos != null, "Entity must have a 'renderPos' Position to move.");
        DEBUG.assert(moving != null, "Entity must have a 'moving' Flag to move.");
        // @endif

        if (ECSStorage[entity.id] == null) {
            ECSStorage[entity.id] = {};
        }
        if (ECSStorage[entity.id]["moveFn"] == null) {
            ECSStorage[entity.id]["moveFn"] = Interpolator(now, 160, Easing.linear);
        }
        let interp = ECSStorage[entity.id]["moveFn"].next(now);
        let o = TileToPixel(tilePos.value, tileMap.tileSize);
        let d = TileToPixel(targetTile.value, tileMap.tileSize);

        renderPos.value.x = o.x + Math.round((d.x - o.x) * interp.value);
        renderPos.value.y = o.y + Math.round((d.y - o.y) * interp.value);

        if (interp.done == true) {
            moving.value = false;
            tilePos.value = CopyV2(targetTile.value);
            renderPos.value = TileToPixel(tilePos.value, tileMap.tileSize);
            Engine.TileMap.mapEntity(entity, tileMap, tilePos.value);
            delete ECSStorage[entity.id]["moveFn"];
        }
    }
}
