function UserInfo({ user }) {
    return (
        <div className="user-info">
            <div className="avatar">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className="details">
                <div className="username">
                    {user.firstName} {user.lastName}
                </div>
                <div className="user-id">
                    @{user.username} • ID: {user.userId}
                </div>
            </div>
        </div>
    )
}

export default UserInfo
