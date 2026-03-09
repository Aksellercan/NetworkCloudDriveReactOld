import { useState, useEffect } from "react";
import { downloadFile } from "../Functions/DownloadFile";
import no_thumbnail_file from "../Media/file.png"
import folderIcon from "../Media/folder.png"
import { UploadButton } from "./UploadButton";
import "../Styles/filelist.css"
import { CreateFolder } from "../Functions/CreateFolder";

export function FileList() {
    const [getfolderId, setFolderId] = useState(0);
    const navigationHistory: number[] = checkSessionStorageNavigationHistory();
    const [currentFolderName, setCurrentFolderName] = useState("");
    const [getSortType, setSortType] = useState(checkSessionStorageSorting());

    async function onSortChange(chosenValue: string) {
        console.log(`chosen value ${chosenValue}`);
        setSortType(chosenValue);
    }

    function checkSessionStorageSorting(): string {
        if (sessionStorage.getItem("file_list") === null) {
            return "DEFAULT";
        }
        return JSON.parse(sessionStorage.getItem("file_list")!).sort_type;
    }

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

    function checkSessionStorageNavigationHistory(): number[] {
        if (sessionStorage.getItem("file_list") === null) {
            return [0];
        }
        return JSON.parse(sessionStorage.getItem("file_list")!).navigation_history;
    }

    function checkSessionStorage(): number {
        if (sessionStorage.getItem("file_list") === null) {
            return 0;
        }
        const jsonParse = JSON.parse(sessionStorage.getItem("file_list")!);
        return jsonParse.current_folder;
    }

    function updateSessionStorage(currentFolder: number, currentNavigationHistory: number[]) {
        sessionStorage.setItem(
            "file_list",
             JSON.stringify(
                {
                     "current_folder": currentFolder,
                      "navigation_history": currentNavigationHistory,
                      "sort_type": getSortType
                    }));
    }

    async function goBack(current_folderid: number) {
        navigationHistory.splice(navigationHistory.indexOf(current_folderid), 1);
        reloadList(navigationHistory[navigationHistory.length - 1]);
        updateSessionStorage(navigationHistory[navigationHistory.length - 1], navigationHistory);
    }

    async function reloadList(folderid: number) {
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
        getFileList(folderid, getSortType);
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

    const fetchFileInfo = async (current_folderid: number) => {
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/info/get/foldermetadata?folderid=${current_folderid}`, {
            method: "GET",
            credentials: "include"
        }).then((r) => { return r.json(); }).catch((e) => { console.error(e); });
        return response;
    }

    const fetchFileList = async (current_folderid: number, sortType: string) => {
        console.log(`fetch ${sortType}`);
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/filesystem/list?folderid=${current_folderid}&fileListFilter=${sortType}`, {
            method: "GET",
            credentials: "include"
        }).then((r) => { return r.json(); }).catch((e) => { console.error(e); });
        return response;
    }

    async function getFileList(current_folderid: number, sortType: string) {
        let response = await fetchFileList(current_folderid, sortType);
        const infoResponse = await fetchFileInfo(current_folderid);
        const fileList = document.getElementById("fileList")!;
        setCurrentFolderName(`${infoResponse.name} :ID ${infoResponse.id}`);

        if (current_folderid !== 0) {
            const test = document.getElementById("navigationDiv")!;
            const goBackFunc = document.createElement("button");
            goBackFunc.onclick = () => { goBack(current_folderid) }
            goBackFunc.textContent = "Back"
            test.append(goBackFunc);
        }

        for (let i: number = 0; i < response.folders.length; i++) {
            const folderDiv = document.createElement("div");
            folderDiv.className = "folder";
            const folderLink = document.createElement("p");
            const thumbnailTest = document.createElement("img");
            folderDiv.onclick = () => {
                let value = response.folders[i].id;
                appendToHistory(value);
                updateSessionStorage(value, navigationHistory);
                reloadList(value)
            }
            thumbnailTest.src = folderIcon;
            folderDiv.append(thumbnailTest);
            folderLink.textContent = `${response.folders[i].name}`
            folderDiv.append(folderLink);
            fileList.append(folderDiv);
        }

        for (let i: number = 0; i < response.files.length; i++) {
            const fileDiv = document.createElement("div");
            fileDiv.className = "file";
            const fileLink = document.createElement("p");
            const thumbnailTest = document.createElement("img");
            if (response.files[i].hasThumbnail === true) {
                thumbnailTest.src = `${process.env.REACT_APP_API_URL}/api/thumbnails/getbyfileid?fileId=${response.files[i].id}`
            } else {
                thumbnailTest.src = no_thumbnail_file;
            }
            fileDiv.onclick = () => {
                downloadFile(response.files[i].id)
            }
            fileDiv.append(thumbnailTest);
            fileLink.textContent = `${response.files[i].name}`
            fileDiv.append(fileLink);
            fileList.append(fileDiv);
        }
    }

    let useEffectRunCount = 0;
    useEffect(() => {
        if (useEffectRunCount >= 1) {
            return;
        }
        reloadList(checkSessionStorage())
        updateSessionStorage(getfolderId, navigationHistory);
        useEffectRunCount++;
    }, [getSortType]);

    return (<div style={{ display: "flex", flexDirection: "column" }}>
        <h1>{currentFolderName}</h1>
        <div>
            <CreateFolder currentFolderId={getfolderId} />
            <UploadButton currentFolderId={getfolderId} />
            <select value={getSortType} onChange={e => onSortChange(e.target.value)}>
                <option value="DEFAULT">Default</option>
                <option value="ALPHABETIC">A-Z</option>
                <option value="REVERSE_ALPHABETIC">Z-A</option>
                <option value="NEWEST">Newest first</option>
                <option value="OLDEST">Oldest first</option>
            </select>
        </div>
        <div id="navigationDiv"></div>
        <div id="list-outer" className="fileListDiv">
            <div id="fileList" className="fileDiv"></div>
        </div>
    </div>);
}
