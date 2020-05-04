import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import Editor, {LANGUAGE_LIST} from "./Editor";
import {convertUnixEpochToString} from "./Utils.js";

import "./UnlistedView.css";

export default function UnlistedView(props) {
    const {blockchain} = props;
    const [pasteData, setPasteData] = useState(null);

    const {pasteId} = useParams();
    const [pasteID, key] = pasteId.split('_');

    useEffect(() => {
        if (blockchain == undefined) {
            return;
        }

        const fetchData = async () => {
            try {
                const data = await blockchain.getUnlisted(pasteID, key);
                let {code, title, language, owner, creationDate, edited} = data;

                language = LANGUAGE_LIST[language];
                let details = [
                    "Type: Unlisted",
                    "Language: " + language,
                    "Author: " + owner,
                    "Creation date: " + convertUnixEpochToString(creationDate),
                    ("Edited: " + (edited ? "Yes" : "No")),
                ];
                props.onUpdate(title, details);

                setPasteData(data);
            }
            catch (e) {
                let es = e.toString();

                props.onUpdate("Error: " + es, []);
                setPasteData(null);
            }
        };

        fetchData();
    }, [blockchain, pasteID]);

    if (!blockchain || !pasteData) {
        return <></>;
    }
    if (pasteData.error) {
        return <>{pasteData.error}</>;
    }

    return (
        <div className="inactiveEditor">
            <Editor readOnly={true} code={pasteData.code} language={pasteData.language} />
        </div>
    );
}
