/// <reference path="util.ts" />
// @ifdef DEBUG
/// <reference path="debug.ts" />
// @endif

namespace Engine {
    export namespace ECS {
        export interface IComponent {
            name: string;
            active: boolean;
            value: any;
        }

        export class Component<T> implements IComponent {
            public name: string;
            public active: boolean;
            public value: T;
            constructor(name: string, value: T, active: boolean = true) {
                this.name = name;
                this.value = value;
                this.active = active;
            }
        }

        export namespace Component {
            export type Collection = { [key: string]: Entity[] };

            export function coalesceValue<T>(component: Component<T>, ifNull: T): T {
                if (component != null) {
                    return component.value;
                }
                return ifNull;
            }
        }

        export class Entity {
            // tslint:disable-next-line:
            private static __id: number = 1;
            public readonly id: number;
            private _components: { [key: string]: IComponent } = {};
            private _manager: Manager;

            constructor(manager?: Manager) {
                this.id = Entity.__id++;
                this._manager = manager || null;
            }

            public setManager(manager: Manager): void {
                if (this._manager != null) {
                    this.detachManager();
                }
                this._manager = manager;
                for (const component in this._components) {
                    if (this._components.hasOwnProperty(component)) {
                        this.registerComponentWithManager(this._components[component]);
                    }
                }
            }

            public detachManager(): void {
                if (this._manager) {
                    for (const component in this._manager.collections) {
                        if (this._manager.collections[component]) {
                            const index = this._manager.collections[component].indexOf(this);
                            if (index !== -1) {
                                this._manager.collections[component].splice(index, 1);
                            }
                        }
                    }
                    this._manager.entities[this.id] = null;
                    delete this._manager.entities[this.id];
                }
                this._manager = null;
            }

            public addComponent<T>(name: string, value: T): Component<T> {
                const component = new Component<T>(name, value);

                // @ifdef DEBUG
                DEBUG.assert(this._components[component.name] == null,
                    `Cannot add component named "${component.name}" to Entity #${this.id} multiple times.`,
                    this);
                // @endif

                this._components[component.name] = component;
                if (this._manager != null) {
                    this.registerComponentWithManager(component);
                }
                return component;
            }

            public removeComponent(name: string): void {
                this._components[name] = null;
                delete this._components[name];
            }

            public removeAllComponents(): void {
                for (const component in this._components) {
                    if (this._components[component]) {
                        this.removeComponent(component);
                    }
                }
            }

            public addTag(name: string): Component<string> {
                return this.addComponent(name, name);
            }

            public getComponent<T>(name: string): Component<T> {
                if (this._components[name] == null) {
                    return null;
                }
                return this._components[name];
            }

            public getValue<T>(name: string): T {
                if (this._components[name] == null) {
                    return null;
                }
                return this._components[name].value as T;
            }

            public hasComponent(name: string): boolean {
                return (this._components[name] != null);
            }

            private registerComponentWithManager<T>(component: Component<T>): void {
                if (this._manager.collections[component.name] == null) {
                    this._manager.collections[component.name] = [];
                }
                this._manager.collections[component.name].push(this);
                this._manager.emit(this, component.name, "added");
            }
        }

        type Event = "added" | "removed";
        type EventHandler = (entity: Entity, collection: Entity[], event: Event) => void;

        export class Manager {
            public collections: Component.Collection = {};
            public entities: Entity[] = [];
            private _eventHandlers: { [key: string]: { [key: string]: EventHandler[] } } = {};

            public reset(): void {
                this.collections = {};
                this._eventHandlers = {};
                this.entities.length = 0;
            }

            public addEntity(entity?: Entity): Entity {
                if (entity == null) {
                    entity = new Entity(this);
                } else {
                    entity.setManager(this);
                }
                this.entities[entity.id] = entity;
                return entity;
            }

            public removeEntity(entity: Entity): void {
                // NOTE: This does not clean up entities mapped to a tilemap.
                entity.detachManager();
                entity.removeAllComponents();
            }

            public getAll(name: string): Entity[] {
                if (this.collections[name]) {
                    return Array.from(this.collections[name]);
                }
                return [];
            }

            public getFirst(name: string): Entity {
                if (this.collections[name] == null) {
                    return null;
                }
                return this.collections[name][0];
            }

            public on(collectionName: string, event: Event, handler: EventHandler): void {
                if (this._eventHandlers[collectionName] == null) {
                    this._eventHandlers[collectionName] = {};
                }
                if (this._eventHandlers[collectionName][event] == null) {
                    this._eventHandlers[collectionName][event] = [];
                }
                this._eventHandlers[collectionName][event].push(handler);
            }

            public emit(entity: Entity, collection: string, event: Event): void {
                if (this._eventHandlers[collection] &&
                    this._eventHandlers[collection][event]) {
                    this._eventHandlers[collection][event].forEach(
                        (handler, index, array) => {
                            handler(entity, this.collections[collection], event);
                        });
                }
            }
        }
    }
}
