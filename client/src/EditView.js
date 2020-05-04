import React from "react";
import {withRouter} from "react-router-dom";

import Editor, {LANGUAGE_LIST} from "./Editor";
import Submit from "./Submit";
import {convertUnixEpochToString} from "./Utils.js";

import {Select, MenuItem, Input} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import "./Title.css";
import "./Submit.css";
import "./EditView.css";

class EditView extends React.Component {
    static PASTE_TYPE_ERROR = 0;
    static PASTE_TYPE_PUBLIC = 1;
    static PASTE_TYPE_UNLISTED = 2;
    static BAD_ID_MESSAGE = "Error: Wrong paste id";
    static LOADING_PASTE_MESSAGE = "Loading paste...";
    static NORMAL_TITLE = "Editing paste:";
    static gettingData = false;

    getTypeAndPasteId(param) {
        let error = {
            type: EditView.PASTE_TYPE_ERROR
        };

        if (param == undefined) {
            return error;
        }

        if (parseInt(param).toString() === param) {
            let id = parseInt(param);
            return {
                type: EditView.PASTE_TYPE_PUBLIC,
                id: id
            };
        }

        try {
            let arr = param.split('_');

            if (arr.length == 2) {
                const [id, key] = arr;
                return {
                    type: EditView.PASTE_TYPE_UNLISTED,
                    id: id,
                    key: key
                };
            }
        }
        catch {}

        return error;
    }

    constructor(props) {
        super(props);

        let {type, id, key} = this.getTypeAndPasteId(this.props.match.params.id);
        let initTitle;
        if (type == EditView.PASTE_TYPE_ERROR) {
            initTitle = EditView.BAD_ID_MESSAGE
        }
        else {
            initTitle = EditView.LOADING_PASTE_MESSAGE;
        }

        this.state = {
            title: initTitle,
            type: type,
            id: id,
            key: key,
            receivedData: false,
            errorMessage: null
        };
        EditView.gettingData = false;

        this.doFetch = this.doFetch.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.getDetails = this.getDetails.bind(this);
        this.editPaste = this.editPaste.bind(this);
    }

    doFetch() {
        if (
            this.props.blockchain == undefined ||
            this.state.type == EditView.PASTE_TYPE_ERROR ||
            EditView.gettingData ||
            this.state.receivedData
        ) {
            return;
        }

        const fetchData = async () => {
            try {
                EditView.gettingData = true;

                const {blockchain} = this.props;
                const {type, id, key} = this.state;

                let data;
                if (type == EditView.PASTE_TYPE_PUBLIC) {
                    data = await blockchain.getPublic(id)
                }
                else {
                    data = await blockchain.getUnlisted(id, key);
                }
                let {code, title: pasteTitle, language: languageId, owner, creationDate, edited} = data;
                let language = LANGUAGE_LIST[languageId];

                this.setState({
                    title: EditView.NORMAL_TITLE,

                    pasteTitle,
                    code,
                    languageId,
                    language,
                    owner,
                    creationDate,
                    edited,

                    receivedData: true,
                    errorMessage: null
                }, () => {
                    EditView.gettingData = true;
                });
            }
            catch (e) {
                EditView.gettingData = true;

                let es = e.toString();
                this.setState({title: es});
            }
        };

        fetchData();
    }

    componentDidMount() {
        this.doFetch();
    }

    componentDidUpdate() {
        this.doFetch();
    }

    handleChange(event) {
        const {target} = event;

        if (target.name === "language") {
            this.setState({languageId: target.value});
        }
        else if (target.name === "title") {
            let pasteTitle = (target.value == "") ? Submit.DEFAULT_TITLE : target.value;
            this.setState({pasteTitle});
        }
    }

    handleClose() {
        this.setState({errorMessage: null});
    }

    async editPaste() {
        const {blockchain, history} = this.props;
        if (blockchain == undefined || this.state.type == EditView.PASTE_TYPE_ERROR) {
            this.setState((previousState) =>
                Object.assign({}, previousState, {errorMessage: "Failed to load blockchain."})
            );
            return;
        }

        const {type, id, key, code, pasteTitle, languageId} = this.state;

        if (type == EditView.PASTE_TYPE_PUBLIC) {
            // public paste
            try {
                await blockchain.editPublic(id, code, pasteTitle, languageId.toString());
                history.push(`/public/${id}`);
            }
            catch (e) {
                this.setState({errorMessage: e.toString()});
            }
        }
        else {
            // unlisted paste
            try {
                await blockchain.editUnlisted(id, key, code, pasteTitle, languageId.toString());
                history.push(`/unlisted/${id}_${key}`);
            }
            catch (e) {
                this.setState({errorMessage: e.toString()});
            }
        }
    }

    getDetails() {
        if (this.state.receivedData == false) {
            return [];
        }

        let type = this.state;
        let details = [];

        details.push(
            <div>
                <span> Title: </span>
                <Input
                    name="title"
                    defaultValue={this.state.pasteTitle}
                    placeholder="Paste title"
                    onChange={this.handleChange}
                />
            </div>
        );

        details.push(
            <div>
                <span> Type: {(type == EditView.PASTE_TYPE_PUBLIC) ? "Public" : "Unlisted"} </span>
            </div>
        );

        const languageOptions = LANGUAGE_LIST.map((langName, index) => (
            <MenuItem value={index} > {langName} </MenuItem>
        ));
        details.push(
            <div>
                <span> Language: </span>
                <Select name="language" value={this.state.languageId} onChange={this.handleChange}>
                    {languageOptions}
                </Select>
            </div>
        );

        // details.push(
        //     <div>
        //         <span> Author: {this.state.owner} </span>
        //     </div>
        // );

        details.push(
            <div>
                <span> Date: { convertUnixEpochToString(this.state.creationDate) } </span>
            </div>
        );

        details.push(
            <div>
                <span> Edited: { (this.state.edited) ? "Yes" : "No" } </span>
            </div>
        );

        return details;
    }

    render() {
        const {title, receivedData, errorMessage} = this.state;

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

                <div className="titleBar editBar">
                    <h3 className="title">{title}</h3>
                    {this.getDetails()}
                </div>

                <div className="submit activeEditor" style={(receivedData) ? {} : {display: "none"}}>
                    <Editor
                        readOnly={false}
                        code={this.state.code}
                        language={this.state.languageId}
                        onChange={(editor, data, value) => {
                            this.setState({code: value});
                        }}
                    />
                </div>

                <div className="options" style={(receivedData) ? {} : {display: "none"}}>
                    <Button
                        className="button"
                        color="default"
                        startIcon={<CloudUploadIcon />}
                        onClick={this.editPaste}>
                        Edit
                    </Button>
                </div>
            </>
        );
    }
}

export default withRouter(EditView);
