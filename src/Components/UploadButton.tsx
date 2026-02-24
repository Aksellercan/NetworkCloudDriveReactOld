import React, { useState } from "react";
import { UploadFile } from "../Functions/UploadFile";

type UploadButtonProps = {
    currentFolderId: number
}

export function UploadButton({ currentFolderId }: UploadButtonProps) {
    const [files, setFile] = useState<FileList | undefined>();
    const [state, setState] = useState("ready to upload");

    function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement & {
            files: FileList;
        };
        setFile(target.files);
        console.log("target", target.files);
    }

    async function handleFileUpload() {
        if (files === undefined) {    
            return
        }
        const results: string[] = await UploadFile(files!, currentFolderId);
        if (results.length === 0) {
            setState("Failed to upload files");
            return;
        }
        setState("Uploaded files");
    }

    return (
        <div>
            <p>Upload state: {state}</p>
            <input onChange={handleOnChange} type="file" multiple />
            <button onClick={handleFileUpload}>Upload file to {currentFolderId}</button>
        </div>
    );
}
