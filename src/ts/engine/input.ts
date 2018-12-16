// @ifdef DEBUG
/// <reference path="debug.ts" />
// @endif

namespace Engine {
    export interface KeyBind {
        keyDown: Function;
        keyUp: Function;
    }

    export namespace Input {
        export let Controls: { [key: string]: number[] } = {};

        let _bindings: KeyBind[] = [];
        let _isDown: boolean[] = [];
        let _isUp: boolean[] = [];
        let disabled: boolean = false;

        for (let i: number = 0; i < 256; i++) {
            _isUp[i] = true;
        }

        window.onkeydown = keyDown;
        window.onkeyup = keyUp;

        export function keyDown(event: KeyboardEvent): void {
            if (!disabled) {
                let keyCode: number = event.which;
                if (_isUp[keyCode]) {
                    // @ifdef DEBUG
                    //DEBUG.log(keyCode.toString());
                    // @endif
                    if (_bindings[keyCode]) {
                        _bindings[keyCode].keyDown();
                    }
                }
                _isUp[keyCode] = false;
                _isDown[keyCode] = true;
            }
        }

        export function keyUp(event: KeyboardEvent): void {
            if (!disabled) {
                let keyCode: number = event.which;
                if (_bindings[keyCode]) {
                    _bindings[keyCode].keyUp();
                }
                _isDown[keyCode] = false;
                _isUp[keyCode] = true;
            }
        }

        export function disable() {
            disabled = true;
            _isDown.forEach((value, index, array) => {
                if (value) {
                    _bindings[index] && _bindings[index].keyUp();
                }
                array[index] = false;
            });
            _isUp.forEach((value, index, array) => {
                array[index] = true;
            });
        }

        export function enable() {
            disabled = false;
        }

        export function bindKey(key: number, keyDown: Function, keyUp: Function = () => { }): void {
            _bindings[key] = { keyDown: keyDown, keyUp: keyUp };
        }

        export function unbindKey(key: number) {
            delete _bindings[key];
        }

        export function unbindAll() {
            _bindings.forEach(
                (keyBind, keyCode) => {
                    if (keyCode !== 73) {
                        delete _bindings[keyCode];
                    }
                });
        }

        export function bindControl(control: string, keyDown: Function, keyUp: Function = () => { }): void {
            //@ifdef DEBUG
            DEBUG.assert(Controls[control] != null, `Control "${control}" is not defined.`);
            //@endif
            for (let key of Controls[control]) {
                _bindings[key] = { keyDown: keyDown, keyUp: keyUp };
            }
        }

        export function unbindControl(control: string) {
            //@ifdef DEBUG
            DEBUG.assert(Controls[control] != null, `Control "${control}" is not defined.`);
            //@endif
            for (let key of Controls[control]) {
                delete _bindings[key];
            }
        }
    }
}
