import { useEffect, useRef } from 'react'
import bgImage from '../assets/bg-main.png'

const Background = () => {
    const canvasRef = useRef(null)
    const bgRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationFrameId

        // Настройки снега
        const particleCount = 100
        const particles = []

        // Состояние параллакса
        let mouseX = 0
        let mouseY = 0
        let targetX = 0
        let targetY = 0

        // Инициализация размеров
        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        // Создание снежинок
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 3 + 1, // Радиус
                d: Math.random() * particleCount, // Плотность/скорость
                a: Math.random() * 0.5 + 0.1 // Альфа (прозрачность)
            })
        }

        // Обработчики движения
        const handleMouseMove = (e) => {
            // Нормализуем координаты от -1 до 1
            mouseX = (e.clientX / window.innerWidth) * 2 - 1
            mouseY = (e.clientY / window.innerHeight) * 2 - 1
        }

        const handleOrientation = (e) => {
            // Для мобильных: beta (-180, 180), gamma (-90, 90)
            if (e.beta !== null && e.gamma !== null) {
                // Ограничиваем наклон для эстетики
                const x = Math.min(Math.max(e.gamma, -45), 45) / 45
                const y = Math.min(Math.max(e.beta, -45), 45) / 45

                mouseX = x
                mouseY = y
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('deviceorientation', handleOrientation)

        // Анимация
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Плавное движение к целевой точке (easing)
            targetX += (mouseX - targetX) * 0.05
            targetY += (mouseY - targetY) * 0.05

            // Двигаем фон (медленно)
            if (bgRef.current) {
                const bgX = targetX * -10 // Сдвиг поменьше (10px)
                const bgY = targetY * -10
                bgRef.current.style.transform = `scale(1.05) translate(${bgX}px, ${bgY}px)`
            }

            ctx.fillStyle = '#FFF'
            ctx.beginPath()

            for (let i = 0; i < particleCount; i++) {
                const p = particles[i]

                // Движение снега
                p.y += Math.cos(p.d) + 1 + p.r / 2
                p.x += Math.sin(0) * 2

                // Параллакс для снега (быстрее фона для глубины)
                // Чем больше снежинка (p.r), тем сильнее эффект (ближе к камере)
                const parallaxX = targetX * (p.r * -15)
                const parallaxY = targetY * (p.r * -15)

                // Рисуем с учетом параллакса
                ctx.moveTo(p.x + parallaxX, p.y + parallaxY)
                ctx.arc(p.x + parallaxX, p.y + parallaxY, p.r, 0, Math.PI * 2, true)

                // Возврат снежинки наверх, если улетела
                if (p.y + parallaxY > canvas.height + 20) {
                    particles[i] = {
                        x: Math.random() * canvas.width,
                        y: -10,
                        r: p.r,
                        d: p.d,
                        a: p.a
                    }
                }

                // "Бесконечная" прокрутка по X
                if (p.x + parallaxX > canvas.width + 20) {
                    particles[i].x = -20
                } else if (p.x + parallaxX < -20) {
                    particles[i].x = canvas.width + 20
                }
            }

            ctx.fill()
            animationFrameId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('deviceorientation', handleOrientation)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div className="background-container">
            {/* Фоновая картинка */}
            <img
                ref={bgRef}
                src={bgImage}
                className="background-image"
                alt="Background"
            />
            {/* Снег */}
            <canvas ref={canvasRef} className="snow-canvas" />
        </div>
    )
}

export default Background
