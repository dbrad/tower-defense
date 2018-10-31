/// <reference path="util.ts" />

namespace Engine {
    export namespace ECS {
        export interface Component {
            name: string;
            active: boolean;
            value: any;
        }

        export namespace Component {
            export let Collections: { [key: string]: Entity[] } = {};

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
                constructor(name: string, tag: string) {
                    this.name = name;
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
            public id: number;
            constructor() {
                this.id = Entity.__id++;
            }

            public addComponent(component: Component): void {
                this._components[component.name] = component;
                this[component.name] = component;
                if (Component.Collections[component.name] == null) {
                    Component.Collections[component.name] = [];
                }
                Component.Collections[component.name].push(this);
            }
        }
    }
}