// Утилиты для работы со сделками

/**
 * Генерирует уникальный ID для сделки
 * @returns {string} Уникальный идентификатор сделки
 */
export const generateDealId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `deal_${timestamp}_${randomPart}`;
};

/**
 * Сохраняет сделку в localStorage и создает публичную ссылку
 * @param {Object} dealData - Данные сделки
 * @returns {string} ID созданной сделки
 */
export const saveDeal = (dealData) => {
  const dealId = generateDealId();
  const deal = {
    id: dealId,
    ...dealData,
    createdAt: new Date().toISOString(),
    status: 'active',
    publicUrl: `${window.location.origin}/deal/${dealId}`, // Публичная ссылка
    isPublic: true // Флаг публичности
  };

  // Получаем существующие сделки
  const existingDeals = JSON.parse(localStorage.getItem('deals') || '[]');
  
  // Добавляем новую сделку
  existingDeals.push(deal);
  
  // Сохраняем обратно в localStorage
  localStorage.setItem('deals', JSON.stringify(existingDeals));
  
  // Также сохраняем в sessionStorage для быстрого доступа
  sessionStorage.setItem(`deal_${dealId}`, JSON.stringify(deal));
  
  return dealId;
};

/**
 * Получает сделку по ID
 * @param {string} dealId - ID сделки
 * @returns {Object|null} Данные сделки или null если не найдена
 */
export const getDealById = (dealId) => {
  const deals = JSON.parse(localStorage.getItem('deals') || '[]');
  return deals.find(deal => deal.id === dealId) || null;
};

/**
 * Получает все сделки пользователя
 * @returns {Array} Массив всех сделок
 */
export const getAllDeals = () => {
  return JSON.parse(localStorage.getItem('deals') || '[]');
};

/**
 * Получает активные сделки
 * @returns {Array} Массив активных сделок
 */
export const getActiveDeals = () => {
  const deals = getAllDeals();
  return deals.filter(deal => 
    deal.status === 'waiting_for_participant' || 
    deal.status === 'waiting_for_confirmation' ||
    deal.status === 'in_progress'
  );
};

/**
 * Получает завершенные сделки
 * @returns {Array} Массив завершенных сделок
 */
export const getCompletedDeals = () => {
  const deals = getAllDeals();
  return deals.filter(deal => deal.status === 'completed');
};

/**
 * Обновляет статус сделки
 * @param {string} dealId - ID сделки
 * @param {string} status - Новый статус
 */
