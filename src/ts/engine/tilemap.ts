/// <reference path="util.ts" />
/// <reference path="gl.ts" />
/// <reference path="assets.ts" />
/// <reference path="lighting.ts" />
/// <reference path="graphics.ts" />
/// <reference path="entity.ts" />

namespace Engine {

    export let TileStorage: { [key: string]: Tile } = {};
    export let TileNames: { [key: number]: string } = {};

    export namespace Graphics {
        export namespace Tile {
            export function draw(
                gl: GL.Renderer,
                camera: Camera,
                s: Assets.Texture,
                tileX: number,
                tileY: number,
            ): void {
                const w = s.w;
                const h = s.h;
                Texture.draw({
                    position: {
                        x: (tileX * w) - camera.position.x,
                        y: (tileY * h) - camera.position.y,
                    },
                    renderer: gl,
                    texture: s,
                });
            }
        }

        export namespace TileMap {
            export function draw(gl: GL.Renderer, camera: Camera, tilemap: TileMap): void {
                const cameraTilePos = PixelToTile(camera.position, tilemap.tileSize);
                const cameraTileSize = PixelToTile(camera.size, tilemap.tileSize);
                for (let x = cameraTilePos.x; x <= cameraTilePos.x + cameraTileSize.x; x++) {
                    for (let y = cameraTilePos.y; y <= cameraTilePos.y + cameraTileSize.y; y++) {
                        const tile = Engine.TileMap.getTile(tilemap, { x, y });
                        if (tile != null) {
                            gl.col = tile.colour;
                            Tile.draw(gl, camera, tile.texture, x, y);
                        }
                    }
                }
            }
        }
    }

    export type Tile = {
        id: number;
        texture: Assets.Texture;
        colour: number;
        hasCollision: boolean;
    };

    export namespace Tile {

        function* TileId(): IterableIterator<number> {
            let id = 0;
            while (true) {
                yield id++;
            }
        }

        const tileId = TileId();

        export function NextTileId(): number {
            return tileId.next().value;
        }

        export function CreateAndStore(
            name: string,
            texture: Assets.Texture,
            colour: number,
            hasCollision: boolean,
        ): Tile {
            const tile: Tile = {
                colour,
                hasCollision,
                id: NextTileId(),
                texture,
            };
            TileStorage[name] = tile;
            TileNames[tile.id] = name;
            return tile;
        }
    }

    /*
    000 |0000 0000 0000 0000 0000 |0000 000|0

    1 bit to solid (0-1), offset = 0
    7 bits => tileid (0-127), offset = 1
    20 bits => head entity id (1-‭1,048,575‬), offset = 8
    3 bits unallocated, offset = 28

    |= (val << offset) add
    &= ~(bitval << offset) remove
    */

    const COLLISION_OFFSET = 0;
    const COLLISION_SIZE = 1;
    const COLLISION_MASK = 0x1;

    const TILE_ID_OFFSET = 1;
    const TILE_ID_SIZE = 7;
    const TILE_ID_MASK = 0x7f << TILE_ID_OFFSET;

    const ENTITY_ID_OFFSET = 8;
    const ENTITY_ID_SIZE = 20;
    const ENTITY_ID_MASK = 0xFFFFF << ENTITY_ID_OFFSET;

    const UNUSED_OFFSET = ENTITY_ID_OFFSET + ENTITY_ID_SIZE;
    const UNUSED_SIZE = 31 - ENTITY_ID_SIZE - TILE_ID_SIZE - COLLISION_SIZE;

    export type TileMap = {
        tiles: number[];
        mapSize: V2;
        tileSize: number;
    };

    export namespace TileMap {

        export function* Iterator(tileMap: TileMap): IterableIterator<Node> {
            for (let x = 0; x < tileMap.mapSize.x; x++) {
                for (let y = 0; y < tileMap.mapSize.y; y++) {
                    const tile = TileMap.getTile(tileMap, { x, y });
                    const entities = TileMap.getEntities(tileMap, { x, y });
                    const position: V2 = { x, y };
                    yield { tile, position, entities };
                }
            }
            return (1);
        }

