/// <reference path="../engine/util.ts" />
/// <reference path="../engine/tilemap.ts" />
/// <reference path="../engine/entity.ts" />
/// <reference path="../engine/pathing.ts" />

namespace PathGenerator {
    import ECS = Engine.ECS;

    export function testAndGenerate(
        spawnPoint: ECS.Entity,
        wayPoints: ECS.Entity[],
        endpoint: ECS.Entity,
        tileMap: Engine.TileMap,
        testPosition: V2,
    ): V2[] {
        let path: V2[] = [];

        let from = spawnPoint;
        let to: ECS.Entity;
        for (const waypoint of wayPoints) {
            to = waypoint;

            const fromPos = from.getValue<V2>("tilePos");
            const toPos = to.getValue<V2>("tilePos");

            const cellMap = Engine.TileMap.convertToCellMap(tileMap);
            const index = testPosition.x + (testPosition.y * tileMap.mapSize.x);
            cellMap.cells[index] = null;

            const currentPath = Engine.Pathing.generatePath(
                cellMap,
                fromPos,
                toPos,
            );

            if (currentPath.length === 0) {
                path.length = 0;
                break;
            } else {
                path = path.concat(currentPath.slice(1));
                from = to;
            }
        }

        if (path.length !== 0) {
            to = endpoint;

            const fromPos = from.getValue<V2>("tilePos");
            const toPos = to.getValue<V2>("tilePos");

            const cellMap = Engine.TileMap.convertToCellMap(tileMap);
            const index = testPosition.x + (testPosition.y * tileMap.mapSize.x);
            cellMap.cells[index] = null;

            const currentPath = Engine.Pathing.generatePath(
                cellMap,
                fromPos,
                toPos,
            );
            if (currentPath.length === 0) {
                path.length = 0;
            } else {
                path = path.concat(currentPath.slice(1));
            }
        }

        return path;
    }

    export function generate(
        spawnPoint: ECS.Entity,
        wayPoints: ECS.Entity[],
        endpoint: ECS.Entity,
        tileMap: Engine.TileMap,
    ): V2[] {
        let path: V2[] = [];

        let from = spawnPoint;
        let to: ECS.Entity;
        for (const waypoint of wayPoints) {
            to = waypoint;

            const fromPos = from.getValue<V2>("tilePos");
            const toPos = to.getValue<V2>("tilePos");

            const cellMap = Engine.TileMap.convertToCellMap(tileMap);

            const currentPath = Engine.Pathing.generatePath(
                cellMap,
                fromPos,
                toPos,
            );

            if (currentPath.length === 0) {
                path.length = 0;
                break;
            } else {
                path = path.concat(currentPath.slice(1));
                from = to;
            }
        }

        if (path.length !== 0) {
            to = endpoint;

            const fromPos = from.getValue<V2>("tilePos");
            const toPos = to.getValue<V2>("tilePos");

            const cellMap = Engine.TileMap.convertToCellMap(tileMap);

            const currentPath = Engine.Pathing.generatePath(
                cellMap,
                fromPos,
                toPos,
            );
            if (currentPath.length === 0) {
                path.length = 0;
            } else {
                path = path.concat(currentPath.slice(1));
            }
        }

        return path;
    }
}
