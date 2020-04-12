import React from "react";
import Submit from "./Submit";
import Login from "./Login";

import "./Main.css";

export default class Main extends React.Component {
    render() {
        return (
            <div className="main">
                <Login />
            </div>
        );
    }
}
