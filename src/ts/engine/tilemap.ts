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
            export function draw(gl: GL.Renderer, camera: Camera, s: Assets.Texture, tileX: number, tileY: number) {
                let w = s.w;
                let h = s.h;
                Texture.draw({
                    renderer: gl,
                    texture: s,
                    position: {
                        x: (tileX * w) - camera.position.x,
                        y: (tileY * h) - camera.position.y
                    }
                });
            }
        }

        export namespace TileMap {
            export function draw(gl: GL.Renderer, camera: Camera, tilemap: TileMap): void {
                let cameraTilePos = PixelToTile(camera.position, tilemap.tileSize);
                let cameraTileSize = PixelToTile(camera.size, tilemap.tileSize);
                for (let x = cameraTilePos.x; x <= cameraTilePos.x + cameraTileSize.x; x++) {
                    for (let y = cameraTilePos.y; y <= cameraTilePos.y + cameraTileSize.y; y++) {
                        let tile = Engine.TileMap.getTile(tilemap, { x, y })
                        if (tile != null) {
                            gl.col = tile.colour;
                            Tile.draw(gl, camera, tile.texture, x, y);
                        }
                    }
                }
            }
        }
    }

    export interface Tile {
        id: number;
        texture: Assets.Texture;
        colour: number;
        hasCollision: boolean;
    }

    export namespace Tile {
        function* TileId() {
            let id = 0;
            while (true) {
                yield id++;
            }
        }
        let tileId = TileId();
        export function NextTileId() {
            return tileId.next().value;
        }
        export function CreateAndStore(name: string, texture: Assets.Texture, colour: number, hasCollision: boolean): Tile {
            let tile: Tile = {
                id: NextTileId(),
                texture: texture,
                colour: colour,
                hasCollision: hasCollision
            }
            TileStorage[name] = tile;
            TileNames[tile.id] = name;
            return tile;
        }
    }

    /*
    000 0000 0000 0000 0000 0000 0000 0000

    1 bit to solid (0-1), offset = 0
    7 bits => tileid (0-127), offset = 1
    12 bits => head entity id (0-4095), offset = 8 
    19 bits unallocated, offset = 12

    |= (val << offset) add
    &= ~(bitval << offset) remove
    */
    export interface TileMap {
        tiles: number[];
        mapSize: V2;
        tileSize: number
    }
    export namespace TileMap {
        type EntityNode = {
            next: EntityNode;
            ecs: ECS.Entity;
            position: V2;
            previous: EntityNode;
        }
        let EntityStorage: EntityNode[] = [];

        export function addTile(tileMap: TileMap, tile: Tile, position: V2): void {
            let i = position.x + (position.y * tileMap.mapSize.x);
            if (tileMap.tiles[i] === undefined) {
                tileMap.tiles[i] = 0;
            }
            tileMap.tiles[i] |= tile.hasCollision ? 1 : 0;
            tileMap.tiles[i] |= (tile.id << 1);
        }

        export function getTile(tileMap: TileMap, position: V2): Tile {
            if (position.x >= tileMap.mapSize.x ||
                position.y >= tileMap.mapSize.y ||
                position.x < 0 ||
                position.y < 0) {
                return null;
            }
            let i = position.x + (position.y * tileMap.mapSize.x);
            let id = ((tileMap.tiles[i]) & ~(0xFFFFFF << 8)) >> 1;
            return TileStorage[TileNames[id]];
        }

        export function getEntities(tileMap: TileMap, position: V2): ECS.Entity[] {
            let i = position.x + (position.y * tileMap.mapSize.x);
            let id = ((tileMap.tiles[i]) & ~(0x7F << 20)) >> 12;
            let head = EntityStorage[id];
            let list: ECS.Entity[] = [];
            let current = head;
            while (current) {
                list.push(current.ecs);
                current = current.next;
            }
            return list
        }

        export function mapEntity(entity: ECS.Entity, tileMap: TileMap, position: V2) {
            let node: EntityNode =
                EntityStorage[entity.id] ||
                {
                    next: null,
                    ecs: entity,
                    position: position,
                    previous: null
                };

            // if this entity is already stored, we need to break its links
            if (EntityStorage[entity.id] != null) {
                let i = node.position.x + (node.position.y * tileMap.mapSize.x);

                // remap id if this was the head
                let id = ((tileMap.tiles[i]) & ~(0x7F << 20)) >> 12;
                if (id == node.ecs.id) {
                    tileMap.tiles[i] &= ~(0xFFF << 12);
                    if (node.next) {
                        tileMap.tiles[i] |= (node.next.ecs.id << 12);
                    }
                }

                // remap the linked list join previous to next
                node.next && (node.next.previous = node.previous);
                node.previous && (node.previous.next = node.next);
                node.next = node.previous = null;
            }

            // get the index of this position
            let i = position.x + (position.y * tileMap.mapSize.x);

            // get the head entity id of this position
            let id = ((tileMap.tiles[i]) & ~(0x7F << 20)) >> 12;

            // if this position already has at least 1 entity we need to push the new entity onto the head.
            if (id !== 0) {
                // clear the stored head id
                tileMap.tiles[i] &= ~(0xFFF << 12);

                // map the the node to the front of the previous head
                let headNode = EntityStorage[id];
                node.next = headNode;
                headNode.previous = node;
            }

            node.position = CopyV2(position);

            // always update the head to the new entity id
            tileMap.tiles[i] |= (entity.id << 12);

            // always update the storage for this entity
            EntityStorage[entity.id] = node;
        }
    }
}