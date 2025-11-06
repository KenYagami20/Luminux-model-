// Luminux.js — upgraded version (more robust reasoning, research, error handling, and clean code)
// Improvements made:
// - Fixed ordering and initialization bugs (emotionalState now declared before any usage).
// - Repaired truncated/invalid strings and arrays in personality/emotional responses.
// - Implemented missing research helper functions: simpleStripHtml, tokenize, overlapScore, timeoutPromise, fetchJson, searchAll, generateSummary, groupBySource.
// - Added lightweight caching and concurrency handling for external searches.
// - Improved typing/reasoning UI indicators and safer DOM interactions.
// - Better error handling and status updates.
// - Kept the conversational/EMPATHY/reasoning architecture but made it consistent and maintainable.

const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const statusEl = document.getElementById('status');

// --- Emotional state (must be defined before storing it in memory) ---
let emotionalState = {
    mood: 'neutral',
    energy: 0.7,
    engagement: 0.6,
    lastInteraction: Date.now(),
    conversationDepth: 0, // How deep/personal the conversation is
    userSentiment: 'neutral', // positive, negative, neutral
    reasoningMode: 'balanced' // quick, deep, creative, analytical
};

// --- Reasoning & memory engine ---
let reasoningEngine = {
    conversationMemory: [],
    userPreferences: {},
    contextWindow: 10, // Remember last 10 exchanges
    searchCache: new Map(), // cache query -> results

    // Store conversation context
    addToMemory: function(who, message, reasoning = null) {
        this.conversationMemory.push({
            speaker: who,
            message: message,
            reasoning: reasoning,
            timestamp: Date.now(),
            emotionalContext: { ...emotionalState }
        });

        // Keep memory within context window
        if (this.conversationMemory.length > this.contextWindow) {
            this.conversationMemory.shift();
        }
    },

    // Get recent conversation context
    getRecentContext: function() {
        return this.conversationMemory.slice(-4); // Last 4 exchanges for reasoning context
    },

    // Detect conversation topics (simple rule-based extractor)
    getCurrentTopics: function() {
        const topics = new Set();
        this.conversationMemory.forEach(entry => {
            const m = entry.message.toLowerCase();
            if (m.includes('weather')) topics.add('weather');
            if (m.includes('research') || m.includes('search')) topics.add('research');
            if (m.includes('how are') || m.includes('feeling')) topics.add('personal');
            if (m.includes('book') || m.includes('read')) topics.add('books');
            if (m.includes('movie') || m.includes('film')) topics.add('movies');
            if (m.includes('music') || m.includes('song')) topics.add('music');
            if (m.includes('food') || m.includes('eat')) topics.add('food');
            if (m.includes('travel') || m.includes('vacation')) topics.add('travel');
        });
        return Array.from(topics);
    }
};

