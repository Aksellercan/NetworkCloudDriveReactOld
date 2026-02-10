import { useState } from "react";
import { convertToNumber } from "../Functions/Numbers";
import { downloadFile } from "../Functions/DownloadFile";
import no_thumbnail_file from "../Media/no_thumbnail_file.jpg"
import { useEffect } from "react";

export function FileList() {
    const [getfolderId, setFolderId] = useState(0);

    function handleFolderIdChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFolderId(convertToNumber(e.currentTarget.value, 0));
    }

    async function resetList(folderid: number) {
        setFolderId(folderid);
        const outer_div = document.getElementById("list-outer")!;
        outer_div.removeChild(outer_div.firstChild!);
        outer_div.removeChild(outer_div.firstChild!);
        const fileList = document.createElement("div");
        fileList.id = "fileList";
        const folderList = document.createElement("div");
        folderList.id = "folderList";
        outer_div.append(fileList);
        outer_div.append(folderList);
        console.log(`update folderid = ${getfolderId}`)
        getFileList(folderid);
    }

    async function getFileList(current_folderid: number) {
        console.log(`folder id = ${getfolderId}`)
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/filesystem/list?folderid=${current_folderid}`, {
            method: "GET",
            credentials: "include"
        }).then((r) => { return r.json(); }).catch((e) => { console.error(e); });

        const fileList = document.getElementById("fileList")!;
        const folderList = document.getElementById("folderList")!;

        if (current_folderid !== 0) {
            const goBack = document.createElement("button");
            goBack.onclick = () => { resetList(0) }
            goBack.textContent = "go back to root"
            const breakLine = document.createElement("br");
            fileList.append(goBack);
            fileList.append(breakLine);
        }

        if (response.files.length !== 0) {
            const title = document.createElement("p");
            title.textContent = "Files:"
            fileList.append(title);
        }
        for (let i = 0; i < response.files.length; i++) {
            const fileLink = document.createElement("button");
            fileLink.onclick = () => { downloadFile(response.files[i].id) }
            const breakLine = document.createElement("br");
            const thumbnailTest = document.createElement("img");
            if (response.files[i].hasThumbnail === true) {
                thumbnailTest.src = `${process.env.REACT_APP_API_URL}/api/thumbnails/getbyfileid?fileId=${response.files[i].id}`
            } else {
                thumbnailTest.src = no_thumbnail_file;
            }
            fileList.append(thumbnailTest);
            fileLink.textContent = `File name: ${response.files[i].name} id: ${response.files[i].id}`
            fileList.append(fileLink);
            fileList.append(breakLine);
        }

        if (response.folders.length !== 0) {
            const title = document.createElement("p");
            title.textContent = "Folders:"
            fileList.append(title);
        }
        for (let i = 0; i < response.folders.length; i++) {
            const folderLink = document.createElement("button");
            console.log(`onclick id set = ${response.folders[i].id}`)
            folderLink.onclick = () => {
                let value = response.folders[i].id;
                console.log(`value is ${value}`);
                resetList(value)
            }
            const breakLine = document.createElement("br");
            folderLink.textContent = `Folder name: ${response.folders[i].name} id: ${response.folders[i].id}`
            folderList.append(folderLink);
            folderList.append(breakLine);
        }
    }
    useEffect(() => {
        resetList(getfolderId)
        console.log('i fire once');
    }, []);

    return (<div>
        <input
            type="number"
            min={0}
            onChange={handleFolderIdChange}
            value={getfolderId}
        />
        <button onClick={() => { resetList(getfolderId) }}>get list {getfolderId}</button>
        <div id="list-outer">
            <div id="fileList"></div>
            <div id="folderList"></div>
        </div>
    </div>);
}
