/// <reference path="entity.ts" />
/// <reference path="tilemap.ts" />
/// <reference path="util.ts" />

namespace Engine {
    export namespace TileMap {
        export function convertToCellMap(tileMap: Engine.TileMap): Pathing.CellMap {
            const iterator = TileMap.Iterator(tileMap);
            const cellMap = new Pathing.CellMap();
            cellMap.size = tileMap.mapSize;
            for (const node of iterator) {
                let cell: Pathing.Cell = null;
                if (!node.tile.hasCollision) {
                    const blocking = node.entities.filter((entity) => entity.hasComponent("blockMovement"));
                    if (blocking.length === 0) {
                        cell = new Pathing.Cell();
                        cell.position = node.position;
                    }
                }
                const index = node.position.x + (node.position.y * tileMap.mapSize.x);
                cellMap.cells[index] = cell;
            }
            return cellMap;
        }
    }

    export namespace Pathing {

        export class CellMap {
            public cells: Cell[] = [];
            public size: V2;
        }

        export class Cell {
            public parent: Cell;
            public position: V2;
            public g: number = 0;
            public h: number = 0;
            public get f(): number {
                return this.g + this.h;
            }
        }

        class NeighborGroup {
            public North: Cell;
            public South: Cell;
            public West: Cell;
            public East: Cell;
            public NorthWest: Cell;
            public NorthEast: Cell;
            public SouthWest: Cell;
            public SouthEast: Cell;

            public *[Symbol.iterator](): IterableIterator<{ cell: Cell, direction: string }> {
                yield { cell: this.North, direction: "North" };
                yield { cell: this.South, direction: "South" };
                yield { cell: this.West, direction: "West" };
                yield { cell: this.East, direction: "East" };
                yield { cell: this.NorthWest, direction: "NorthWest" };
                yield { cell: this.NorthEast, direction: "NorthEast" };
                yield { cell: this.SouthWest, direction: "SouthWest" };
                yield { cell: this.SouthEast, direction: "SouthEast" };
                return (1);
            }
        }

        function getNeighbors(map: CellMap, cell: Cell): NeighborGroup {
            const neighbors: NeighborGroup = new NeighborGroup();
            const positionCopy = CopyV2(cell.position);
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
            const index = position.x + (position.y * map.size.x);
            return map.cells[index];
        }

        function getHeuristic(current: V2, end: V2): number {
            return Math.sqrt(
                Math.pow(current.x - end.x, 2) +
                Math.pow(current.y - end.y, 2),
            );
        }

        function reconstructPath(finalCell: Cell): V2[] {
            let path: V2[] = [];
            let current = finalCell;
            path.push({ x: finalCell.position.x, y: finalCell.position.y });
            while (current.parent != null) {
                const pos = CopyV2(current.parent.position);
                path.push(pos);
                current = current.parent;
            }
            path = path.reverse();
            return path;
        }

        export function generatePath(map: CellMap, start: V2, end: V2): V2[] {
            const openList: Cell[] = [];
            const closedList: Cell[] = [];

            const startingNode = getCell(map, start);
            startingNode.g = 0;
            startingNode.h = getHeuristic(start, end);
            openList.push(startingNode);

            while (openList.length > 0) {
                openList.sort((a, b) => b.f - a.f);
                const current = openList.pop();

                if (V2.equal(current.position, end)) {
                    return reconstructPath(current);
                }

                closedList.push(current);

                const neighbors = getNeighbors(map, current);
                for (const neighbor of neighbors) {
                    if (neighbor.cell == null) {
                        switch (neighbor.direction) {
                            case "North":
                                neighbors.NorthWest = null;
                                neighbors.NorthEast = null;
                                break;
                            case "South":
                                neighbors.SouthWest = null;
                                neighbors.SouthEast = null;
                                break;
                            case "West":
                                neighbors.NorthWest = null;
                                neighbors.SouthWest = null;
                                break;
                            case "East":
                                neighbors.NorthEast = null;
                                neighbors.SouthEast = null;
                                break;
                        }
                        continue;
                    } else {
                        const inClosedList = closedList.some((cell) => V2.equal(cell.position, neighbor.cell.position));
                        if (inClosedList) {
                            continue;
                        }

                        const tentativeG = current.g + 10;

                        const inOpenList = openList.some((cell) => V2.equal(cell.position, neighbor.cell.position));
                        if (!inOpenList) {
                            openList.push(neighbor.cell);
                        } else if (tentativeG >= neighbor.cell.g) {
                            continue;
                        }

                        neighbor.cell.parent = current;
                        neighbor.cell.g = tentativeG;
                        neighbor.cell.h = getHeuristic(neighbor.cell.position, end);
                    }
                }
            }
            return [];
        }
    }
}
