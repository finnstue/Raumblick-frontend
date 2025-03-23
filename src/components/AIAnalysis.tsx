import React from 'react';
import { Check, Circle, Layers } from 'lucide-react';

interface AIAnalysisProps {
  processingStatus: string;
  processingProgress: number;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ processingStatus, processingProgress }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <Layers size={48} className="mx-auto text-blue-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">KI-Analyse läuft</h3>
          <p className="text-gray-500">{processingStatus}</p>
        </div>
        
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Fortschritt: {processingProgress}%</span>
            <span>Geschätzte Restzeit: {Math.max(1, 10 - Math.round(processingProgress / 10))} Min</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Was passiert gerade:</p>
            <ul className="space-y-1">
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" /> Bildanalyse
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-green-500 mr-2" /> Punktwolkenerstellung
              </li>
              <li className="flex items-center">
                {processingProgress > 30 ? 
                  <Check size={16} className="text-green-500 mr-2" /> : 
                  <Circle size={16} className="text-gray-300 mr-2" />} 
                Objekterkennung
              </li>
              <li className="flex items-center">
                {processingProgress > 60 ? 
                  <Check size={16} className="text-green-500 mr-2" /> : 
                  <Circle size={16} className="text-gray-300 mr-2" />} 
                3D-Modellierung
              </li>
              <li className="flex items-center">
                {processingProgress > 90 ? 
                  <Check size={16} className="text-green-500 mr-2" /> : 
                  <Circle size={16} className="text-gray-300 mr-2" />} 
                Raumverständnis
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis; 