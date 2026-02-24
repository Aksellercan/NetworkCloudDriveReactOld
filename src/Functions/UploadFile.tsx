export async function UploadFile(files: FileList, folderID_upload: number): Promise<any> {
    if (typeof files === "undefined") {
        console.error("No file uploaded");
        return [] as string[];
    }
    console.log("FORM DATA");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }
    formData.append("folderid", folderID_upload.toString());
    console.log("SEND");
    return await fetch(
        `${process.env.REACT_APP_API_URL}/api/file/upload`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        }
    )
        .then((r) => {
            console.log("status", r.status);
            return r.json();
        })
        .catch((err) => {
            console.log(err);
            return [] as string[];
        });
}