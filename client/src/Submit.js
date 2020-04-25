import React from "react";
import {withRouter} from "react-router-dom";

import Editor, {LANGUAGE_LIST} from "./Editor";

import {Select, MenuItem, Input} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import "./Submit.css";

class Submit extends React.Component {
    static PRIVACY_OPTIONS = ["Public", "Private"];
    static STORAGE_KEY = "code";

    constructor(props) {
        super(props);
        this.state = {languageId: 0, privacyOptionId: 0, code: "", errorMessage: null};
        this.handleChange = this.handleChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.uploadPaste = this.uploadPaste.bind(this);
    }

    getCachedCode() {
        try {
            return localStorage.getItem(Submit.STORAGE_KEY);
        } catch {}
    }

    componentDidMount() {
        this.setState((previousState) =>
            Object.assign({}, previousState, {
                code: this.getCachedCode(),
            })
        );
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

    handleClose() {
        this.setState((previousState) => Object.assign({}, previousState, {errorMessage: null}));
    }

    async uploadPaste() {
        const api = this.props.blockchain;
        if (!api) {
            this.setState((previousState) =>
                Object.assign({}, previousState, {errorMessage: "Failed to load blockchain."})
            );
            return;
        }

        const {languageId, code} = this.state;
        try {
            const pasteId = await api.postPublic(code, languageId.toString());
        } catch (e) {
            this.setState((previousState) =>
                Object.assign({}, previousState, {errorMessage: e.toString()})
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
        const {languageId, privacyOptionId, code, errorMessage} = this.state;

        return (
            <>
                <Snackbar
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                    open={errorMessage !== null}
                    autoHideDuration={6000}
                    onClose={this.handleClose}
                    message={errorMessage}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={this.handleClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                />
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
                        <Input defaultValue="Key" disabled={privacyOptionId === 0} />
                        <Button
                            className="button"
                            color="default"
                            startIcon={<CloudUploadIcon />}
                            onClick={this.uploadPaste}>
                            Upload
                        </Button>
                    </div>
                </div>
            </>
        );
    }
}

export default withRouter(Submit);
