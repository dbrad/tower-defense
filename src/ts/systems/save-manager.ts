/// <reference path="../game.ts" />

namespace SaveManager {

    interface Storage {
        setItem(key: string, value: string): void;
        getItem(key: string): string;
    }

    var _storage: Storage = null;

    export function setStorage(storage: Storage): void {
        _storage = storage;
    }

    export function newGame(): void {
        Game.gameState = initialGameState();
    }

    export function save(): void {
        _storage.setItem("save", JSON.stringify(Game.gameState));
    }

    export function saveExists(): boolean {
        var gameStateString: string = _storage.getItem("save");
        return (gameStateString != null && gameStateString != "");
    }

    export function load(): void {
        var gameStateString: string = _storage.getItem("save");
        Game.gameState = JSON.parse(gameStateString);
    }

    //#region Game state initializer
    function initialGameState(): Game.GameState {
        let gameState: Game.GameState = {
            version: "0.0.0"
        }
        return gameState;
    }
    //#endregion
}