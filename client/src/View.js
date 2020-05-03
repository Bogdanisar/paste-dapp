import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import Editor, {LANGUAGE_LIST} from "./Editor";
import {convertUnixEpochToString} from "./Utils.js";

import "./View.css";

export default function View(props) {
    const {blockchain} = props;
    const {pasteId} = useParams();
    const [pasteData, setPasteData] = useState(null);


    useEffect(() => {
        if (blockchain == undefined) {
            return;
        }

        const fetchData = async () => {
            try {
                const data = await blockchain.getPublic(pasteId);
                let {code, title, language, owner, creationDate, edited} = data;

                language = LANGUAGE_LIST[language];
                let details = [
                    "Type: Public",
                    "Language: " + language,
                    "Author: " + owner,
                    "Creation date: " + convertUnixEpochToString(creationDate),
                    ("Edited: " + (edited ? "Yes" : "No")),
                ];
                props.onUpdate(title, details);

                setPasteData(data);
            } catch (e) {
                let es = e.toString();

                props.onUpdate("Error: " + es, []);
                setPasteData({error: es});
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
