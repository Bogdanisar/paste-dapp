import React from "react"
import { withRouter, useParams } from "react-router-dom";

import "./ListPublic.css"
import {convertUnixEpochToString} from "./Utils.js";



class ListPublic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            public_pastes: [],
            pageNumber: 0,
            windowSize: 10,
            prevIsActive: false,
            nextIsActive: false,
        }
    }


    async componentDidUpdate(prevProps) {
        if (prevProps.blockchain == this.props.blockchain) return;
        await this.loadPublicPaste(this.props.blockchain, this.state.pageNumber)
    }


    async loadPublicPaste(blockchain, pageNumber) {
        const offset = this.state.windowSize * pageNumber;
        const quantity = this.state.windowSize;
        const no_public_pastes = await blockchain.callApi("getNumberOfPublicPastes");
        if (offset + quantity <= 0 | offset - quantity >= no_public_pastes) {
            return;
        }
        const public_pastes = await blockchain.getWindowPublic(no_public_pastes - offset - quantity, quantity);
        let prevIsActive, nextIsActive;
        if(offset > 0) {
            prevIsActive = true;
        } else {
            prevIsActive = false;
        }
        if (offset + quantity < no_public_pastes) {
            nextIsActive = true;
        } else {
            nextIsActive = false;
        }
        this.setState({public_pastes, prevIsActive, nextIsActive, pageNumber});
    }


    getSampleCode(code) {
        const first_index=code.indexOf('\n');
        // console.log(first_index)
        if (first_index == -1) return (
            <div className = 'sample'>
                {code}
            </div>
        );
        const second_index = code.indexOf('\n', first_index+1)
        // console.log(second_index)
        if (second_index == -1) return (
            <div className = 'sample'>
                {code.substring(0, first_index)} <br/>
                {code.substring(first_index+1)}
            </div>
        );
        const third_index = code.indexOf('\n', second_index+1)
        // console.log(third_index)
        if (third_index == -1) return (
            <div className = 'sample'>
                {code.substring(0, first_index)} <br></br>
                {code.substring(first_index+1, second_index)} <br></br>
                {code.substring(second_index+1)}
            </div>
        )
        if (third_index+1 == code.length) return (
            <div className = 'sample'>
                {code.substring(0, first_index)} <br></br>
                {code.substring(first_index+1, second_index)} <br></br>
                {code.substring(second_index+1, third_index)} <br></br>
            </div>
        );

        return (
            <div className = 'sample'>
                {code.substring(0, first_index)} <br></br>
                {code.substring(first_index+1, second_index)} <br></br>
                {code.substring(second_index+1, third_index)} <br></br>
                ...
            </div>
        )

    }


    routeChange(offset) {
        let pageNumber = this.state.pageNumber + offset;
        this.setState({pageNumber},  async() => {
            await this.loadPublicPaste(this.props.blockchain, pageNumber);
        })
    }


    render() {
        let prev_button, next_button;
        if (this.state.prevIsActive) {
            prev_button = (<button className = 'prev' onClick={() => this.routeChange(-1)}>Prev</button>);
        } else {
            prev_button = (<button className = 'prev disabled' disabled>Prev</button>);
        }
        if (this.state.nextIsActive) {
            next_button = (<button className = 'next' onClick={() => this.routeChange(1)}>Next</button>);
        } else {
            next_button = (<button className = 'next disabled' disabled>Next</button>);
        }
        const paste_elements = this.state.public_pastes.reverse().map((paste) => {
            const view_link = "/public/" + paste['id'];
            const sample_code_element = this.getSampleCode(paste['code']);
            const title = paste['title'] == "" ? "Untitled" : paste['title']
            return (
                <li key={paste['id']}>
                    <div className='paste_item'>
                        <div className = 'header'>
                            <div className = 'title'>
                                <a href={view_link}>{title}</a>
                            </div>
                            <div className = 'language'>
                                Synthax: {paste['language']}
                            </div>
                        </div>
                        <div className = 'author'>
                            Author: {paste['owner']}
                        </div>
                        {sample_code_element}
                        <div className = 'posted_on'>
                            Posted on: {convertUnixEpochToString(paste['creationDate'])}
                        </div>
                    </div>
                </li>
            );
        });
    
        return (
            <div className="container">
                {prev_button}
                {next_button}
                <ul>{paste_elements}</ul>
            </div>
        );
    }
}

export default withRouter(ListPublic);