
import React, {Component, ReactNode} from "react";
import Vector2 from '../../../node_modules/@talesoft/geometry/dist/Vector2';
import bind from "../../common/decorators/bind";

interface BuilderItem
{
    width: number;
    height: number;
    color: string;
    collides?: boolean;
    strokeColor?: string;
    strokeWidth?: string;
    strokeLineDash?: [number, number];
    influenceRadius?: number;
    influenceColor?: string;
    influenceStrokeColor?: string;
    influenceStrokeWidth?: number;
    influenceLineDash?: [number, number];
}

interface BuilderPlacedItem
{
    itemIndex: number;
    row: number;
    column: number;
}

interface BuilderLayout
{
    rows: number;
    columns: number;
    items: BuilderItem[];
    placedItems: BuilderPlacedItem[];
}

interface BuilderCanvasState
{
    layout: BuilderLayout|null;
    position: Vector2;
    mousePosition: Vector2;
    dragging: boolean;
}

interface BuilderCanvasProps
{
    layout?: BuilderLayout
    position?: Vector2;
}

export default class BuilderCanvas extends Component<BuilderCanvasProps, BuilderCanvasState>
{
    canvasElement: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    frame: number;

    tileSize: number = 64;

    state: BuilderCanvasState = {
        layout: null,
        position: new Vector2(20, 20),
        mousePosition: new Vector2,
        dragging: false
    };

    constructor(props: BuilderCanvasProps)
    {
        super(props);

        if (typeof props.layout !== 'undefined') {
            this.state.layout = props.layout;
        }

        if (typeof props.position !== 'undefined') {
            this.state.position.set(props.position);
        }
    }

    @bind update(): void
    {
        this.frame = requestAnimationFrame(this.update);

        let ctx = this.context;
        let {width, height} = this.canvasElement;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        if (this.state.layout === null) {
            return;
        }
        this.drawLayout();
    }

    private drawLayout()
    {
        const {layout, position} = this.state;
        const ctx = this.context;
        const gridWidth = layout.columns * this.tileSize;
        const gridHeight = layout.rows * this.tileSize;

        //Draw gridlines
        ctx.strokeStyle = 'gray';
        ctx.strokeRect(position.x, position.y, gridWidth, gridHeight);
        for (let y = 1; y < layout.rows; y++) {
            ctx.beginPath();
            let posY = position.y + y * this.tileSize;
            ctx.moveTo(position.x, posY);
            ctx.lineTo(position.x + gridWidth, posY);
            ctx.stroke();
        }
        for (let x = 1; x < layout.columns; x++) {
            ctx.beginPath();
            let posX = position.x + x * this.tileSize;
            ctx.moveTo(posX, position.y);
            ctx.lineTo(posX, position.y + gridHeight);
            ctx.stroke();
        }
    }

    @bind private fit(): void
    {
        let {offsetWidth: width, offsetHeight: height} = this.canvasElement;
        this.canvasElement.width = width;
        this.canvasElement.height = height;
    }

    @bind private onPointerDown(event: PointerEvent): void
    {
        this.setState({dragging: true});
    }

    @bind private onPointerUp(event: PointerEvent): void
    {
        this.setState({dragging: false});
    }

    @bind private onPointerMove(event: PointerEvent): void
    {
        let {dragging, position, mousePosition} = this.state;
        if (dragging && !mousePosition.isZero()) {
            let delta = mousePosition.copy().subtract({x: event.clientX, y: event.clientY});
            this.setState({position: position.copy().add(delta)});
        }
        this.setState({mousePosition: new Vector2(event.clientX, event.clientY)});
    }

    componentDidMount(): void
    {
        this.context = this.canvasElement.getContext('2d');
        this.fit();
        this.update();

        addEventListener('resize', this.fit);
        this.canvasElement.addEventListener('pointerdown', this.onPointerDown);
        this.canvasElement.addEventListener('pointerup', this.onPointerUp);
        this.canvasElement.addEventListener('pointermove', this.onPointerMove);
    }

    componentWillUnmount()
    {
        if (typeof this.frame !== 'undefined') {
            cancelAnimationFrame(this.frame);
            this.frame = undefined;
        }
        this.canvasElement.removeEventListener('pointermove', this.onPointerMove);
        this.canvasElement.removeEventListener('pointerup', this.onPointerUp);
        this.canvasElement.removeEventListener('pointerdown', this.onPointerDown);
        removeEventListener('resize', this.fit);
    }

    render(): ReactNode
    {
        return <canvas id="builderCanvas" ref={ref => this.canvasElement = ref}/>;
    }
}