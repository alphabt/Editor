import { Engine, Scene, ArcRotateCamera, Vector3, Material, Mesh, Texture, HemisphericLight } from "babylonjs";
import "babylonjs-materials";

import * as React from "react";

export const title = "Mesh Viewer";

export default class MeshViewerWindow extends React.Component {
    private _engine: Engine;
    private _scene: Scene;
    private _camera: ArcRotateCamera;
    private _sphere: Mesh;

    /**
     * Constructor
     * @param props the component's props.
     */
    public constructor(props: any) {
        super(props);
    }

    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        return <canvas id="renderCanvas" style={{ width: "100%", height: "100%", position: "absolute", top: "0", touchAction: "none" }}></canvas>;
    }

    /**
     * Called on the component did mount.
     */
    public componentDidMount(): void {
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        if (!canvas) { return; }

        this._engine = new Engine(canvas, true, {
            audioEngine: true,
        });

        this._scene = new Scene(this._engine);
        this._scene.clearColor.set(0, 0, 0, 1);
        
        this._camera = new ArcRotateCamera("camera", 0, 0, 100, Vector3.Zero(), this._scene, true);
        this._camera.minZ = 0.1;
        this._camera.attachControl(canvas, false, false);

        this._sphere = Mesh.CreateSphere("sphere", 32, 50, this._scene, false);

        new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);

        this._engine.runRenderLoop(() => this._scene.render());

        // Add events
        window.addEventListener("resize", () => this._engine.resize());
    }

    /**
     * Inits the plugin.
     * @param data the initialization data containing the material definition etc.
     */
    public init(data: { rootUrl: string, json: any, environmentTexture: any }): void {
        this._parseMaterial(data.rootUrl, data.json, data.environmentTexture);
    }

    /**
     * Loads the mesh located at the given path.
     */
    private async _parseMaterial(rootUrl: string, json: any, environmentTexture: any): Promise<void> {
        // Create material
        const material = Material.Parse(json, this._scene, rootUrl);
        this._sphere.material = material;

        if (environmentTexture) {
            this._scene.environmentTexture = Texture.Parse(environmentTexture, this._scene, rootUrl)
        }

        // Open bjs inspector
        this._scene.debugLayer.show({
            globalRoot: document.body,
            handleResize: false,
            enablePopup: false,
            enableClose: false,
            embedMode: true,
            inspectorURL: "../node_modules/babylonjs-inspector/babylon.inspector.bundle.max.js",
        });
    }
}