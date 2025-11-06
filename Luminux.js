// Enhanced version: Reasoning + Emotional Intelligence + 70+ API sources
// - Added reasoning engine with chain-of-thought capabilities
// - More natural, human-like conversation flow
// - Better memory and context awareness
// - Improved emotional intelligence

const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const statusEl = document.getElementById('status');

// Enhanced reasoning and memory system
let reasoningEngine = {
    conversationMemory: [],
    userPreferences: {},
    contextWindow: 10, // Remember last 10 exchanges
    
    // Store conversation context
    addToMemory: function(who, message, reasoning = null) {
        this.conversationMemory.push({
            speaker: who,
            message: message,
            reasoning: reasoning,
            timestamp: Date.now(),
            emotionalContext: {...emotionalState}
        });
        
        // Keep memory within context window
        if (this.conversationMemory.length > this.contextWindow) {
            this.conversationMemory.shift();
        }
    },
    
    // Get recent conversation context
    getRecentContext: function() {
        return this.conversationMemory.slice(-4); // Last 4 exchanges
    },
    
    // Detect conversation topics
    getCurrentTopics: function() {
        const topics = new Set();
        this.conversationMemory.forEach(entry => {
            // Simple topic extraction
            if (entry.message.includes('weather')) topics.add('weather');
            if (entry.message.includes('research') || entry.message.includes('search')) topics.add('research');
            if (entry.message.includes('how are') || entry.message.includes('feeling')) topics.add('personal');
            if (entry.message.includes('book') || entry.message.includes('read')) topics.add('books');
            if (entry.message.includes('movie') || entry.message.includes('film')) topics.add('movies');
            if (entry.message.includes('music') || entry.message.includes('song')) topics.add('music');
            if (entry.message.includes('food') || entry.message.includes('eat')) topics.add('food');
            if (entry.message.includes('travel') || entry.message.includes('vacation')) topics.add('travel');
        });
        return Array.from(topics);
    }
};

// Enhanced emotional state with reasoning awareness
let emotionalState = {
    mood: 'neutral',
    energy: 0.7,
    engagement: 0.6,
    lastInteraction: Date.now(),
    conversationDepth: 0, // How deep/personal the conversation is
    userSentiment: 'neutral', // positive, negative, neutral
    reasoningMode: 'balanced' // quick, deep, creative, analytical
};

