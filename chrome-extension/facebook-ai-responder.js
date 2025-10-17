// JokerVision - Facebook Messenger AI Auto-Responder with CRISP Methodology
// Monitors Facebook messages and responds automatically following CRISP framework

console.log('🤖 JokerVision AI Auto-Responder loaded');

// CRISP Methodology Stages
const CRISP_STAGES = {
    CONNECTING: 'connecting',
    RESEARCHING: 'researching', 
    INVESTIGATING: 'investigating',
    SOLVING: 'solving',
    PROPOSING: 'proposing'
};

// Configuration
let autoResponseEnabled = false;
let currentConversations = new Map();

// Initialize message monitoring
function initializeMessageMonitoring() {
    console.log('📱 Starting Facebook Messenger monitoring...');
    
    // Check for new messages every 3 seconds
    setInterval(() => {
        if (autoResponseEnabled) {
            checkForNewMessages();
        }
    }, 3000);
    
    // Also monitor when user navigates to messages
    if (window.location.href.includes('/messages')) {
        monitorActiveConversation();
    }
}

// Check for new unread messages
async function checkForNewMessages() {
    try {
        // Look for unread message indicators
        const unreadMessages = document.querySelectorAll('[data-testid="unread_message_indicator"], .message-badge, [aria-label*="unread"]');
        
        if (unreadMessages.length > 0) {
            console.log(`📬 Found ${unreadMessages.length} unread messages`);
            
            // Process each unread message
            for (const indicator of unreadMessages) {
                await processUnreadMessage(indicator);
            }
        }
    } catch (error) {
        console.error('Error checking messages:', error);
    }
}

// Process unread message
async function processUnreadMessage(indicator) {
    try {
        // Click to open conversation
        const conversationElement = indicator.closest('[role="row"], [data-testid="conversation"]');
        if (!conversationElement) return;
        
        conversationElement.click();
        await sleep(1000);
        
        // Get conversation details
        const conversation = await extractConversationDetails();
        
        if (conversation && !currentConversations.has(conversation.id)) {
            console.log('💬 New conversation detected:', conversation.leadName);
            
            // Determine CRISP stage and respond
            await handleConversation(conversation);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
}

// Monitor active conversation
function monitorActiveConversation() {
    console.log('👀 Monitoring active conversation...');
    
    // Watch for new messages in the conversation thread
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && isNewIncomingMessage(node)) {
                        handleNewMessage(node);
                    }
                });
            }
        }
    });
    
    const messageContainer = document.querySelector('[role="main"]');
    if (messageContainer) {
        observer.observe(messageContainer, {
            childList: true,
            subtree: true
        });
    }
}

// Check if message is new and incoming (not from us)
function isNewIncomingMessage(node) {
    // Check if it's a message bubble and not sent by us
    const isMessage = node.querySelector('[data-testid="message-container"]') || 
                     node.classList?.contains('message') ||
                     node.getAttribute('role') === 'article';
    
    const isOutgoing = node.querySelector('[data-testid="outgoing_message"]') ||
                      node.classList?.contains('outgoing');
    
    return isMessage && !isOutgoing;
}

// Handle new incoming message
async function handleNewMessage(messageNode) {
    try {
        const messageText = messageNode.textContent?.trim();
        if (!messageText || messageText.length === 0) return;
        
        console.log('📩 New message received:', messageText);
        
        // Get full conversation context
        const conversation = await extractConversationDetails();
        conversation.latestMessage = messageText;
        
        // Send to backend for AI response
        await handleConversation(conversation);
        
    } catch (error) {
        console.error('Error handling new message:', error);
    }
}

// Extract conversation details
async function extractConversationDetails() {
    try {
        // Get lead name
        const nameElement = document.querySelector('[role="heading"]');
        const leadName = nameElement?.textContent?.trim() || 'Unknown';
        
        // Get all messages in conversation
        const messageElements = document.querySelectorAll('[data-testid="message-container"]');
        const messages = Array.from(messageElements).map(el => ({
            text: el.textContent?.trim(),
            isOutgoing: !!el.querySelector('[data-testid="outgoing_message"]'),
            timestamp: Date.now()
        }));
        
        // Get vehicle context (if in marketplace listing conversation)
        let vehicleInfo = null;
        const vehicleElement = document.querySelector('[data-testid="marketplace_listing_title"]');
        if (vehicleElement) {
            vehicleInfo = vehicleElement.textContent?.trim();
        }
        
        return {
            id: generateConversationId(leadName),
            leadName: leadName,
            messages: messages,
            latestMessage: messages[messages.length - 1]?.text,
            vehicleInterest: vehicleInfo,
            platform: 'Facebook Marketplace',
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error extracting conversation:', error);
        return null;
    }
}

// Handle conversation with CRISP methodology
async function handleConversation(conversation) {
    try {
        console.log('🧠 Processing with CRISP methodology...');
        
        // Send to backend AI agent
        const response = await fetch('https://autofollowpro.preview.emergentagent.com/api/ai/crisp-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation: conversation,
                platform: 'facebook_marketplace',
                methodology: 'CRISP'
            })
        });
        
        if (!response.ok) {
            console.error('Failed to get AI response');
            return;
        }
        
        const aiResponse = await response.json();
        console.log('🤖 AI Response:', aiResponse);
        
        // Determine if we should auto-send or wait for approval
        if (autoResponseEnabled && aiResponse.autoSend) {
            await sendMessage(aiResponse.message);
            
            // If AI suggests appointment, trigger appointment scheduler
            if (aiResponse.suggestAppointment) {
                await showAppointmentScheduler(conversation, aiResponse);
            }
        } else {
            // Show notification to user
            showResponseSuggestion(aiResponse);
        }
        
        // Track conversation stage
        currentConversations.set(conversation.id, {
            ...conversation,
            crispStage: aiResponse.crispStage,
            lastResponse: aiResponse.message
        });
        
    } catch (error) {
        console.error('Error handling conversation:', error);
    }
}

