import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, ChevronRight, Circle, Grid, Info, RotateCw, Send, X, Layers, ArrowUp } from 'lucide-react';
import * as THREE from 'three';

const CustomerScanningInterface = () => {
  const [scanStep, setScanStep] = useState('start'); // start, scanning, review, submit
  const [scanProgress, setScanProgress] = useState(0);
  const [areasNeeded, setAreasNeeded] = useState(['walls', 'corners', 'floor', 'ceiling']);
  const [capturedFrames, setCapturedFrames] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [scanComplete, setScanComplete] = useState(false);
  const [modelGenerated, setModelGenerated] = useState(false);
  const [areasCovered, setAreasCovered] = useState({
    walls: 0,
    corners: 0, 
    floor: 0,
    ceiling: 0
  });
  
  const [threeJsRenderer, setThreeJsRenderer] = useState(null);
  const [threeJsScene, setThreeJsScene] = useState(null);
  const [threeJsCamera, setThreeJsCamera] = useState(null);
  const [rotationSpeed, setRotationSpeed] = useState(0); // Changed initial value to 0 to stop auto rotation
  const [viewMode, setViewMode] = useState('3d'); // 3d or top
  
  const threeJsContainerRef = useRef(null);
  const videoRef = useRef(null);
  const kitchenGroupRef = useRef(null);
  
  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  
  // New state variables
  const [processingStatus, setProcessingStatus] = useState('Hochgeladene Bilder werden verarbeitet...');
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Simulate scanning mode when entering scanning mode
  useEffect(() => {
    if (scanStep === 'scanning') {
      // Initialize camera
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          // Modified simulation code with smoother progress
          const interval = setInterval(() => {
            setScanProgress(prev => {
              const newProgress = Math.min(prev + 0.2, 100); // Reduced from 0.8 to 0.2
              
              // Update areas covered based on progress
              if (newProgress > 15 && areasCovered.walls < 100) {
                setAreasCovered(prev => ({...prev, walls: Math.min(prev.walls + 0.75, 100)})); // Reduced from 3 to 0.75
              }
              
              if (newProgress > 35 && areasCovered.corners < 100) {
                setAreasCovered(prev => ({...prev, corners: Math.min(prev.corners + 0.625, 100)})); // Reduced from 2.5 to 0.625
              }
              
              if (newProgress > 50 && areasCovered.floor < 100) {
                setAreasCovered(prev => ({...prev, floor: Math.min(prev.floor + 0.75, 100)})); // Reduced from 3 to 0.75
              }
              
              if (newProgress > 65 && areasCovered.ceiling < 100) {
                setAreasCovered(prev => ({...prev, ceiling: Math.min(prev.ceiling + 0.625, 100)})); // Reduced from 2.5 to 0.625
              }
              
              // Update captured frames
              setCapturedFrames(Math.floor(newProgress * 0.8));
              
              // Mark scan as complete at 100%
              if (newProgress === 100) {
                setScanComplete(true);
                clearInterval(interval);
              }
              
              return newProgress;
            });
          }, 60); // Reduced from 250ms to 60ms for smoother animation
          
          return () => {
            clearInterval(interval);
            if (videoRef.current && videoRef.current.srcObject) {
              const tracks = videoRef.current.srcObject.getTracks();
              tracks.forEach(track => track.stop());
            }
          };
        } catch (error) {
          console.error("Error accessing camera:", error);
          // Fall back to simulation mode
          alert("Camera access was denied. Using simulation mode instead.");
          
          // Run the original simulation code
          const interval = setInterval(() => {
            setScanProgress(prev => {
              // Same simulation code as above
              const newProgress = Math.min(prev + 0.8, 100);
              
              // Update areas covered based on progress
              if (newProgress > 15 && areasCovered.walls < 100) {
                setAreasCovered(prev => ({...prev, walls: Math.min(prev.walls + 3, 100)}));
              }
              
              if (newProgress > 35 && areasCovered.corners < 100) {
                setAreasCovered(prev => ({...prev, corners: Math.min(prev.corners + 2.5, 100)}));
              }
              
              if (newProgress > 50 && areasCovered.floor < 100) {
                setAreasCovered(prev => ({...prev, floor: Math.min(prev.floor + 3, 100)}));
              }
              
              if (newProgress > 65 && areasCovered.ceiling < 100) {
                setAreasCovered(prev => ({...prev, ceiling: Math.min(prev.ceiling + 2.5, 100)}));
              }
              
              // Update captured frames
              setCapturedFrames(Math.floor(newProgress * 0.8));
              
              // Mark scan as complete at 100%
              if (newProgress === 100) {
                setScanComplete(true);
                clearInterval(interval);
              }
              
              return newProgress;
            });
          }, 250);
          
          return () => clearInterval(interval);
        }
      };
      
      startCamera();
    }
  }, [scanStep]);

  // Initialize and set up Three.js scene
  useEffect(() => {
    if (scanStep === 'review' && modelGenerated && threeJsContainerRef.current) {
      // Create a scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      
      // Create a camera
      const camera = new THREE.PerspectiveCamera(
        75, 
        threeJsContainerRef.current.clientWidth / threeJsContainerRef.current.clientHeight, 
        0.1, 
        1000
      );
      camera.position.z = 5;
      
      // Create a renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(
        threeJsContainerRef.current.clientWidth,
        threeJsContainerRef.current.clientHeight
      );
      
      // Clear container and append renderer
      if (threeJsContainerRef.current.firstChild) {
        threeJsContainerRef.current.removeChild(threeJsContainerRef.current.firstChild);
      }
      threeJsContainerRef.current.appendChild(renderer.domElement);
      
      // Create kitchen model (simplified for demo)
      // Create a group to hold all kitchen objects
      const kitchenGroup = new THREE.Group();
      kitchenGroupRef.current = kitchenGroup;
      
      // Floor
      const floorGeometry = new THREE.BoxGeometry(6, 0.2, 6);
      const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.y = -1.5;
      kitchenGroup.add(floor);
      
      // Countertop
      const countertopGeometry = new THREE.BoxGeometry(5, 0.2, 1.5);
      const countertopMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
      const countertop = new THREE.Mesh(countertopGeometry, countertopMaterial);
      countertop.position.y = -0.5;
      countertop.position.z = -1;
      kitchenGroup.add(countertop);
      
      // Cabinet base
      const cabinetBaseGeometry = new THREE.BoxGeometry(5, 0.8, 1.4);
      const cabinetBaseMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
      const cabinetBase = new THREE.Mesh(cabinetBaseGeometry, cabinetBaseMaterial);
      cabinetBase.position.y = -1;
      cabinetBase.position.z = -1;
      kitchenGroup.add(cabinetBase);
      
      // Upper cabinets
      const upperCabinetGeometry = new THREE.BoxGeometry(5, 1.2, 0.8);
      const upperCabinetMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
      const upperCabinet = new THREE.Mesh(upperCabinetGeometry, upperCabinetMaterial);
      upperCabinet.position.y = 1;
      upperCabinet.position.z = -1.4;
      kitchenGroup.add(upperCabinet);
      
      // Sink
      const sinkGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
      const sinkMaterial = new THREE.MeshPhongMaterial({ color: 0xc0c0c0 });
      const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
      sink.position.y = -0.3;
      sink.position.x = -1;
      sink.position.z = -1;
      kitchenGroup.add(sink);
      
      // Stove
      const stoveGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
      const stoveMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const stove = new THREE.Mesh(stoveGeometry, stoveMaterial);
      stove.position.y = -0.3;
      stove.position.x = 1;
      stove.position.z = -1;
      kitchenGroup.add(stove);
      
      // Refrigerator
      const fridgeGeometry = new THREE.BoxGeometry(1.2, 3, 1);
      const fridgeMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });
      const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
      fridge.position.x = -2.5;
      fridge.position.z = 1;
      kitchenGroup.add(fridge);
      
      // Back wall
      const backWallGeometry = new THREE.BoxGeometry(6, 3, 0.1);
      const backWallMaterial = new THREE.MeshPhongMaterial({ color: 0xe8e8e8 });
      const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
      backWall.position.z = -2;
      kitchenGroup.add(backWall);
      
      // Side wall
      const sideWallGeometry = new THREE.BoxGeometry(0.1, 3, 6);
      const sideWallMaterial = new THREE.MeshPhongMaterial({ color: 0xe0e0e0 });
      const sideWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
      sideWall.position.x = -3;
      kitchenGroup.add(sideWall);
      
      // Add the group to the scene
      scene.add(kitchenGroup);
      
      // Position the kitchen group
      kitchenGroup.position.y = -0.5;
      kitchenGroup.rotation.y = Math.PI / 6;
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-1, 0.5, -1);
      scene.add(directionalLight2);
      
      // Store reference to renderer, scene, and camera
      setThreeJsRenderer(renderer);
      setThreeJsScene(scene);
      setThreeJsCamera(camera);
      
      // Mouse interaction handlers
      const handleMouseDown = (event) => {
        isDraggingRef.current = true;
        const { clientX, clientY } = event.type === 'touchstart' ? event.touches[0] : event;
        previousMousePositionRef.current = {
          x: clientX,
          y: clientY
        };
      };
      
      const handleMouseMove = (event) => {
        if (!isDraggingRef.current || !kitchenGroupRef.current) return;
        
        const { clientX, clientY } = event.type === 'touchmove' ? event.touches[0] : event;
        const deltaX = clientX - previousMousePositionRef.current.x;
        const deltaY = clientY - previousMousePositionRef.current.y;
        
        // Rotate the model based on mouse movement
        if (viewMode === '3d') {
          kitchenGroupRef.current.rotation.y += deltaX * 0.01;
          kitchenGroupRef.current.rotation.x += deltaY * 0.01;
          
          // Limit vertical rotation to prevent flipping
          kitchenGroupRef.current.rotation.x = Math.max(
            -Math.PI / 4, 
            Math.min(Math.PI / 4, kitchenGroupRef.current.rotation.x)
          );
        } else if (viewMode === 'top') {
          // For top view, pan instead of rotate
          kitchenGroupRef.current.position.x += deltaX * 0.01;
          kitchenGroupRef.current.position.z += deltaY * 0.01;
        }
        
        previousMousePositionRef.current = {
          x: clientX,
          y: clientY
        };
      };
      
      const handleMouseUp = () => {
        isDraggingRef.current = false;
      };
      
      // Add event listeners for mouse interaction
      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('touchstart', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
      
      // Render function
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Apply auto-rotation if enabled (with fixed speed, not cumulative)
        if (kitchenGroupRef.current && rotationSpeed !== 0) {
          // Set absolute rotation rather than incrementing to prevent acceleration
          kitchenGroupRef.current.rotation.y += rotationSpeed;
        }
        
        // Update camera position based on view mode
        if (viewMode === '3d') {
          // Perspective view
          if (camera.position.y !== 0) {
            camera.position.y = 0;
            camera.position.z = 5;
            camera.lookAt(0, 0, 0);
          }
        } else if (viewMode === 'top') {
          // Top-down view
          if (camera.position.y !== 5) {
            camera.position.y = 5;
            camera.position.z = 0.1;
            camera.lookAt(0, 0, 0);
          }
        }
        
        renderer.render(scene, camera);
      };
      
      // Start animation
      animate();
      
      // Handle window resize
      const handleResize = () => {
        if (threeJsContainerRef.current) {
          camera.aspect = threeJsContainerRef.current.clientWidth / threeJsContainerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(
            threeJsContainerRef.current.clientWidth,
            threeJsContainerRef.current.clientHeight
          );
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('touchstart', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleMouseUp);
        
        // Clean up resources
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    }
  }, [scanStep, modelGenerated, rotationSpeed, viewMode]);
  
  // Skip to review function
  const skipToReview = () => {
    setScanComplete(true);
    setAreasCovered({
      walls: 100,
      corners: 100, 
      floor: 100,
      ceiling: 100
    });
    setScanProgress(100);
    setCapturedFrames(80);
    setScanStep('review');
    
    // Reset processing progress and status at the start
    setProcessingProgress(0);
    setProcessingStatus('Starte KI-Analyse...');
    
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
    
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 100) {
        // Update status message based on current progress
        const stepIndex = Math.floor((progress / 100) * processingSteps.length);
        setProcessingStatus(processingSteps[Math.min(stepIndex, processingSteps.length - 1)]);
        
        // Increment progress by 1%
        progress += 1;
        setProcessingProgress(progress);
      } else {
        clearInterval(interval);
        setModelGenerated(true);
      }
    }, 120); // Adjusted interval for smoother animation (60ms = ~1 second for full progress)
  };
  
  // Toggle rotation on/off with fixed speed
  const toggleRotation = () => {
    // If rotating, stop it. If stopped, start with fixed speed
    if (rotationSpeed !== 0) {
      setRotationSpeed(0);
    } else {
      setRotationSpeed(0.01);
    }
  };
  
  const getOverallProgress = () => {
    const values = Object.values(areasCovered);
    return values.reduce((acc, val) => acc + val, 0) / values.length;
  };
  
  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Camera size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Hallo Leon Blumenthal</h1>
          <p className="text-gray-600 mb-6">
            Bitte laden Sie eine Aufnahme von Ihrer Küche hoch, um ein präzises 3D Modell zu erstellen.
          </p>
        </div>
        
        {/* Upload area with drag & drop */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 hover:border-blue-500 transition-colors cursor-pointer">
          <label className="w-full h-full flex flex-col items-center cursor-pointer">
            <ArrowUp size={32} className="text-gray-400 mb-4" />
            <span className="text-gray-600">Datei hier per Drag & Drop ablegen</span>
            <input
              type="file"
              accept="video/*,.scan"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setScanComplete(true);
                  setAreasCovered({
                    walls: 100,
                    corners: 100,
                    floor: 100,
                    ceiling: 100
                  });
                  setScanProgress(100);
                  setCapturedFrames(80);
                  setScanStep('review');
                  
                  setProcessingProgress(0);
                  setProcessingStatus('Verarbeite hochgeladene Aufnahme...');
                  
                  const processingSteps = [
                    'Analysiere Aufnahme...',
                    'Extrahiere Einzelbilder...',
                    'Erstelle Punktwolke...',
                    'Objekte werden erkannt...',
                    'Semantisches Modell wird erstellt...',
                    'Raumverständnis wird generiert...',
                    'Analysiere Raumgeometrie...',
                    'Erstelle 3D-Modell...',
                    'Optimiere für Rendering...',
                    'Fertigstellung...'
                  ];
                  
                  let progress = 0;
                  const interval = setInterval(() => {
                    if (progress < 100) {
                      const stepIndex = Math.floor((progress / 100) * processingSteps.length);
                      setProcessingStatus(processingSteps[Math.min(stepIndex, processingSteps.length - 1)]);
                      progress += 1;
                      setProcessingProgress(progress);
                    } else {
                      clearInterval(interval);
                      setModelGenerated(true);
                    }
                  }, 120);
                }
              }}
            />
          </label>
        </div>
        
        {/* Tips section */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left">
          <h2 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
            <Info size={16} className="text-blue-600 mr-2" />
            Für die besten Ergebnisse:
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <Circle size={8} className="text-blue-500 mr-2 mt-1.5" />
              Stellen Sie sicher, dass die Aufnahme gut beleuchtet ist
            </li>
            <li className="flex items-start">
              <Circle size={8} className="text-blue-500 mr-2 mt-1.5" />
              Erfassen Sie den Raum aus mehreren Blickwinkeln
            </li>
            <li className="flex items-start">
              <Circle size={8} className="text-blue-500 mr-2 mt-1.5" />
              Achten Sie besonders auf Ecken und Kanten
            </li>
            <li className="flex items-start">
              <Circle size={8} className="text-blue-500 mr-2 mt-1.5" />
              Die Aufnahme sollte mindestens 1 Minute lang sein
            </li>
          </ul>
        </div>
        
        {/* Demo button */}
        {/* <button 
          className="w-full py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
          onClick={skipToReview}
        >
          Demo anzeigen
        </button> */}
      </div>
    </div>
  );
  
  const renderReviewScreen = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-hidden">
        {!modelGenerated ? (
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
                      {processingProgress > 10 ? 
                        <Check size={16} className="text-green-500 mr-2" /> : 
                        <Circle size={16} className="text-gray-300 mr-2" />} 
                      Bildanalyse
                    </li>
                    <li className="flex items-center">
                      {processingProgress > 20 ? 
                        <Check size={16} className="text-green-500 mr-2" /> : 
                        <Circle size={16} className="text-gray-300 mr-2" />} 
                      Punktwolkenerstellung
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
        ) : (
          <div className="h-full flex flex-col p-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 relative">
              {/* Three.js container */}
              <div 
                ref={threeJsContainerRef} 
                className="w-full h-full"
              ></div>
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-blue-600 flex items-center justify-center"
                  onClick={toggleRotation}
                  title="Auto-Rotation ein/ausschalten"
                >
                  <Rotate3D />
                </button>
                <button 
                  className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-blue-600 flex items-center justify-center"
                  onClick={() => setViewMode(viewMode === '3d' ? 'top' : '3d')}
                  title={viewMode === '3d' ? 'Zur Draufsicht wechseln' : 'Zur 3D-Ansicht wechseln'}
                >
                  <Grid />
                </button>
              </div>
            </div>
            
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Erkannte Elemente:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2" />
                  1 Fenster
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2" />
                  4 Wände
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2" />
                  1 Tisch
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2" />
                  2 Steckdosen
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button 
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            onClick={() => setScanStep('scanning')}
          >
            <ArrowLeft size={18} className="mr-1" />
            Zurück
          </button>
          
          <button 
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            onClick={() => setScanStep('submit')}
            disabled={!modelGenerated}
          >
            {modelGenerated ? (
              <>
                Weiter
                <ArrowRight size={18} className="ml-1" />
              </>
            ) : (
              <>
                Wird geladen...
                <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderSubmitScreen = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
            <Check size={30} />
          </div>
          
          <h2 className="text-xl font-medium text-gray-800 mb-2">3D-Scan erfolgreich</h2>
          <p className="text-gray-600 mb-6">
            Ihr Scan ist bereit und kann nun an den Dienstleister übermittelt werden.
          </p>
          
          <div className="p-4 bg-gray-50 rounded-lg mb-6 text-left">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Scan-Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Raumgröße:</span>
                <span className="text-gray-800">18.3 m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deckenhöhe:</span>
                <span className="text-gray-800">2.4 m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Erkannte Objekte:</span>
                <span className="text-gray-800">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scangüte:</span>
                <span className="text-gray-800">Hoch</span>
              </div>
            </div>
          </div>
          
          <button 
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            onClick={() => setScanStep('thankYou')}
          >
            An Dienstleister senden
            <Send size={18} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderThankYouScreen = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Check size={30} />
          </div>
          
          <h2 className="text-xl font-medium text-gray-800 mb-2">Vielen Dank!</h2>
          <p className="text-gray-600 mb-6">
            Ihr 3D-Scan wurde erfolgreich an Ihren Dienstleister übermittelt. 
            Sie werden in Kürze kontaktiert.
          </p>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-left">
            <div className="flex items-start">
              <Info size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                Ihr Dienstleister kann jetzt mit diesem 3D-Modell arbeiten, um Ihnen ein detailliertes Angebot zu erstellen.
                Sie sparen damit Zeit und erhalten präzisere Ergebnisse!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const getNextAreaToScan = () => {
    for (const area of areasNeeded) {
      if (areasCovered[area] < 100) {
        return area;
      }
    }
    return null;
  };
  
  const getNextAreaToScanName = () => {
    const area = getNextAreaToScan();
    if (area === 'walls') return 'Wände';
    if (area === 'corners') return 'Ecken';
    if (area === 'floor') return 'Boden';
    if (area === 'ceiling') return 'Decke';
    return '';
  };
  
  // Helper component for the 3D rotation icon
  const Rotate3D = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M21 15a3 3 0 0 0 3-3M21 15h-1M21 15v-1"></path>
    </svg>
  );
  
  // Render the appropriate screen based on the current step
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xl font-bold text-gray-800">
            <Grid className="text-blue-600" size={24} />
            <span>Raum<span className="text-blue-600">Blick</span></span>
          </div>
          
          {scanStep !== 'start' && scanStep !== 'thankYou' && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">3D-Modell erstellen</span>
              <span className="mx-2">•</span>
              <span>
                {scanStep === 'review' ? 'Schritt 1 von 2' : 'Schritt 2 von 2'}
              </span>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {scanStep === 'start' && renderStartScreen()}
        {scanStep === 'review' && renderReviewScreen()}
        {scanStep === 'submit' && renderSubmitScreen()}
        {scanStep === 'thankYou' && renderThankYouScreen()}
      </main>
    </div>
  );
};

export default CustomerScanningInterface;
