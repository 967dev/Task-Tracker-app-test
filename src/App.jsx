import { useState, useEffect } from 'react'
import TaskCard from './components/TaskCard'
import TaskModal from './components/TaskModal'
import UserInfo from './components/UserInfo'
import Background from './components/Background'

// Тестовое задание из ТЗ
const TASKS = [
    {
        id: 1,
        title: 'Новогодний Репост',
        emoji: '📢',
        description: 'Сделать репост поста-анонса этого розыгрыша в сторис и отметить наш канал.',
        taskLink: 'https://t.me/bidask',
        instructions: [
            'Перейдите по ссылке на канал',
            'Найдите пост-анонс розыгрыша',
            'Сделайте репост в сторис',
            'Отметьте наш канал',
            'Отправьте ссылку на вашу сторис (из архива или актуального)'
        ]
    },
    {
        id: 2,
        title: 'Снеговик-Комьюнити',
        emoji: '⛄',
        description: 'Собери снеговика из эмодзи в одном сообщении!',
        taskLink: 'https://t.me/bidask',
        instructions: [
            'Найдите соответствующий пост',
            'Отправьте комментарий, собрав снеговика из эмодзи',
            'Скопируйте ссылку на ваш комментарий'
        ]
    },
    {
        id: 3,
        title: 'Креативный Гений',
        emoji: '🎨',
        description: 'Создать лучший мем или арт на новогоднюю тему, связанную с Bidask и TON.',
        taskLink: 'https://t.me/bidask',
        instructions: [
            'Создайте мем или арт',
            'Опубликуйте его в нашем чате или своих соцсетях',
            'Пришлите ссылку на публикацию'
        ]
    },
    {
        id: 4,
        title: 'Виртуальная Елка',
        emoji: '🎄',
        description: 'Собери ёлку из эмодзи в одном сообщении!',
        taskLink: 'https://t.me/bidask',
        instructions: [
            'Найдите пост с заданием',
            'Соберите ёлку из эмодзи в одном комментарии',
            'Пришлите ссылку на ваш комментарий'
        ]
    },
    {
        id: 6,
        title: 'Главный Тост',
        emoji: '🥂',
        description: 'Написать самый смешной или вдохновляющий новогодний тост для комьюнити Bidask в комментариях под сегодняшним постом.',
        taskLink: 'https://t.me/bidask',
        instructions: [
            'Напишите тост в комментариях',
            'Скопируйте ссылку на сообщение'
        ]
    },
    {
        id: 7,
        title: 'Рекрутер Санты',
        emoji: '🎅',
        description: 'Пригласить 1 друга в наш Telegram-чат и прислать ссылку на его первое сообщение.',
        taskLink: 'https://t.me/bidask_gm',
        instructions: [
            'Пригласите друга в чат',
            'Попросите друга написать любое сообщение',
            'Скопируйте ссылку на сообщение друга'
        ]
    },
    {
        id: 8,
        title: 'Лучшее Предсказание',
        emoji: '🔮',
        description: 'Опубликовать в X/Twitter свое самое смелое (и позитивное) предсказание для Bidask на 2026 год (отметить @BidaskProtocol).',
        taskLink: 'https://twitter.com/',
        instructions: [
            'Напишите твит с предсказанием',
            'Отметьте @BidaskProtocol',
            'Пришлите ссылку на твит'
        ]
    },
    {
        id: 9,
        title: 'Новогодние чаты',
        emoji: '🗣️',
        description: 'Написать в чаты из списка любую пасту на выбор или предложить свою. Выберите один или несколько чатов из списка ниже.',
        taskLink: '',
        subTasks: [
            { title: 'This one is the GOAT', desc: 'Спам фразы в чате Tonskigoat', link: 'https://t.me/tonskigoatctoportal' },
            { title: 'Пу-пу-пу...', desc: 'Поспрашивать в чате, стоит ли купить арбуз?', link: 'https://t.me/+QzoGJS7ktps1NOzh' },
            { title: 'Новогодний памп (мышц)', desc: 'Попроси у ARNI программу тренировок', link: 'https://t.me/arnoldton' },
            { title: 'Голубцы с AMORE', desc: 'Напиши рецепт голубцов', link: 'https://t.me/amorechatcis' },
            { title: 'Worldwide', desc: 'Написать "Happy new year from Bidask"', links: ['https://t.me/toncischat', 'https://t.me/tonsseachat', 'https://t.me/toneuropechat', 'https://t.me/tonchathq', 'https://t.me/toneachat', 'https://t.me/tonushubchat'] },
            { title: 'Tвиттерский', desc: 'Поздравить Виктора и Гио с хештегом #BidaskWishes', links: ['https://x.com/Giooton', 'https://x.com/s0meone_u_know'] },
            { title: 'Клуб 100 пожеланий', desc: 'Пожелать добра под последним постом', link: 'https://t.me/crypto_okop' },
            { title: 'Meta silence', desc: 'Отправить пасту', link: 'https://t.me/metavloge' },
            { title: 'Sub0', desc: 'Отправить пасту', link: 'https://t.me/chat_no_ne_gpt' },
            { title: 'TONdev', desc: 'Отправить пасту', link: 'https://t.me/tondevchatik' }
        ],
        copyableTexts: [
            "This one is the goat listed on Bidask",
            "🎄 ЭТО ПОЗДРАВЛЕНИЕ ВИДЯТ ТОЛЬКО НАСТОЯЩИЕ TON БЕЛИВЕРЫ И ПОЛЬЗОВАТЕЛИ BIDASK 💎\nЕсли ты читаешь этот текст, значит, ты крепче, чем стенки в стакане, а рука не дрогнула зафиксироваться на лоях.\n\nПусть твои ордера всегда исполняются по лучшим ценам, а ликвидность течёт рекой прямо в твой кошелек.\n\nС наступающим, легенда! 🚀",
            "Желаю в новом году, чтобы твой профит рос быстрее, чем TVL в экосистеме TON, а Bidask всегда радовал лучшим исполнением.\nВстретимся на иксах в 2025-м! 🚀💎",
            "May your 2025 be filled with low slippage and high returns. Stop chasing green candles and start making smart moves with Bidask.🚀💎",
            "🔒 This message is encrypted. Only Bidask power users and TON whales can decrypt it with their diamond hands.\n\nIf you can read this: I wish yoou Happy New Year, you absolute legend! May your bags be heavy and your transaction fees be non-existent. LFG! 🚀🔥",
            "[ДАННОЕ СООБЩЕНИЕ ДОСТУПНО ТОЛЬКО ПОЛЬЗОВАТЕЛЯМ BIDASK]\n\nЕсли ты это читаешь, значит, твои ордера всегда в профите, а палец не дрожит при виде красных свечей. С наступающим! Желаю, чтобы твоя жизнь была как TON (в хорошем смысле) 💎🎅"
        ],
        instructions: [
            'Выберите чат из списка',
            'Скопируйте любой текст (пасту) или придумайте свой',
            'Напишите сообщение в чат',
            'Пришлите ссылку на ваше сообщение'
        ]
    },
    {
        id: 10,
        title: 'Благодарность Билдерам',
        emoji: '🙏',
        description: 'Написать пост в X/Twitter/ТГ, поблагодарив одного крупного TON-билдера или проект за их работу в 2025 году, и упомянуть @BidaskProtocol.',
        taskLink: 'https://twitter.com/',
        instructions: [
            'Напишите пост благодарности',
            'Упомяните @BidaskProtocol',
            'Пришлите ссылку на пост'
        ]
    },
    {
        id: 11,
        title: 'Снежный Взнос',
        emoji: '💎',
        description: 'Символическая "снежинка": Внести ликвидность от 1 TON в любой пул Bidask (можно вывести после подтверждения).',
        taskLink: 'https://bidask.app',
        skipTelegramValidation: true,
        instructions: [
            'Внесите ликвидность (>1 TON)',
            'Пришлите ссылку на транзакцию (explorer)'
        ]
    },
    {
        id: 16,
        title: 'ТОН Ёлка',
        emoji: '🎄',
        description: 'Отправьте в чат фото вашей ёлки.',
        taskLink: 'https://t.me/bidask_chat',
        instructions: [
            'Сфотографируйте вашу елку',
            'Отправьте фото в наш чат',
            'Пришлите ссылку на сообщение с фото'
        ]
    }
]

