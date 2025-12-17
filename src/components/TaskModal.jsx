import { useState } from 'react'

function TaskModal({ task, onClose, onSubmit }) {
  const [proofLink, setProofLink] = useState(task.proofLink || '')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [copyFeedback, setCopyFeedback] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Базовая валидация ссылки (если не отключена для задания)
    if (!task.skipTelegramValidation && !proofLink.startsWith('https://t.me/')) {
      setMessage({ type: 'error', text: 'Ссылка должна начинаться с https://t.me/' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    const result = await onSubmit(task.id, proofLink)

    if (result.success) {
      setMessage({ type: 'success', text: '✅ Отчет успешно отправлен!' })
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setMessage({ type: 'error', text: result.error || 'Ошибка при отправке отчета' })
    }

    setSubmitting(false)
  }

  const handleOpenLink = (link) => {
    // Проверяем доступность Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(link)
    } else {
      window.open(link, '_blank')
    }
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(index)
      setTimeout(() => setCopyFeedback(null), 2000)
    })
  }

  const isCompleted = task.status === 'completed'
  const isUnderReview = task.status === 'review'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>


        <div className="modal-content-scrollable">
          <div className="modal-header">
            <span className="task-emoji">{task.emoji}</span>
            <h2 className="modal-title">{task.title}</h2>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="modal-body">
            {/* Описание */}
            <div className="modal-section">
              <p>{task.description}</p>
            </div>

            {/* Специальный блок для подзаданий (как в задании 9) */}
            {task.subTasks && (
              <div className="modal-section">
                <h3>🎯 Список миссий</h3>
                <div className="subtasks-list">
                  {task.subTasks.map((sub, idx) => (
                    <div key={idx} className="subtask-item">
                      <div className="subtask-content">
                        <strong>{sub.title}</strong>
                        <p>{sub.desc}</p>
                      </div>
                      {(sub.link || sub.links) && (
                        <div className="subtask-links">
                          {sub.link && (
                            <button className="btn-small" onClick={() => handleOpenLink(sub.link)}>
                              ↗️ Перейти
                            </button>
                          )}
                          {sub.links && sub.links.map((l, i) => (
                            <button key={i} className="btn-small" onClick={() => handleOpenLink(l)}>
                              ↗️ Чат {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Блок для копирования паст */}
            {task.copyableTexts && (
              <div className="modal-section">
                <h3>📋 Тексты для копирования (Пасты)</h3>
                <div className="pastas-list">
                  {task.copyableTexts.map((text, idx) => (
                    <div key={idx} className="pasta-item" onClick={() => copyToClipboard(text, idx)}>
                      <p>{text}</p>
                      <div className="pasta-action">
                        {copyFeedback === idx ? '✅ Скопировано!' : 'Нажми чтобы скопировать'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Стандартная инструкция */}
            {task.instructions && (
              <div className="modal-section">
                <h3>📝 Инструкция</h3>
                <ol>
                  {task.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}

            {!isCompleted && (
              <>
                {/* Основная ссылка задания (если нет подзаданий) */}
                {task.taskLink && !task.subTasks && (
                  <div className="modal-section">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenLink(task.taskLink)}
                      type="button"
                    >
                      🔗 Перейти к заданию
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                  <div className="input-group">
                    <label htmlFor="proofLink">
                      {task.id === 9
                        ? "Ссылка на одно из ваших сообщений или скриншот"
                        : "Ссылка на доказательство (сообщение/скриншот)"}
                    </label>
                    <input
                      id="proofLink"
                      type="text"
                      className="input"
                      placeholder="https://t.me/..."
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      disabled={submitting || isUnderReview}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || isUnderReview}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner"></span>
                        Отправка...
                      </>
                    ) : isUnderReview ? (
                      '⏳ На проверке'
                    ) : (
                      '📤 Отправить на проверку'
                    )}
                  </button>
                </form>
              </>
            )}

            {isCompleted && (
              <div className="success-message">
                <span>✅</span>
                <span>Задание выполнено!</span>
              </div>
            )}

            {message && (
              <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


export default TaskModal
