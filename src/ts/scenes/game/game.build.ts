/// <reference path="../../engine/core.ts" />

namespace Scenes {
    export namespace Game {
        export namespace SubScenes {
            export let Build = new Engine.Scene({
                name: "Build",
                transitionIn (parentScene: Engine.Scene) { 
                    let self = this as Engine.Scene;
                    self.attach<Engine.Scene>("parentScene", parentScene);
                },
                transitionOut () { },
                update () { },
                render () { }
            });
        }
    }
}