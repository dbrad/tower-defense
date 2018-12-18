/// <reference path="./assets.ts" />
/// <reference path="./tilemap.ts" />
/// <reference path="./camera.ts" />
/// <reference path="./util.ts" />

namespace Engine {
    export namespace Graphics {
        export let SpriteStore: { [key: string]: Sprite } = {};
        export let NinePatchStore: { [key: string]: NinePatch } = {};

        export type FrameDef = {
            texture: string;
            colour?: Colour;
            duration: number;
        };

        export type SpriteDef = {
            name: string;
            animations: { [key: string]: FrameDef[] };
        };

        export type Frame = {
            texture: Assets.Texture;
            colour: Colour;
            duration: number;
            rotation?: number;
        };

        namespace Frame {
            export function clone(frame: Frame): Frame {
                return Object.assign({}, frame);
            }

            export function cloneArray(frames: Frame[]): Frame[] {
                let result: Frame[] = [];
                frames.forEach((frame, index, array) => {
                    result.push(clone(frame));
                });
                return result;
            }
        }

        export class Sprite {
            private animations: { [key: string]: Sprite.Animation } = {};
            private animationQueue: Sprite.Animation[] = [];
            private loopQueue: boolean = false;
            private animationIndex: number = 0;

            constructor(baseAnimation: Sprite.Animation) {
                this.animations["DEFAULT"] = baseAnimation;
                this.play("DEFAULT", true);
            }

            public clone(): Sprite {
                let sprite = new Sprite(this.animations["DEFAULT"].clone());
                for (let key in this.animations) {
                    sprite.addAnimation(key, this.animations[key].clone());
                }
                return sprite;
            }

            get currentAnimation(): Sprite.Animation {
                return this.animationQueue[this.animationIndex];
            }

            get currentFrame(): Frame {
                return this.currentAnimation.currentFrame;
            }

            public addAnimation(name: string, animation: Sprite.Animation): void {
                this.animations[name] = animation;
            }

            public play(animationName: string, loop: boolean = false): Sprite {
                this.animationQueue.length = 0;
                const animation = this.animations[animationName].clone();
                animation.loop = loop;
                this.animationQueue.push(animation);
                return this;
            }

            public delay(milliseconds: number): Sprite {
                const delayFrame: Frame = {
                    colour: Colour.argb(0, 0, 0, 0),
                    duration: milliseconds,
                    texture: null,
                };
                this.animationQueue.push(new Sprite.Animation([delayFrame]));
                return this;
            }

            public then(animationName: string, loop: boolean = false): Sprite {
                const animation = this.animations[animationName].clone();
                animation.loop = loop;
                this.animationQueue.push(animation);
                return this;
            }

            public loop(): void {
                this.next();
                this.loopQueue = true;
            }

            public next(): void {
                if (this.loopQueue) {
                    this.animationIndex++;
                    if (this.animationIndex >= this.animationQueue.length) {
                        this.animationIndex = 0;
                    }
                } else {

                    this.animationQueue.shift();
                    if (this.animationQueue.length === 0) {
                        this.stop();
                    }
                }
            }

            public stop(): void {
                this.animationQueue.length = 0;
                this.animationIndex = 0;
                this.loopQueue = false;
                this.animationQueue.push(this.animations["DEFAULT"]);
            }

            public update(now: number, delta: number): void {
                if (this.currentAnimation.done) {
                    this.next();
                }
                this.currentAnimation.update(delta);
            }

            public setColour(colour: Colour): void {
                for (let key in this.animations) {
                    this.animations[key].setColour(colour);
                }
                this.animationQueue.forEach(
                    (animation) => {
                        animation.setColour(colour);
                    });
            }

            public setColourHex(colour: number): void {
                for (let key in this.animations) {
                    this.animations[key].setColourHex(colour);
                }
                this.animationQueue.forEach(
                    (animation) => {
                        animation.setColourHex(colour);
                    });
            }

            public setRotation(radians: number): void {
                for (let key in this.animations) {
                    this.animations[key].setRotation(radians);
                }
                this.animationQueue.forEach(
                    (animation) => {
                        animation.setRotation(radians);
                    });
            }
        }

        export namespace Sprite {
            export class Animation {
                public readonly frames: Frame[];
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

                public clone(): Animation {
                    return new Animation(Frame.cloneArray(this.frames));
                }

                public update(delta: number): void {
                    this.done = false;
                    if (this.duration === 0) {
                        return;
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

                public setColour(colour: Colour): void {
                    this.frames.forEach(
                        (frame) => {
                            frame.colour = colour;
                        });
                }

                public setColourHex(colour: number): void {
                    this.frames.forEach(
                        (frame) => {
                            frame.colour = hexToColour(colour);
                        });
                }

                public setRotation(radians: number): void {
                    this.frames.forEach(
                        (frame) => {
                            frame.rotation = radians;
                        });
                }
            }

            export function draw(
                gl: GL.Renderer,
                sprite: Sprite,
                position: V2,
                cameraPosition: V2 = { x: 0, y: 0 },
            ): void {
                if (sprite.currentFrame.texture != null) {
                    gl.col = colourToHex(sprite.currentFrame.colour);
                    Texture.draw({
                        position: V2.sub(position, cameraPosition),
                        renderer: gl,
                        rotation: 0 || sprite.currentFrame.rotation,
                        texture: sprite.currentFrame.texture,
                    });
                }
            }

            export function CreateAndStore(def: SpriteDef): Sprite {
                let sprite: Sprite =
                    new Sprite(new Sprite.Animation([
                        {
                            colour: def.animations["DEFAULT"][0].colour || Colour.WHITE,
                            duration: def.animations["DEFAULT"][0].duration,
                            texture: Assets.TextureStore[def.animations["DEFAULT"][0].texture],
                        },
                    ]));

                for (const animationName in def.animations) {
                    if (def.animations[animationName]) {
                        const animation = def.animations[animationName];
                        const frames: Frame[] = [];
                        for (const frame of animation) {
                            frames.push(
                                {
                                    colour: frame.colour || Colour.WHITE,
                                    duration: frame.duration,
                                    texture: Assets.TextureStore[frame.texture],
                                });
                        }
                        sprite.addAnimation(animationName, new Sprite.Animation(frames));
                    }
                }

                SpriteStore[def.name] = sprite;
                return sprite;
            }
        }

        export type NinePatch = {
            tl: Assets.Texture;
            tc: Assets.Texture;
            tr: Assets.Texture;
            ml: Assets.Texture;
            mc: Assets.Texture;
            mr: Assets.Texture;
            bl: Assets.Texture;
            bc: Assets.Texture;
            br: Assets.Texture;
        };

        export namespace NinePatch {
            export type Data = {
                name: string;
                colour: number;
                tileSize: V2;
            };
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
                            position: { x: x * s.w, y: y * s.h },
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

            export type Data = {
                text: string;
                textAlign: Alignment;
                colour: number;
                wrapWidth: number;
            };
            export enum Alignment {
                LEFT,
                CENTER,
                RIGHT,
            }

            export function draw(gl: GL.Renderer, text: string, position: V2, textAlign: Alignment = Alignment.LEFT, wrap: number = 0): void {
                let pos = CopyV2(position);
                let words = text.split(' ');
                let orgx = pos.x;
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
                        pos.y += 6;
                        offx = 0;
                    }
                    for (let letter of word.split('')) {
                        let l = letter.toLowerCase();
                        let s = Assets.TextureStore[l];
                        pos.x = orgx + offx;

                        gl.push();
                        gl.trans(pos.x, pos.y);
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
