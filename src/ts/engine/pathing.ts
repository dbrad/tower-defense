namespace Engine {
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

        type NeighborGroup = {
            North: Cell,
            South: Cell,
            West: Cell,
            East: Cell,
            NorthWest: Cell,
            NorthEast: Cell,
            SouthWest: Cell,
            SouthEast: Cell
        }

        function GetNeighbors(map: CellMap, cell: Cell): NeighborGroup {
            let neighbors: NeighborGroup;
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

        export function generate() {

        }
    }
}