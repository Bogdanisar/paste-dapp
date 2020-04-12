import React from "react";
import {UnControlled as CodeMirror} from "react-codemirror2";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/xq-light.css";

export const LANGUAGE_LIST = [
    "clike",
    "javascript",
    "go",
    "haskell",
    "python",
    "rust",
    "sql",
    "toml",
];

for (const language of LANGUAGE_LIST) {
    require(`codemirror/mode/${language}/${language}`);
}

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {language: 1};
    }

    render() {
        const {language, readOnly, code} = this.props;
        return (
            <CodeMirror
                value={code}
                options={{
                    theme: "xq-light",
                    indentUnit: 4,
                    lineNumbers: true,

                    autoFocus: !readOnly,
                    mode: LANGUAGE_LIST[language],
                    readOnly: readOnly,
                }}
            />
        );
    }
}
