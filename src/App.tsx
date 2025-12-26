import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { CreateFolder } from "./Pages/CreateFolder";
import { DownloadPage } from "./Pages/DownloadPage";
import { UploadPage } from "./Pages/UploadPage";
import { Layout } from "./Layout";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<UploadPage />} />
                    <Route path="/create/folder" element={<CreateFolder />} />
                    <Route path="/download" element={<DownloadPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
