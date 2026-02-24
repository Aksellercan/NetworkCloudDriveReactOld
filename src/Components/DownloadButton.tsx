import { useState } from "react";
import { convertToNumber } from "../Functions/Numbers";
import { downloadFile } from "../Functions/DownloadFile";

export function DownloadButton() {
    const [fileId, setFileId] = useState(1);

    function handleFileIdChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFileId(convertToNumber(e.currentTarget.value, 1));
    }

    async function DownloadFile() {
        downloadFile(fileId)
    }

    return (
        <div>
            <input
                type="number"
                min={1}
                onSubmit={DownloadFile}
                onChange={handleFileIdChange}
                value={fileId}
            />
            <button onClick={DownloadFile}>Download file {fileId}</button>
        </div>
    );
}
