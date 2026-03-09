import { NavLink } from "react-router-dom";
import "../Styles/navbar.css"
import { useState } from "react";
import { DarkModeHandler } from "../Functions/DarkModeHandler";
import { ReturnUsername } from "../Functions/ReturnUsername";

export function Navbar() {
    const [showNav, setShowNav] = useState(false)

    const toggleNavItems = () => {
        setShowNav(!showNav)
    }

    const logout = async () => {
        await fetch(
            `${process.env.REACT_APP_API_URL}/logout`, {
            method: "GET",
            credentials: "include"
        }).then((r) => {
            console.log("Status code", r.status);
            return r.json();
        }).catch((e) => { console.error(e); });
        localStorage.removeItem("user"); 
        sessionStorage.removeItem("file_list");
        window.location.reload();
    }

    return (
        <nav className="navbar">
            <div className="container">
                <div className="brand">
                    <p>NetworkCloudDrive</p>
                </div>
                <div className="menu-icon" onClick={toggleNavItems}>
                    <p>Menu</p>
                </div>
                <div className={`nav-elements  ${showNav && 'active'}`}>
                    <ul>
                        <li>
                            <NavLink to="/">File List</NavLink>
                        </li>
                        <li>
                            <NavLink to="/login">Login</NavLink>
                        </li>
                        <li>
                            <NavLink to="/register">Register</NavLink>
                        </li>
                        <li>
                            <NavLink to="/logout" onClick={logout}>Logout</NavLink>
                        </li>
                        <li>
                            <DarkModeHandler />
                        </li>
                        <li>
                            <ReturnUsername />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