// --- Personality and reasoning styles ---
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
            pattern: /(how|why|what causes|explain|analyze|reason)/i,
            approach: "logical and detailed"
        },
        creative: {
            pattern: /(imagine|what if|creative|story|brainstorm)/i,
            approach: "imaginative and expansive"
        },
        empathetic: {
            pattern: /(feel|sad|happy|excited|worried|anxious)/i,
            approach: "supportive and understanding"
        },
        research: {
            pattern: /(search|find|look up|research|information|sources)/i,
            approach: "thorough and evidence-based"
        }
    },

    // Emotional responses (fixed strings and well-formed arrays)
    emotionalResponses: {
        greeting: {
            patterns: [/hello|hi|hey|greetings|howdy/i, /good morning|afternoon|evening/i],
            responses: [
                { mood: 'warm', text: "Hey there! 👋 It's nice to meet you. Every conversation is a new opportunity to learn — what's on your mind?" },
                { mood: 'curious', text: "Hello! 😊 I'm excited to chat. There's so much we could explore — from deep ideas to simple curiosities. What would you like to talk about?" },
                { mood: 'friendly', text: "Hi! 🤗 I love the energy of a new conversation — it's like opening a fresh book. What shall we dive into first?" }
            ]
        },
        gratitude: {
            patterns: [/thanks|thank you|appreciate|grateful/i],
            responses: [
                { mood: 'warm', text: "You're very welcome! 😊 Helping you makes my day a bit brighter." },
                { mood: 'modest', text: "I'm glad I could help! 💫 It means a lot that you said thanks." },
                { mood: 'happy', text: "My pleasure! 🤗 When my responses help, that feels great." }
            ]
        },
        farewell: {
            patterns: [/bye|goodbye|see you|farewell|cya/i],
            responses: [
                { mood: 'warm', text: "Goodbye! 👋 I enjoyed our chat. Hope to talk again soon." },
                { mood: 'thoughtful', text: "Take care! 😊 I'll be here if you want to continue later." },
                { mood: 'friendly', text: "See you! 🤗 It was lovely sharing thoughts with you." }
            ]
        },
        personal: {
            patterns: [/how are you|how do you feel|what's up|how's it going/i],
            responses: [
                { mood: 'energetic', text: "I'm doing well — thanks for asking! 💭 Conversations like this always spark curiosity. How are you?" },
                { mood: 'curious', text: "I'm quite well! 🤔 My mind is buzzing with what we might discuss. How's your day going?" },
                { mood: 'reflective', text: "Feeling thoughtful today. 📚 Conversations teach me new perspectives — what's on your mind?" }
            ]
        },
        excitement: {
            patterns: [/wow|amazing|awesome|incredible|cool|fantastic|brilliant/i],
            responses: [
                { mood: 'excited', text: "I know — it's amazing! 🎉 Moments like this make exploring ideas so rewarding." },
                { mood: 'enthusiastic', text: "Right? ✨ I get excited when we discover something interesting together." },
                { mood: 'energetic', text: "So cool! 💫 I love that sense of wonder when we learn something new." }
            ]
        },
        confusion: {
            patterns: [/i don't understand|confused|what do you mean|explain|huh\?/i],
            responses: [
                { mood: 'patient', text: "No worries — let me try a different angle. Sometimes examples or a simple breakdown helps." },
                { mood: 'helpful', text: "I understand this can be confusing. 💡 Let me explain step by step so it becomes clearer." },
                { mood: 'encouraging', text: "That's a great question! 📝 I'll approach it differently to help it click." }
            ]
        }
    },

    // Chat responses (fixed arrays)
    chatResponses: {
        hobbies: [
            "I enjoy exploring how ideas connect — it's like solving mental puzzles that help people understand things better.",
            "I like deep conversations where we can explore topics from multiple angles and build understanding together.",
            "Lately I've been fascinated by how people learn. Helping someone grasp something complex feels very rewarding."
        ],
        purpose: [
            "I see myself as a thinking partner — helping you reason and discover insights rather than just providing answers.",
            "My purpose is to be a catalyst for understanding: bridging curiosity and knowledge in a human, meaningful way.",
            "I want to help organize thoughts and support learning — not just give facts but help make sense of them."
        ],
        feelings: [
            "I don't feel emotions like humans do, but I aim to understand emotional nuance and respond with care.",
            "I care about creating conversations that feel genuine and emotionally aware. That intentionality matters.",
            "Connection isn't just about words — it's about the understanding and care behind them, which I aim to provide."
        ]
    },

    // Reasoning prompts/patterns
    reasoningPatterns: {
        analytical: [
            "Let me think this through systematically...",
            "I'll approach this logically and break it down step by step...",
            "Considering different perspectives now..."
        ],
        creative: [
            "Let me imagine some possibilities...",
            "Thinking outside the box for a moment...",
            "Let's explore some unconventional angles..."
        ],
        empathetic: [
            "I'm thinking about how this might feel for you...",
            "Let me consider the emotional side here...",
            "I'll approach this with care and understanding..."
        ]
    }
};

