import { Link } from "react-router-dom";

export function Navbar() {
    return (
        // <>
        //     <Link to="/">
        //         <button>Upload</button>
        //     </Link>
        //     <Link to="/download">
        //         <button>Download</button>
        //     </Link>
        //     <Link to="/create/folder">
        //         <button>Create Folder</button>
        //     </Link>
        //     <Link to="/login">
        //         <button>login</button>
        //     </Link>
        // </>
        <nav className="z-50 bg-white">
            <div className="h-10vh flex items-center px-20 py-20 border-b">
                <div className="flex items-center flex-1">
                    <h2 className="text-3xl font-bold text-pink-500 ">
                        NetworkCloudDrive
                    </h2>
                </div>
                <div>
                    <ul className="flex items-center justify-between space-x-6 text-[18px]">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/download">Download</Link>
                        </li>

                        <li>
                            <Link to="/create/folder">Create</Link>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/list">File List</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
