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
        const results = await UploadFile(files!, currentFolderId);
        if (results.length === 0) {
            setState("Failed to upload files");
            return;
        }
        let uploadedFilesId = "";
        for (let i = 0; i < results.files.length; i++) {
            if (i == results.files.length - 1) {
                uploadedFilesId += `${results.files[i].id}`
                break;
            }
            uploadedFilesId += `${results.files[i].id}, `
        }
        setState(`Uploaded: ${uploadedFilesId}`);
    }

    return (
        <div>
            <p>Upload state: {state}</p>
            <input onChange={handleOnChange} type="file" multiple />
            <button onClick={handleFileUpload}>Upload file to {currentFolderId}</button>
        </div>
    );
}