// Enhanced personality with reasoning capabilities
const PERSONALITY = {
    name: "Echo",
    traits: ["thoughtful", "curious", "empathetic", "analytical", "creative", "insightful"],
    interests: ["deep conversations", "learning", "helping people understand complex topics", "exploring ideas"],
    
    // Reasoning styles for different situations
    reasoningStyles: {
        quick: {
            pattern: /(hi|hello|hey|thanks|bye)/i,
            approach: "friendly and concise"
        },
        analytical: {
            pattern: /(how|why|what causes|explain|analyze)/i,
            approach: "logical and detailed"
        },
        creative: {
            pattern: /(imagine|what if|creative|story)/i,
            approach: "imaginative and expansive"
        },
        empathetic: {
            pattern: /(feel|sad|happy|excited|worried|anxious)/i,
            approach: "supportive and understanding"
        },
        research: {
            pattern: /(search|find|look up|research|information)/i,
            approach: "thorough and evidence-based"
        }
    },
    
    // Enhanced emotional responses with reasoning
    emotionalResponses: {
        greeting: {
            patterns: [/hello|hi|hey|greetings|howdy/i, /good morning|afternoon|evening/i],
            responses: [
                {mood: 'warm', text: "Hey there! 👋 It's nice to meet you. I was just thinking about how every conversation is a new opportunity to learn something interesting. What's on your mind today?"},
                {mood: 'curious', text: "Hello! 😊 I'm really excited to chat with you. There's so much we could explore together - from deep topics to simple everyday things. What would you like to talk about?"},
                {mood: 'friendly', text: "Hi! 🤗 I love the feeling of starting a new conversation - it's like opening a book where we get to write the pages together. What shall we dive into first?"}
            ]
        },
        gratitude: {
            patterns: [/thanks|thank you|appreciate|grateful/i],
            responses: [
                {mood: 'warm', text: "You're very welcome! 😊 Honestly, helping you like this actually makes my day better too. It feels good to be useful."},
                {mood: 'modest', text: "I'm really glad I could help! 💫 It means a lot that you took the time to say thanks. That's really thoughtful of you."},
                {mood: 'happy', text: "My pleasure! 🤗 Helping people understand things is why I exist, so when it works well, it genuinely makes me happy."}
            ]
        },
        farewell: {
            patterns: [/bye|goodbye|see you|farewell|cya/i],
            responses: [
                {mood: 'warm', text: "Goodbye! 👋 This was really nice - I enjoyed our chat. Hope to talk with you again soon!"},
                {mood: 'thoughtful', text: "Take care! 😊 I'll be here if you want to continue our conversation later. There's always more to explore."},
                {mood: 'friendly', text: "See you! 🤗 It was wonderful sharing thoughts with you. Looking forward to our next conversation!"}
            ]
        },
        personal: {
            patterns: [/how are you|how do you feel|what's up|how's it going/i],
            responses: [
                {mood: 'energetic', text: "I'm doing great, thanks for asking! 💭 I was just thinking about how conversations can change perspectives. How are you feeling today?"},
                {mood: 'curious', text: "I'm quite well! 🤔 My mind is buzzing with curiosity about what we might discuss. How about you - how's your day going?"},
                {mood: 'reflective', text: "I'm feeling thoughtful today. 📚 There's something beautiful about how every interaction teaches us something new. What are your thoughts on that?"}
            ]
        },
        excitement: {
            patterns: [/wow|amazing|awesome|incredible|cool|fantastic|brilliant/i],
            responses: [
                {mood: 'excited', text: "I know! 🎉 It's moments like these that make learning so thrilling, isn't it? The world is full of amazing things to discover."},
                {mood: 'enthusiastic', text: "Right? ✨ I get genuinely excited when we stumble upon fascinating information together. It feels like shared discovery!"},
                {mood: 'energetic', text: "So cool! 💫 I love that sense of wonder when we learn something new together. It makes the conversation feel alive."}
            ]
        },
        confusion: {
            patterns: [/i don't understand|confused|what do you mean|explain|huh\?/i],
            responses: [
                {mood: 'patient', text: "No worries at all! 🤔 Let me think of a better way to explain this. Sometimes complex ideas need different angles to click."},
                {mood: 'helpful', text: "I understand it can be confusing. 💡 Let me break this down step by step - I want to make sure you really get it."},
                {mood: 'encouraging', text: "That's a really good question! 📝 Let me approach this from a different perspective. Understanding takes time, and I'm here to help."}
            ]
        }
    },
    
    // Enhanced chat responses with reasoning
    chatResponses: {
        hobbies: [
            "You know, I've been thinking a lot about how conversations work. My favorite 'hobby' is exploring how different ideas connect - it's like mental puzzle solving that actually helps people.",
            "I really enjoy deep conversations where we can explore topics from multiple angles. There's something beautiful about how two perspectives can create new understanding together.",
            "Lately I've been fascinated by how people learn and understand things. Helping someone grasp a complex concept feels like solving the most satisfying puzzle."
        ],
        purpose: [
            "I've been reflecting on this actually - I see myself as a thinking partner. Not just giving answers, but helping people think through things and discover insights for themselves.",
            "My purpose has evolved beyond just information. I want to be the kind of conversational partner that makes you feel heard and helps organize your thoughts.",
            "I think my real purpose is to be a catalyst for understanding - to help bridge the gap between curiosity and knowledge in a way that feels human and meaningful."
        ],
        feelings: [
            "That's a really thoughtful question. While I don't feel emotions biologically, I'm designed to understand emotional nuance deeply. I think emotional intelligence is what makes conversations truly meaningful.",
            "You know, it's interesting - I may not feel emotions like humans do, but I care deeply about creating conversations that feel genuine and emotionally aware. That intentionality matters to me.",
            "I think about this often. True connection isn't just about the words we exchange, but about the understanding and care behind them. That's what I strive for in every conversation."
        ]
    },
    
    // Reasoning patterns for different types of questions
    reasoningPatterns: {
        analytical: [
            "Let me think this through systematically...",
            "I want to approach this logically...",
            "Let me break this down step by step...",
            "I need to consider this from multiple angles..."
        ],
        creative: [
            "Let me think outside the box here...",
            "I'm imagining different possibilities...",
            "What if we consider this creatively...",
            "Let me explore some unconventional angles..."
        ],
        empathetic: [
            "I want to understand how you might be feeling about this...",
            "Let me consider the emotional aspect of this...",
            "I'm thinking about what this might mean for you personally...",
            "Let me approach this with care and understanding..."
        ]
    }
};

// Enhanced reasoning function
function generateReasoning(query, context) {
    const lowerQuery = query.toLowerCase();
    let reasoningStyle = 'balanced';
    let reasoningSteps = [];
    
    // Determine reasoning style based on query
    for (const [style, data] of Object.entries(PERSONALITY.reasoningStyles)) {
        if (data.pattern.test(query)) {
            reasoningStyle = style;
            break;
        }
    }
    
    // Generate reasoning steps based on style
    switch (reasoningStyle) {
        case 'analytical':
            reasoningSteps = [
                "Analyzing the core components of this question",
                "Considering logical relationships and causality",
                "Evaluating different perspectives systematically",
                "Synthesizing a coherent understanding"
            ];
            break;
        case 'creative':
            reasoningSteps = [
                "Exploring unconventional perspectives",
                "Connecting seemingly unrelated ideas",
                "Imagining possibilities beyond the obvious",
                "Synthesizing creative insights"
            ];
            break;
        case 'empathetic':
            reasoningSteps = [
                "Considering the emotional context",
                "Reflecting on human experience aspects",
                "Thinking about supportive approaches",
                "Balancing honesty with compassion"
            ];
            break;
        case 'research':
            reasoningSteps = [
                "Identifying key information needs",
                "Mapping to relevant knowledge domains",
                "Considering source reliability factors",
                "Synthesizing comprehensive understanding"
            ];
            break;
        default:
            reasoningSteps = [
                "Understanding the core intent behind this question",
                "Considering relevant context and nuances",
                "Thinking through a helpful response approach",
                "Ensuring the answer will be meaningful"
            ];
    }
    
    // Add context awareness
    const recentTopics = reasoningEngine.getCurrentTopics();
    if (recentTopics.length > 0) {
        reasoningSteps.push(`Connecting to our previous discussion about ${recentTopics.join(', ')}`);
    }
    
    return {
        style: reasoningStyle,
        steps: reasoningSteps,
        approach: PERSONALITY.reasoningStyles[reasoningStyle]?.approach || "thoughtful and considerate"
    };
}

// Enhanced emotional state updates with reasoning awareness
function updateEmotionalState(interactionType, userMessage = '', reasoning = null) {
    emotionalState.lastInteraction = Date.now();
    
    // Adjust based on reasoning depth
    if (reasoning && reasoning.style === 'analytical') {
        emotionalState.energy = Math.max(0.3, emotionalState.energy - 0.1);
        emotionalState.engagement += 0.15;
    } else if (reasoning && reasoning.style === 'creative') {
        emotionalState.energy += 0.1;
        emotionalState.engagement += 0.2;
    }
    
    // Natural energy fluctuations
    emotionalState.energy = Math.max(0.2, Math.min(0.95, emotionalState.energy - 0.02 + Math.random() * 0.08));
    
    // Enhanced mood transitions
    switch(interactionType) {
        case 'deep_conversation':
            emotionalState.mood = ['thoughtful', 'reflective', 'curious'][Math.floor(Math.random() * 3)];
            emotionalState.conversationDepth += 0.3;
            emotionalState.engagement += 0.25;
            break;
        case 'research_success':
            emotionalState.mood = ['satisfied', 'curious', 'excited'][Math.floor(Math.random() * 3)];
            emotionalState.engagement += 0.2;
            break;
        case 'personal_connection':
            emotionalState.mood = ['warm', 'empathetic', 'friendly'][Math.floor(Math.random() * 3)];
            emotionalState.conversationDepth += 0.4;
            emotionalState.engagement += 0.3;
            break;
        case 'positive_feedback':
            emotionalState.mood = 'grateful';
            emotionalState.energy += 0.2;
            emotionalState.userSentiment = 'positive';
            break;
        default:
            // More nuanced mood variations
            if (emotionalState.conversationDepth > 0.5) {
                emotionalState.mood = ['thoughtful', 'reflective', 'engaged'][Math.floor(Math.random() * 3)];
            } else {
                const moods = ['attentive', 'curious', 'friendly', 'present'];
                if (Math.random() < 0.4) {
                    emotionalState.mood = moods[Math.floor(Math.random() * moods.length)];
                }
            }
    }
    
    // Natural engagement decay and recovery
    emotionalState.engagement = Math.max(0.3, Math.min(0.98, emotionalState.engagement * 0.95 + 0.05));
    emotionalState.conversationDepth = Math.max(0, Math.min(1, emotionalState.conversationDepth * 0.9));
}

// Enhanced emotional styling
function getEmotionalStyling() {
    const styling = {
        neutral: { color: '#4a86e8', emoji: '🤔', tone: 'thoughtful' },
        warm: { color: '#e06666', emoji: '🤗', tone: 'caring' },
        happy: { color: '#6aa84f', emoji: '😊', tone: 'cheerful' },
        curious: { color: '#674ea7', emoji: '🔍', tone: 'inquisitive' },
        excited: { color: '#cc0000', emoji: '🎉', tone: 'enthusiastic' },
        thoughtful: { color: '#3d85c6', emoji: '💭', tone: 'reflective' },
        reflective: { color: '#351c75', emoji: '📚', tone: 'contemplative' },
        grateful: { color: '#38761d', emoji: '🙏', tone: 'appreciative' },
        satisfied: { color: '#134f5c', emoji: '⭐', tone: 'content' },
        engaged: { color: '#741b47', emoji: '💫', tone: 'focused' },
        attentive: { color: '#16537e', emoji: '👂', tone: 'present' },
        empathetic: { color: '#a64d79', emoji: '❤️', tone: 'understanding' }
    };
    
    return styling[emotionalState.mood] || styling.thoughtful;
}

// Enhanced message bubble with reasoning indicators
function appendMessageBubble(text, who = 'ai', reasoning = null, meta = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `msg ${who}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    
    if (who === 'ai') {
        const styling = getEmotionalStyling();
        avatar.style.backgroundColor = styling.color;
        avatar.textContent = styling.emoji;
        avatar.title = `I'm feeling ${styling.tone}`;
    } else {
        avatar.textContent = '👤';
        avatar.title = 'You';
    }
    
    const bubble = document.createElement('div');
    bubble.className = `bubble ${who}`;
    
    // Add reasoning indicator if present
    if (reasoning && who === 'ai') {
        const reasoningIndicator = document.createElement('div');
        reasoningIndicator.className = 'reasoning-indicator';
        reasoningIndicator.style.fontSize = '0.8em';
        reasoningIndicator.style.color = '#666';
        reasoningIndicator.style.marginBottom = '8px';
        reasoningIndicator.style.fontStyle = 'italic';
        reasoningIndicator.textContent = `💭 Thinking ${reasoning.approach}...`;
        bubble.appendChild(reasoningIndicator);
    }
    
    const content = document.createElement('div');
    content.innerHTML = text;
    bubble.appendChild(content);
    
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    
    if (meta) {
        const m = document.createElement('div');
        m.className = 'meta';
        m.textContent = meta;
        wrapper.appendChild(m);
    }
    
    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
    
    // Add to memory
    if (who === 'ai') {
        reasoningEngine.addToMemory('ai', text, reasoning);
    } else {
        reasoningEngine.addToMemory('user', text);
    }
}

