import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Camera, Check, ChevronRight, Circle, Edit3, FileText, Grid, Home, Image, Layers, Maximize, Rotate3D, Save, UploadCloud, X, ZoomIn } from 'lucide-react';
import AIAnalysis from '../components/AIAnalysis';

const RaumBlick = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [roomObjects, setRoomObjects] = useState([]);
  const [viewMode, setViewMode] = useState('3d');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quoteItems, setQuoteItems] = useState([]);
  const [showQuote, setShowQuote] = useState(false);
  
  const canvasRef = useRef(null);
  
  // Sample data for products catalog
  const productCatalog = [
    { id: 1, name: 'Modern Kitchen Counter', price: 1299, category: 'Kitchen', color: 'White' },
    { id: 2, name: 'Cabinet Set', price: 899, category: 'Kitchen', color: 'Oak' },
    { id: 3, name: 'Island Kitchen Block', price: 749, category: 'Kitchen', color: 'Gray' },
    { id: 4, name: 'Built-in Refrigerator', price: 1499, category: 'Appliances', color: 'Silver' },
    { id: 5, name: 'Wall Shelving Unit', price: 349, category: 'Storage', color: 'White' },
    { id: 6, name: 'Sink & Faucet Combo', price: 459, category: 'Plumbing', color: 'Stainless' }
  ];
  
  // Sample room photos
  const sampleImages = [
    '/api/placeholder/300/200',
    '/api/placeholder/300/200',
    '/api/placeholder/300/200'
  ];
  
  const steps = [
    { label: 'Raum scannen', icon: <Camera size={20} /> },
    { label: 'KI-Analyse', icon: <Layers size={20} /> },
    { label: 'Planung', icon: <Edit3 size={20} /> },
    { label: 'Angebot', icon: <FileText size={20} /> }
  ];
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const startProcessing = () => {
    setIsProcessing(true);
    setProcessingStatus('Hochgeladene Bilder werden verarbeitet...');
    setProcessingProgress(0);
    
    const processingSteps = [
      'Bilder werden ausgewertet...',
      'Erstelle Punktwolke...',
      'Objekte werden erkannt...',
      'Semantisches Modell wird erstellt...',
      'Raumverständnis wird generiert...',
      'Analysiere Raumgeometrie...',
      'Erstelle 3D-Modell...',
      'Optimiere für Rendering...',
      'Füge Texturdetails hinzu...',
      'Fertigstellung...'
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < processingSteps.length) {
        setProcessingStatus(processingSteps[currentStep]);
        setProcessingProgress(Math.round((currentStep + 1) / processingSteps.length * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        setAnalysisComplete(true);
        setRoomObjects([
          { id: 1, name: 'Kühlschrank', category: 'Appliance', position: { x: 120, y: 0, z: 100 } },
          { id: 2, name: 'Spüle', category: 'Plumbing', position: { x: 200, y: 0, z: 50 } },
          { id: 3, name: 'Wandschrank', category: 'Furniture', position: { x: 150, y: 70, z: 0 } },
          { id: 4, name: 'Arbeitsfläche', category: 'Furniture', position: { x: 150, y: 40, z: 50 } },
          { id: 5, name: 'Herd', category: 'Appliance', position: { x: 80, y: 40, z: 50 } }
        ]);
        setActiveStep(2);
      }
    }, 600);
  };
  
  const addToQuote = () => {
    if (selectedProduct) {
      setQuoteItems([...quoteItems, selectedProduct]);
      setSelectedProduct(null);
    }
  };
  
  const removeFromQuote = (id) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };
  
  const generateQuote = () => {
    setShowQuote(true);
    setActiveStep(3);
  };
  
  // Effect to "draw" the 3D visualization on the canvas
  useEffect(() => {
    if (analysisComplete && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      
      // Mock 3D rendering - in reality this would be Three.js or similar
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw a simple kitchen layout
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      
      // Room outline
      ctx.beginPath();
      ctx.rect(50, 50, 300, 200);
      ctx.stroke();
      
      // Kitchen counter
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(50, 150, 300, 50);
      
      // Sink
      ctx.fillStyle = '#ccc';
      ctx.beginPath();
      ctx.rect(100, 160, 50, 30);
      ctx.fill();
      ctx.stroke();
      
      // Stove
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.rect(200, 160, 60, 30);
      ctx.fill();
      ctx.stroke();
      
      // Refrigerator
      ctx.fillStyle = '#eee';
      ctx.beginPath();
      ctx.rect(300, 80, 40, 70);
      ctx.fill();
      ctx.stroke();
      
      // Upper cabinets
      ctx.fillStyle = '#d0c0a0';
      ctx.beginPath();
      ctx.rect(50, 70, 240, 30);
      ctx.fill();
      ctx.stroke();
      
      // Add labels for recognized objects
      ctx.fillStyle = '#2563eb';
      ctx.font = '10px Arial';
      
      roomObjects.forEach(obj => {
        ctx.beginPath();
        ctx.arc(obj.position.x, obj.position.y + obj.position.z/3, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillText(obj.name, obj.position.x - 20, obj.position.y + obj.position.z/3 - 10);
      });
      
      // If a product is selected, highlight its potential placement
      if (selectedProduct) {
        ctx.fillStyle = 'rgba(37, 99, 235, 0.3)';
        ctx.strokeStyle = '#2563eb';
        ctx.beginPath();
        
        if (selectedProduct.category === 'Kitchen') {
          ctx.rect(80, 150, 100, 50);
        } else if (selectedProduct.category === 'Appliances') {
          ctx.rect(300, 80, 40, 70);
        } else if (selectedProduct.category === 'Storage') {
          ctx.rect(50, 70, 100, 30);
        } else if (selectedProduct.category === 'Plumbing') {
          ctx.rect(100, 160, 50, 30);
        }
        
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [analysisComplete, roomObjects, viewMode, selectedProduct]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xl font-bold text-gray-800">
            <Grid className="text-blue-600" size={24} />
            <span>Raum<span className="text-blue-600">Blick</span></span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600">Dokumentation</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Support</a>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Anmelden
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Projekt: Demo-Küche</h2>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Fortschritt</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                      activeStep > index 
                        ? 'bg-green-100 text-green-600' 
                        : activeStep === index 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {activeStep > index ? <Check size={16} /> : step.icon}
                  </div>
                  <span 
                    className={`text-sm ${
                      activeStep >= index ? 'text-gray-800 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {activeStep >= 2 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Erkannte Objekte</h3>
              <div className="space-y-2">
                {roomObjects.map(obj => (
                  <div key={obj.id} className="flex items-center text-sm text-gray-600 py-1">
                    <Circle size={8} className="mr-2 text-blue-500" />
                    {obj.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-auto p-4 border-t border-gray-200">
            <button 
              className="flex items-center justify-center w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={() => {
                if (activeStep === 0 && uploadedImage) {
                  setActiveStep(1);
                  startProcessing();
                } else if (activeStep === 2) {
                  generateQuote();
                }
              }}
              disabled={activeStep === 0 && !uploadedImage}
            >
              {activeStep === 0 ? 'Raum analysieren' : activeStep === 2 ? 'Angebot erstellen' : 'Weiter'}
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
        
        {/* Main workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step 0: Upload */}
          {activeStep === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-2xl">
                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Laden Sie Raumfotos hoch</h3>
                    <p className="text-gray-500 mb-6">
                      Ziehen Sie Fotos hierher oder klicken Sie, um Fotos aus Ihrem Gerät auszuwählen.
                    </p>
                    <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        multiple
                      />
                      Fotos auswählen
                    </label>
                    
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Oder wählen Sie ein Beispielfoto</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {sampleImages.map((src, index) => (
                          <img 
                            key={index}
                            src={src}
                            alt={`Beispielfoto ${index + 1}`}
                            className="rounded-md cursor-pointer hover:opacity-80 transition"
                            onClick={() => setUploadedImage(src)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden">
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded room" 
                        className="w-full rounded-t-lg"
                      />
                      <button 
                        className="absolute top-4 right-4 bg-white p-1 rounded-full shadow-md"
                        onClick={() => setUploadedImage(null)}
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                    <div className="bg-white p-4 rounded-b-lg border border-gray-200">
                      <h3 className="text-gray-800 font-medium mb-2">Foto wurde hochgeladen</h3>
                      <p className="text-gray-500 text-sm">
                        Klicken Sie auf "Raum analysieren", um die KI-gestützte Verarbeitung zu starten.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 1: Processing */}
          {activeStep === 1 && (
            <AIAnalysis 
              processingStatus={processingStatus}
              processingProgress={processingProgress}
            />
          )}
          
          {/* Step 2: Planning */}
          {activeStep === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 bg-white p-4 flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button 
                    className={`p-2 rounded-md ${viewMode === '3d' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    onClick={() => setViewMode('3d')}
                  >
                    <Rotate3D size={20} />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${viewMode === 'top' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    onClick={() => setViewMode('top')}
                  >
                    <Grid size={20} />
                  </button>
                </div>
                
                <div className="border-l border-gray-200 h-6 mx-2"></div>
                
                <div className="flex space-x-2">
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <ZoomIn size={20} />
                  </button>
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <Maximize size={20} />
                  </button>
                </div>
                
                <div className="border-l border-gray-200 h-6 mx-2"></div>
                
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Anweisungen eingeben, z.B. 'Arbeitsplatte 15 cm nach links verlängern'"
                    className="w-full px-4 py-2 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                  <Save size={20} />
                </button>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative">
                  <canvas 
                    ref={canvasRef}
                    width={400} 
                    height={300}
                    className="w-full h-full"
                  />
                  
                  <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md p-2 text-xs text-gray-600">
                    {viewMode === '3d' ? '3D Ansicht' : 'Draufsicht'}
                  </div>
                </div>
                
                <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
                  <h3 className="font-medium text-gray-800 mb-4">Produktkatalog</h3>
                  
                  <div className="space-y-4">
                    {productCatalog.map(product => (
                      <div 
                        key={product.id}
                        className={`p-3 rounded-md border ${selectedProduct?.id === product.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer transition`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.category} • {product.color}</p>
                          </div>
                          <span className="font-medium text-gray-900">{product.price} €</span>
                        </div>
                        
                        {selectedProduct?.id === product.id && (
                          <div className="mt-3 flex justify-end">
                            <button 
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                              onClick={addToQuote}
                            >
                              Zum Angebot hinzufügen
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {quoteItems.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-800">Angebot</h3>
                        <span className="text-sm text-gray-500">{quoteItems.length} Produkte</span>
                      </div>
                      
                      <div className="space-y-3">
                        {quoteItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.name}</span>
                            <div className="flex items-center">
                              <span className="mr-2">{item.price} €</span>
                              <button 
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => removeFromQuote(item.id)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-medium">
                        <span>Gesamtsumme</span>
                        <span>{quoteItems.reduce((sum, item) => sum + item.price, 0)} €</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Quote */}
          {activeStep === 3 && (
            <div className="flex-1 p-8 overflow-auto">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-1">Angebot</h2>
                      <p className="text-gray-500">Erstellt am {new Date().toLocaleDateString('de-DE')}</p>
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                        PDF herunterladen
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Versenden
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Anbieter</h3>
                      <p className="text-gray-800">RaumBlick Demo GmbH</p>
                      <p className="text-gray-800">Musterstraße 123</p>
                      <p className="text-gray-800">80333 München</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Kunde</h3>
                      <p className="text-gray-800">Max Mustermann</p>
                      <p className="text-gray-800">Beispielweg 42</p>
                      <p className="text-gray-800">10115 Berlin</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Projekt-Visualisierung</h3>
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <canvas 
                        ref={canvasRef}
                        width={400} 
                        height={300}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Positionen</h3>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                          <tr>
                            <th className="px-4 py-3 text-gray-600 font-medium">Artikel</th>
                            <th className="px-4 py-3 text-gray-600 font-medium">Kategorie</th>
                            <th className="px-4 py-3 text-gray-600 font-medium">Farbe</th>
                            <th className="px-4 py-3 text-gray-600 font-medium text-right">Preis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {quoteItems.map(item => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                              <td className="px-4 py-3 text-gray-600">{item.category}</td>
                              <td className="px-4 py-3 text-gray-600">{item.color}</td>
                              <td className="px-4 py-3 text-gray-800 font-medium text-right">{item.price.toLocaleString('de-DE')} €</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="3" className="px-4 py-3 text-gray-800 font-medium">Gesamtsumme</td>
                            <td className="px-4 py-3 text-gray-800 font-medium text-right">
                              {quoteItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('de-DE')} €
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-8">
                    <div className="flex items-start">
                      <AlertCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">Hinweis</h4>
                        <p className="text-sm text-gray-600">
                          Dieses Angebot ist 30 Tage gültig. Bei Fragen steht Ihnen unser Support-Team gerne zur Verfügung.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Angebot bestätigen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaumBlick;