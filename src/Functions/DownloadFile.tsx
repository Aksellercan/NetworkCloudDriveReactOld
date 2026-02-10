export function downloadFile(fileId: number) {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/file/download?fileid=${fileId}`;
}