export const updateDealStatus = (dealId, status) => {
  const deals = getAllDeals();
  const dealIndex = deals.findIndex(deal => deal.id === dealId);
  
  if (dealIndex !== -1) {
    deals[dealIndex].status = status;
    deals[dealIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('deals', JSON.stringify(deals));
  }
};

/**
 * Присоединяет участника к сделке
 * @param {string} dealId - ID сделки
 * @param {string} participantId - ID участника
 * @returns {boolean} Успешность операции
 */
export const joinDeal = (dealId, participantId) => {
  const deals = getAllDeals();
  const dealIndex = deals.findIndex(deal => deal.id === dealId);
  
  if (dealIndex !== -1 && deals[dealIndex].status === 'waiting_for_participant') {
    deals[dealIndex].participants.participant = {
      id: participantId,
      confirmed: false,
      ready: false
    };
    deals[dealIndex].status = 'waiting_for_confirmation';
    deals[dealIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('deals', JSON.stringify(deals));
    return true;
  }
  return false;
};

/**
 * Подтверждает готовность участника
 * @param {string} dealId - ID сделки
 * @param {string} userId - ID пользователя
 * @param {boolean} ready - Готовность
 * @returns {boolean} Успешность операции
 */
export const confirmReadiness = (dealId, userId, ready) => {
  const deals = getAllDeals();
  const dealIndex = deals.findIndex(deal => deal.id === dealId);
  
  if (dealIndex !== -1) {
    const deal = deals[dealIndex];
    
    // Определяем, кто это - создатель или участник
    if (deal.participants.creator.id === userId) {
      deal.participants.creator.ready = ready;
    } else if (deal.participants.participant && deal.participants.participant.id === userId) {
      deal.participants.participant.ready = ready;
    } else {
      return false;
    }
    
    // Проверяем, готовы ли оба участника
    const creatorReady = deal.participants.creator.ready;
    const participantReady = deal.participants.participant ? deal.participants.participant.ready : false;
    
    if (creatorReady && participantReady) {
      deal.status = 'in_progress';
    } else {
      deal.status = 'waiting_for_confirmation';
    }
    
    deal.updatedAt = new Date().toISOString();
    localStorage.setItem('deals', JSON.stringify(deals));
    return true;
  }
  return false;
};

/**
 * Завершает сделку
 * @param {string} dealId - ID сделки
 * @param {string} userId - ID пользователя, завершающего сделку
 * @returns {boolean} Успешность операции
 */
export const completeDeal = (dealId, userId) => {
  const deals = getAllDeals();
  const dealIndex = deals.findIndex(deal => deal.id === dealId);
  
  if (dealIndex !== -1 && deals[dealIndex].status === 'in_progress') {
    deals[dealIndex].status = 'completed';
    deals[dealIndex].completedAt = new Date().toISOString();
    deals[dealIndex].completedBy = userId;
    localStorage.setItem('deals', JSON.stringify(deals));
    return true;
  }
  return false;
};

/**
 * Получает сделки пользователя (как создателя, так и участника)
 * @param {string} userId - ID пользователя
 * @returns {Array} Массив сделок пользователя
 */
export const getUserDeals = (userId) => {
  const deals = getAllDeals();
  return deals.filter(deal => 
    deal.creatorId === userId || 
    (deal.participants.participant && deal.participants.participant.id === userId)
  );
};

/**
 * Получает доступные для присоединения сделки
 * @param {string} userId - ID пользователя
 * @returns {Array} Массив доступных сделок
 */
export const getAvailableDeals = (userId) => {
  const deals = getAllDeals();
  return deals.filter(deal => 
    deal.status === 'waiting_for_participant' && 
    deal.creatorId !== userId
  );
};

/**
 * Получает сделку из URL-параметров (для публичного доступа)
 * @param {string} dealId - ID сделки из URL
 * @returns {Object|null} Данные сделки или null если не найдена
 */
export const getDealFromUrl = (dealId) => {
  // Сначала проверяем sessionStorage
  const sessionDeal = sessionStorage.getItem(`deal_${dealId}`);
  if (sessionDeal) {
    return JSON.parse(sessionDeal);
  }
  
  // Затем проверяем localStorage
  const deals = JSON.parse(localStorage.getItem('deals') || '[]');
  const deal = deals.find(d => d.id === dealId);
  
  if (deal) {
    // Сохраняем в sessionStorage для быстрого доступа
    sessionStorage.setItem(`deal_${dealId}`, JSON.stringify(deal));
    return deal;
  }
  
  return null;
};

/**
 * Создает публичную ссылку на сделку
 * @param {string} dealId - ID сделки
 * @returns {string} Публичная ссылка
 */
export const createPublicDealUrl = (dealId) => {
  return `${window.location.origin}/deal/${dealId}`;
};

/**
 * Генерирует уникальный ID пользователя для гостевого режима
 * @returns {string} Уникальный ID пользователя
 */
export const generateGuestUserId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `guest_${timestamp}_${randomPart}`;
};

/**
 * Получает или создает ID пользователя
 * @returns {string} ID пользователя
 */
export const getOrCreateUserId = () => {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = generateGuestUserId();
    localStorage.setItem('user_id', userId);
  }
  return userId;
};

/**
 * Форматирует дату для отображения
 * @param {string} dateString - Дата в ISO формате
 * @returns {string} Отформатированная дата
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
