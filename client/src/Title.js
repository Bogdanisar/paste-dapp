import React, {useState} from "react";
import {useParams} from "react-router-dom";

import "./Title.css";

export default function Title(props) {
    const [address, setAddress] = useState(null)
    const {pasteId} = useParams();
    let blockchain = props.blockchain;
    let title = (props.title !== undefined) ? props.title : props.defaultTitle;
    let edit_button;
    let owner;
    let prev_address;
    
    
    let dStrArr = (props.details !== undefined) ? props.details : props.defaultDetails;
    let details = Array();
    for (let str of dStrArr) {
        details.push(
            <p> {str} </p>
            );
        }
    
    if (dStrArr.length){
        owner = dStrArr[2].substring(dStrArr[2].indexOf('0x')).toLowerCase()
    } else {
        owner = null;
    }

    setInterval(() => {
        if(! blockchain){return;}
        let current_address = blockchain.getAccount();
        let update = prev_address!=current_address;
        prev_address = blockchain === undefined ?  null : current_address
        if(update) {
            setAddress(current_address)
        }
    }, 1000)
        
    if (title != "Post a paste" 
     && title != "Loading paste..."
     && blockchain !== undefined 
     && blockchain.getAccount() == owner) {
        edit_button = (<button className = "edit" onClick={() => {
            let edit_link = "/edit/" + pasteId;
            window.location = `${edit_link}`;
        }}>Edit</button>);
    } else {
        edit_button = (<></>);
    }

    return (
    <div className="titleBar">
        <h3 className="title">{title}</h3>
        <div className = "details">
            {details}
        </div>
        {edit_button}
    </div>
    );
}