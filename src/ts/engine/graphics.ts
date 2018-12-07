/// <reference path="./assets.ts" />
/// <reference path="./tilemap.ts" />
/// <reference path="./camera.ts" />

namespace Engine {
    export namespace Graphics {
        export let SpriteStore: { [key: string]: Sprite } = {};
        export let NinePatchStore: { [key: string]: NinePatch } = {}

        export interface AnimationDef {
            texture: string;
            duration: number;
        }

        export interface SpriteDef {
            name: string;
            animations: { [key: string]: AnimationDef[] };
        }

        export interface Frame {
            texture: Assets.Texture;
            duration: number;
        }

        export class Sprite {
            private animations: { [key: string]: Sprite.Animation } = {};
            private animationQueue: Sprite.Animation[] = [];

            constructor(baseAnimation: Sprite.Animation) {
                this.animations["DEFAULT"] = baseAnimation;
                this.play("DEFAULT");
            }

            clone(): Sprite {
                let sprite = new Sprite(this.animations["DEFAULT"].clone());
                for(let key in this.animations) {
                    sprite.addAnimation(key, this.animations[key].clone());
                }
                return sprite;
            }

            get currentAnimation(): Sprite.Animation {
                return this.animationQueue[0];
            }

            get currentFrame(): Frame {
                return this.currentAnimation.currentFrame;
            }

            addAnimation(name: string, animation: Sprite.Animation): void {
                this.animations[name] = animation;
            }

            play(animationName: string, loop: boolean = false): Sprite {
                this.animationQueue.length = 0;
                let animation = this.animations[animationName].clone();
                animation.loop = loop;
                this.animationQueue.push(animation);
                return this;
            }

            then(animationName: string, loop: boolean = false): Sprite {
                let animation = this.animations[animationName].clone();
                animation.loop = loop;
                this.animationQueue.push(animation);
                return this;
            }

            next(): void {
                this.animationQueue.shift();
                if (this.animationQueue.length === 0) {
                    this.stop();
                }
            }

            stop(): void {
                this.animationQueue.length = 0;
                this.animationQueue.push(this.animations["DEFAULT"])
            }

            update(now: number, delta: number): void {
                if (this.currentAnimation.done) {
                    this.next();
                }
                this.currentAnimation.update(delta);
            }
        }

        export namespace Sprite {
            export class Animation {
                private readonly frames: Frame[];
                get currentFrame(): Frame {
                    if (this.duration === 0) {
                        return this.frames[0];
                    } else {
                        let totalDuration = 0;
                        for (let i in this.frames) {
                            totalDuration += this.frames[i].duration;
                            if (this.progress <= totalDuration) {
                                return this.frames[i];
                            }
                        }
                        return this.frames[this.frames.length - 1];
                    }
                }

                private _duration: number = -1;
                get duration(): number {
                    if (this._duration === -1) {
                        this._duration = 0;
                        for (let frame of this.frames) {
                            this._duration += frame.duration;
                        }
                    }
                    return this._duration;
                }

                public progress: number = 0;
                public loop: boolean = false;
                public done: boolean = false;

                constructor(frames: Frame[]) {
                    this.frames = frames;
                }

                clone(): Animation {
                    return new Animation(this.frames);
                }

                update(delta: number) {
                    this.done = false;
                    if (this.duration === 0) {
                        return this.frames[0];
                    } else {
                        this.progress += delta;
                        if (this.progress > this.duration) {
                            if (this.loop) {
                                this.progress = 0;
                            } else {
                                this.progress = 0;
                                this.done = true;
                            }
                        }
                    }
                }
            }

            export function CreateAndStore(def: SpriteDef) {
                let sprite: Sprite =
                    new Sprite(new Sprite.Animation([
                        { texture: Assets.TextureStore[def.animations["DEFAULT"][0].texture], duration: def.animations["DEFAULT"][0].duration }
                    ]));

                for (let animationName in def.animations) {
                    let animation = def.animations[animationName];
                    let frames: Frame[] = [];
                    for (let frame of animation) {
                        frames.push({ texture: Assets.TextureStore[frame.texture], duration: frame.duration })
                    }
                    sprite.addAnimation(animationName, new Sprite.Animation(frames));
                }

                SpriteStore[def.name] = sprite;
                return sprite;
            }
        }

