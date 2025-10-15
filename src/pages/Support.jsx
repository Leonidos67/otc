import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PageStyles.css';

const Support = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Новое обращение");
  const [formData, setFormData] = useState({
    name: user?.first_name || '',
    username: user?.username || '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem('support_tickets');
    return savedTickets ? JSON.parse(savedTickets) : [];
  });
  
  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  // Анимация индикатора для вкладок
  useEffect(() => {
    if (!menuRef.current) return;
    const buttons = menuRef.current.querySelectorAll(".profile-tab-button");

    const moveIndicator = (el) => {
      if (indicatorRef.current && el) {
        indicatorRef.current.style.width = `${el.offsetWidth}px`;
        indicatorRef.current.style.left = `${el.offsetLeft}px`;
      }
    };

    const activeEl = menuRef.current.querySelector(".active-tab");
    moveIndicator(activeEl);

    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => moveIndicator(button));
      button.addEventListener("mouseleave", () => {
        const activeEl = menuRef.current.querySelector(".active-tab");
        moveIndicator(activeEl);
      });
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("mouseenter", () => moveIndicator(button));
        button.removeEventListener("mouseleave", () => {
          const activeEl = menuRef.current.querySelector(".active-tab");
          moveIndicator(activeEl);
        });
      });
    };
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Создаем Новое обращение
      const newTicket = {
        id: Date.now().toString(),
        ...formData,
        status: 'Отправлен',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Добавляем тикет в список
      const updatedTickets = [...tickets, newTicket];
      setTickets(updatedTickets);
      localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
      
      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      alert('Произошла ошибка при отправке сообщения. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.first_name || '',
      username: user?.username || '',
      subject: '',
      message: '',
      priority: 'medium'
    });
    setIsSubmitted(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'Срочный';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Средний';
    }
  };

  if (isSubmitted) {
    return (
      <div className="page-container">
        <div className="support-success">
          <div className="success-icon">✓</div>
          <h2>Сообщение отправлено!</h2>
          <p>Мы получили ваше сообщение и свяжемся с вами в ближайшее время.</p>
          <button onClick={resetForm} className="manage-wallet-btn" style={{ width: "max-content" }}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="profile-page-title">Техподдержка</h1>
      <hr className="divider" style={{ marginTop: "10px", marginLeft: "-20px", marginRight: "-20px" }} />
      
      {/* Меню вкладок */}
      <div className="menu-container mb-6 relative" ref={menuRef}>
        <button
          className={`profile-tab-button ${activeTab === "Новое обращение" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("Новое обращение")}
        >
          Новое обращение
        </button>
        <button
          className={`profile-tab-button ${activeTab === "История" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("История")}
        >
          История
        </button>
        <div className="hover-indicator" ref={indicatorRef} />
      </div>
      <hr className="divider" style={{ marginTop: "0px", marginLeft: "-20px", marginRight: "-20px" }} />
      
      <div className="tab-content">
        {activeTab === "Новое обращение" && (
          <div className="support-container" style={{ marginTop: "20px" }}>
            <div className="support-header">
              <p>Опишите вашу проблему, и мы поможем вам её решить</p>
            </div>

        <div className="support-layout">
          <div className="support-form-section">
            <form onSubmit={handleSubmit} className="support-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Имя *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Введите ваше имя"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="username">Username для связи *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Введите ваш username"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subject">Тема *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Кратко опишите проблему"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">Приоритет</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Сообщение *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Подробно опишите вашу проблему или вопрос..."
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="manage-wallet-btn"
                  // style={{  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                </button>
              </div>
            </form>
          </div>

          <div className="support-info-section">
            <div className="support-info">
              <h3>Дополнительная информация</h3>
              <div className="info-grid">
                <div className="info-item">
                  <h4>Время ответа</h4>
                  <p style={{fontStyle: 'italic'}}>Обычно мы отвечаем в течение 6 часов.</p>
                  <p style={{fontStyle: 'italic'}}>*Иногда ожидание ответа занимает до 10 рабочих дней</p>
                </div>
                <div className="info-item">
                  <h4>Срочные вопросы</h4>
                  <p style={{fontStyle: 'italic'}}>Для срочных вопросов выберите приоритет "Срочный"</p>
                </div>
                {/* <div className="info-item">
                  <h4>Контакты</h4>
                  <p>Telegram: @</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        </div>
        )}

        {activeTab === "История" && (
          <div className="support-container" style={{ marginTop: "20px" }}>
            <div className="support-header">
              <p>История ваших обращений в техподдержку</p>
            </div>
            
            {tickets.length === 0 ? (
              <div className="empty-state">
                <h3>Нет обращений</h3>
                <p>Вы еще не отправляли обращения в техподдержку</p>
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-header">
                      {/* <div className="ticket-status-top">
                        <span className="status-badge">{ticket.status}</span>
                      </div> */}
                      <div className="ticket-title-row">
                        <h3 className="ticket-subject">{ticket.subject}</h3>
                        <span className="ticket-id">#{ticket.id.slice(-6)}</span>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                        >
                          {getPriorityText(ticket.priority)}
                        </span>
                        <span className="status-badge">{ticket.status}</span>
                      </div>
                      <div className="ticket-date-row">
                        <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ticket-content">
                      <p className="ticket-message">{ticket.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
