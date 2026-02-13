import React, {
    EventHandler,
    ReactEventHandler,
    SetStateAction,
    useState,
} from "react";

export function Login() {
    const [mail, setMail] = useState("");
    const [remember_me, setRemember_me] = useState("");
    const [password, setPassword] = useState("");
    const [userState, setUserState] = useState("not logged in");

    function handleMailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setMail(e.currentTarget.value);
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.currentTarget.value);
    }

    function handleRememberMe(e: React.ChangeEvent<HTMLInputElement>) {
        setRemember_me(e.currentTarget.value);
    }

    async function checkConnection() {
        const results = await fetch(
            `${process.env.REACT_APP_API_URL}/api/user/info`,
            {
                method: "GET",
                credentials: "include",
            }
        )
            .then((r) => r.json())
            .catch((err) => console.log(err));
        console.log("results", results);
        setUserState(
            `user name: ${results.object.name} mail: ${results.object.mail}`
        );
    }

    async function loginForm() {
        console.log(`username ${mail} password ${password} remember me ${remember_me}`);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: "POST",
            body: new URLSearchParams({
                username: mail,
                password: password,
                remember_me: remember_me
            }),
            credentials: "include",
        })
            .then((res) => {
                if (res.ok) {
                    console.log("logged in");
                } else {
                    console.log("failed to login");
                    return;
                }
            })
            .catch((e) => console.error(e));
        checkConnection();
    }

    return (
        <div>
            <h1>Login</h1>
            <form>
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
                <label>
                    Remember me on this computer.
                    <input type="checkbox" name="remember-me" onChange={handleRememberMe}/> 
                </label>
            </form>
            <button onClick={loginForm}>submit</button>
            <p>{userState}</p>
        </div>
    );
}
