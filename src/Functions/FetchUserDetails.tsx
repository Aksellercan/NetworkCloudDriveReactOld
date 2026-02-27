export async function FetchUserDetails(): Promise<string> {
    const results = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/info`,
        {
            method: "GET",
            credentials: "include",
        }
    )
        .then((r) => r.json())
        .catch((err) => console.log(err));
    const user = localStorage.setItem("user", results.object.name)!;
    return user
}