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

        reset() {
            this._stateDictionary = {};
            this._stateStack.length = 0;
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
            // todo(dbrad): revert this to the old way of updating the current state here
            // so the transitioning state has control of the update and render
            let newState = this._stateDictionary[stateName];

            if (newState && newState.transitionIn) {
                newState.transitionIn(...args);
            }

            this._stateStack.push(newState);
        }
        pop(...args: any[]): T {
            if (this.current && this.current.transitionOut) {
                this.current.transitionOut();
            }

            if (this._stateStack.length < 2) {
                return null;
            }
            // todo(dbrad): revert this to the old way of updating the current state here
            // so the transitioning state has control of the update and render
            var newState = this._stateStack[this._stateStack.length - 2];

            if (newState && newState.transitionIn) {
                newState.transitionIn(...args);
            }

            return this._stateStack.pop();
        }
    }
}