
import React, {Component, ReactNode} from "react";
import BuilderCanvas from "./BuilderCanvas";

export default class App extends Component
{
    render(): ReactNode
    {
        return <div id="appContainer">
            <BuilderCanvas layout={{
                rows: 6,
                columns: 8,
                items: [],
                placedItems: []
            }} />
        </div>;
    }
}