        export interface NinePatch {
            tl: Assets.Texture;
            tc: Assets.Texture;
            tr: Assets.Texture;
            ml: Assets.Texture;
            mc: Assets.Texture;
            mr: Assets.Texture;
            bl: Assets.Texture;
            bc: Assets.Texture;
            br: Assets.Texture;
        }

        export namespace NinePatch {
            export function draw(gl: GL.Renderer, ninePatch: NinePatch, tileX: number, tileY: number, tileW: number, tileH: number) {
                let s: Assets.Texture;
                let endX = tileX + tileW - 1;
                let endY = tileY + tileH - 1;

                for (let x = tileX; x <= endX; x++) {
                    for (let y = tileY; y <= endY; y++) {
                        if (x === tileX) {
                            if (y === tileY) {
                                s = ninePatch.tl;
                            } else if (y === endY) {
                                s = ninePatch.bl;
                            } else {
                                s = ninePatch.ml;
                            }
                        } else if (x === endX) {
                            if (y === tileY) {
                                s = ninePatch.tr;
                            } else if (y === endY) {
                                s = ninePatch.br;
                            } else {
                                s = ninePatch.mr;
                            }
                        } else if (y === tileY) {
                            s = ninePatch.tc;
                        } else if (y === endY) {
                            s = ninePatch.bc;
                        } else {
                            s = ninePatch.mc;
                        }
                        Texture.draw({
                            renderer: gl,
                            texture: s,
                            position: { x: x * s.w, y: y * s.h }
                        });
                    }
                }
            }
        }

        export namespace Texture {
            export interface Parameters {
                renderer: GL.Renderer;
                texture: Assets.Texture;
                position: V2;
                scale?: V2;
                rotation?: number;
                light?: V3;
            }
            export function draw(parameters: Parameters) {
                let t = parameters.texture;

                let w = t.w;
                let hw = ~~(w / 2);
                let h = t.h;
                let hh = ~~(h / 2);

                let gl = parameters.renderer;
                let l = parameters.light ? parameters.light : { x: 1.0, y: 1.0, z: 1.0 };
                let p = parameters.position;
                gl.push();
                gl.trans(p.x + hw, p.y + hh);
                if (parameters.scale) {
                    gl.scale(parameters.scale.x, parameters.scale.y);
                }
                if (parameters.rotation) {
                    gl.rot(parameters.rotation);
                }
                gl.img(
                    t.atlas,
                    -hw, -hh,
                    w, h,
                    t.u0, t.v0,
                    t.u1, t.v1,
                    l);
                gl.pop();
            }
        }

        export namespace Text {
            export enum Alignment {
                LEFT,
                CENTER,
                RIGHT
            }

            export function draw(gl: GL.Renderer, text: string, x: number, y: number, textAlign: Alignment = Alignment.LEFT, wrap: number = 0): void {
                let words = text.split(' ');
                let orgx = x;
                let offx = 0;
                let lineLength = wrap == 0 ? text.split('').length * 6 : wrap;
                let alignmentOffset = 0;
                if (textAlign == Alignment.CENTER) {
                    alignmentOffset = ~~(-lineLength / 2);
                } else if (textAlign === Alignment.RIGHT) {
                    alignmentOffset = ~~(-lineLength);
                }

                for (let word of words) {
                    if (wrap != 0 && offx + word.length * 6 > wrap) {
                        y += 6;
                        offx = 0;
                    }
                    for (let letter of word.split('')) {
                        let l = letter.toLowerCase();
                        let s = Assets.TextureStore[l];
                        x = orgx + offx;

                        gl.push();
                        gl.trans(x, y);
                        gl.img(
                            s.atlas,
                            alignmentOffset, 0,
                            s.w, s.h,
                            s.u0, s.v0,
                            s.u1, s.v1);
                        gl.pop();
                        offx += 6;
                    }
                    offx += 6;
                }
            }
        }
    }
}