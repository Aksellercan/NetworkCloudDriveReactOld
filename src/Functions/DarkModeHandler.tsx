import { useEffect, useState } from "react";
import "../Styles/content.css"

export function DarkModeHandler() {
    const [darkMode, setDarkMode] = useState(true);

    const toggleDarkMode = () => {
        localStorage.setItem("theme", JSON.stringify({ "eye_ache": darkMode }));
        setDarkMode(!darkMode)
    }

    useEffect(() => {
        const status = localStorage.getItem("theme");
        if (status === null) return;
    }, [darkMode])

    return <div className="App" data-theme={darkMode ? "light":"dark"}>
        <button onClick={toggleDarkMode}>Theme: {darkMode ? "Dark" : "Light"}</button>
    </div>
}