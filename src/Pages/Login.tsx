export function Login() {
    async function loginForm() {
        let username_input = (
            document.getElementById("username_input") as HTMLInputElement
        ).value;

        let password_input = (
            document.getElementById("password_input") as HTMLInputElement
        ).value;

        if (username_input === null || password_input === null) {
            return;
        }

        console.log(`username ${username_input} password ${password_input}`);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: "POST",
            body: new URLSearchParams({
                username: username_input,
                password: password_input,
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
                return res.redirected;
            })
            .catch((e) => console.error(e));

        console.log("login response", response);
    }

    return (
        <>
            <h1>Login</h1>
            <div>
                <input
                    type="email"
                    id="username_input"
                    name="username"
                    required
                />
                <label>email</label>
                <input
                    type="password"
                    id="password_input"
                    name="password"
                    required
                />
                <label>password</label>
                <button onClick={loginForm}>submit</button>
            </div>
        </>
    );
}
