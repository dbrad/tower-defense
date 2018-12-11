namespace Engine {
    export namespace Events {
        type EventHandler = (...args: any[]) => void;

        export class Manager {
            public subscribers: { [key: string]: { [key: string]: EventHandler[] } } = {};
            public reset() {
                this.subscribers = {};
            }
        }

        export function emit(manager: Manager, object: string, event: string, ...args: any[]) {
            if (manager.subscribers[object] && manager.subscribers[object][event]) {
                manager.subscribers[object][event].forEach(
                    (handler) => {
                        handler(...args);
                    }
                )
            }
        }

        export function on(manager: Manager, object: string, event: string, handler: EventHandler) {
            if (manager.subscribers[object] == null) {
                manager.subscribers[object] = {};
            }
            if (manager.subscribers[object][event] == null) {
                manager.subscribers[object][event] = [];
            }
            manager.subscribers[object][event].push(handler);
        }
    }
}