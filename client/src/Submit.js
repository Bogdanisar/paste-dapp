import React from "react";
import Editor, {LANGUAGE_LIST} from "./Editor";
import {Select, MenuItem} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import "./Submit.css";

export default class Submit extends React.Component {
    static PRIVACY_OPTIONS = ["Public", "Private"];
    static STORAGE_KEY = "code";

    constructor(props) {
        super(props);
        this.state = {languageId: 0, privacyOptionId: 0, code: ""};
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        if (!localStorage) {
            return;
        }

        let cachedCode;
        try {
            cachedCode = localStorage.getItem(Submit.STORAGE_KEY);
            if (!cachedCode) {
                return;
            }
        } catch {}
        this.setState((previousState) => Object.assign({}, previousState, {code: cachedCode}));
    }

    handleChange(event) {
        const {target} = event;
        if (target.name === "language") {
            this.setState((previousState) =>
                Object.assign({}, previousState, {languageId: target.value})
            );
        } else if (target.name === "privacy") {
            this.setState((previousState) =>
                Object.assign({}, previousState, {privacyOptionId: target.value})
            );
        }
    }

    render() {
        const languageOptions = LANGUAGE_LIST.map((langName, index) => (
            <MenuItem value={index}>{langName}</MenuItem>
        ));
        const privacyOptions = Submit.PRIVACY_OPTIONS.map((privacyOption, index) => (
            <MenuItem value={index}>{privacyOption}</MenuItem>
        ));
        const {languageId, privacyOptionId, code} = this.state;

        return (
            <div className="submit">
                <Editor
                    readOnly={false}
                    code={code}
                    language={languageId}
                    onChange={(editor, data, value) => {
                        if (!localStorage) {
                            return;
                        }
                        localStorage.setItem(Submit.STORAGE_KEY, value);
                        this.setState((previousState) =>
                            Object.assign({}, previousState, {code: value})
                        );
                    }}
                />
                <div className="options">
                    <Select name="language" value={languageId} onChange={this.handleChange}>
                        {languageOptions}
                    </Select>
                    <Select name="privacy" value={privacyOptionId} onChange={this.handleChange}>
                        {privacyOptions}
                    </Select>
                    <Button className="button" color="default" startIcon={<CloudUploadIcon />}>
                        Upload
                    </Button>
                </div>
            </div>
        );
    }
}
