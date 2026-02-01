/**
 * Car Owner Contact Application
 * Improved version with better code organization and performance
 */

// ===========================
// Configuration & Constants
// ===========================
const CONFIG = {
  DEFAULT_MESSAGE: 'ВАША МАШИНА МЕШАЕТ',
  SCROLL_DELAY: 100,
  MESSAGE_ANIMATION_DELAY: 50
};

// ===========================
// DOM Elements Cache
// ===========================
const DOM = {
  // Cards
  cards: null,
  cardsGrid: null,
  
  // Buttons
  btnTooltip: null,
  btnSend: null,
  btnSendFromTooltip: null,
  btnCloseTooltip: null,
  btnCloseChat: null,
  
  // Modals
  tooltipModal: null,
  chatModal: null,
  
  // Chat elements
  chatMessages: null,
  chatInput: null,
  selectedMessageText: null,
  messageMedia: null,
  messageTime: null,
  
  // Links
  linkSkip: null
};

// ===========================
// State Management
// ===========================
const state = {
  selectedCard: null
};

// ===========================
// Utility Functions
// ===========================

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get current time in HH:MM format
 * @returns {string} Formatted time
 */
function getCurrentTime() {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Smooth scroll to bottom of element
 * @param {HTMLElement} element - Element to scroll
 */
function scrollToBottom(element) {
  setTimeout(() => {
    element.scrollTop = element.scrollHeight;
  }, CONFIG.SCROLL_DELAY);
}

/**
 * Get icon SVG for selected card
 * @param {HTMLElement} card - Selected card element
 * @returns {string} SVG HTML
 */
function getCardIcon(card) {
  const iconElement = card.querySelector('.card-icon svg');
  return iconElement ? iconElement.outerHTML : '';
}

// ===========================
// Card Selection
// ===========================

/**
 * Handle card selection
 * @param {HTMLElement} card - Card to select
 */
function selectCard(card) {
  // Remove selection from all cards
  DOM.cards.forEach(c => c.classList.remove('selected'));
  
  // Add selection to clicked card
  card.classList.add('selected');
  
  // Update state
  state.selectedCard = card;
}

/**
 * Initialize card click handlers
 */
function initCardHandlers() {
  DOM.cards.forEach(card => {
    card.addEventListener('click', () => selectCard(card));
  });
  
  // Select first card by default
  if (DOM.cards.length > 0) {
    selectCard(DOM.cards[0]);
  }
}

// ===========================
// Modal Management
// ===========================

/**
 * Open tooltip modal
 * @param {Event} e - Click event
 */
function openTooltip(e) {
  e.stopPropagation();
  DOM.tooltipModal.classList.add('active');
  // Focus management for accessibility
  const closeButton = DOM.tooltipModal.querySelector('.btn-close-tooltip');
  if (closeButton) closeButton.focus();
}

/**
 * Close tooltip modal
 */
function closeTooltip() {
  DOM.tooltipModal.classList.remove('active');
}

/**
 * Open chat modal with selected message
 */
function openChat() {
  // Get message text
  const text = state.selectedCard
    ? state.selectedCard.dataset.text.toUpperCase()
    : CONFIG.DEFAULT_MESSAGE;
  
  // Update message text
  DOM.selectedMessageText.textContent = text;
  
  // Update message icon
  if (state.selectedCard) {
    const iconSvg = getCardIcon(state.selectedCard);
    DOM.messageMedia.innerHTML = iconSvg;
  }
  
  // Update time
  DOM.messageTime.textContent = getCurrentTime();
  
  // Close tooltip and open chat
  closeTooltip();
  DOM.chatModal.classList.add('active');
  
  // Focus chat input for better UX
  setTimeout(() => DOM.chatInput.focus(), CONFIG.MESSAGE_ANIMATION_DELAY);
}

/**
 * Close chat modal
 */
function closeChat() {
  DOM.chatModal.classList.remove('active');
  // Clear input
  DOM.chatInput.value = '';
}

/**
 * Initialize modal handlers
 */
function initModalHandlers() {
  // Tooltip handlers
  DOM.btnTooltip.addEventListener('click', openTooltip);
  DOM.btnCloseTooltip.addEventListener('click', closeTooltip);
  DOM.linkSkip.addEventListener('click', (e) => {
    e.preventDefault();
    closeTooltip();
  });
  
  // Send button handlers
  DOM.btnSend.addEventListener('click', openChat);
  DOM.btnSendFromTooltip.addEventListener('click', openChat);
  
  // Chat handlers
  DOM.btnCloseChat.addEventListener('click', closeChat);
  
  // Close on overlay click
  DOM.tooltipModal.addEventListener('click', (e) => {
    if (e.target === DOM.tooltipModal) closeTooltip();
  });
  
  DOM.chatModal.addEventListener('click', (e) => {
    if (e.target === DOM.chatModal) closeChat();
  });
  
  // Close modals on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.chatModal.classList.contains('active')) {
        closeChat();
      } else if (DOM.tooltipModal.classList.contains('active')) {
        closeTooltip();
      }
    }
  });
}

