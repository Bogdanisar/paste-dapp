import React from "react";
import {UnControlled as CodeMirror} from "react-codemirror2";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/xq-light.css";

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
                        theme: "xq-light",
                        indentUnit: 4,
                        lineNumbers: true,
                        autofocus: true,
                    }}
                    onChange={(editor, data, value) => {}}
                />
            </div>
        );
    }
}
