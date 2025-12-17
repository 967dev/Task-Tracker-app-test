function TaskCard({ task, onClick }) {
    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Не выполнено'
            case 'review':
                return 'На проверке'
            case 'completed':
                return 'Выполнено'
            default:
                return 'Не выполнено'
        }
    }

    return (
        <div className="task-card" onClick={onClick}>
            <div className="task-card-header">
                <div className="task-emoji">{task.emoji}</div>
                <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className={`task-status ${task.status}`}>
                        <span className="status-dot"></span>
                        {getStatusText(task.status)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskCard
