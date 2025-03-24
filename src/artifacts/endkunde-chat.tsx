import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Check,
  ThumbsUp,
  ThumbsDown,
  X,
  Share2
} from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'system' | 'sales' | 'customer';
  message: string;
  timestamp: Date;
  isHtml?: boolean;
}

interface CustomerChatProps {
  customerName?: string;
  quoteId?: string;
}

const CustomerChat: React.FC<CustomerChatProps> = ({ 
  customerName = "Max Mustermann",
  quoteId = "Q2024-001"
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'system',
      message: 'Angebot gesendet',
      timestamp: new Date(),
    },
    {
      id: 2,
      sender: 'sales',
      message: `
        <div class="quote-message">
          <p>Sehr geehrte${customerName === "Max Mustermann" ? "r" : ""} ${customerName},</p>
          <p>ich habe Ihnen soeben ein Angebot zugesendet.</p>
          <a href="http://localhost:5173/angebot" class="quote-link hover:no-underline">
            <div class="quote-preview bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div class="quote-details p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="quote-title text-lg font-semibold">Angebot #${quoteId}</span>
                  </div>
                  <span class="text-xs bg-blue-500 px-2 py-1 rounded-full">Neu</span>
                </div>
                <div class="flex justify-between items-end">
                  <div>
                    <p class="text-sm text-blue-100 mb-1">Gesamtbetrag</p>
                    <span class="quote-price text-2xl font-bold">4.299,00 €</span>
                  </div>
                  <div class="flex items-center text-sm text-blue-100">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Angebot ansehen
                  </div>
                </div>
              </div>
            </div>
          </a>
          <p>Bitte schauen Sie sich das Angebot in Ruhe an. Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>
          <p>Mit freundlichen Grüßen,<br/>Finn Stürenburg</p>
        </div>
      `,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isHtml: true
    },
    {
      id: 3,
      sender: 'customer',
      message: 'Vielen Dank für das Angebot! Der Schreibtisch gefällt mir sehr gut. Können Sie mir noch sagen, ob die Tischplatte höhenverstellbar ist?',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 4,
      sender: 'sales',
      message: 'Ja, der "Professional Plus" Schreibtisch ist elektrisch höhenverstellbar von 65-125cm. Perfekt für flexibles Arbeiten im Sitzen und Stehen. Soll ich Ihnen noch die technischen Details der Steuerung zusenden?',
      timestamp: new Date(Date.now() - 3300000) // 55 minutes ago
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        sender: 'customer',
        message: newMessage,
        timestamp: new Date()
      }]);
      setNewMessage('');
    }
  };

  const handleFeedbackSubmit = (feedback: 'positive' | 'negative') => {
    setFeedbackSubmitted(true);
    setShowFeedbackForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xl font-bold text-gray-800">
            <MessageSquare className="text-blue-600" size={24} />
            <span>Chat mit RaumBlick</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800">
              <Share2 size={18} className="mr-2" />
              Teilen
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-medium text-gray-900">Chat mit Finn Stürenburg</h2>
            <p className="text-sm text-gray-500">RaumBlick Solutions GmbH</p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'system' 
                      ? 'justify-center' 
                      : msg.sender === 'sales' 
                        ? 'justify-start' 
                        : 'justify-end'
                  }`}
                >
                  {msg.sender === 'system' ? (
                    <div className="bg-blue-50 text-blue-800 text-sm py-2 px-4 rounded-full">
                      {msg.message}
                    </div>
                  ) : msg.sender === 'sales' ? (
                    <div className="bg-gray-100 p-4 rounded-lg shadow-sm max-w-[80%]">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">FS</span>
                          </div>
                        </div>
                        <div className="ml-3 w-full min-w-0">
                          {msg.isHtml ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: msg.message }}
                              className="text-sm break-words [&_.quote-message]:space-y-3 [&_.quote-link]:block [&_.quote-link]:mt-4 [&_.quote-link]:mb-4 
                                [&_.quote-preview]:rounded-xl [&_.quote-preview]:overflow-hidden [&_.quote-preview]:transition-transform [&_.quote-preview]:duration-200 
                                [&_.quote-preview]:shadow-lg [&_.quote-preview]:hover:shadow-xl [&_.quote-preview]:hover:-translate-y-1
                                [&_.quote-details]:flex [&_.quote-details]:flex-col
                                [&_.quote-title]:text-lg [&_.quote-title]:font-semibold
                                [&_p]:break-words [&_a]:break-words"
                            />
                          ) : (
                            <p className="text-sm break-words">{msg.message}</p>
                          )}
                          <span className="text-xs text-gray-500 block mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-sm max-w-[80%]">
                      <div className="flex items-start">
                        <div className="mr-3 min-w-0">
                          <p className="text-sm break-words">{msg.message}</p>
                          <span className="text-xs text-blue-100 block mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {customerName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nachricht eingeben..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center"
              >
                <Send size={16} className="mr-2" />
                Senden
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-medium text-gray-900">Ihre Meinung ist uns wichtig</h3>
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Wie zufrieden sind Sie mit der Beratung?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleFeedbackSubmit('positive')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50"
              >
                <ThumbsUp size={32} className="text-green-500 mb-2" />
                <span className="text-sm text-gray-600">Zufrieden</span>
              </button>
              <button
                onClick={() => handleFeedbackSubmit('negative')}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50"
              >
                <ThumbsDown size={32} className="text-red-500 mb-2" />
                <span className="text-sm text-gray-600">Unzufrieden</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-100 rounded-lg p-4 flex items-start shadow-lg">
          <Check size={20} className="text-green-500 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-green-800 font-medium">Vielen Dank für Ihr Feedback!</h4>
            <p className="text-green-600 text-sm mt-1">
              Wir werden uns in Kürze bei Ihnen melden.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerChat; 