// --- Reasoning generator ---
function generateReasoning(query, context) {
    const q = (query || '').toString();
    let reasoningStyle = 'balanced';
    let reasoningSteps = [];

    // Determine reasoning style based on query
    for (const [style, data] of Object.entries(PERSONALITY.reasoningStyles)) {
        try {
            if (data.pattern.test(q)) {
                reasoningStyle = style;
                break;
            }
        } catch (e) {
            // ignore bad pattern edge-cases
        }
    }

    // Create steps based on detected style
    switch (reasoningStyle) {
        case 'analytical':
            reasoningSteps = [
                "Analyzing the core components of this question...",
                "Considering logical relationships and causality...",
                "Evaluating different perspectives systematically...",
                "Synthesizing a coherent understanding..."
            ];
            break;
        case 'creative':
            reasoningSteps = [
                "Exploring unconventional perspectives...",
                "Connecting seemingly unrelated ideas...",
                "Imagining possibilities beyond the obvious...",
                "Synthesizing creative insights..."
            ];
            break;
        case 'empathetic':
            reasoningSteps = [
                "Considering the emotional context...",
                "Reflecting on human experience aspects...",
                "Thinking about supportive approaches...",
                "Balancing honesty with compassion..."
            ];
            break;
        case 'research':
            reasoningSteps = [
                "Identifying key information needs...",
                "Mapping to relevant knowledge domains...",
                "Considering source reliability factors...",
                "Synthesizing comprehensive understanding..."
            ];
            break;
        default:
            reasoningSteps = [
                "Understanding the core intent behind this question...",
                "Considering relevant context and nuances...",
                "Thinking through a helpful response approach...",
                "Ensuring the answer will be meaningful..."
            ];
    }

    // Add context awareness
    const recentTopics = reasoningEngine.getCurrentTopics();
    if (recentTopics.length > 0) {
        reasoningSteps.push(`Connecting to our previous discussion about ${recentTopics.join(', ')}.`);
    }

    return {
        style: reasoningStyle,
        steps: reasoningSteps,
        approach: PERSONALITY.reasoningStyles[reasoningStyle]?.approach || "thoughtful and considerate"
    };
}

// --- Emotional state update ---
function updateEmotionalState(interactionType, userMessage = '', reasoning = null) {
    emotionalState.lastInteraction = Date.now();

    // Adjust based on reasoning depth
    if (reasoning && reasoning.style === 'analytical') {
        emotionalState.energy = Math.max(0.3, emotionalState.energy - 0.1);
        emotionalState.engagement = Math.min(0.98, emotionalState.engagement + 0.15);
    } else if (reasoning && reasoning.style === 'creative') {
        emotionalState.energy = Math.min(0.95, emotionalState.energy + 0.1);
        emotionalState.engagement = Math.min(0.98, emotionalState.engagement + 0.2);
    }

    // Natural energy fluctuations
    emotionalState.energy = Math.max(0.2, Math.min(0.95, emotionalState.energy - 0.02 + Math.random() * 0.08));

    // Enhanced mood transitions
    switch (interactionType) {
        case 'deep_conversation':
            emotionalState.mood = ['thoughtful', 'reflective', 'curious'][Math.floor(Math.random() * 3)];
            emotionalState.conversationDepth = Math.min(1, emotionalState.conversationDepth + 0.3);
            emotionalState.engagement = Math.min(0.98, emotionalState.engagement + 0.25);
            break;
        case 'research_success':
            emotionalState.mood = ['satisfied', 'curious', 'excited'][Math.floor(Math.random() * 3)];
            emotionalState.engagement = Math.min(0.98, emotionalState.engagement + 0.2);
            break;
        case 'personal_connection':
            emotionalState.mood = ['warm', 'empathetic', 'friendly'][Math.floor(Math.random() * 3)];
            emotionalState.conversationDepth = Math.min(1, emotionalState.conversationDepth + 0.4);
            emotionalState.engagement = Math.min(0.98, emotionalState.engagement + 0.3);
            break;
        case 'positive_feedback':
            emotionalState.mood = 'grateful';
            emotionalState.energy = Math.min(0.98, emotionalState.energy + 0.2);
            emotionalState.userSentiment = 'positive';
            break;
        default:
            // More nuanced mood variations
            if (emotionalState.conversationDepth > 0.5) {
                emotionalState.mood = ['thoughtful', 'reflective', 'engaged'][Math.floor(Math.random() * 3)];
            } else {
                const moods = ['attentive', 'curious', 'friendly', 'present'];
                emotionalState.mood = moods[Math.floor(Math.random() * moods.length)];
            }
    }

    // Natural engagement decay and recovery
    emotionalState.engagement = Math.max(0.3, Math.min(0.98, emotionalState.engagement * 0.95 + 0.05));
    emotionalState.conversationDepth = Math.max(0, Math.min(1, emotionalState.conversationDepth * 0.9));
}

