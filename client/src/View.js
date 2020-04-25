import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import Editor from "./Editor";

import "./View.css";

export default function View(props) {
    const {blockchain} = props;
    const {pasteId} = useParams();
    const [pasteData, setPasteData] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await blockchain.getPublic(pasteId);
                setPasteData(data);
            } catch (e) {
                setPasteData({error: e.toString()});
            }
        };

        fetchData();
    }, [blockchain, pasteId]);

    if (!blockchain || !pasteData) {
        return <></>;
    }
    if (pasteData.error) {
        return <>{pasteData.error}</>;
    }

    return (
        <Editor readOnly={true} code={pasteData.code} language={pasteData.language} />
    );
}
