import React, { useState } from "react";
import "../App.css";
import logo from "../logo.svg";

export function UploadPage() {
    const [state, setState] = useState("ready to upload");
    const [files, setFile] = useState<FileList | undefined>();

    function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement & {
            files: FileList;
        };
        setFile(target.files);
        console.log("target", target.files);
    }

    async function handleSubmition(e: React.SyntheticEvent) {
        e.preventDefault();

        const folderID_upload = (
            document.getElementById("folderIDSelector") as HTMLInputElement
        ).value;

        console.log("folderid", folderID_upload);

        if (typeof files === "undefined") {
            console.error("No file uploaded");
            return;
        }
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        formData.append("folderid", folderID_upload);
        setState("started uploading files...");
        const results = await fetch(
            `${process.env.REACT_APP_API_URL}/api/file/upload`,
            {
                method: "POST",
                credentials: "include",
                body: formData,
            }
        )
            .then((r) => {
                console.log("status", r.status);
                return r.json();})
            .catch((err) => console.log(err));
        console.log("results", results);
        let uploadedFilesId = "";
        for (let i = 0; i < results.files.length; i++) {
            if (i == results.files.length-1) {
             uploadedFilesId += `${results.files[i].id}`
             break;
            }
            uploadedFilesId += `${results.files[i].id}, `
        }
        setState(`Uploaded file ID ${uploadedFilesId}`);
    }
    return (
        <>
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1>Upload Files</h1>
                <div>
                    <input onChange={handleOnChange} type="file" multiple />
                    <input type="number" id="folderIDSelector" min={0}></input>
                    <button onClick={handleSubmition}>Submit</button>
                </div>
                <p>{state}</p>
            </header>
        </>
    );
}