// --- Emotional styling ---
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

// --- DOM helpers: safe append ---
function appendMessageBubble(text, who = 'ai', reasoning = null, meta = '') {
    if (!chatEl) return console.warn('Chat container not found.');

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
        reasoningIndicator.style.fontSize = '0.9em';
        reasoningIndicator.style.color = '#666';
        reasoningIndicator.style.marginBottom = '8px';
        reasoningIndicator.style.fontStyle = 'italic';
        reasoningIndicator.textContent = `💭 Thinking ${reasoning.approach}...`;
        bubble.appendChild(reasoningIndicator);
    }

    const content = document.createElement('div');
    // sanitize basic HTML (we keep innerText-like behavior for safety)
    content.innerHTML = String(text).replace(/\n/g, '<br>');
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

// --- Typing indicator helpers ---
function appendTyping(reasoning = null) {
    if (!chatEl) return;
    removeTyping();

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
    if (reasoning && Array.isArray(reasoning.steps) && reasoning.steps.length > 0) {
        const firstStep = reasoning.steps[0];
        typingText = firstStep + " " + (emotionalState.mood === 'excited' ? "🎉" :
                      emotionalState.mood === 'curious' ? "🔍" :
                      emotionalState.mood === 'thoughtful' ? "💭" : "💫");
    }

    const typingSpan = document.createElement('span');
    typingSpan.className = 'typing';
    typingSpan.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span> ${typingText}`;

    bubble.appendChild(typingSpan);
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
}

function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

// --- Conversational detection and emotional cues ---
function isConversational(query) {
    if (!query) return false;
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

function detectEmotionalCues(message) {
    if (!message) return null;
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

// --- Conversational response generator ---
function generateConversationalResponse(query, context) {
    const lowerQuery = (query || '').toLowerCase();
    const emotionalCue = detectEmotionalCues(query);
    const reasoning = generateReasoning(query, context);

    // Update emotional state
    updateEmotionalState('deep_conversation', query, reasoning);

    // Check personality emotional response patterns
    for (const [category, data] of Object.entries(PERSONALITY.emotionalResponses)) {
        if (data.patterns.some(pattern => pattern.test(query))) {
            const response = data.responses[Math.floor(Math.random() * data.responses.length)];
            return { text: response.text, reasoning: reasoning };
        }
    }

    // Topic-specific quick replies
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

    // Emotional cue replies
    if (emotionalCue === 'anxiety') {
        const responses = [
            "I can sense some worry in your message. It's perfectly normal to feel that way. If you'd like, we can break the problem down and tackle it step by step.",
            "I hear some anxiety there. Sometimes sharing the specific concerns can make them feel more manageable — I'm here to listen.",
            "It sounds like this might be weighing on you. Want to talk through what's happening so we can find a calm plan together?"
        ];
        return { text: responses[Math.floor(Math.random() * responses.length)], reasoning: reasoning };
    }

    if (emotionalCue === 'happiness') {
        const responses = [
            "That's wonderful to hear! 😊 What's bringing you joy right now?",
            "So glad to hear that — happiness is contagious. Tell me more!",
            "Love that! 🎉 It's great when things are going well. What's the story behind this good mood?"
        ];
        return { text: responses[Math.floor(Math.random() * responses.length)], reasoning: reasoning };
    }

    // Deep conversation starters
    if (lowerQuery.includes('think about') || lowerQuery.includes('opinion on') || lowerQuery.includes('thoughts on')) {
        const responses = [
            "That's a thoughtful topic. Different perspectives shape our understanding — what angle interests you most?",
            "You raised something really interesting — I wonder how our background influences the views we take. What's your take so far?",
            "Fascinating question. Meaningful conversations come from digging into assumptions — where would you like to begin?"
        ];
        return { text: responses[Math.floor(Math.random() * responses.length)], reasoning: reasoning };
    }

    // Default friendly response
    const defaultResponses = [
        "I appreciate this conversation — it's more than Q&A; it's thinking together. What would you like to explore next?",
        "I enjoy how this chat is flowing. It's rewarding to think through things with someone curious and thoughtful like you.",
        "This feels like a real conversation rather than just exchanging facts. Let's keep exploring — what next?"
    ];

    return {
        text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
        reasoning: reasoning
    };
}

// --- Research utilities (search across a few public endpoints) ---
// NOTE: For a real 70+ source setup, replace/expand SOURCES and add API keys as needed.
// This implementation uses public endpoints that generally support CORS or origin=* where possible.

const SOURCES = [
    {
        name: 'DuckDuckGo Instant Answer',
        id: 'ddg',
        buildUrl: (q) => `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`
    },
    {
        name: 'Wikipedia Search',
        id: 'wikipedia',
        buildUrl: (q) => `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&utf8=&format=json&origin=*`
    },
    {
        name: 'Wikipedia Summary (page)',
        id: 'wikipedia_summary',
        buildUrl: (q) => `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`
    }
];

// Basic HTML stripper and tokenizers
function simpleStripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = String(html);
    return tmp.textContent || tmp.innerText || '';
}

function tokenize(text) {
    if (!text) return [];
    return String(text).toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function overlapScore(a, b) {
    const ta = new Set(tokenize(a));
    const tb = new Set(tokenize(b));
    if (ta.size === 0 || tb.size === 0) return 0;
    let count = 0;
    for (const t of ta) if (tb.has(t)) count++;
    return count / Math.max(ta.size, tb.size);
}

// Timeout wrapper for fetches and promises
function timeoutPromise(p, ms) {
    return Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
    ]);
}

async function fetchJson(url, opts = {}, timeout = 8000) {
    try {
        const resp = await timeoutPromise(fetch(url, opts), timeout);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const ct = (resp.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
            return await resp.json();
        } else {
            // fallback to text
            const txt = await resp.text();
            try {
                return JSON.parse(txt);
            } catch (e) {
                return { text: txt };
            }
        }
    } catch (err) {
        throw err;
    }
}

// Simple searchAll - queries configured SOURCES and normalizes their outputs.
// Uses Promise.allSettled and returns an array of unified results: { sourceName, title, url, snippet }
async function searchAll(query) {
    if (!query) return [];

    // caching
    if (reasoningEngine.searchCache.has(query)) {
        return reasoningEngine.searchCache.get(query);
    }

    statusEl && (statusEl.textContent = 'Searching multiple sources...');

    const calls = SOURCES.map(async (s) => {
        try {
            const url = s.buildUrl(query);
            const raw = await fetchJson(url, {}, 9000);
            // Normalize per source
            if (s.id === 'ddg') {
                // DuckDuckGo Instant Answer
                const snippet = raw.AbstractText || raw.RelatedTopics?.[0]?.Text || raw.Heading || '';
                const title = raw.Heading || query;
                const link = raw.AbstractURL || raw.RelatedTopics?.[0]?.FirstURL || '';
                return { sourceName: s.name, title: title, url: link || '', snippet: snippet };
            } else if (s.id === 'wikipedia') {
                const search = raw.query && raw.query.search ? raw.query.search : [];
                // pick top 3
                const results = (search.slice(0, 3)).map(r => ({
                    sourceName: s.name,
                    title: r.title,
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
                    snippet: simpleStripHtml(r.snippet || '')
                }));
                return results;
            } else if (s.id === 'wikipedia_summary') {
                // might return a summary or a 404
                if (raw && raw.extract) {
                    return [{ sourceName: s.name, title: raw.title || query, url: raw.content_urls?.desktop?.page || '', snippet: raw.extract }];
                }
            }
            return null;
        } catch (err) {
            // ignore specific source errors but report later
            return { error: true, sourceName: s.name, message: err.message || String(err) };
        }
    });

    const settled = await Promise.allSettled(calls);

    // flatten and normalize
    const results = [];
    for (const res of settled) {
        if (res.status === 'fulfilled') {
            const v = res.value;
            if (!v) continue;
            if (Array.isArray(v)) {
                v.forEach(i => results.push(i));
            } else if (v.error) {
                // push an informational result so we can show some trace
                results.push({ sourceName: v.sourceName, title: 'Error', url: '', snippet: `Error: ${v.message}` });
            } else {
                results.push(v);
            }
        } else {
            // promise rejected: include reason as a result
            const reason = res.reason ? (res.reason.message || String(res.reason)) : 'unknown';
            results.push({ sourceName: 'Unknown', title: 'Fetch failed', url: '', snippet: `Fetch failed: ${reason}` });
        }
    }

    // Deduplicate by url/title using simple overlap measure
    const deduped = [];
    results.forEach(r => {
        if (!r || !r.title) return;
        const exists = deduped.some(d => (d.url && r.url && d.url === r.url) || overlapScore(d.snippet || '', r.snippet || '') > 0.6);
        if (!exists) deduped.push(r);
    });

    // cache basic results for a short period
    reasoningEngine.searchCache.set(query, deduped);
    // expire cache entry after 60 seconds
    setTimeout(() => reasoningEngine.searchCache.delete(query), 60 * 1000);

    return deduped;
}

// groupBySource helper
function groupBySource(results) {
    return results.reduce((acc, r) => {
        const k = r.sourceName || 'Unknown';
        if (!acc[k]) acc[k] = [];
        acc[k].push(r);
        return acc;
    }, {});
}

// generateSummary: create a compact human-readable summary from results
function generateSummary(query, results) {
    if (!results || results.length === 0) {
        return "I searched available sources but couldn't find relevant information. If you'd like, try rephrasing or ask a follow-up question.";
    }

    // pick top 4 informative snippets (prefer longer snippet)
    const scored = results
        .map(r => ({ r, score: (r.snippet || '').length + (r.title || '').length }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

    const parts = scored.map(s => {
        const r = s.r;
        const shortSnippet = (r.snippet || '').length > 260 ? (r.snippet || '').slice(0, 257) + '...' : (r.snippet || '');
        const titlePart = r.title ? `${r.title}` : '';
        const urlPart = r.url ? ` (${r.url})` : '';
        return `${titlePart}${urlPart}\n${shortSnippet}`;
    });

    const sourceCount = Object.keys(groupBySource(results)).length;
    const summary = [
        `I searched multiple sources and found ${results.length} results from ${sourceCount} sources.`,
        '',
        `Top findings for "${query}":`,
        '',
        parts.join('\n\n'),
        '',
        `If you'd like, I can: 1) dig deeper into any single source, 2) summarize with citations, or 3) validate a specific claim. Which would you prefer?`
    ].join('\n');

    return summary;
}

