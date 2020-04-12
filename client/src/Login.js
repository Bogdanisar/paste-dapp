import React from "react";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";

import "./Login.css";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userName: "", password: "", showPassword: false};
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClickShowPassword() {
        this.setState((previousState) =>
            Object.assign({}, previousState, {showPassword: !previousState.showPassword})
        );
    }

    handleChange(event) {
        const {target} = event;
        if (target.name === "userName") {
            this.setState((previousState) =>
                Object.assign({}, previousState, {userName: target.value})
            );
        } else if (target.name === "password") {
            this.setState((previousState) =>
                Object.assign({}, previousState, {password: target.value})
            );
        }
    }

    render() {
        const {userName, password, showPassword} = this.state;
        return (
            <div className="login">
                <FormControl className="form">
                    <Input
                        name="userName"
                        className="userName"
                        value={userName}
                        onChange={this.handleChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <AccountCircle />
                            </InputAdornment>
                        }
                    />
                    <Input
                        name="password"
                        className="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={this.handleChange}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={this.handleClickShowPassword}>
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <Button color="primary">Login</Button>
                    <Button color="secondary">Create an account</Button>
                </FormControl>
            </div>
        );
    }
}
