/// <reference path="util.ts" />

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
        }

        export class Entity {
            [index: string]: any;
            private static __id: number = 0;
            private _components: { [key: string]: Component } = {};
            private _manager: Manager;
            public id: number;
            constructor(manager: Manager) {
                this.id = Entity.__id++;
                this._manager = manager;
            }

            public addComponent(component: Component): void {
                this._components[component.name] = component;
                this[component.name] = component;
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
        }

        export class Manager {
            public collections: { [key: string]: Entity[] } = {};
            public entities: Entity[] = [];

            public addEntity(): Entity {
                let entity: Entity = new Entity(this);
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