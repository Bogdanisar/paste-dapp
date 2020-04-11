import React from "react";
import {UnControlled as CodeMirror} from "react-codemirror2";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import "./Main.css";

require("codemirror/mode/javascript/javascript");

export default class Main extends React.Component {
    render() {
        return (
            <div className="main">
                <CodeMirror
                    value="Hello"
                    options={{
                        mode: "javascript",
                        theme: "material",
                        lineNumbers: true,
                    }}
                    onChange={(editor, data, value) => {}}
                />
            </div>
        );
    }
}
