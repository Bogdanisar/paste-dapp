import React from "react";

import "./Title.css";

export default function Title(props) {
    let title = (props.title !== undefined) ? props.title : props.defaultTitle;

    let dStrArr = (props.details !== undefined) ? props.details : props.defaultDetails;
    let details = Array();
    for (let str of dStrArr) {
        details.push(
            <p> {str} </p>
        );
    }

    return (
        <div className="titleBar">
            <h3 className="title">{title}</h3>
            {details}
        </div>
    );
}
