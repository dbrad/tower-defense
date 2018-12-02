/// <reference path="util.ts" />
// @ifdef DEBUG
/// <reference path="debug.ts" />
// @endif

namespace Engine {
    export namespace ECS {
        export interface Component {
            name: string;
            active: boolean;
            value: any;
        }

        export namespace Component {
            export class Position implements Component {
                name: string;
                active: boolean;
                value: V2;
                constructor(name: string, pos: V2, active: boolean = true) {
                    this.name = name;
                    this.value = pos;
                    this.active = active;
                }
            }

            export class Tag implements Component {
                name: string;
                active: boolean;
                value: string;
                constructor(tag: string) {
                    this.name = tag;
                    this.value = tag;
                }
            }

            export class Flag implements Component {
                name: string;
                active: boolean;
                value: boolean;
                constructor(name: string, flag: boolean) {
                    this.name = name;
                    this.value = flag;
                }
            }

            export class Number implements Component {
                name: string;
                active: boolean;
                value: number;
                constructor(name: string, value: number) {
                    this.name = name;
                    this.value = value;
                }
            }

            export class Object<T> implements Component {
                name: string;
                active: boolean;
                value: T;
                constructor(name: string, object: T) {
                    this.name = name;
                    this.value = object;
                }
            }
        }

        export class Entity {
            private static __id: number = 0;
            private _components: { [key: string]: Component } = {};
            private _manager: Manager;
            public id: number;

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

            private registerComponentWithManager(component: Component): void {
                if (this._manager.collections[component.name] == null) {
                    this._manager.collections[component.name] = [];
                }
                this._manager.collections[component.name].push(this);
                this._manager.collections[component.name].sort(
                    (a: Entity, b: Entity) => {
                        if (a.id < b.id) {
                            return -1;
                        } else if (a.id > b.id) {
                            return 1;
                        }
                        return 0;
                    });
            }

            public addComponent(component: Component): void {
                // @ifdef DEBUG
                DEBUG.assert(this._components[component.name] == null,
                    `Cannot add component "${component.name}" to Entity #${this.id} multiple times.`,
                    this);
                // @endif

                this._components[component.name] = component;
                if (this._manager != null) {
                    this.registerComponentWithManager(component);
                }
            }

            public getComponent<T extends Component>(name: string): T {
                return this._components[name] as T;
            }
        }

        export class Manager {
            public collections: { [key: string]: Entity[] } = {};
            public entities: Entity[] = [];

            public addEntity(entity?: Entity): Entity {
                if (entity == null) {
                    entity = new Entity(this);
                } else {
                    entity.SetManager(this);
                }
                this.entities.push(entity);
                return entity;
            }

            public getAll(name: string): Entity[] {
                return this.collections[name];
            }

            public getFirst(name: string): Entity {
                return this.collections[name][0];
            }
        }
    }
}