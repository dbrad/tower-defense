/// <reference path="util.ts" />
/// <reference path="gl.ts" />
/// <reference path="assets.ts" />
/// <reference path="lighting.ts" />
/// <reference path="graphics.ts" />

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
    4 bits => entity count (0-15), offset = 8 
    12 bits => head entity (0-4095), offset = 12 
    7 bits unallocated, offset = 24

    |= (val << offset) add
    &= ~(bitval << offset) remove
    */
    export interface TileMap {
        tiles: number[];
        mapSize: V2;
        tileSize: number
    }
    export namespace TileMap {
        export function addTile(tileMap: TileMap, tile: Tile, position: V2): void {
            let i = position.x + (position.y * tileMap.mapSize.x);
            if (tileMap.tiles[i] === undefined) {
                tileMap.tiles[i] = 0;
            }
            tileMap.tiles[i] |= tile.hasCollision ? 1 : 0;
            tileMap.tiles[i] |= (tile.id << 1);
        }
        export function getTile(tileMap: TileMap, position: V2): Tile {
            if(position.x >= tileMap.mapSize.x || 
                position.y >= tileMap.mapSize.y || 
                position.x < 0 || 
                position.y < 0) {
                return null;
            }
            let i = position.x + (position.y * tileMap.mapSize.x);
            let id = tileMap.tiles[i] >> 1;
            return TileStorage[TileNames[id]];
        }
    }
}