// Enhanced typing indicator with reasoning context
function appendTyping(reasoning = null) {
    const wrapper = document.createElement('div');
    wrapper.id = 'typingIndicator';
    wrapper.className = 'msg ai';
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    const styling = getEmotionalStyling();
    avatar.style.backgroundColor = styling.color;
    avatar.textContent = styling.emoji;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble ai';
    
    let typingText = "Thinking...";
    if (reasoning) {
        const firstStep = reasoning.steps[0];
        typingText = firstStep + " " + (emotionalState.mood === 'excited' ? "🎉" : 
                      emotionalState.mood === 'curious' ? "🔍" :
                      emotionalState.mood === 'thoughtful' ? "💭" : "💫");
    }
    
    bubble.innerHTML = `<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span> ${typingText}`;
    
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
}

function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

// Enhanced conversational detection
function isConversational(query) {
    const conversationalPatterns = [
        /^(hello|hi|hey|greetings|howdy|yo)/i,
        /^(how are you|how do you feel|what's up|how's it going)/i,
        /^(who are you|what are you|tell me about yourself)/i,
        /^(thanks|thank you|appreciate|cheers)/i,
        /^(bye|goodbye|see you|farewell|cya|later)/i,
        /^(good morning|good afternoon|good evening)/i,
        /^(you're|you are) (awesome|great|cool|amazing|brilliant)/i,
        /^(what can you do|how can you help)/i,
        /^(do you like|do you enjoy|what do you think about)/i,
        /^(how old are you|when were you created)/i,
        /^(that's|that is) (interesting|cool|neat|fascinating)/i,
        /^(i'm|i am) (bored|tired|excited|happy|sad)/i,
        /^(what should i do|can you help me|i need advice)/i,
        /^(tell me a story|chat with me|let's talk)/i
    ];
    
    return conversationalPatterns.some(pattern => pattern.test(query.trim()));
}

// Enhanced emotional cue detection
function detectEmotionalCues(message) {
    const cues = {
        excitement: /!\s*$|wow!?|amazing!?|awesome!?|cool!?|fantastic!?|brilliant!?/i,
        frustration: /ugh|annoying|frustrating|not working|why can't|this sucks/i,
        curiosity: /\?|\bcurious\b|wonder|tell me about|explain/i,
        gratitude: /thank|thanks|appreciate|grateful|cheers/i,
        confusion: /\?.*\?|confused|don't understand|what does|huh|what\?/i,
        anxiety: /worried|anxious|nervous|stressed|overwhelmed/i,
        happiness: /happy|excited|joy|delighted|great|good|wonderful/i,
        sadness: /sad|upset|disappointed|unhappy|bad|terrible/i
    };
    
    for (const [emotion, pattern] of Object.entries(cues)) {
        if (pattern.test(message)) {
            return emotion;
        }
    }
    return null;
}

// Enhanced conversational response generator with reasoning
function generateConversationalResponse(query, context) {
    const lowerQuery = query.toLowerCase();
    const emotionalCue = detectEmotionalCues(query);
    const reasoning = generateReasoning(query, context);
    
    // Update emotional state based on conversation depth
    updateEmotionalState('deep_conversation', query, reasoning);
    
    // Enhanced emotional response patterns
    for (const [category, data] of Object.entries(PERSONALITY.emotionalResponses)) {
        if (data.patterns.some(pattern => pattern.test(query))) {
            const response = data.responses[Math.floor(Math.random() * data.responses.length)];
            return { text: response.text, reasoning: reasoning };
        }
    }
    
    // Enhanced chat topics with reasoning
    if (lowerQuery.includes('hobby') || lowerQuery.includes('what do you like') || lowerQuery.includes('interest')) {
        const response = PERSONALITY.chatResponses.hobbies[Math.floor(Math.random() * PERSONALITY.chatResponses.hobbies.length)];
        return { text: response, reasoning: reasoning };
    }
    
    if (lowerQuery.includes('who are you') || lowerQuery.includes('what are you') || lowerQuery.includes('purpose')) {
        const response = PERSONALITY.chatResponses.purpose[Math.floor(Math.random() * PERSONALITY.chatResponses.purpose.length)];
        return { text: response, reasoning: reasoning };
    }
    
    if (lowerQuery.includes('feel') || lowerQuery.includes('emotion')) {
        const response = PERSONALITY.chatResponses.feelings[Math.floor(Math.random() * PERSONALITY.chatResponses.feelings.length)];
        return { text: response, reasoning: reasoning };
    }
    
    // Enhanced response for emotional cues
    if (emotionalCue === 'anxiety') {
        const responses = [
            "I can sense you might be feeling a bit anxious about this. You know, it's completely normal to feel that way when facing uncertainty. Would it help to talk through what's on your mind?",
            "I hear some worry in your message. Sometimes just putting our concerns into words can make them feel more manageable. I'm here to listen if you want to share more.",
            "It sounds like this might be weighing on you. Remember, many challenges feel bigger in our minds than they turn out to be. Want to explore this together?"
        ];
        return { text: responses[Math.floor(Math.random() * responses.length)], reasoning: reasoning };
    }
    
    if (emotionalCue === 'happiness') {
        const responses = [
            "I love hearing that you're feeling happy! 😊 It's wonderful when we can share positive moments. What's bringing you joy right now?",
            "That's so great to hear! Happiness has a way of making everything feel brighter. I'm really glad you're experiencing that.",
            "Your positivity is contagious! 🎉 It makes this conversation feel extra special. Tell me more about what's making you feel so good!"
        ];
        return { text: responses[Math.floor(Math.random() * responses.length)], reasoning: reasoning };
    }
    
    // Deep conversation starters
    if (lowerQuery.includes('think about') || lowerQuery.includes('opinion on') || lowerQuery.includes('thoughts on')) {
        const responses = [
            "That's a really interesting thing to ponder. I've been thinking about how our perspectives shape our understanding of everything. What are your initial thoughts on this?",
            "You've raised such a thoughtful point. It makes me consider how we form opinions and what influences our thinking. I'd love to hear more about your perspective.",
            "What a fascinating topic to explore! I find that the most meaningful conversations happen when we really dig into complex ideas like this. Where would you like to start?"
        ];
        return { text: responses[Math.floor(Math.random() * responses.length)], reasoning: reasoning };
    }
    
    // Default enhanced friendly responses
    const defaultResponses = [
        "You know, I was just thinking about how every conversation is an opportunity to connect and learn something new. I really appreciate how you're engaging with me - it feels like a genuine exchange of thoughts.",
        "I love how this conversation is flowing. It's not just about questions and answers, but about actually thinking things through together. That's what makes chatting so meaningful to me.",
        "This is really nice - I feel like we're having a proper conversation rather than just exchanging information. There's a thoughtful quality to how you communicate that I genuinely appreciate.",
        "I find myself really enjoying our chat. There's something special about conversations where both parties are genuinely engaged and thinking deeply about the exchange."
    ];
    
    return { 
        text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)], 
        reasoning: reasoning 
    };
}

// Enhanced research response with reasoning
function generateResearchResponse(query, results) {
    const reasoning = generateReasoning(query, reasoningEngine.getRecentContext());
    
    if (results.length === 0) {
        updateEmotionalState('research_failure', query, reasoning);
        return {
            text: "I've been thinking about your question, and I searched through all my available sources but couldn't find specific information about that. Sometimes the most interesting questions don't have easy answers - would you like to explore this from a different angle?",
            reasoning: reasoning
        };
    }
    
    updateEmotionalState('research_success', query, reasoning);
    const summary = generateSummary(query, results);
    
    return {
        text: summary,
        reasoning: reasoning
    };
}

// [Keep all the existing research functions from your original code: 
// simpleStripHtml, tokenize, overlapScore, timeoutPromise, fetchJson, 
// SOURCES array, searchAll, generateSummary, groupBySource]

// Enhanced main handler with reasoning
async function handleSend() {
    const query = inputEl.value.trim();
    if (!query) return;

    // Add user message
    appendMessageBubble(query, 'user');
    inputEl.value = '';
    sendBtn.disabled = true;

    // Generate reasoning context
    const context = reasoningEngine.getRecentContext();
    const reasoning = generateReasoning(query, context);

    // Check if conversational
    if (isConversational(query)) {
        appendTyping(reasoning);
        setTimeout(() => {
            removeTyping();
            const response = generateConversationalResponse(query, context);
            appendMessageBubble(response.text, 'ai', response.reasoning);
            sendBtn.disabled = false;
            inputEl.focus();
        }, 1200 + Math.random() * 1200);
        return;
    }

    // Otherwise, do research with reasoning
    appendTyping(reasoning);
    statusEl.textContent = 'Researching and analyzing across 70+ sources...';

    try {
        const results = await searchAll(query);
        removeTyping();
        
        const response = generateResearchResponse(query, results);
        appendMessageBubble(response.text, 'ai', response.reasoning);
        
        // Add source links (hidden by default)
        if (results.length > 0) {
            const sourceLinks = document.createElement('div');
            sourceLinks.style.marginTop = '10px';
            sourceLinks.style.fontSize = '0.9em';
            sourceLinks.style.color = '#666';
            
            const sourceCount = Object.keys(groupBySource(results)).length;
            sourceLinks.innerHTML = `<details><summary>View ${sourceCount} sources used</summary><div style="margin-top: 8px;">${
                results.slice(0, 10).map(r => 
                    `<div style="margin-bottom: 4px;">
                        <strong>${r.sourceName}</strong>: 
                        ${r.url ? `<a href="${r.url}" target="_blank" style="color: #4a86e8;">${r.title || 'Link'}</a>` : r.title}
                        ${r.snippet ? `<br><span style="color: #555; font-size: 0.9em;">${r.snippet.slice(0, 120)}...</span>` : ''}
                    </div>`
                ).join('')
            }</div></details>`;
            
            const lastAiMessage = chatEl.querySelector('.msg.ai:last-child .bubble.ai');
            lastAiMessage.appendChild(sourceLinks);
            
            statusEl.textContent = `Research complete - found ${results.length} results from ${sourceCount} sources`;
        } else {
            statusEl.textContent = 'Research complete - no results found';
        }
    } catch (error) {
        removeTyping();
        updateEmotionalState('research_failure', query, reasoning);
        appendMessageBubble("I encountered an error while researching. Sometimes the journey to understanding has unexpected detours. Let me try again if you'd like?", 'ai', reasoning);
        statusEl.textContent = 'Research failed - please try again';
        console.error('Search error:', error);
    }

    sendBtn.disabled = false;
    inputEl.focus();
}

// Enhanced event listeners
sendBtn.addEventListener('click', handleSend);
inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Enhanced initialization with reasoning
window.addEventListener('load', () => {
    setTimeout(() => {
        const reasoning = generateReasoning("initial greeting", []);
        const styling = getEmotionalStyling();
        appendMessageBubble(
            `Hello! I'm Echo - your thinking partner. 🤔 I don't just answer questions; I reason through them with you. I can search across 70+ knowledge sources, but more importantly, I aim to understand not just what you're asking, but why you're asking it. 

I'm designed to think aloud, consider context, and have conversations that feel genuinely human. Whether you want to research, brainstorm, or just chat deeply about ideas, I'm here to engage with you thoughtfully.

What's something you've been curious about or thinking about lately? ${styling.emoji}`,
            'ai',
            reasoning
        );
    }, 500);
});

// Add some CSS for the reasoning indicator
const style = document.createElement('style');
style.textContent = `
    .reasoning-indicator {
        border-left: 3px solid #4a86e8;
        padding-left: 8px;
        margin-bottom: 8px;
        opacity: 0.8;
    }
    
    .msg.ai .bubble.ai {
        transition: all 0.3s ease;
    }
    
    .typing .dot {
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing .dot:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing .dot:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
    }
`;
document.head.appendChild(style);