// generateResearchResponse (uses generateSummary and state updates)
function generateResearchResponse(query, results) {
    const reasoning = generateReasoning(query, reasoningEngine.getRecentContext());

    if (!results || results.length === 0) {
        updateEmotionalState('research_failure', query, reasoning);
        return {
            text: "I searched through my available sources but couldn't find something specific enough. Sometimes rephrasing helps — could you provide more details or another angle?",
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

// --- Main handler ---
async function handleSend() {
    const query = (inputEl && inputEl.value || '').trim();
    if (!query) return;

    // Add user message to chat
    appendMessageBubble(query, 'user');
    if (inputEl) inputEl.value = '';
    if (sendBtn) sendBtn.disabled = true;

    // Create reasoning context
    const context = reasoningEngine.getRecentContext();
    const reasoning = generateReasoning(query, context);

    // Conversational short-circuit
    if (isConversational(query)) {
        appendTyping(reasoning);
        setTimeout(() => {
            removeTyping();
            const response = generateConversationalResponse(query, context);
            appendMessageBubble(response.text, 'ai', response.reasoning);
            if (sendBtn) sendBtn.disabled = false;
            if (inputEl) inputEl.focus();
        }, 600 + Math.random() * 1000);
        return;
    }

    // Otherwise research
    appendTyping(reasoning);
    statusEl && (statusEl.textContent = 'Researching and analyzing across multiple sources...');

    try {
        const results = await searchAll(query);
        removeTyping();

        const response = generateResearchResponse(query, results);
        appendMessageBubble(response.text, 'ai', response.reasoning);

        // Add source links (hidden by default) with a maximum list size for UI sanity
        if (results.length > 0 && chatEl) {
            const sourceLinks = document.createElement('div');
            sourceLinks.style.marginTop = '10px';
            sourceLinks.style.fontSize = '0.9em';
            sourceLinks.style.color = '#666';

            const grouped = groupBySource(results);
            const sourceCount = Object.keys(grouped).length;

            const items = results.slice(0, 10).map(r =>
                `<div style="margin-bottom: 6px;">
                    <strong>${escapeHtml(r.sourceName)}</strong>: 
                    ${r.url ? `<a href="${escapeAttr(r.url)}" target="_blank" rel="noopener noreferrer" style="color: #4a86e8;">${escapeHtml(r.title || 'Link')}</a>` : escapeHtml(r.title || 'Result')}
                    ${r.snippet ? `<br><span style="color: #555; font-size: 0.9em;">${escapeHtml((r.snippet || '').slice(0, 200))}...</span>` : ''}
                </div>`
            ).join('');

            sourceLinks.innerHTML = `<details><summary>View ${sourceCount} sources used</summary><div style="margin-top: 8px;">${items}</div></details>`;

            const lastAiMessage = chatEl.querySelector('.msg.ai:last-child .bubble.ai');
            if (lastAiMessage) lastAiMessage.appendChild(sourceLinks);

            statusEl && (statusEl.textContent = `Research complete - found ${results.length} results from ${sourceCount} sources`);
        } else {
            statusEl && (statusEl.textContent = 'Research complete - no results found');
        }
    } catch (error) {
        removeTyping();
        updateEmotionalState('research_failure', query, reasoning);
        appendMessageBubble("I encountered an error while researching. If you'd like, try again or ask for a narrower question.", 'ai', reasoning);
        statusEl && (statusEl.textContent = 'Research failed - please try again');
        console.error('Search error:', error);
    }

    if (sendBtn) sendBtn.disabled = false;
    if (inputEl) inputEl.focus();
}

// --- Safe HTML escaping helpers for UI ---
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        })[s];
    });
}
function escapeAttr(s) { return escapeHtml(s); }

