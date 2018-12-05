// @ifdef DEBUG
/// <reference path="debug.ts" />
// @endif

namespace Engine {
    export interface State {
        name: string;
        transitionIn(...args: any[]): void;
        transitionOut(): void;
    }

    export class StateMachine<T extends State> {
        private _stateDictionary: { [key: string]: T; };
        private _stateStack: T[];

        constructor() {
            this._stateDictionary = {};
            this._stateStack = [];
        }

        register(state: T): void {
            // @ifdef DEBUG
            DEBUG.assert(state.transitionIn != null, `State needs to have a 'transitionIn' method.`);
            DEBUG.assert(state.transitionOut != null, `State needs to have a 'transitionOut' method.`);
            DEBUG.assert(state.name != null && state.name != "", `State needs to have a 'name' property.`);
            // @endif
            this._stateDictionary[state.name] = state;
        }

        get current(): T {
            return this._stateStack[this._stateStack.length - 1];
        }

        push(stateName: string, ...args: any[]): void {
            if (this.current && this.current.transitionOut) {
                this.current.transitionOut();
            }

            this._stateStack.push(this._stateDictionary[stateName]);

            if (this.current && this.current.transitionIn) {
                this.current.transitionIn(...args);
            }
        }
        pop(...args: any[]): T {
            if (this.current && this.current.transitionOut) {
                this.current.transitionOut();
            }

            var result = this._stateStack.pop();

            if (this.current && this.current.transitionIn) {
                this.current.transitionIn(...args);
            }
            return result;
        }
    }
}