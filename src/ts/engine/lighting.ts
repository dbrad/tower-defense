/// <reference path="tilemap.ts" />

namespace Engine {

    export interface Light {
        position: V2;
        radius: number;
        intensity: number
        a: number[];
    }

    export namespace Lighting {
        export let lightMap: number[];
        export function calculateLight(light: Light, tileMap: TileMap): void {
            light.a = [];
            let es = pointsOnCircle(light.position.x, light.position.y, light.radius);

            for (let e in es) {
                let l = pointsOnLine(light.position.x, light.position.y, es[e].x, es[e].y);
                let mx = light.intensity / l.length;
                let haw = 0;
                for (let tl in l) {
                    if (l[tl].x < 0 || l[tl].x >= tileMap.mapSize.x ||
                        l[tl].y < 0 || l[tl].y >= tileMap.mapSize.y) { break; }

                    let idx = ((l[tl].y * tileMap.mapSize.x) + l[tl].x);
                    let st = mx * (l.length - parseInt(tl));
                    let tile = TileMap.getTile(tileMap, { x: l[tl].x, y: l[tl].y })

                    if (tile.hasCollision && haw > 0) { break; }

                    if (!(idx in light.a) || light.a[idx] > st) {
                        light.a[idx] = (st > 1 ? 1 : st);
                    }

                    if (tile.hasCollision) { break; }
                    if (tile.hasCollision && haw > 1) { break; }
                    if (tile.hasCollision) { haw++; }
                    if (!tile) { break; }
                }
            }
        }

        export function calculateLightMap(lights: Light[]): number[] {
            let lm: number[] = [];
            for (let l in lights) {
                for (let idx in lights[l].a) {
                    if (!lm[idx] || lm[idx] > lights[l].a[idx]) {
                        lm[idx] = lights[l].a[idx];
                    }
                }
            }
            return lm;
        }

        export function pointsOnLine(x1: number, y1: number, x2: number, y2: number): V2[] {
            let l: V2[] = [];
            var dx = Math.abs(x2 - x1);
            var dy = Math.abs(y2 - y1);
            var x = x1;
            var y = y1;
            var n = 1 + dx + dy;
            var xInc = (x1 < x2 ? 1 : -1);
            var yInc = (y1 < y2 ? 1 : -1);
            var e = dx - dy;
            dx *= 2;
            dy *= 2;
            while (n > 0) {
                l.push({ x: x, y: y });
                if (e > 0) {
                    x += xInc;
                    e -= dy;
                } else {
                    y += yInc;
                    e += dx;
                }
                n -= 1;
            }
            return l;
        }

        export function pointsOnCircle(cx: number, cy: number, cr: number): V2[] {
            let l: V2[] = [];
            let x = cr;
            let y = 0;
            let o2 = ~~(1 - x);
            while (y <= x) {
                l.push({ x: x + cx, y: y + cy });
                l.push({ x: y + cx, y: x + cy });
                l.push({ x: -x + cx, y: y + cy });
                l.push({ x: -y + cx, y: x + cy });
                l.push({ x: -x + cx, y: -y + cy });
                l.push({ x: -y + cx, y: -x + cy });
                l.push({ x: x + cx, y: -y + cy });
                l.push({ x: y + cx, y: -x + cy });
                y += 1;
                if (o2 <= 0) { o2 += (2 * y) + 1; }
                else {
                    x -= 1;
                    o2 += (2 * (y - x)) + 1;
                }
            }
            return l;
        }
    }
}