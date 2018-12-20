/// <reference path="../tower-defense.ts" />

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
        TowerDefense.gameState = initialGameState();
    }

    export function save(): void {
        _storage.setItem("save", JSON.stringify(TowerDefense.gameState));
    }

    export function saveExists(): boolean {
        var gameStateString: string = _storage.getItem("save");
        return (gameStateString != null && gameStateString != "");
    }

    export function load(): void {
        var gameStateString: string = _storage.getItem("save");
        TowerDefense.gameState = JSON.parse(gameStateString);
    }

    //#region Game state initializer
    function initialGameState(): TowerDefense.GameState {
        let gameState: TowerDefense.GameState = {
            version: "0.0.0",
            wallPoints: 0,
            towerPoints: 0,
            upgradePoint: 0,
        };
        return gameState;
    }
    //#endregion
}
