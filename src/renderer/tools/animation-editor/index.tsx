import { Nullable } from "../../../shared/types";

import * as React from "react";
import { Classes, ButtonGroup, Button, NonIdealState } from "@blueprintjs/core";
import Drawer from "antd/lib/drawer";

import { Chart } from "chart.js";
import "chartjs-plugin-dragdata";
import "chartjs-plugin-zoom";

import "./augmentations";

import { AbstractEditorPlugin, IEditorPluginProps } from "../../editor/tools/plugin";

export const title = "Animation Editor";

export interface IAnimationEditorPluginState {
    /**
     * Defines wether or not the animations list is opened.
     */
    animatonsListOpened: boolean;
}

export default class AnimationEditorPlugin extends AbstractEditorPlugin<IAnimationEditorPluginState> {
    /**
     * Defines the reference to the chart element.
     */
    public chart: Nullable<Chart> = null;

    private _canvas: Nullable<HTMLCanvasElement> = null;
    private _refHandler = {
        getCanvas: (ref: HTMLCanvasElement) => this._canvas = ref,
    };

    private _draggingNode: boolean = false;

    /**
     * Constructor.
     * @param props the component's props.
     */
    public constructor(props: IEditorPluginProps) {
        super(props);

        this.state = {
            animatonsListOpened: false,
        };
    }

    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <div className={Classes.FILL} key="documentation-toolbar" style={{ width: "100%", height: "25px", backgroundColor: "#333333", borderRadius: "10px", marginTop: "5px" }}>
                    <ButtonGroup>
                        <Button key="open-animations-list" small={true} text="Animations..." onClick={() => this.setState({ animatonsListOpened: true })} />
                    </ButtonGroup>
                </div>
                <div style={{ position: "relative", width: "100%", height: "calc(100% - 30px)" }}>
                    <canvas ref={this._refHandler.getCanvas}></canvas>
                </div>
                <Drawer
                    title="Animations of ..."
                    placement="left"
                    closable={false}
                    visible={this.state.animatonsListOpened}
                    onClose={() => this.setState({ animatonsListOpened: false })}
                    getContainer={false}
                    style={{ position: "absolute" }}
                >
                    <Button text="Add..." small={true} fill={true} />
                    <NonIdealState
                        icon="search"
                        title="No animation."
                        description={`No animation available. To select and edit animations, please add at least one animation by clikcing on the button "Add..."`}
                    />
                </Drawer>
            </div>
        );
    }

    /**
     * Called on the plugin is ready.
     */
    public onReady(): void {
        if (!this._canvas) { return; }

        // Create chart
        this.chart = new Chart(this._canvas.getContext("2d")!, {
            type: "line",
            data: {
                datasets: [{
                    label: "x",
                    pointRadius: 10,
                    showLine: true,
                    data: [
                        { x: 0, y: 5 },
                        { x: 10, y: 10 },
                        { x: 20, y: 5 }
                    ],
                }],
            },
            options: {
                dragData: true,
                dragX: true,
                onDragStart: () => {
                    this._draggingNode = true;
                },
                onDrag: () => {
                    // TODO: notify that key changed.
                },
                onDragEnd: () => {
                    this._draggingNode = false;
                },
                onClick: (_, elements) => {
                    if (!elements?.length) { return; }
                    // TODO: notify point selected.
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: () => this._draggingNode ? "" : "xy",
                        },
                        zoom: {
                            enabled: true,
                            mode: "xy",
                        },
                    },
                },
                scales: {
                    xAxes: [{
                        type: "linear",
                        position: "bottom",
                        ticks: { min: 0, max: 20 },
                    }],
                    yAxes: [{
                        ticks: { min: 0, max: 10 },
                    }],
                }
            },
        });
    }

    /**
     * Called on the plugin is closed.
     */
    public onClose(): void {
        // Destroy chart
        try {
            this.chart?.destroy();
        } catch (e) {
            this.editor.console.logError("[Animation Editor]: failed to destroy chart.");
        }
    }
}
