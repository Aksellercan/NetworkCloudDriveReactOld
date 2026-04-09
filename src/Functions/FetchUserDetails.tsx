export const FetchUserDetails = async () => {
    await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/info`,
        {
            method: "GET",
            credentials: "include",
        }
    )
        .then(async (r) => {
            
            let object = await r.json()
            localStorage.setItem("user", object.name);
            })
        .catch((err) => {
            localStorage.removeItem("user");
            console.log(err)
    });
}