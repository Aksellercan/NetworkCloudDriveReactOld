import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <>
            <Link to="/">
                <button>Upload</button>
            </Link>
            <Link to="/download">
                <button>Download</button>
            </Link>
            <Link to="/create/folder">
                <button>Create Folder</button>
            </Link>
        </>
    );
}
