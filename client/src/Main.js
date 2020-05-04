import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import Submit from "./Submit";
import ListPublic from "./ListPublic"
import PublicView from "./PublicView";
import UnlistedView from "./UnlistedView";
import EditView from "./EditView";
import Title from "./Title";

import "./Main.css";

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: undefined,
            details: undefined,
        };
    }

    setTitleAndDetails(title, details) {
        this.setState({title: title, details: details});
    }

    render() {

        const defaultValues = {
            post: {
                title: "Post a paste",
                details: []
            },
            get: {
                title: "Loading paste...",
                details: []
            }
        };

        const {blockchain} = this.props;

        return (
            <div className="main">
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/">
                            <Title
                                defaultTitle={defaultValues.post.title}
                                defaultDetails={defaultValues.post.details}
                            />
                            <Submit blockchain={blockchain} />
                        </Route>
                        <Route exact path="/public/:pasteId">
                            <Title
                                defaultTitle={defaultValues.get.title}
                                defaultDetails={defaultValues.get.details}
                                title={this.state.title}
                                details={this.state.details}
                            />
                            <PublicView
                                blockchain={blockchain}
                                onUpdate={(t, d) => {this.setTitleAndDetails(t, d);}}
                            />
                        </Route>
                        <Route exact path="/unlisted/:pasteId_key">
                            <Title
                                defaultTitle={defaultValues.get.title}
                                defaultDetails={defaultValues.get.details}
                                title={this.state.title}
                                details={this.state.details}
                            />
                            <UnlistedView
                                blockchain={blockchain}
                                onUpdate={(t, d) => {this.setTitleAndDetails(t, d);}}
                            />
                        </Route>
                        <Route exact path="/list/:page">
                            <ListPublic blockchain={blockchain} />
                        </Route>
                        <Route exact path="/edit/:id">
                            <EditView
                                blockchain={blockchain}
                            />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}
