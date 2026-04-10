export function ReturnUsername(): string {
    const user = localStorage.getItem("user");
    return (user === null ? "Logged out" : `User ${user}`);
}
