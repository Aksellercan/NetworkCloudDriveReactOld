export async function FetchUserDetails() {
    const results = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/info`,
        {
            method: "GET",
            credentials: "include",
        }
    )
        .then((r) => r.json())
        .catch((err) => console.log(err));
    if (results === undefined) {
        localStorage.removeItem("user");
        return;
    }
    localStorage.setItem("user", results.object.name);
}