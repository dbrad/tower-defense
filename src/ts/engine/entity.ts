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
            name: string;
            active: boolean;
            value: T;
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
            private static __id: number = 1;
            private _components: { [key: string]: IComponent } = {};
            private _manager: Manager;
            public readonly id: number;

            constructor(manager?: Manager) {
                this.id = Entity.__id++;
                this._manager = manager || null;
            }

            public SetManager(manager: Manager) {
                if (this._manager != null) {
                    this.DetachManager();
                }
                this._manager = manager;
                for (let component in this._components) {
                    this.registerComponentWithManager(this._components[component]);
                }
            }

            public DetachManager() {
                for (let component in this._manager.collections) {
                    let index = this._manager.collections[component].indexOf(this);
                    if (index !== -1) {
                        this._manager.collections[component].splice(index, 1);
                    }
                }
                this._manager = null;
            }

            private registerComponentWithManager<T>(component: Component<T>): void {
                if (this._manager.collections[component.name] == null) {
                    this._manager.collections[component.name] = [];
                }
                this._manager.collections[component.name].push(this);
                this._manager.emit(this, component.name, "added");
            }

            public addComponent<T>(name: string, value: T): Component<T> {
                let component = new Component<T>(name, value);

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
        }

        type Event = "added" | "removed";
        type EventHandler = (entity: Entity, collection: Entity[], event: Event) => void;

        export class Manager {
            public collections: Component.Collection = {};
            private _eventHandlers: { [key: string]: { [key: string]: EventHandler[] } } = {};
            public entities: Entity[] = [];

            public reset() {
                this.collections = {};
                this._eventHandlers = {};
                this.entities.length = 0;
            }

            public addEntity(entity?: Entity): Entity {
                if (entity == null) {
                    entity = new Entity(this);
                } else {
                    entity.SetManager(this);
                }
                this.entities[entity.id] = entity;
                return entity;
            }

            public getAll(name: string): Entity[] {
                if (this.collections[name])
                    return this.collections[name];
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