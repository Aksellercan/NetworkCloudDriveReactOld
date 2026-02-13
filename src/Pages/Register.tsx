import { useState } from "react";
import React from "react";

export function Register() {
    const [username, setUsername] = useState("");
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [userState, setUserState] = useState("not registered");

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.currentTarget.value);
    }

    function handleMailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setMail(e.currentTarget.value);
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.currentTarget.value);
    }

    async function registerForm() {
        console.log(`username ${mail} password ${password}`);

        const bodyJson = {name: username, mail: mail, password: password}
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyJson)
        })
            .then((res) => {
                if (res.ok) {
                    setUserState("Registered");
                    console.log("registerd");
                } else {
                    console.log("failed to register");
                    return;
                }
            })
            .catch((e) => console.error(e));
    }

    return (
        <div>
            <h1>Register</h1>
            <form>
                <label>
                    Username
                    <input
                        type="name"
                        id="username_input"
                        name="username"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                    />
                </label>
                <label>
                    User Mail
                    <input
                        type="email"
                        id="username_input"
                        name="username"
                        value={mail}
                        onChange={handleMailChange}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        id="password_input"
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </label>
            </form>
            <button onClick={registerForm}>submit</button>
            <p>{userState}</p>
        </div>
    );
}
