// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axiosClient from "../utils/axiosClient";
// import { Send } from 'lucide-react';

// function ChatAi({problem}) {
//     const [messages, setMessages] = useState([
//         { role: 'model', parts:[{text: "Hi, How are you"}]},
//         { role: 'user', parts:[{text: "I am Good"}]}
//     ]);

//     const { register, handleSubmit, reset,formState: {errors} } = useForm();
//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);

//     const onSubmit = async (data) => {
        
//         setMessages(prev => [...prev, { role: 'user', parts:[{text: data.message}] }]);
//         reset();

//         try {
            
//             const response = await axiosClient.post("/ai/chat", {
//                 messages:messages,
//                 title:problem.title,
//                 description:problem.description,
//                 testCases: problem.visibleTestCases,
//                 startCode:problem.startCode
//             });

           
//             setMessages(prev => [...prev, { 
//                 role: 'model', 
//                 parts:[{text: response.data.message}] 
//             }]);
//         } catch (error) {
//             console.error("API Error:", error);
//             setMessages(prev => [...prev, { 
//                 role: 'model', 
//                 parts:[{text: "Error from AI Chatbot"}]
//             }]);
//         }
//     };

//     return (
//         <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                 {messages.map((msg, index) => (
//                     <div 
//                         key={index} 
//                         className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
//                     >
//                         <div className="chat-bubble bg-base-200 text-base-content">
//                             {msg.parts[0].text}
//                         </div>
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <form 
//                 onSubmit={handleSubmit(onSubmit)} 
//                 className="sticky bottom-0 p-4 bg-base-100 border-t"
//             >
//                 <div className="flex items-center">
//                     <input 
//                         placeholder="Ask me anything" 
//                         className="input input-bordered flex-1" 
//                         {...register("message", { required: true, minLength: 2 })}
//                     />
//                     <button 
//                         type="submit" 
//                         className="btn btn-ghost ml-2"
//                         disabled={errors.message}
//                     >
//                         <Send size={20} />
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default ChatAi;

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Trash2, Code, Copy, Check, Play } from 'lucide-react';

