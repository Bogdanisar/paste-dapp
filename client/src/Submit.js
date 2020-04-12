import React from "react";
import Editor, {LANGUAGE_LIST} from "./Editor";
import {Select, MenuItem} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import "./Submit.css";

export default class Submit extends React.Component {
    static PRIVACY_OPTIONS = ["Public", "Private"];

    constructor(props) {
        super(props);
        this.state = {languageId: 0, privacyOptionId: 0};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const target = event.target;
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
        const {languageId, privacyOptionId} = this.state;

        return (
            <div className="submit">
                <Editor readOnly={false} code="" language={languageId} />
                <div className="options">
                    <Select name="language" value={languageId} onChange={this.handleChange}>
                        {" "}
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
