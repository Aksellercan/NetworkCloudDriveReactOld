import { useEffect, useState } from "react";
import "../Styles/content.css"

export function DarkModeHandler() {
    const [darkMode, setDarkMode] = useState(true);

    const toggleDarkMode = () => {
        localStorage.setItem("theme", JSON.stringify({ "eye_ache": darkMode }));
        setDarkMode(!darkMode)
        window.location.reload();
    }
    let counter = 0;
    useEffect(() => {
        if (counter >= 1) return;
        const status = localStorage.getItem("theme");
        if (status === null) return;
        const parsed = JSON.parse(status);
        if (parsed.eye_ache === true) {
            setDarkMode(false);
        } else {
            setDarkMode(true);
        }
        counter++;
    }, [darkMode, counter])

    return <div className="App" data-theme={darkMode ? "light":"dark"}>
        <button onClick={toggleDarkMode}>Theme: {darkMode ? "Dark" : "Light"}</button>
    </div>
}