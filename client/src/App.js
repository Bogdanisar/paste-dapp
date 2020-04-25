import React from "react";

import Sidebar from "./Sidebar";
import Main from "./Main";
import "./App.css";

import {getBlockchain} from "./blockchain";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {blockchain: null};
    }

    async componentDidMount() {
        const blockchain = await getBlockchain();
        this.setState({blockchain});
    }

    render() {
        const {blockchain} = this.state;
        return (
            <>
                <Sidebar />
                <Main blockchain={blockchain} />
            </>
        );
    }
}