function ChatAi({ problem, currentCode, currentLanguage }) {
    // Load messages from sessionStorage or initialize with welcome message
    const [messages, setMessages] = useState(() => {
        if (!problem?._id) return [
            { 
                role: 'model', 
                parts: [{text: "Hi! I'm your DSA assistant. Please select a problem to get started."}]
            }
        ];
        
        const saved = sessionStorage.getItem(`chat-${problem._id}`);
        return saved ? JSON.parse(saved) : [
            { 
                role: 'model', 
                parts: [{text: `Hi! I'm your DSA assistant for "${problem?.title}". I can help you with:\n\n• Code review and debugging\n• Algorithm explanations\n• Hint generation\n• Solution approaches\n\nFeel free to ask anything about this problem or share your code for review!`}]
            }
        ];
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

    // Save messages to sessionStorage whenever they change
    useEffect(() => {
        if (problem?._id) {
            sessionStorage.setItem(`chat-${problem._id}`, JSON.stringify(messages));
        }
    }, [messages, problem?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Function to extract code blocks from text
    const extractCodeBlocks = (text) => {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const matches = [];
        let match;
        let lastIndex = 0;
        const parts = [];
        
        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index)
                });
            }
            
            // Add code block
            parts.push({
                type: 'code',
                language: match[1] || 'text',
                content: match[2]
            });
            
            lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text after last code block
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex)
            });
        }
        
        return parts;
    };

    // Function to copy code to clipboard
    const copyToClipboard = async (code, index) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCodeIndex(index);
            setTimeout(() => setCopiedCodeIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedCodeIndex(index);
            setTimeout(() => setCopiedCodeIndex(null), 2000);
        }
    };

    // Function to apply code suggestion to editor
    const applyCodeSuggestion = (code) => {
        if (window.applyCodeToEditor) {
            window.applyCodeToEditor(code);
        }
    };

    // Reset chat function
    const resetChat = () => {
        setMessages([
            { 
                role: 'model', 
                parts: [{text: `Hi! I'm your DSA assistant for "${problem?.title}". Let's start fresh! How can I help you with this problem?`}]
            }
        ]);
        if (problem?._id) {
            sessionStorage.removeItem(`chat-${problem._id}`);
        }
    };

    // Function to send code for review
    const sendCodeForReview = () => {
        if (!currentCode || currentCode.trim() === '') {
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{text: "I don't see any code in the editor to review. Please write some code first!"}]
            }]);
            return;
        }

        const codeMessage = `Please review my current ${currentLanguage} code:\n\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\`\n\nCan you help me debug or improve it?`;
        handleMessageSubmit(codeMessage);
    };

    const handleMessageSubmit = async (messageContent) => {
        const newUserMessage = { role: 'user', parts: [{ text: messageContent }] };
        setMessages(prev => [...prev, newUserMessage]);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: [...messages, newUserMessage],
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode,
                currentCode: currentCode,
                language: currentLanguage
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message }] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Sorry, I encountered an error. Please try again." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (data) => {
        if (data.message.trim()) {
            handleMessageSubmit(data.message);
        }
    };

    // Function to render message with proper code block separation
    const renderMessageContent = (text, messageIndex) => {
        const parts = extractCodeBlocks(text);
        
        return parts.map((part, partIndex) => {
            const globalIndex = messageIndex * 100 + partIndex;
            
            if (part.type === 'code') {
                return (
                    <div key={globalIndex} className="my-3">
                        <div className="flex justify-between items-center bg-gray-900 px-4 py-2 rounded-t-lg border-b border-gray-700">
                            <span className="text-xs text-gray-300 font-mono uppercase">
                                {part.language || 'text'}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => applyCodeSuggestion(part.content)}
                                    className="btn btn-xs btn-primary gap-1"
                                    title="Apply to editor"
                                >
                                    <Play size={12} />
                                    Apply
                                </button>
                                <button
                                    onClick={() => copyToClipboard(part.content, globalIndex)}
                                    className="btn btn-xs btn-ghost text-white gap-1"
                                    title="Copy code"
                                >
                                    {copiedCodeIndex === globalIndex ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedCodeIndex === globalIndex ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-b-lg overflow-x-auto text-sm">
                            <code>{part.content}</code>
                        </pre>
                    </div>
                );
            } else {
                // Render text with proper line breaks and formatting
                return (
                    <div key={globalIndex} className="whitespace-pre-wrap leading-relaxed">
                        {part.content.split('\n').map((line, lineIndex) => (
                            <span key={lineIndex}>
                                {line}
                                {lineIndex < part.content.split('\n').length - 1 && <br />}
                            </span>
                        ))}
                    </div>
                );
            }
        });
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh] min-h-[500px]">
            {/* Header with actions */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
                <h3 className="font-semibold">AI Coding Assistant</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={sendCodeForReview}
                        className="btn btn-sm btn-outline border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                        title="Send current code for review"
                        disabled={isLoading}
                    >
                        <Code size={16} className="mr-1" />
                        Review Code
                    </button>
                    <button 
                        onClick={resetChat}
                        className="btn btn-sm btn-ghost text-red-400 hover:bg-red-500/20"
                        title="Reset conversation"
                        disabled={isLoading}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-3xl rounded-2xl p-4 ${
                            msg.role === "user" 
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ml-10" 
                                : "bg-slate-800 text-slate-300 border border-slate-700 mr-10"
                        }`}>
                            <div className="text-sm">
                                {renderMessageContent(msg.parts[0].text, index)}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl p-4 mr-10 max-w-3xl">
                            <div className="flex items-center gap-2">
                                <span className="loading loading-dots loading-sm"></span>
                                <span>AI is thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-slate-900 border-t border-slate-700"
            >
                <div className="flex items-center gap-2">
                    <input 
                        placeholder="Ask about the problem or share your code..." 
                        className="input bg-slate-800 border-slate-700 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 flex-1" 
                        {...register("message", { 
                            required: "Message is required", 
                            minLength: { value: 2, message: "Message too short" } 
                        })}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white btn-square shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        disabled={errors.message || isLoading}
                    >
                        <Send size={20} />
                    </button>
                </div>
                {errors.message && (
                    <p className="text-error text-xs mt-1">{errors.message.message}</p>
                )}
            </form>
        </div>
    );
}

export default ChatAi;