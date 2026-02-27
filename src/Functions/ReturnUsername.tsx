import "../Styles/navbar.css"

export function ReturnUsername() {
    const user = localStorage.getItem("user");
    return (<>{user === null ? "Logged out" : `User ${user}`}</>);
}