/// <reference path="core.ts" />
/// <reference path="input.ts" />

// @ifdef DEBUG
namespace DEBUG {
    export function log(message?: string): void {
        window.console.log.apply(console, arguments);
    }

    export function assert(assertion: boolean, message: string, object?: any): void {
        if (!assertion) {
            Engine.Input.unbindAll();
            window.console.assert(assertion, message, object);
            while (Engine.Core.popScene() !== undefined) {}
            Engine.Core.pushScene("Debug", message);
        }
    }
}
// @endif
