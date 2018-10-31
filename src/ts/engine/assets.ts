/// <reference path="core.ts" />
/// <reference path="gl.ts" />

namespace Engine {
    export namespace Assets {
        export interface TiledTextureAtlasDef {
            loc: string;
            sWidth: number;
            sHeight: number;
            textures: string[][];
        }

        function instanceOfTiledTextureAtlasDef(object: any): object is TiledTextureAtlasDef {
            return "sWidth" in object && "sHeight" in object;
        }

        export interface IrregularTextureAtlasDef {
            loc: string;
            textures: IrregularTextureDef[];
        }

        export interface IrregularTextureDef {
            name: string;
            x: number;
            y: number;
            width: number;
            height: number;
        }

        export type TextureAtlas = TiledTextureAtlasDef | IrregularTextureAtlasDef;

        export interface Texture {
            atlas: WebGLTexture;
            w: number;
            h: number;
            u0: number;
            v0: number;
            u1: number;
            v1: number;
        }
        export let TextureAtlasStore: { [key: string]: WebGLTexture } = {};
        export let TextureStore: { [key: string]: Texture } = {};

        export function load(textureData: { [key: string]: TextureAtlas }, callback: Function): void {
            let count = 0;
            let done = () => {
                count--;
                if (count <= 0) {
                    callback();
                }
            }
            for (let texturename in textureData) {
                let image = new Image();

                if (instanceOfTiledTextureAtlasDef(textureData[texturename])) {
                    image.onload = (function (texturename, image, done) {
                        let _tn = texturename;
                        let _t = textureData[_tn] as TiledTextureAtlasDef;
                        return () => {
                            let glTexture: WebGLTexture = GL.CreateTexture(Core._gl.gl, image, image.width, image.height);
                            let textures = _t.textures;

                            TextureAtlasStore[_tn] = glTexture;

                            for (let y = 0; y < textures.length; y++) {
                                for (let x = 0; x < textures[y].length; x++) {
                                    TextureStore[textures[y][x]] = {
                                        atlas: glTexture,
                                        w: _t.sWidth,
                                        h: _t.sHeight,
                                        u0: (x * _t.sWidth) / image.width,
                                        v0: (y * _t.sHeight) / image.height,
                                        u1: ((x * _t.sWidth) + _t.sWidth) / image.width,
                                        v1: ((y * _t.sHeight) + _t.sHeight) / image.height
                                    }
                                }
                            }
                            done();
                        }
                    })(texturename, image, done);
                } else {
                    image.onload = (function (texturename, image, done) {
                        let _tn = texturename;
                        let _t = textureData[_tn] as IrregularTextureAtlasDef;
                        return () => {
                            let glTexture: WebGLTexture = GL.CreateTexture(Core._gl.gl, image, image.width, image.height);
                            let textures = _t.textures;

                            TextureAtlasStore[_tn] = glTexture;
                            for(let texture of textures) {
                                TextureStore[texture.name] = {
                                    atlas: glTexture,
                                    w: texture.width,
                                    h: texture.height,
                                    u0: texture.x / image.width,
                                    v0: texture.y / image.height,
                                    u1: (texture.x + texture.width) / image.width,
                                    v1: (texture.y + texture.height) / image.height
                                }
                            }
                            done();
                        }
                    })(texturename, image, done);
                }
                count++;
                image.src = textureData[texturename].loc;
            }
        }
    }
}