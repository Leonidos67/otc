import React, { useState, useRef, useEffect } from 'react';
import './ProfileEditModal.css';

const ProfileEditModal = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('photo');
  const [selectedBackground, setSelectedBackground] = useState(() => 
    localStorage.getItem('profile_background') || 'none'
  );
  const [selectedEmoji, setSelectedEmoji] = useState(() => 
    localStorage.getItem('profile_emoji') || '😊'
  );
  const [uploadedPhoto, setUploadedPhoto] = useState(() => 
    localStorage.getItem('profile_custom_photo') || null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  // Заготовленные фоны
  const backgrounds = [
    { id: 'none', name: 'Без фона', color: 'transparent' },
    { id: 'gradient1', name: 'Градиент 1', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', name: 'Градиент 2', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'gradient3', name: 'Градиент 3', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'gradient4', name: 'Градиент 4', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'gradient5', name: 'Градиент 5', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'gradient6', name: 'Градиент 6', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { id: 'dark', name: 'Темный', color: '#1a1a1a' },
    { id: 'purple', name: 'Фиолетовый', color: '#6366f1' },
    { id: 'blue', name: 'Синий', color: '#3b82f6' },
    { id: 'green', name: 'Зеленый', color: '#10b981' },
    { id: 'red', name: 'Красный', color: '#ef4444' }
  ];

  // Заготовленные эмодзи
  const emojis = [
    '😊', '😎', '🤔', '😍', '🥰', '😘', '😋', '😜', '🤪', '😏',
    '😌', '😴', '🤤', '😪', '😵', '🤐', '🤢', '🤮', '🤧', '😷',
    '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '👻',
    '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀',
    '😿', '😾', '🙈', '🙉', '🙊', '🐵', '🐒', '🦍', '🦧', '🐶',
    '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁',
    '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂',
    '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐑', '🐐', '🐪', '🐫',
    '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰',
    '🐇', '🐿️', '🦔', '🦇', '🐻', '🐨', '🐼', '🦥', '🦦', '🦡'
  ];

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoDataUrl = e.target.result;
        setUploadedPhoto(photoDataUrl);
        localStorage.setItem('profile_custom_photo', photoDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Логика для индикатора меню
  useEffect(() => {
    if (!menuRef.current) return;
    const buttons = menuRef.current.querySelectorAll(".profile-edit-modal-menu-item");

    const moveIndicator = (el) => {
      if (indicatorRef.current && el) {
        indicatorRef.current.style.width = `${el.offsetWidth}px`;
        indicatorRef.current.style.left = `${el.offsetLeft}px`;
      }
    };

    // Небольшая задержка для корректной инициализации
    setTimeout(() => {
      const activeEl = menuRef.current.querySelector(".active");
      if (activeEl) {
        moveIndicator(activeEl);
      }
    }, 100);

    buttons.forEach((btn) => {
      const handleMouseEnter = () => moveIndicator(btn);
      const handleMouseLeave = () => moveIndicator(menuRef.current.querySelector(".active"));

      btn.addEventListener("mouseenter", handleMouseEnter);
      btn.addEventListener("mouseleave", handleMouseLeave);

      btn.cleanup = () => {
        btn.removeEventListener("mouseenter", handleMouseEnter);
        btn.removeEventListener("mouseleave", handleMouseLeave);
      };
    });

    return () => buttons.forEach((btn) => btn.cleanup());
  }, [activeTab]);

  // Дополнительная инициализация при открытии модального окна
  useEffect(() => {
    if (isOpen && menuRef.current && indicatorRef.current) {
      setTimeout(() => {
        const activeEl = menuRef.current.querySelector(".active");
        if (activeEl && indicatorRef.current) {
          indicatorRef.current.style.width = `${activeEl.offsetWidth}px`;
          indicatorRef.current.style.left = `${activeEl.offsetLeft}px`;
        }
      }, 200);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('profile_background', selectedBackground);
    localStorage.setItem('profile_emoji', selectedEmoji);
    if (uploadedPhoto) {
      localStorage.setItem('profile_custom_photo', uploadedPhoto);
    }
    if (onSave) {
      onSave(selectedBackground, selectedEmoji, uploadedPhoto);
    }
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'photo':
        return (
          <div className="profile-edit-section">
            <h3>Загрузить свою фотографию</h3>
            {uploadedPhoto ? (
              <div>
                <img src={uploadedPhoto} alt="Preview" className="photo-preview" />
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button 
                    className="profile-edit-modal-button secondary"
                    onClick={() => {
                      setUploadedPhoto(null);
                      localStorage.removeItem('profile_custom_photo');
                    }}
                  >
                    Удалить фото
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`photo-upload-area ${isDragOver ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="photo-upload-icon">📷</div>
                <div className="photo-upload-text">Нажмите или перетащите фото</div>
                <div className="photo-upload-subtext">PNG, JPG до 5MB</div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="photo-upload-input"
            />
          </div>
        );
      case 'emoji':
        return (
          <>
            <div className="profile-edit-section">
              <h3>Выберите фон:</h3>
              <div className="background-grid">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    className={`background-option ${selectedBackground === bg.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBackground(bg.id)}
                    style={{
                      background: bg.gradient || bg.color,
                      border: selectedBackground === bg.id ? '2px solid #4ade80' : '1px solid #333'
                    }}
                    title={bg.name}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-edit-section">
              <h3>Выберите эмодзи:</h3>
              <div className="emoji-grid">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
                    onClick={() => setSelectedEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-edit-modal-overlay" onClick={onClose}>
      <div className="profile-edit-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок модального окна */}
        <div className="profile-edit-modal-header">
          <h2>Редактировать профиль</h2>
          <button className="profile-edit-modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Меню */}
        <div className="profile-edit-modal-menu" ref={menuRef}>
          <button
            className={`profile-edit-modal-menu-item ${activeTab === 'photo' ? 'active' : ''}`}
            onClick={() => setActiveTab('photo')}
          >
            Загрузить свою фотографию
          </button>
          <button
            className={`profile-edit-modal-menu-item ${activeTab === 'emoji' ? 'active' : ''}`}
            onClick={() => setActiveTab('emoji')}
          >
            Использовать эмодзи
          </button>
          <div className="hover-indicator" ref={indicatorRef} />
        </div>
        
        {/* Разделитель */}
        <div className="profile-edit-modal-divider" />

        {/* Содержимое модального окна */}
        <div className="profile-edit-modal-body">
          {renderTabContent()}
        </div>

        {/* Кнопки действий */}
        <div className="profile-edit-modal-footer">
          <button 
            className="profile-edit-modal-button secondary"
            onClick={onClose}
          >
            Отмена
          </button>
          <button 
            className="profile-edit-modal-button primary"
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;