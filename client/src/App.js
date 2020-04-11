import React from "react";

import Sidebar from "./Sidebar";
import Main from "./Main";
import "./App.css";

export default class App extends React.PureComponent {
    render() {
        return (
            <>
                <Sidebar />
                <Main />
            </>
        );
    }
}
