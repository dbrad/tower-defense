/// <reference path="util.ts" />

namespace Engine {
    export namespace GL {
        export interface Renderer {
            gl: WebGLRenderingContext;
            canvas: HTMLCanvasElement;
            col: number;
            bkg(red: number, blue: number, green: number): void;
            cls(): void;
            trans(x: number, y: number): void;
            scale(x: number, y: number): void;
            rot(radians: number): void;
            push(): void;
            pop(): void;
            img(texture: WebGLTexture, x: number, y: number, width: number, height: number, u0: number, v0: number, u1: number, v1: number, light?: V3): void;
            flush(): void;
        }

        export function CompileShader(gl: WebGLRenderingContext, source: string, type: number) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        export function CreateShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
            var program = gl.createProgram(),
                vShader = CompileShader(gl, vsSource, 35633),
                fShader = CompileShader(gl, fsSource, 35632);
            gl.attachShader(program, vShader);
            gl.attachShader(program, fShader);
            gl.linkProgram(program);
            return program;
        }

        export function CreateBuffer(gl: WebGLRenderingContext, bufferType: number, size: number, usage: number) {
            var buffer = gl.createBuffer();
            gl.bindBuffer(bufferType, buffer);
            gl.bufferData(bufferType, size, usage);
            return buffer;
        }

        export function CreateTexture(gl: WebGLRenderingContext, image: HTMLImageElement, width: number, height: number) {
            var texture = gl.createTexture();
            gl.bindTexture(3553, texture);
            gl.texParameteri(3553, 10242, 33071);
            gl.texParameteri(3553, 10243, 33071);
            gl.texParameteri(3553, 10240, 9728);
            gl.texParameteri(3553, 10241, 9728);
            gl.texImage2D(3553, 0, 6408, 6408, 5121, image);
            gl.bindTexture(3553, null);
            return texture;
        }

