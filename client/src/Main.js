import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import Submit from "./Submit";
import View from "./View";
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
            public: {
                post: {
                    title: "Post a public paste",
                    details: []
                },
                get: {
                    title: "Loading paste...",
                    details: []
                }
            },
            unlisted: {
                // TODO
            }
        };

        const {blockchain} = this.props;

        return (
            <div className="main">
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/">
                            <Title
                                defaultTitle={defaultValues.public.post.title}
                                defaultDetails={defaultValues.public.post.details}
                            />
                            <Submit blockchain={blockchain} />
                        </Route>
                        <Route exact path="/view/:pasteId">
                            <Title
                                defaultTitle={defaultValues.public.get.title}
                                defaultDetails={defaultValues.public.get.details}
                                title={this.state.title}
                                details={this.state.details}
                            />
                            <View
                                blockchain={blockchain}
                                onUpdate={(t, d) => {this.setTitleAndDetails(t, d);}}
                            />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}
