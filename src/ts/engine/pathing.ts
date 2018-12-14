/// <reference path="entity.ts" />
/// <reference path="tilemap.ts" />
/// <reference path="util.ts" />

namespace Engine {
    export namespace TileMap {
        export function convertToCellMap(tileMap: Engine.TileMap, entityManager: ECS.Manager): Pathing.CellMap {
            return new Pathing.CellMap();
        }
    }

    export namespace Pathing {

        export class CellMap {
            cells: Cell[];
            size: V2;
        }

        export class Cell {
            parent: Cell;
            position: V2;
            g: number;
            h: number;
            get f() {
                return this.g + this.h;
            }
        }

        class NeighborGroup {
            North: Cell;
            South: Cell;
            West: Cell;
            East: Cell;
            NorthWest: Cell;
            NorthEast: Cell;
            SouthWest: Cell;
            SouthEast: Cell;

            *[Symbol.iterator](): IterableIterator<Cell> {
                yield this.North;
                yield this.South;
                yield this.West;
                yield this.East;
                yield this.NorthWest;
                yield this.NorthEast;
                yield this.SouthWest;
                yield this.SouthEast;
                return (1);
            }
        }

        function getNeighbors(map: CellMap, cell: Cell): NeighborGroup {
            let neighbors: NeighborGroup = new NeighborGroup();
            let positionCopy = CopyV2(cell.position);
            neighbors.North = getCell(map, V2.add(positionCopy, { x: 0, y: -1 }));
            neighbors.South = getCell(map, V2.add(positionCopy, { x: 0, y: 1 }));
            neighbors.West = getCell(map, V2.add(positionCopy, { x: -1, y: 0 }));
            neighbors.East = getCell(map, V2.add(positionCopy, { x: 1, y: 0 }));

            neighbors.NorthWest = getCell(map, V2.add(positionCopy, { x: -1, y: -1 }));
            neighbors.NorthEast = getCell(map, V2.add(positionCopy, { x: 1, y: -1 }));
            neighbors.SouthWest = getCell(map, V2.add(positionCopy, { x: -1, y: 1 }));
            neighbors.SouthEast = getCell(map, V2.add(positionCopy, { x: 1, y: 1 }));
            return neighbors;
        }

        function getCell(map: CellMap, position: V2): Cell {
            if (position.x < 0 || position.x >= map.size.x ||
                position.y < 0 || position.y >= map.size.y) {
                return null;
            }
            let index = position.x + (position.y * map.size.x);
            return map.cells[index];
        }

        export function generatePath(map: CellMap, start: V2, end: V2): V2[] {
            let openList: Cell[] = [];
            let closedList: Cell[] = [];

            let startingNode = getCell(map, start);
            openList.push(startingNode);

            while (openList.length > 0) {
                openList.sort((a,b) => { return b.f - a.f});
                let current = openList.pop();
                let neighbors = getNeighbors(map, current);
                for(let cell of neighbors) {
                    
                }
                closedList.push(current);
            }
            return [];
        }
    }
}