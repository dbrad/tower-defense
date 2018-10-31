namespace DEBUG {
    export function log(message?: string) {
        window.console.log.apply(console, arguments);
    }

    export function assert(assertion: boolean, message: string) {
        if (!assertion) {
            throw new Error(`ASSERTION FAILED: ${message}`);
        }
    }
}