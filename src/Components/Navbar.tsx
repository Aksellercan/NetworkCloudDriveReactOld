import { Link } from "react-router-dom";

export function Navbar() {

    const logout = async () => {
        await fetch(
            `${process.env.REACT_APP_API_URL}/logout`, {
            method: "GET",
            credentials: "include"
        }).then((r) => {
            console.log("Status code", r.status);
            return r.json(); }).catch((e) => { console.error(e); });
    }

    return (
        <nav className="z-50 bg-white">
            <div className="h-10vh flex items-center px-20 py-20 border-b">
                <div className="flex items-center justify-between space-x-6 text-[18px]">
                    <div className="flex items-center flex-1">
                        <h2 className="text-3xl font-bold text-pink-500 ">
                            NetworkCloudDrive
                        </h2>
                    </div>
                        <Link to="/upload">Upload</Link>
                        <Link to="/download">Download</Link>
                        <Link to="/create/folder">Create Folder</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                        <Link to="/">File List</Link>
                        <Link to="/logout" onClick={logout}>Logout</Link>
                </div>
            </div>
        </nav>
    );
}
