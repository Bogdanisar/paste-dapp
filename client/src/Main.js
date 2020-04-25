import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import Submit from "./Submit";
import View from "./View";

import "./Main.css";

export default class Main extends React.Component {
    render() {
        const {blockchain} = this.props;
        return (
            <div className="main">
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/">
                            <Submit blockchain={blockchain} />
                        </Route>
                        <Route exact path="/view/:pasteId">
                            <View blockchain={blockchain} />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}
