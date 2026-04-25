// JS/chatbot.js - Chatbot inteligente para tienda
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    
    // Estado del chat
    let chatHistory = [];
    let currentStep = 'welcome';
    
    // Respuestas predefinidas del bot
    const botResponses = {
        welcome: {
            message: "¡Hola! 👋 Soy tu asistente virtual de Fernando Store. ¿En qué puedo ayudarte?",
            quickReplies: [
                "📦 Ver productos",
                "🛒 Mi carrito", 
                "💬 Contactar",
                "ℹ️ Información"
            ]
        },
        
        products: {
            message: "¡Genial! Tenemos varias categorías de productos:\n\n• 👕 Playeras\n• 🧥 Sudaderas  \n• 👖 Pantalones\n• 🧢 Accesorios\n• 👟 Calzado\n\n¿Te interesa alguna categoría en particular?",
            quickReplies: [
                "👕 Playeras",
                "🧥 Sudaderas",
                "👖 Pantalones",
                "🧢 Accesorios",
                "👟 Calzado",
                "⬅️ Volver"
            ]
        },
        
        contact: {
            message: "📞 **Información de contacto:**\n\n• **WhatsApp:** [443-405-3416](https://wa.me/524434053416)\n• **Ubicación:** Instituto Tecnológico de Morelia\n• **Horario:** Lunes a Viernes 9:00 - 18:00\n\n¿Quieres que te ayude con algo más?",
            quickReplies: [
                "📦 Ver productos",
                "🛒 Mi carrito",
                "⬅️ Volver"
            ]
        },
         
        info: {
            message: "🏪 **Sobre Mi Tiendita:**\n\nSomos una tienda en línea dedicada a ofrecer ropa y accesorios de moda para todas las edades. Nuestra misión es proporcionar productos de alta calidad a precios accesibles.\n\n💡 **Servicios:**\n• Envíos a domicilio\n• Pagos seguros\n• Atención personalizada",
            quickReplies: [
                "📦 Ver productos", 
                "📞 Contactar",
                "⬅️ Volver"
            ]
        },
        
        cart: {
            message: "🛒 **Tu Carrito:**\n\nPuedes ver y gestionar tu carrito de compras haciendo clic en 'Carrito' en el menú superior. Desde allí podrás:\n\n• Ver productos agregados\n• Modificar cantidades\n• Eliminar productos\n• Enviar pedido por WhatsApp\n\n¿Necesitas ayuda con algo específico del carrito?",
            quickReplies: [
                "📦 Seguir comprando",
                "📞 Contactar para ayuda",
                "⬅️ Volver"
            ]
        },
        
        help: {
            message: "🔧 **Centro de ayuda:**\n\n¿En qué necesitas ayuda específicamente? Puedo asistirte con:\n\n• Búsqueda de productos\n• Proceso de compra\n• Información de envíos\n• Problemas técnicos\n• Contacto con soporte",
            quickReplies: [
                "📦 Buscar producto",
                "🛒 Problema con carrito",
                "📞 Contactar soporte",
                "⬅️ Volver"
            ]
        },
        
        default: {
            message: "🤔 No estoy seguro de entender. ¿Podrías reformular tu pregunta o elegir una de estas opciones?",
            quickReplies: [
                "📦 Ver productos",
                "🛒 Mi carrito",
                "📞 Contactar", 
                "ℹ️ Información",
                "🔧 Ayuda"
            ]
        }
    };
    
    // Categorías de productos
    const productCategories = {
        "👕 Playeras": "playera",
        "🧥 Sudaderas": "sudadera", 
        "👖 Pantalones": "pantalon",
        "🧢 Accesorios": "accesorios",
        "👟 Calzado": "calzado"
    };
    
    // Inicializar chatbot
    function initChatbot() {
        showBotMessage(botResponses.welcome.message, botResponses.welcome.quickReplies);
        updateCurrentTime();
        
        // Mostrar hora actual cada minuto
        setInterval(updateCurrentTime, 60000);
    }
    
    // Mostrar mensaje del bot
    function showBotMessage(message, quickReplies = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = formatMessage(message);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        if (quickReplies && quickReplies.length > 0) {
            const quickRepliesDiv = document.createElement('div');
            quickRepliesDiv.className = 'quick-replies';
            
            quickReplies.forEach(reply => {
                const button = document.createElement('button');
                button.className = 'quick-reply';
                button.textContent = reply;
                button.addEventListener('click', () => handleQuickReply(reply));
                quickRepliesDiv.appendChild(button);
            });
            
            messageDiv.appendChild(quickRepliesDiv);
        }
        
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
        
        // Guardar en historial de chat
        chatHistory.push({
            type: 'bot',
            message: message,
            time: getCurrentTime()
        });
    }
    
    // Mostrar mensaje del usuario 
    function showUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
        
        // Guardar en historial de chat
        chatHistory.push({
            type: 'user',
            message: message,
            time: getCurrentTime()
        });
    }
    
    // Manejar respuestas rápidas
    function handleQuickReply(reply) {
        showUserMessage(reply);
        
        switch(reply) {
            case "📦 Ver productos":
            case "📦 Seguir comprando":
                currentStep = 'products';
                showBotMessage(botResponses.products.message, botResponses.products.quickReplies);
                break;
                
            case "🛒 Mi carrito":
            case "🛒 Problema con carrito":
                currentStep = 'cart';
                showBotMessage(botResponses.cart.message, botResponses.cart.quickReplies);
                break;
                
            case "💬 Contactar":
            case "📞 Contactar":
            case "📞 Contactar para ayuda":
            case "📞 Contactar soporte":
                currentStep = 'contact';
                showBotMessage(botResponses.contact.message, botResponses.contact.quickReplies);
                break;
                
            case "ℹ️ Información":
                currentStep = 'info';
                showBotMessage(botResponses.info.message, botResponses.info.quickReplies);
                break;
                
            case "🔧 Ayuda":
                currentStep = 'help';
                showBotMessage(botResponses.help.message, botResponses.help.quickReplies);
                break;
                
            case "⬅️ Volver":
                currentStep = 'welcome';
                showBotMessage(botResponses.welcome.message, botResponses.welcome.quickReplies);
                break;
                
            default:
                // Manejar categorías de productos
                if (productCategories[reply]) {
                    const category = productCategories[reply];
                    showBotMessage(`Perfecto! Te muestro nuestra selección de ${reply.toLowerCase()}.`);
                    
                    // Navegar a la categoría en la página principal
                    setTimeout(() => {
                        if (typeof renderProducts === 'function') {
                            renderProducts(category);
                            const productosSection = document.querySelector("#productos");
                            if (productosSection) {
                                productosSection.scrollIntoView({ behavior: "smooth" });
                            }
                        }
                        showBotMessage("He filtrado los productos para ti. ¿Necesitas ayuda con algo más?", 
                            ["🛒 Ver carrito", "📞 Contactar", "⬅️ Volver"]);
                    }, 1000);
                } else {
                    // Respuesta por defecto
                    showBotMessage(botResponses.default.message, botResponses.default.quickReplies);
                }
        }
    }
    
    // Procesar mensaje del usuario
    function processUserMessage(message) {
        message = message.toLowerCase().trim();
        
        // Detectar intenciones
        if (message.includes('hola') || message.includes('hi') || message.includes('hello')) {
            currentStep = 'welcome';
            showBotMessage(botResponses.welcome.message, botResponses.welcome.quickReplies);
        }
        else if (message.includes('producto') || message.includes('comprar') || message.includes('catalogo')) {
            currentStep = 'products';
            showBotMessage(botResponses.products.message, botResponses.products.quickReplies);
        }
        else if (message.includes('carrito') || message.includes('compra') || message.includes('pedido')) {
            currentStep = 'cart';
            showBotMessage(botResponses.cart.message, botResponses.cart.quickReplies);
        }
        else if (message.includes('contacto') || message.includes('whatsapp') || message.includes('tel')) {
            currentStep = 'contact';
            showBotMessage(botResponses.contact.message, botResponses.contact.quickReplies);
        }
        else if (message.includes('información') || message.includes('info') || message.includes('sobre')) {
            currentStep = 'info';
            showBotMessage(botResponses.info.message, botResponses.info.quickReplies);
        }
        else if (message.includes('ayuda') || message.includes('soporte') || message.includes('problema')) {
            currentStep = 'help';
            showBotMessage(botResponses.help.message, botResponses.help.quickReplies);
        }
        else {
            showBotMessage(botResponses.default.message, botResponses.default.quickReplies);
        }
    }
    
    // Utilidades
    function formatMessage(text) {
        return text.replace(/\n/g, '<br>')
                   .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    function getCurrentTime() {
        return new Date().toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    function updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = getCurrentTime();
        }
    }
    
    function scrollToBottom() {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Event Listeners
    chatbotToggle.addEventListener('click', function() {
        chatbotContainer.classList.toggle('open');
        chatbotToggle.style.display = 'none';
    });
    
    chatbotClose.addEventListener('click', function() {
        chatbotContainer.classList.remove('open');
        chatbotToggle.style.display = 'block';
    });
    
    chatbotSend.addEventListener('click', function() {
        const message = chatbotInput.value.trim();
        if (message) {
            showUserMessage(message);
            chatbotInput.value = '';
            setTimeout(() => processUserMessage(message), 500);
        }
    });
    
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            chatbotSend.click();
        }
    });
    
    // Cerrar chatbot al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!chatbotContainer.contains(e.target) && !chatbotToggle.contains(e.target)) {
            if (chatbotContainer.classList.contains('open')) {
                chatbotContainer.classList.remove('open');
                chatbotToggle.style.display = 'block';
            }
        }
    });
    
    // Inicializar chatbot al cargar la página
    initChatbot();
});