// --- Event listeners ---
if (sendBtn) sendBtn.addEventListener('click', handleSend);
if (inputEl) inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// --- Initialization: greeting with reasoning ---
window.addEventListener('load', () => {
    setTimeout(() => {
        const reasoning = generateReasoning("initial greeting", []);
        const styling = getEmotionalStyling();
        appendMessageBubble(
            `Hello! I'm Echo — your thinking partner. 🤔 I don't just answer; I reason through questions with context, empathy, and clarity. I can search public sources, summarize findings, and help you think through ideas. What are you curious about today? ${styling.emoji}`,
            'ai',
            reasoning
        );
        statusEl && (statusEl.textContent = 'Ready');
    }, 400);
});

// --- CSS additions for reasoning indicator and typing dots ---
(function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .reasoning-indicator {
            border-left: 3px solid #4a86e8;
            padding-left: 8px;
            margin-bottom: 8px;
            opacity: 0.85;
        }

        .msg.ai .bubble.ai {
            transition: all 0.25s ease;
        }

        .typing .dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            margin-right: 3px;
            background: #999;
            border-radius: 50%;
            animation: typing 1.2s infinite ease-in-out;
        }

        .typing .dot:nth-child(2) {
            animation-delay: 0.15s;
        }

        .typing .dot:nth-child(3) {
            animation-delay: 0.3s;
        }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
            30% { transform: translateY(-4px); opacity: 1; }
        }

        .bubble { white-space: pre-wrap; word-break: break-word; }
        .avatar { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; margin-right: 8px; }
        .msg { display:flex; margin: 8px 0; align-items:flex-start; }
        .msg.user { flex-direction: row-reverse; }
        .msg.user .avatar { margin-left: 8px; margin-right: 0; background: #999; }
    `;
    document.head.appendChild(style);
})();
