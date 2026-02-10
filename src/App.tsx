import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CreateFolder } from "./Pages/CreateFolder";
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
                    <Route path="/" element={<UploadPage />} />
                    <Route path="/create/folder" element={<CreateFolder />} />
                    <Route path="/download" element={<DownloadPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/list" element={<List />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
