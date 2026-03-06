import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Register } from "./Pages/Register"
import { CreateFolderPage } from "./Pages/CreateFolderPage";
import { DownloadPage } from "./Pages/DownloadPage";
import { UploadPage } from "./Pages/UploadPage";
import { Layout } from "./Layout";
import { Login } from "./Pages/Login";
import { List } from "./Pages/List";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<List />} />
                    <Route path="/create/folder" element={<CreateFolderPage />} />
                    <Route path="/download" element={<DownloadPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/logout" element={<Login />} />
                    <Route path = "/register" element={<Register />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