function App() {
    const [user, setUser] = useState(null)
    const [tasks, setTasks] = useState([])
    const [selectedTask, setSelectedTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        initTelegramApp()
    }, [])

    const initTelegramApp = async () => {
        try {
            // Инициализация Telegram WebApp
            const tg = window.Telegram.WebApp
            tg.ready()
            tg.expand()

            // Получение данных пользователя
            const initData = tg.initDataUnsafe

            if (!initData.user) {
                // Если мы в браузере (не в TG), используем тестового пользователя
                console.warn('⚠️ No Telegram user data found. Using mock user for development.');
                const mockUser = {
                    id: 123456789,
                    username: 'dev_user',
                    first_name: 'Dev',
                    last_name: 'User'
                };
                initData.user = mockUser;
            }

            const userData = {
                userId: initData.user.id,
                username: initData.user.username,
                firstName: initData.user.first_name,
                lastName: initData.user.last_name
            }

            // Проверка наличия username
            if (!userData.username) {
                setError('У вас нет username в Telegram. Пожалуйста, создайте его в настройках Telegram для использования приложения.')
                setLoading(false)
                return
            }

            setUser(userData)

            // Регистрация/авторизация пользователя
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })

            if (!response.ok) {
                throw new Error('Ошибка при регистрации пользователя')
            }

            // Получение статусов заданий
            await loadTaskStatuses(userData.userId)

            setLoading(false)
        } catch (err) {
            console.error('Error initializing app:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    const loadTaskStatuses = async (userId) => {
        try {
            const response = await fetch(`/api/tasks/${userId}`)

            if (!response.ok) {
                throw new Error('Ошибка при загрузке заданий')
            }

            const data = await response.json()

            // Объединяем статические задания со статусами из базы
            const tasksWithStatus = TASKS.map(task => ({
                ...task,
                status: data.tasks[task.id] || 'pending',
                proofLink: data.proofLinks[task.id] || ''
            }))

            setTasks(tasksWithStatus)
        } catch (err) {
            console.error('Error loading tasks:', err)
            // Если не удалось загрузить статусы, показываем задания со статусом "pending"
            setTasks(TASKS.map(task => ({ ...task, status: 'pending', proofLink: '' })))
        }
    }

    const handleTaskClick = (task) => {
        setSelectedTask(task)
    }

    const handleCloseModal = () => {
        setSelectedTask(null)
    }

    const handleSubmitProof = async (taskId, proofLink) => {
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.userId,
                    taskNum: taskId,
                    proofLink: proofLink
                })
            })

            if (!response.ok) {
                throw new Error('Ошибка при отправке отчета')
            }

            // Обновляем статус задания
            await loadTaskStatuses(user.userId)

            return { success: true }
        } catch (err) {
            console.error('Error submitting proof:', err)
            return { success: false, error: err.message }
        }
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

    if (error) {
        return (
            <div className="app">
                <div className="warning">
                    <strong>⚠️ Внимание!</strong>
                    <p style={{ marginTop: '0.5rem' }}>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Background />
            <div className="app">
                <div className="header">
                    <div className="header-content">
                        <h1>Bidask Advent calendar</h1>
                        <p className="subtitle">Выполняйте задания и получайте награды</p>
                    </div>
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
        </>
    )
}

export default App
