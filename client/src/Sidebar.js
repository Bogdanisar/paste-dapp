import React from "react";
import "./Sidebar.css";

export default class Sidebar extends React.Component {
    render() {
        return (
            <div className="sidebar">
                <a className="logo" href="/">
                    Paste D-App
                </a>
                <a href="/list/0">
                    Public Pastes
                </a>
            </div>
        );
    }
}
