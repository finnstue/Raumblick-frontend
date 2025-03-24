import React, { useState } from 'react';
import { Grid, Scan, FileText, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [showEndkundeModal, setShowEndkundeModal] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xl font-bold text-gray-800">
            <Grid className="text-blue-600" size={24} />
            <span>Raum<span className="text-blue-600">Blick</span></span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-4">
                <Grid size={40} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Willkommen bei RaumBlick</h1>
              <p className="text-gray-600 mb-6">
                Wählen Sie Ihre Perspektive, um fortzufahren
              </p>
            </div>

            <div className="space-y-4">
              <button 
                className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => navigate('/anbieter')}
              >
                <h2 className="text-xl font-medium text-blue-600 mb-2">Anbieter Demo</h2>
                <p className="text-gray-600">
                  Für Anbieter von Gebäudetechnik und Einrichtung
                </p>
              </button>

              <button 
                className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => setShowEndkundeModal(true)}
              >
                <h2 className="text-xl font-medium text-blue-600 mb-2">Endkunde Demo</h2>
                <p className="text-gray-600">
                  Für Endkunden und Haushalte
                </p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Endkunde options */}
      {showEndkundeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Wählen Sie eine Option</h3>
            <div className="space-y-3">
              <button
                className="w-full p-4 flex items-center space-x-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                onClick={() => navigate('/endkunde')}
              >
                <Scan className="text-blue-600" />
                <span>Scan starten</span>
              </button>
              
              <button
                className="w-full p-4 flex items-center space-x-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                onClick={() => navigate('/angebot')}
              >
                <FileText className="text-blue-600" />
                <span>Angebot ansehen</span>
              </button>

              <button
                className="w-full p-4 flex items-center space-x-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                onClick={() => navigate('/endkunde-chat')}
              >
                <MessageCircle className="text-blue-600" />
                <span>Chat öffnen</span>
              </button>
            </div>
            
            <button
              className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowEndkundeModal(false)}
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
