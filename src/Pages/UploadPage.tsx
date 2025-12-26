import React, { useState } from "react";
import "../App.css";
import logo from "../logo.svg";

export function UploadPage() {
    const [state, setState] = useState("ready to upload");
    const [userState, setUserState] = useState("not logged in");
    const [files, setFile] = useState<FileList | undefined>();

    function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement & {
            files: FileList;
        };
        setFile(target.files);
        console.log("target", target.files);
    }

    function getAuthorizationHeader(): Headers | undefined {
        let username_input = (
            document.getElementById("username_input") as HTMLInputElement
        ).value;

        let password_input = (
            document.getElementById("password_input") as HTMLInputElement
        ).value;

        if (username_input === null || password_input === null) {
            setState("username or password is empty");
            return undefined;
        }

        console.log(`username ${username_input} password ${password_input}`);

        let headers = new Headers();

        headers.set(
            "Authorization",
            "Basic " + btoa(username_input + ":" + password_input)
        );
        return headers;
    }

    async function login(e: React.SyntheticEvent) {
        e.preventDefault();
        let headers = getAuthorizationHeader();
        if (headers === undefined) {
            return;
        }
        checkConnection(headers);
    }

    async function checkConnection(headers: Headers) {
        const results = await fetch(
            `${process.env.REACT_APP_API_URL}/api/user/info`,
            {
                method: "GET",
                headers: headers,
            }
        )
            .then((r) => r.json())
            .catch((err) => console.log(err));
        console.log("results", results);
        setUserState(
            `user name: ${results.object.name} mail: ${results.object.mail}`
        );
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
        // let headers = getAuthorizationHeader();
        // if (headers === undefined) {
        //     return;
        // }
        const results = await fetch(
            `${process.env.REACT_APP_API_URL}/api/file/upload`,
            {
                method: "POST",
                credentials: "include",
                // headers: headers,
                body: formData,
            }
        )
            .then((r) => {
                console.log("status", r.status);
                return r.json();})
            .catch((err) => console.log(err));
        console.log("results", results);
        setState(`Uploaded file ID ${results.files[0].id}`);
    }
    return (
        <>
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1>Upload Files</h1>
                <p>{userState}</p>
                <label>user mail</label>
                <input type="text" id="username_input" name="username" />
                <label>user password</label>
                <input type="password" id="password_input" name="password" />
                <button onClick={login}>login</button>
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
