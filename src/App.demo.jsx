import { useState, useEffect } from 'react'
import TaskCard from './components/TaskCard'
import TaskModal from './components/TaskModal'
import UserInfo from './components/UserInfo'

// Тестовое задание из ТЗ
const TASKS = [
    {
        id: 1,
        title: 'Первый отклик',
        emoji: '💬',
        description: 'Проверьте работу системы. Перейдите в наш тестовый чат по ссылке ниже, напишите любое приветственное сообщение. После этого скопируйте ссылку на свое сообщение и вставьте в поле ниже.',
        taskLink: 'https://t.me/+9DFnKmmVuDs3MzJi',
        instructions: [
            'Напишите текст в чате',
            'Нажмите на свое сообщение (или правой кнопкой мыши)',
            'Выберите "Копировать ссылку" (Copy Link)'
        ],
        status: 'pending',
        proofLink: ''
    },
    {
        id: 2,
        title: 'Подписка на канал',
        emoji: '📢',
        description: 'Подпишитесь на наш официальный Telegram канал и станьте частью сообщества.',
        taskLink: 'https://t.me/your_channel',
        instructions: [
            'Перейдите по ссылке на канал',
            'Нажмите кнопку "Подписаться"',
            'Сделайте скриншот подписки',
            'Отправьте скриншот в поддержку'
        ],
        status: 'review',
        proofLink: 'https://t.me/test/123'
    },
    {
        id: 3,
        title: 'Пригласи друга',
        emoji: '👥',
        description: 'Пригласите друга в приложение и получите бонусные баллы.',
        taskLink: 'https://t.me/share',
        instructions: [
            'Нажмите кнопку "Поделиться"',
            'Выберите друга из списка',
            'Отправьте приглашение',
            'Дождитесь регистрации друга'
        ],
        status: 'completed',
        proofLink: 'https://t.me/test/456'
    }
]

// Mock данные пользователя
const MOCK_USER = {
    userId: 123456789,
    username: 'demo_user',
    firstName: 'Демо',
    lastName: 'Пользователь'
}

function App() {
    const [user, setUser] = useState(null)
    const [tasks, setTasks] = useState([])
    const [selectedTask, setSelectedTask] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Симуляция загрузки
        setTimeout(() => {
            setUser(MOCK_USER)
            setTasks(TASKS)
            setLoading(false)
        }, 1000)
    }, [])

    const handleTaskClick = (task) => {
        setSelectedTask(task)
    }

    const handleCloseModal = () => {
        setSelectedTask(null)
    }

    const handleSubmitProof = async (taskId, proofLink) => {
        // Симуляция отправки
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Обновляем статус задания локально
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? { ...task, status: 'review', proofLink }
                    : task
            )
        )

        // Обновляем выбранное задание
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(prev => ({ ...prev, status: 'review', proofLink }))
        }

        return { success: true }
    }

    if (loading) {
        return (
            <div className="app">
                <div className="header">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Загрузка...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <div className="header">
                <h1>🎯 Quest Tracker</h1>
                <p className="subtitle">Выполняйте задания и получайте награды</p>
            </div>

            <div className="warning" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <strong>🧪 DEMO режим</strong>
                <p style={{ marginTop: '0.5rem' }}>
                    Это демонстрационная версия. Данные не сохраняются на сервере.
                </p>
            </div>

            {user && <UserInfo user={user} />}

            <div className="tasks-grid">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                    />
                ))}
            </div>

            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitProof}
                />
            )}
        </div>
    )
}

export default App
