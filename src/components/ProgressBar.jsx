import './ProgressBar.css'

const ProgressBar = ({ tasks }) => {
    // Считаем только полностью выполненные задания
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'completed').length

    // Вычисляем процент (защита от деления на 0)
    const percentage = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0

    return (
        <div className="progress-container">
            <div className="progress-info">
                <span className="progress-label">Ваш прогресс</span>
                <span className="progress-stats">{completedTasks} / {totalTasks}</span>
            </div>

            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                >
                    {percentage > 5 && <span className="progress-glow"></span>}
                </div>
            </div>

            <div className="progress-text">
                {percentage === 100 ? '🎉 Все задания выполнены!' : `${percentage}% завершено`}
            </div>
        </div>
    )
}

export default ProgressBar
