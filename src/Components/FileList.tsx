import { useState } from "react";

export function FileList() {
    const [folderId, setFoldeId] = useState(0);

    async function getFileList() {
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/filesystem/list?folderid=${folderId}`, {
                method: "GET"
            }
        )
            .then((r) => {
                r.json;
            })
            .catch((e) => console.error(e));

        console.log("List", response);
    }

    return (<></>);
}