        export function Renderer(canvas: HTMLCanvasElement): Renderer {
            var gl = canvas.getContext('webgl'),
                VERTEX_SIZE = (4 * 2) + (4 * 2) + (4) + (4*3),
                MAX_BATCH = 10922, // floor((2 ^ 16) / 6)
                MAX_STACK = 100,
                MAT_SIZE = 6,
                VERTICES_PER_QUAD = 6,
                MAT_STACK_SIZE = MAX_STACK * MAT_SIZE,
                VERTEX_DATA_SIZE = VERTEX_SIZE * MAX_BATCH * 4,
                INDEX_DATA_SIZE = MAX_BATCH * (2 * VERTICES_PER_QUAD),
                width = canvas.width,
                height = canvas.height,
                shader = CreateShaderProgram(
                    gl, [`precision lowp float;                  
                    
                    // IN Vertex Position and
                    // IN Texture Coordinates
                    attribute vec2 a, b;
                    
                    // IN Vertex Color
                    attribute vec4 c;

                    // IN Light Value
                    attribute vec3 _l;
                    
                    // OUT Texture Coordinates
                    varying vec2 d;
                    
                    // OUT Vertex Color
                    varying vec4 e;
                    
                    // OUT Light Value
                    varying vec3 l;
                    
                    // CONST View Matrix
                    uniform mat4 m;
                    uniform vec2 r;
                    
                    void main(){
                        gl_Position=m*vec4(a,1.0,1.0);
                        d=b;
                        e=c;
                        l=_l;
                    }`
                    ].join('\n'), 
                    [`precision lowp float;
                        // OUT Texture Coordinates
                        varying vec2 d;
                        
                        // OUT Vertex Color
                        varying vec4 e;
                        
                        // OUT Light Strength
                        varying vec3 l;
                        
                        // CONST Single Sampler2D
                        uniform sampler2D f;

                        void main(){
                            gl_FragColor=texture2D(f,d)*e;
                            gl_FragColor.rgb*=l;
                        }`
                    ].join('\n')
                ),
                glBufferSubData = gl.bufferSubData.bind(gl),
                glDrawElements = gl.drawElements.bind(gl),
                glBindTexture = gl.bindTexture.bind(gl),
                glClear = gl.clear.bind(gl),
                glClearColor = gl.clearColor.bind(gl),
                vertexData = new ArrayBuffer(VERTEX_DATA_SIZE),
                vPositionData = new Float32Array(vertexData),
                vColorData = new Uint32Array(vertexData),
                vIndexData = new Uint16Array(INDEX_DATA_SIZE),
                IBO = CreateBuffer(gl, 34963, vIndexData.byteLength, 35044),
                VBO = CreateBuffer(gl, 34962, vertexData.byteLength, 35048),
                count = 0,
                mat = new Float32Array([1, 0, 0, 1, 0, 0]),
                stack = new Float32Array(100),
                stackp = 0,
                cos = Math.cos,
                sin = Math.sin,
                currentTexture = <WebGLTexture>null,
                locA, locB, locC, locF;

            gl.blendFunc(770, 771);
            gl.enable(3042);
            gl.useProgram(shader);
            gl.bindBuffer(34963, IBO);
            for (var indexA = 0, indexB = 0; indexA < MAX_BATCH * VERTICES_PER_QUAD; indexA += VERTICES_PER_QUAD, indexB += 4)
                vIndexData[indexA + 0] = indexB,
                    vIndexData[indexA + 1] = indexB + 1,
                    vIndexData[indexA + 2] = indexB + 2,
                    vIndexData[indexA + 3] = indexB + 0,
                    vIndexData[indexA + 4] = indexB + 3,
                    vIndexData[indexA + 5] = indexB + 1;

            glBufferSubData(34963, 0, vIndexData);
            gl.bindBuffer(34962, VBO);

            locA = gl.getAttribLocation(shader, 'a');
            locB = gl.getAttribLocation(shader, 'b');
            locC = gl.getAttribLocation(shader, 'c');
            locF = gl.getAttribLocation(shader, '_l');

            gl.enableVertexAttribArray(locA);
            gl.vertexAttribPointer(locA, 2, 5126, false, VERTEX_SIZE, 0);
            gl.enableVertexAttribArray(locB);
            gl.vertexAttribPointer(locB, 2, 5126, false, VERTEX_SIZE, 8);
            gl.enableVertexAttribArray(locC);
            gl.vertexAttribPointer(locC, 4, 5121, true, VERTEX_SIZE, 16);
            gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'm'), false,
                new Float32Array([
                    2 / width, 0, 0, 0,
                    0, -2 / height, 0, 0,
                    0, 0, 1, 1, -1, 1, 0, 0
                ])
            );
            gl.enableVertexAttribArray(locF);
            gl.vertexAttribPointer(locF, 3, 5126, false, VERTEX_SIZE, 20);

            gl.activeTexture(33984);
            let renderer: Renderer = {
                'gl': gl,
                'canvas': canvas,
                'col': 0xFFFFFFFF,
                'bkg': function (r: number, g: number, b: number): void {
                    glClearColor(r, g, b, 1);
                },
                'cls': function () {
                    glClear(16384);
                },
                'trans': function (x: number, y: number): void {
                    mat[4] = mat[0] * x + mat[2] * y + mat[4];
                    mat[5] = mat[1] * x + mat[3] * y + mat[5];
                },
                'scale': function (x: number, y: number): void {
                    mat[0] = mat[0] * x;
                    mat[1] = mat[1] * x;
                    mat[2] = mat[2] * y;
                    mat[3] = mat[3] * y;
                },
                'rot': function (r: number): void {
                    var a = mat[0],
                        b = mat[1],
                        c = mat[2],
                        d = mat[3],
                        sr = sin(r),
                        cr = cos(r);

                    mat[0] = a * cr + c * sr;
                    mat[1] = b * cr + d * sr;
                    mat[2] = a * -sr + c * cr;
                    mat[3] = b * -sr + d * cr;
                },
                'push': function (): void {
                    stack[stackp + 0] = mat[0];
                    stack[stackp + 1] = mat[1];
                    stack[stackp + 2] = mat[2];
                    stack[stackp + 3] = mat[3];
                    stack[stackp + 4] = mat[4];
                    stack[stackp + 5] = mat[5];
                    stackp += 6;
                },
                'pop': function (): void {
                    stackp -= 6;
                    mat[0] = stack[stackp + 0];
                    mat[1] = stack[stackp + 1];
                    mat[2] = stack[stackp + 2];
                    mat[3] = stack[stackp + 3];
                    mat[4] = stack[stackp + 4];
                    mat[5] = stack[stackp + 5];
                },
                'img': function (texture: WebGLTexture, x: number, y: number, w: number, h: number, u0: number, v0: number, u1: number, v1: number, light: V3 = {x: 1.0, y: 1.0, z: 1.0}): void {
                    var x0 = x,
                        y0 = y,
                        x1 = x + w,
                        y1 = y + h,
                        x2 = x,
                        y2 = y + h,
                        x3 = x + w,
                        y3 = y,
                        a = mat[0],
                        b = mat[1],
                        c = mat[2],
                        d = mat[3],
                        e = mat[4],
                        f = mat[5],
                        offset = 0,
                        argb = renderer['col'];

                    if (texture != currentTexture ||
                        count + 1 >= MAX_BATCH) {
                        glBufferSubData(34962, 0, vertexData);
                        glDrawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
                        count = 0;
                        if (currentTexture != texture) {
                            currentTexture = texture;
                            glBindTexture(3553, currentTexture);
                        }
                    }

                    offset = count * VERTEX_SIZE;
                    // Vertex Order
                    // Vertex Position | UV | ARGB
                    // Vertex 1
                    vPositionData[offset++] = x0 * a + y0 * c + e;
                    vPositionData[offset++] = x0 * b + y0 * d + f;
                    vPositionData[offset++] = u0;
                    vPositionData[offset++] = v0;
                    vColorData[offset++] = argb;
                    vPositionData[offset++] = light.x;
                    vPositionData[offset++] = light.y;
                    vPositionData[offset++] = light.z;

                    // Vertex 2
                    vPositionData[offset++] = x1 * a + y1 * c + e;
                    vPositionData[offset++] = x1 * b + y1 * d + f;
                    vPositionData[offset++] = u1;
                    vPositionData[offset++] = v1;
                    vColorData[offset++] = argb;
                    vPositionData[offset++] = light.x;
                    vPositionData[offset++] = light.y;
                    vPositionData[offset++] = light.z;

                    // Vertex 3
                    vPositionData[offset++] = x2 * a + y2 * c + e;
                    vPositionData[offset++] = x2 * b + y2 * d + f;
                    vPositionData[offset++] = u0;
                    vPositionData[offset++] = v1;
                    vColorData[offset++] = argb;
                    vPositionData[offset++] = light.x;
                    vPositionData[offset++] = light.y;
                    vPositionData[offset++] = light.z;

                    // Vertex 4
                    vPositionData[offset++] = x3 * a + y3 * c + e;
                    vPositionData[offset++] = x3 * b + y3 * d + f;
                    vPositionData[offset++] = u1;
                    vPositionData[offset++] = v0;
                    vColorData[offset++] = argb;
                    vPositionData[offset++] = light.x;
                    vPositionData[offset++] = light.y;
                    vPositionData[offset++] = light.z;

                    if (++count >= MAX_BATCH) {
                        glBufferSubData(34962, 0, vertexData);
                        glDrawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
                        count = 0;
                    }
                },
                'flush': function (): void {
                    if (count == 0) return;
                    glBufferSubData(34962, 0, vPositionData.subarray(0, count * VERTEX_SIZE));
                    glDrawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
                    count = 0;
                }
            };
            return renderer;
        }

    }
}