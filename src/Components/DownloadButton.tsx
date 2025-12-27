import { useState } from "react";
import { convertToNumber } from "../Functions/Numbers";

export function DownloadButton() {
    const [fileId, setFileId] = useState(1);

    function handleFileIdChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFileId(convertToNumber(e.currentTarget.value));
    }

    async function downloadFile() {
        let filename = "test";
        fetch(
            `${process.env.REACT_APP_API_URL}/api/file/download?fileid=${fileId}`,
            {
                method: "GET",
                credentials: "include",
            }
        )
            .then((response) => {
                const disposition = response.headers.get("Content-Disposition");
                if (disposition === null) {
                    throw "null disposition";
                }
                let fileHeaderList = disposition.match(/filename=(.+)/);
                if (fileHeaderList === null) {
                    throw "null list";
                }
                filename = fileHeaderList[1];
                return response.blob();
            })
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove(); //afterwards we remove the element again
                window.URL.revokeObjectURL(url);
            }).catch(e => console.error(e));
    }

    return (
        <div>
            <input
                type="number"
                min={1}
                onChange={handleFileIdChange}
                value={fileId}
            />
            <button onClick={downloadFile}>download file {fileId}</button>
        </div>
    );
}
