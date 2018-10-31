// @ifdef DEBUG
/// <reference path="debug.ts" />
// @endif

namespace Engine {
    export interface State {
        name: string;
        transitionIn(): void;
        transitionOut(): void;
    }

    export class StateMachine {
        private _stateDictionary: { [key: string]: State; };
        private _stateStack: State[];

        constructor() {
            this._stateDictionary = {};
            this._stateStack = [];
        }

        register(state: State): void {
            // @ifdef DEBUG
            DEBUG.assert(state.transitionIn != null, `State needs to have a 'transitionIn' method.`);
            DEBUG.assert(state.transitionOut != null, `State needs to have a 'transitionOut' method.`);
            DEBUG.assert(state.name != null && state.name != "", `State needs to have a 'name' property.`);
            // @endif
            this._stateDictionary[state.name] = state;
        }

        get current(): State {
            return this._stateStack[this._stateStack.length - 1];
        }

        push(stateName: string): void {
            if (this.current && this.current.transitionOut) {
                this.current.transitionOut();
            }

            this._stateStack.push(this._stateDictionary[stateName]);

            if (this.current && this.current.transitionIn) {
                this.current.transitionIn();
            }
        }
        pop(): State {
            if (this.current && this.current.transitionOut) {
                this.current.transitionOut();
            }

            var result = this._stateStack.pop();

            if (this.current && this.current.transitionIn) {
                this.current.transitionIn();
            }
            return result;
        }
    }
}