import { useState, useRef } from "react";

type CreateFolderCurrentFolderProps = {
    currentFolderId: number
}

export function CreateFolder({ currentFolderId }: CreateFolderCurrentFolderProps ) {
    const [folderName, setFolderName] = useState("");
    const [response, setResponse] = useState("not created yet");
    const folderInput = useRef(null);

    function handleFolderNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFolderName(e.currentTarget.value);
    }

    async function handleSubmition() {
        const bodyJson = { folder_id: currentFolderId, name: folderName };
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/file/create/folder`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyJson),
            }
        )
            .then((res) => res.json())
            .catch((e) => console.error(e));

        setResponse(`Created: ID ${response.id} Name ${response.name}`);
    }

    return (
        <div>
            <input
                type="text"
                onChange={handleFolderNameChange}
                value={folderName}
                ref={folderInput}
            />
            <button onClick={handleSubmition}>Submit</button>
            <p>Folder Name: {folderName}</p>
            <p>{response}</p>
        </div>
    );
}