// Send message to Facebook Messenger
async function sendMessage(message) {
    try {
        console.log('💬 Sending message:', message);
        
        // Find message input
        const messageInput = document.querySelector('[aria-label*="Message"], [contenteditable="true"][role="textbox"]');
        if (!messageInput) {
            console.error('Message input not found');
            return false;
        }
        
        // Type message
        messageInput.focus();
        messageInput.textContent = '';
        
        for (const char of message) {
            messageInput.textContent += char;
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(20); // Natural typing speed
        }
        
        // Wait a moment
        await sleep(500);
        
        // Find and click send button
        const sendButton = document.querySelector('[aria-label*="Send"], [aria-label*="Press Enter to send"]');
        if (sendButton) {
            sendButton.click();
            console.log('✅ Message sent!');
            return true;
        } else {
            // Try pressing Enter
            messageInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                bubbles: true
            }));
            console.log('✅ Message sent via Enter key!');
            return true;
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

// Show appointment scheduler
async function showAppointmentScheduler(conversation, aiResponse) {
    console.log('📅 Showing appointment scheduler...');
    
    // Create appointment popup
    const popup = document.createElement('div');
    popup.id = 'jv-appointment-scheduler';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 999999;
        width: 400px;
        color: #333;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #667eea; font-size: 20px;">Schedule Appointment</h3>
        <p style="margin-bottom: 20px; color: #666;">Lead: <strong>${conversation.leadName}</strong></p>
        <p style="margin-bottom: 20px; color: #666;">Vehicle: <strong>${conversation.vehicleInterest || 'N/A'}</strong></p>
        
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Date & Time:</label>
        <input type="datetime-local" id="jv-appointment-time" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
        
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Notes:</label>
        <textarea id="jv-appointment-notes" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; resize: vertical;" rows="3">${aiResponse.appointmentNotes || ''}</textarea>
        
        <div style="display: flex; gap: 10px;">
            <button id="jv-schedule-btn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Schedule
            </button>
            <button id="jv-cancel-schedule" style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Cancel
            </button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Event handlers
    document.getElementById('jv-schedule-btn').addEventListener('click', async () => {
        const datetime = document.getElementById('jv-appointment-time').value;
        const notes = document.getElementById('jv-appointment-notes').value;
        
        if (!datetime) {
            alert('Please select date and time');
            return;
        }
        
        await scheduleAppointment({
            leadName: conversation.leadName,
            vehicleInterest: conversation.vehicleInterest,
            datetime: datetime,
            notes: notes,
            conversationId: conversation.id
        });
        
        popup.remove();
    });
    
    document.getElementById('jv-cancel-schedule').addEventListener('click', () => {
        popup.remove();
    });
}

// Schedule appointment in backend
async function scheduleAppointment(appointmentData) {
    try {
        console.log('📅 Scheduling appointment:', appointmentData);
        
        const response = await fetch('https://autofollowpro.preview.emergentagent.com/api/appointments/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });
        
        if (response.ok) {
            console.log('✅ Appointment scheduled!');
            
            // Send confirmation message
            const confirmMessage = `Perfect! I've scheduled your appointment for ${new Date(appointmentData.datetime).toLocaleString()}. We're looking forward to meeting you!`;
            await sendMessage(confirmMessage);
            
            // Show success notification
            showNotification('✅ Appointment Scheduled', `Appointment set for ${appointmentData.leadName}`);
        }
        
    } catch (error) {
        console.error('Error scheduling appointment:', error);
    }
}

// Show notification
function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        font-weight: 500;
    `;
    notification.innerHTML = `<strong>${title}</strong><br>${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 4000);
}

// Show response suggestion
function showResponseSuggestion(aiResponse) {
    console.log('💡 Showing response suggestion');
    // Show notification with suggested response
    // User can click to approve and send
}

// Generate conversation ID
function generateConversationId(leadName) {
    return `fb_${leadName.replace(/\s+/g, '_')}_${Date.now()}`;
}

// Helper: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Listen for commands from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'enableAutoResponse') {
        autoResponseEnabled = request.enabled;
        console.log('🤖 Auto-response:', autoResponseEnabled ? 'ENABLED' : 'DISABLED');
        sendResponse({ success: true });
    }
    
    if (request.action === 'startLeadMonitoring') {
        console.log('🔍 Starting lead monitoring...');
        initializeMessageMonitoring();
        sendResponse({ success: true });
    }
    
    return true;
});

// Start monitoring when on Facebook
if (window.location.href.includes('facebook.com')) {
    // Auto-start monitoring after page load
    setTimeout(() => {
        initializeMessageMonitoring();
    }, 3000);
}

console.log('✅ JokerVision AI Auto-Responder ready with CRISP methodology');
