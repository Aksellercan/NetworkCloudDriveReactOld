import { useState, useEffect } from "react";
import { convertToNumber } from "../Functions/Numbers";
import { downloadFile } from "../Functions/DownloadFile";
import no_thumbnail_file from "../Media/no_thumbnail_file.jpg"
import folderIcon from "../Media/folder.jpg"
import { UploadButton } from "./UploadButton";
import "../Styles/filelist.css"

export function FileList() {
    const [getfolderId, setFolderId] = useState(0);
    const navigationHistory: number[] = [0]

    function appendToHistory(folderid: number) {
        if (folderid === 0) {
            navigationHistory.length = 0;
            navigationHistory.push(0);
            return;
        }
        navigationHistory.push(folderid);
        console.log(`pushed ${folderid} size ${navigationHistory.length}`)
        for (let i = 0; i < navigationHistory.length; i++) {
            console.log(`i ${i} at ${navigationHistory[i]}`);
        }
    }

    async function goBack(current_folderid: number) {
        resetList(navigationHistory[navigationHistory.length - 2]);
        navigationHistory.splice(navigationHistory.indexOf(current_folderid), 1);
    }

    async function resetList(folderid: number) {
        setFolderId(folderid);
        const outer_div = document.getElementById("list-outer")!;
        outer_div.removeChild(outer_div.firstChild!);
        const fileList = document.createElement("div");
        fileList.id = "fileList";
        fileList.className = "fileDiv";
        const folderList = document.createElement("div");
        folderList.id = "folderList";
        folderList.className = "folderDiv";
        outer_div.append(fileList);
        getFileList(folderid);
        const navigationDiv = document.getElementById("navigationDiv")!;
        if (folderid !== 0) {
            if (navigationDiv.childElementCount > 0) {
                navigationDiv.removeChild(navigationDiv.firstChild!);
            }
        } else {
            if (navigationDiv.childElementCount > 0) {
                navigationDiv.removeChild(navigationDiv.firstChild!);
            }
        }
    }

    const fetchFileList = async (current_folderid: number) => {
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/filesystem/list?folderid=${current_folderid}`, {
            method: "GET",
            credentials: "include"
        }).then((r) => { return r.json(); }).catch((e) => { console.error(e); });
        return response;
    }

    async function getFileList(current_folderid: number) {
        const response = await fetchFileList(current_folderid);
        const fileList = document.getElementById("fileList")!;

        if (current_folderid !== 0) {
            const test = document.getElementById("navigationDiv")!;
            const goBackFunc = document.createElement("button");
            goBackFunc.onclick = () => { goBack(current_folderid) }
            goBackFunc.textContent = "Back"
            test.append(goBackFunc);
        }

        for (let i = 0; i < response.files.length; i++) {
            const fileDiv = document.createElement("div");
            fileDiv.className = "file";
            const fileLink = document.createElement("button");
            fileLink.onclick = () => { downloadFile(response.files[i].id) }
            const thumbnailTest = document.createElement("img");
            if (response.files[i].hasThumbnail === true) {
                thumbnailTest.src = `${process.env.REACT_APP_API_URL}/api/thumbnails/getbyfileid?fileId=${response.files[i].id}`
            } else {
                thumbnailTest.src = no_thumbnail_file;
            }
            thumbnailTest.onclick = () => {
                downloadFile(response.files[i].id)
            }
            fileDiv.append(thumbnailTest);
            fileLink.textContent = `${response.files[i].name}`
            fileDiv.append(fileLink);
            fileList.append(fileDiv);
        }

        for (let i = 0; i < response.folders.length; i++) {
            const folderDiv = document.createElement("div");
            folderDiv.className = "folder";
            const folderLink = document.createElement("button");
            folderLink.onclick = () => {
                let value = response.folders[i].id;
                appendToHistory(value);
                resetList(value)
            }
            const thumbnailTest = document.createElement("img");
            thumbnailTest.onclick = () => {
                let value = response.folders[i].id;
                appendToHistory(value);
                resetList(value)
            }
            thumbnailTest.src = folderIcon;
            folderDiv.append(thumbnailTest);
            folderLink.textContent = `${response.folders[i].name}`
            folderDiv.append(folderLink);
            fileList.append(folderDiv);
        }
    }
    let useEffectRunCount = 0;
    useEffect(() => {
        if (useEffectRunCount >= 1) {
            return;
        }
        resetList(getfolderId)
        useEffectRunCount++;
    }, []);

    return (<div style={{ display: "flex", flexDirection: "column" }}>
        <UploadButton currentFolderId={getfolderId} />
        <div id="navigationDiv"></div>
        <div id="list-outer" className="fileListDiv">
            <div id="fileList" className="fileDiv"></div>
        </div>
    </div>);
}
