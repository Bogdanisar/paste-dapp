import React from "react";

import Sidebar from "./Sidebar";
import Main from "./Main";
import "./App.css";
import {getBlockchain} from "./blockchain";

export default class App extends React.PureComponent {
    async componentDidMount() {
        const blockchain = await getBlockchain();
        console.log(blockchain);
    }

    render() {
        return (
            <>
                <Sidebar />
                <Main />
            </>
        );
    }
}
