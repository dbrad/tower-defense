namespace Engine {
    export namespace Stats {
        let _fpsTextNode: Text;
        let _msTextNode: Text;
        let _fps: number = 0;
        let _lastFps: number = 0;
        let _lastMs: number = 0;
        let _fpsMs: number = 0;

        export function init(fpsDOM: HTMLElement, msDOM: HTMLElement): void {
            _fpsTextNode = window.document.createTextNode("");
            fpsDOM.appendChild(_fpsTextNode);
            _msTextNode = window.document.createTextNode("");
            msDOM.appendChild(_msTextNode);
        }

        export function tick(delta: number): void {
            _fpsMs += delta
            _fps++;
            if (_fpsMs >= 1000) {
                _lastMs = _fpsMs / _fps;
                if (_fpsMs >= 2000) {
                    _fpsMs = 0;
                } else {
                    _fpsMs -= 1000;
                }
                _lastFps = _fps;
                _fps = 0;
            }
            _fpsTextNode.nodeValue = _lastFps.toString();
            _msTextNode.nodeValue = _lastMs.toFixed(3);
        }
    }
}