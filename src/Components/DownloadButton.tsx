import { useState } from 'react';

export function DownloadButton() {
    const [folderId, setFolderId] = useState(0);



    async function downloadFile() {
       const result = await fetch(`${process.env.REACT_APP_API_URL}/api/filesystem/list?fileid=${folderId}`)
       .then((res) => res.json())
       .catch(e => console.error(e));

       console.log("list", result);
    }

    return (<></>);
}