// ===========================
// Chat Functionality
// ===========================

/**
 * Create message HTML
 * @param {string} text - Message text
 * @param {string} time - Message time
 * @returns {string} Message HTML
 */
function createMessageHtml(text, time) {
  return `
    <div class="message message-sent">
      <div class="message-bubble">
        <span class="message-text" style="text-transform:none">${escapeHtml(text)}</span>
        <span class="message-meta">
          <span>${time}</span>
          <svg class="check" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Доставлено">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </span>
      </div>
    </div>
  `;
}

/**
 * Send chat message
 */
function sendChatMessage() {
  const text = DOM.chatInput.value.trim();
  
  // Validate input
  if (!text) return;
  
  // Get current time
  const time = getCurrentTime();
  
  // Create and insert message
  const messageHtml = createMessageHtml(text, time);
  DOM.chatMessages.insertAdjacentHTML('beforeend', messageHtml);
  
  // Clear input
  DOM.chatInput.value = '';
  
  // Scroll to bottom
  scrollToBottom(DOM.chatMessages);
  
  // Announce to screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Сообщение отправлено: ${text}`;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

/**
 * Initialize chat handlers
 */
function initChatHandlers() {
  // Send on Enter key
  DOM.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  
  // Optional: Send on button click (if you add a send button)
  // DOM.btnSendMessage.addEventListener('click', sendChatMessage);
}

// ===========================
// Initialization
// ===========================

/**
 * Cache DOM elements
 */
function cacheDomElements() {
  // Cards
  DOM.cards = document.querySelectorAll('.card');
  DOM.cardsGrid = document.getElementById('cardsGrid');
  
  // Buttons
  DOM.btnTooltip = document.getElementById('btnTooltip');
  DOM.btnSend = document.getElementById('btnSend');
  DOM.btnSendFromTooltip = document.getElementById('btnSendFromTooltip');
  DOM.btnCloseTooltip = document.getElementById('btnCloseTooltip');
  DOM.btnCloseChat = document.getElementById('btnCloseChat');
  
  // Modals
  DOM.tooltipModal = document.getElementById('tooltipModal');
  DOM.chatModal = document.getElementById('chatModal');
  
  // Chat elements
  DOM.chatMessages = document.getElementById('chatMessages');
  DOM.chatInput = document.getElementById('chatInput');
  DOM.selectedMessageText = document.getElementById('selectedMessageText');
  DOM.messageMedia = document.getElementById('messageMedia');
  DOM.messageTime = document.getElementById('messageTime');
  
  // Links
  DOM.linkSkip = document.getElementById('linkSkip');
}

/**
 * Initialize application
 */
function init() {
  // Cache DOM elements
  cacheDomElements();
  
  // Initialize handlers
  initCardHandlers();
  initModalHandlers();
  initChatHandlers();
  
  // Set initial time
  DOM.messageTime.textContent = getCurrentTime();
  
  console.log('✓ Application initialized successfully');
}

// ===========================
// Start Application
// ===========================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===========================
// Export for testing (optional)
// ===========================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    getCurrentTime,
    selectCard,
    sendChatMessage
  };
}