        export type Node = {
            tile: Tile;
            position: V2;
            entities: ECS.Entity[];
        };

        type EntityNode = {
            next: EntityNode;
            ecs: ECS.Entity;
            position: V2;
            previous: EntityNode;
        };

        const EntityStorage: EntityNode[] = [];

        export function addTile(tileMap: TileMap, tile: Tile, position: V2): void {
            const index = position.x + (position.y * tileMap.mapSize.x);
            if (tileMap.tiles[index] === undefined) {
                tileMap.tiles[index] = 0;
            }
            tileMap.tiles[index] |= tile.hasCollision ? 1 : 0;
            tileMap.tiles[index] |= (tile.id << 1);
        }

        export function getTile(tileMap: TileMap, position: V2): Tile {
            if (position.x >= tileMap.mapSize.x ||
                position.y >= tileMap.mapSize.y ||
                position.x < 0 ||
                position.y < 0) {
                return null;
            }
            const i = position.x + (position.y * tileMap.mapSize.x);
            const id = ((tileMap.tiles[i]) & ~(0xFFFFFF << 8)) >> 1;
            return TileStorage[TileNames[id]];
        }

        export function getEntities(tileMap: TileMap, position: V2): ECS.Entity[] {
            const i = position.x + (position.y * tileMap.mapSize.x);
            const id = Bit.get(tileMap.tiles[i], ENTITY_ID_OFFSET, ENTITY_ID_MASK);
            const head = EntityStorage[id];
            const list: ECS.Entity[] = [];
            let current = head;
            while (current) {
                list.push(current.ecs);
                current = current.next;
            }
            return list;
        }

        export function mapEntity(entity: ECS.Entity, tileMap: TileMap, position: V2): void {
            const node: EntityNode =
                EntityStorage[entity.id] ||
                {
                    ecs: entity,
                    next: null,
                    position,
                    previous: null,
                };

            // if this entity is already stored, we need to break its links
            if (EntityStorage[entity.id] != null) {
                const i = node.position.x + (node.position.y * tileMap.mapSize.x);

                // remap id if this was the head
                const id = Bit.get(tileMap.tiles[i], ENTITY_ID_OFFSET, ENTITY_ID_MASK);
                if (id === node.ecs.id) {
                    tileMap.tiles[i] = Bit.clear(tileMap.tiles[i], ENTITY_ID_MASK);
                    if (node.next) {
                        tileMap.tiles[i] =
                            Bit.set(tileMap.tiles[i], node.next.ecs.id, ENTITY_ID_OFFSET, ENTITY_ID_MASK);
                    }
                }

                // remap the linked list join previous to next
                if (node.next) { node.next.previous = node.previous; }
                if (node.previous) { (node.previous.next = node.next); }
                node.next = node.previous = null;
            }

            // get the index of this position
            const i = position.x + (position.y * tileMap.mapSize.x);

            // get the head entity id of this position
            const id = Bit.get(tileMap.tiles[i], ENTITY_ID_OFFSET, ENTITY_ID_MASK);

            // if this position already has at least 1 entity we need to push the new entity onto the head.
            if (id !== 0) {
                // clear the stored head id
                tileMap.tiles[i] = Bit.clear(tileMap.tiles[i], ENTITY_ID_MASK);

                // map the the node to the front of the previous head
                const headNode = EntityStorage[id];
                node.next = headNode;
                headNode.previous = node;
            }

            node.position = CopyV2(position);

            // always update the head to the new entity id
            tileMap.tiles[i] = Bit.set(tileMap.tiles[i], entity.id, ENTITY_ID_OFFSET, ENTITY_ID_MASK);

            // always update the storage for this entity
            EntityStorage[entity.id] = node;
        }
    }
}
