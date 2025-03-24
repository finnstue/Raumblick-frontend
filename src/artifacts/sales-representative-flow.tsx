import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, Camera, Check, ChevronRight, Circle, Edit3, 
  FileText, Grid, Layers, Maximize, MessageCircle, Rotate3D, 
  Save, Search, Settings, ZoomIn, ZoomOut, Trash2, Move, X,
  Home, Mail, MessageSquare, Copy, Link, Share2,
  Utensils, Box, TableProperties, Refrigerator, BookmarkMinus, 
  Droplets, Lightbulb, Monitor
} from 'lucide-react';
import * as THREE from 'three';

class ThreeJSErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ThreeJS Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md">
          <h3 className="text-red-800 font-medium">3D Viewer Error</h3>
          <p className="text-red-600 text-sm mt-1">
            There was an error loading the 3D viewer. Please refresh the page or contact support if the issue persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const SalesRepresentativeFlow = () => {
  // State for customer scans
  const [customerScans, setCustomerScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [viewMode, setViewMode] = useState('3d');
  const [currentStep, setCurrentStep] = useState('dashboard'); // dashboard, analysis, proposal, quotation
  
  // States for room analysis
  const [roomObjects, setRoomObjects] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  
  // States for proposal creation
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [productCatalog, setProductCatalog] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // States for visualization and quotation
  const [quotationItems, setQuotationItems] = useState([]);
  const [renderQuality, setRenderQuality] = useState('preview');
  const [customerInfo, setCustomerInfo] = useState({
    name: "Max Mustermann",
    email: "max.mustermann@example.com",
    address: "Beispielweg 42, 10115 Berlin"
  });
  
  // Add this new state near the other state declarations
  const [statusFilter, setStatusFilter] = useState('All status');
  
  // Add this new state near other state declarations
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    customerName: '',
    customerId: `C${Math.floor(1000 + Math.random() * 9000)}`, // Generate random ID
    roomType: 'Kitchen',
    status: 'Ausstehender Scan',
    email: '' // Add email field
  });
  
  // Add new state near other state declarations
  const [showProjectSuccessScreen, setShowProjectSuccessScreen] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  
  // Add these new state declarations near the other states
  const [showSentSuccessScreen, setShowSentSuccessScreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'system',
      message: 'Quotation sent to customer',
      timestamp: new Date(),
    }
  ]);
  
  // Refs
  const canvasRef = useRef(null);
  const queryInputRef = useRef(null);
  
  // Add refs for Three.js
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const kitchenGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  
  // Load sample data on component mount
  useEffect(() => {
    // Sample customer scans
    const sampleScans = [
      { 
        id: 1, 
        customerId: 'C1001', 
        customerName: 'Max Mustermann', 
        scanDate: '2025-03-20', 
        roomType: 'Küche', 
        status: 'Scan abgeschlossen', // Changed from 'Ausstehender Scan'
      },
      { 
        id: 2, 
        customerId: 'C1002', 
        customerName: 'Laura Schmidt', 
        scanDate: '2025-03-19', 
        roomType: 'Wohnzimmer', 
        status: 'Scan abgeschlossen',
      },
      { 
        id: 3, 
        customerId: 'C1003', 
        customerName: 'Thomas Weber', 
        scanDate: '2025-03-18', 
        roomType: 'Badezimmer', 
        status: 'Ausstehender Scan',
      },
      { 
        id: 4, 
        customerId: 'C1004', 
        customerName: 'Anna Müller', 
        scanDate: '2025-03-17', 
        roomType: 'Büro', 
        status: 'Angebot gesendet',
      }
    ];
    
    // Sample product catalog
    const sampleProducts = [
      { 
        id: 1, 
        name: 'Modern Kitchen Counter', 
        price: 1299, 
        category: 'Kitchen Furniture', 
        color: 'White', 
        material: 'Laminate', 
        dimensions: '240x60x90cm',
        icon: Utensils
      },
      { 
        id: 2, 
        name: 'Cabinet Set (3 units)', 
        price: 899, 
        category: 'Kitchen Furniture', 
        color: 'Oak', 
        material: 'Wood', 
        dimensions: '180x35x70cm',
        icon: Box
      },
      { 
        id: 3, 
        name: 'Island Kitchen Block', 
        price: 749, 
        category: 'Kitchen Furniture', 
        color: 'Gray', 
        material: 'Granite/Wood', 
        dimensions: '120x80x90cm',
        icon: TableProperties
      },
      { 
        id: 4, 
        name: 'Built-in Refrigerator', 
        price: 1499, 
        category: 'Appliances', 
        color: 'Silver', 
        material: 'Stainless Steel', 
        dimensions: '70x65x180cm',
        icon: Refrigerator
      },
      { 
        id: 5, 
        name: 'Wall Shelving Unit', 
        price: 349, 
        category: 'Storage', 
        color: 'White', 
        material: 'MDF', 
        dimensions: '120x25x40cm',
        icon: BookmarkMinus
      },
      { 
        id: 6, 
        name: 'Sink & Faucet Combo', 
        price: 459, 
        category: 'Plumbing', 
        color: 'Stainless', 
        material: 'Stainless Steel', 
        dimensions: '80x50x20cm',
        icon: Droplets
      },
      { 
        id: 7, 
        name: 'LED Kitchen Lights Set', 
        price: 249, 
        category: 'Lighting', 
        color: 'Warm White', 
        material: 'Aluminum', 
        dimensions: '4x sets',
        icon: Lightbulb
      },
      { 
        id: 8, 
        name: 'Workstation Desk', 
        price: 599, 
        category: 'Office Furniture', 
        color: 'Black/Walnut', 
        material: 'Wood/Metal', 
        dimensions: '160x80x75cm',
        icon: Monitor
      }
    ];
    
    // Extract unique categories
    const categories = ['All', ...new Set(sampleProducts.map(product => product.category))];
    
    setCustomerScans(sampleScans);
    setProductCatalog(sampleProducts);
    setProductCategories(categories);
  }, []);
  
  // Sample room objects when a scan is selected
  useEffect(() => {
    if (selectedScan) {
      const sampleRoomObjects = [
        { id: 1, name: 'Refrigerator', category: 'Appliance', position: { x: 120, y: 0, z: 100 }, dimensions: { width: 70, height: 180, depth: 65 }, removable: true },
        { id: 2, name: 'Sink', category: 'Plumbing', position: { x: 200, y: 0, z: 50 }, dimensions: { width: 80, height: 20, depth: 50 }, removable: true },
        { id: 3, name: 'Wall Cabinet', category: 'Furniture', position: { x: 150, y: 70, z: 0 }, dimensions: { width: 120, height: 70, depth: 35 }, removable: true },
        { id: 4, name: 'Countertop', category: 'Furniture', position: { x: 150, y: 40, z: 50 }, dimensions: { width: 240, height: 5, depth: 60 }, removable: true },
        { id: 5, name: 'Stove', category: 'Appliance', position: { x: 80, y: 40, z: 50 }, dimensions: { width: 60, height: 5, depth: 60 }, removable: true },
        { id: 6, name: 'Power Outlet', category: 'Electrical', position: { x: 220, y: 40, z: 0 }, dimensions: { width: 10, height: 10, depth: 5 }, removable: false },
        { id: 7, name: 'Window', category: 'Structural', position: { x: 180, y: 100, z: 0 }, dimensions: { width: 120, height: 100, depth: 10 }, removable: false, orientation: 'North' }
      ];
      
      setRoomObjects(sampleRoomObjects);
      
      // Sample measurements
      setMeasurements({
        roomDimensions: { width: 400, height: 250, depth: 300 },
        wallThickness: 20,
        ceilingHeight: 240,
        floorType: 'Tile'
      });
    }
  }, [selectedScan]);
  
  // Create kitchen function
  const createKitchen = () => {
    console.log('Creating kitchen model');
    const kitchen = new THREE.Group();
    
    // Add console logs for each component
    console.log('Adding floor');
    // Floor
    const floorGeometry = new THREE.BoxGeometry(10, 0.2, 10);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xD3D3D3 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -2;
    kitchen.add(floor);
    
    // Counter/cabinets (bottom)
    const counterGeometry = new THREE.BoxGeometry(8, 1, 2);
    const counterMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Changed to PhongMaterial
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.z = -3;
    counter.position.y = -1;
    kitchen.add(counter);
    
    // Countertop
    const countertopGeometry = new THREE.BoxGeometry(8, 0.1, 2.2);
    const countertopMaterial = new THREE.MeshPhongMaterial({ color: 0xBEBEBE }); // Changed to PhongMaterial
    const countertop = new THREE.Mesh(countertopGeometry, countertopMaterial);
    countertop.position.z = -3;
    countertop.position.y = -0.45;
    kitchen.add(countertop);
    
    // Sink
    const sinkGeometry = new THREE.BoxGeometry(1.5, 0.3, 1.2);
    const sinkMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 }); // Changed to PhongMaterial
    const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
    sink.position.x = 2;
    sink.position.z = -3;
    sink.position.y = -0.3;
    kitchen.add(sink);
    
    // Upper cabinets
    const upperCabinetGeometry = new THREE.BoxGeometry(8, 2, 1);
    const upperCabinetMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Changed to PhongMaterial
    const upperCabinet = new THREE.Mesh(upperCabinetGeometry, upperCabinetMaterial);
    upperCabinet.position.z = -3.5;
    upperCabinet.position.y = 1.5;
    kitchen.add(upperCabinet);
    
    // Refrigerator
    const fridgeGeometry = new THREE.BoxGeometry(2, 4, 2);
    const fridgeMaterial = new THREE.MeshPhongMaterial({ color: 0xF5F5F5 }); // Changed to PhongMaterial
    const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
    fridge.position.x = -4.5;
    fridge.position.y = 0;
    fridge.position.z = -3;
    kitchen.add(fridge);

    console.log('Kitchen model created');
    return kitchen;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log('Initializing Three.js scene');
    console.log('Current step:', currentStep);
    console.log('Selected scan:', selectedScan);
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Adjust camera position and field of view
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 12); // Try adjusting these values
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Clear container and append new renderer
    const container = containerRef.current;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create and add kitchen with initial rotation
    const kitchen = createKitchen();
    kitchen.rotation.y = Math.PI; // Rotate 180 degrees to face front
    kitchenGroupRef.current = kitchen;
    scene.add(kitchen);

    // Improved lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add a point light to better illuminate the scene
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      console.log('Cleaning up Three.js scene');
      cancelAnimationFrame(animationFrameId);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        // Safely remove the canvas element
        const canvas = container.querySelector('canvas');
        if (canvas) {
          container.removeChild(canvas);
        }
        rendererRef.current = null;
      }
      
      // Clear other refs
      sceneRef.current = null;
      cameraRef.current = null;
      kitchenGroupRef.current = null;
    };
  }, [currentStep, selectedScan]); // Dependencies to reinitialize scene when view changes

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse controls
  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault(); // Prevent text selection while dragging
      isDraggingRef.current = true;
      previousMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current || !kitchenGroupRef.current) return;
      
      const deltaMove = {
        x: event.clientX - previousMousePositionRef.current.x,
        y: event.clientY - previousMousePositionRef.current.y
      };
      
      // Make rotation more sensitive and smooth
      kitchenGroupRef.current.rotation.y += deltaMove.x * 0.005;
      
      previousMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
    };

    const element = containerRef.current;
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Add cursor styles
    element.style.cursor = 'grab';
    
    return () => {
      if (element) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [currentStep]); // Add currentStep as dependency to reinitialize controls when view changes

  // Handler for natural language queries
  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (naturalLanguageQuery) {
      // Simulate response to queries
      if (naturalLanguageQuery.toLowerCase().includes('power outlet')) {
        setQueryResults({
          type: 'info',
          message: 'There is a power outlet on the east wall, approximately 40cm from the sink.',
          objects: roomObjects.filter(obj => obj.category === 'Electrical')
        });
      } else if (naturalLanguageQuery.toLowerCase().includes('window')) {
        setQueryResults({
          type: 'info',
          message: 'The window is on the north wall, with dimensions 120cm x 100cm. It has a north orientation.',
          objects: roomObjects.filter(obj => obj.name === 'Window')
        });
      } else if (naturalLanguageQuery.toLowerCase().includes('dimension') || naturalLanguageQuery.toLowerCase().includes('measurement')) {
        setQueryResults({
          type: 'measurements',
          message: 'The room dimensions are 400cm x 300cm with a ceiling height of 240cm.',
          data: measurements
        });
      } else if (naturalLanguageQuery.toLowerCase().includes('move')) {
        setQueryResults({
          type: 'action',
          message: 'I\'ve moved the selected item as requested.',
          action: 'move'
        });
        // Simulate moving an object if one is selected
        if (selectedObjects.length > 0) {
          const updatedObjects = [...roomObjects];
          const objIndex = updatedObjects.findIndex(obj => obj.id === selectedObjects[0].id);
          if (objIndex !== -1) {
            updatedObjects[objIndex] = {
              ...updatedObjects[objIndex],
              position: {
                ...updatedObjects[objIndex].position,
                x: updatedObjects[objIndex].position.x + 20
              }
            };
            setRoomObjects(updatedObjects);
          }
        }
      } else {
        setQueryResults({
          type: 'info',
          message: 'I\'m processing your request. Please provide more specific details or try different keywords.',
          objects: []
        });
      }
      
      // Clear the input after processing
      setNaturalLanguageQuery('');
    }
  };
  
  // Add this new helper function after the state declarations
  const hasScanData = (scan) => {
    console.log('Checking scan data for:', scan.customerName);
    const hasData = scan.customerName === 'Max Mustermann';
    console.log('Has scan data:', hasData);
    return hasData;
  };

  // Modify the handleSelectScan function
  const handleSelectScan = (scan) => {
    console.log('Selecting scan for:', scan.customerName);
    setSelectedScan(scan);
    
    // Update customerInfo when selecting a scan
    setCustomerInfo({
      name: scan.customerName,
      email: scan.customerId.startsWith('C1001') ? 'max.mustermann@example.com' : 
            scan.customerId === 'C1004' ? 'anna.mueller@example.com' : 
            `${scan.customerName.toLowerCase().replace(' ', '.')}@example.com`,
      address: "Beispielweg 42, 10115 Berlin"
    });
    
    if (scan.status === 'Angebot gesendet') {
      // Show chat interface directly for customers with sent quotes
      setChatMessages([
        {
          id: 1,
          sender: 'system',
          message: 'Angebot an Kunde gesendet',
          timestamp: new Date(),
        },
        {
          id: 2,
          sender: 'sales',
          message: `
            <div class="quote-message">
              <p>Sehr geehrte(r) ${scan.customerName},</p>
              <p>ich habe Ihnen ein Angebot zugesendet.</p>
              <a href="/quote/${scan.id}" class="quote-link">
                <div class="quote-preview">
                  <img src="/quote-preview.jpg" alt="Angebot Vorschau" class="quote-image" />
                  <div class="quote-details">
                    <span class="quote-title">Angebot #${scan.id}</span>
                    <span class="quote-price">Klicken Sie hier um das Angebot anzusehen</span>
                  </div>
                </div>
              </a>
              <p>Bitte schauen Sie sich das Angebot in Ruhe an. Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>
              <p>Mit freundlichen Grüßen,<br/>Finn Stürenburg</p>
            </div>
          `,
          timestamp: new Date(),
          isHtml: true
        }
      ]);
      setShowSentSuccessScreen(true);
      return;
    }
    
    if (!hasScanData(scan)) {
      console.log('No scan data, showing pending-scan view');
      setCurrentStep('ausstehender-scan');
      return;
    }
    
    console.log('Has scan data, showing analysis view');
    setCurrentStep('analysis');
    // Reset other states when selecting a new scan
    setSelectedObjects([]);
    setSelectedProducts([]);
    setQuotationItems([]);
    setQueryResults(null);
  };
  
  // Handler for selecting room objects
  const handleObjectSelect = (obj) => {
    if (selectedObjects.some(selected => selected.id === obj.id)) {
      setSelectedObjects(selectedObjects.filter(selected => selected.id !== obj.id));
    } else {
      setSelectedObjects([...selectedObjects, obj]);
    }
  };
  
  // Handler for removing objects
  const handleRemoveObjects = () => {
    if (selectedObjects.length > 0) {
      // Only remove objects that are marked as removable
      const removableIds = selectedObjects
        .filter(obj => obj.removable)
        .map(obj => obj.id);
      
      setRoomObjects(roomObjects.filter(obj => !removableIds.includes(obj.id)));
      setSelectedObjects([]);
    }
  };
  
  // Handler for adding products to quotation
  const handleAddToQuotation = (product) => {
    setQuotationItems([...quotationItems, product]);
    setSelectedProducts([...selectedProducts, product]);
  };
  
  // Handler for removing products from quotation
  const handleRemoveFromQuotation = (productId) => {
    setQuotationItems(quotationItems.filter(item => item.id !== productId));
    setSelectedProducts(selectedProducts.filter(item => item.id !== productId));
  };
  
  // Handler for generating quotation
  const handleGenerateQuotation = () => {
    setCurrentStep('quotation');
  };
  
  // Handler for filtering products by category
  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
  };
  
  // Return to dashboard
  const handleReturnToDashboard = () => {
    setCurrentStep('dashboard');
    setSelectedScan(null);
  };
  
  // Advance to proposal creation
  const handleAdvanceToProposal = () => {
    setCurrentStep('proposal');
  };
  
  // Update the status filter handler
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };
  
  // Add these new handlers after your other handlers
  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    const newScan = {
      id: customerScans.length + 1,
      ...newProjectForm,
      scanDate: new Date().toISOString().split('T')[0],
      scanCode: generateScanCode(),
      codeExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000)
    };
    
    setCustomerScans([newScan, ...customerScans]);
    setIsNewProjectModalOpen(false);
    setScanCode(newScan.scanCode);
    setCodeExpiry(newScan.codeExpiry);
    setShowProjectSuccessScreen(true);
    
    setNewProjectForm({
      customerName: '',
      customerId: `C${Math.floor(1000 + Math.random() * 9000)}`,
      roomType: 'Kitchen',
      status: 'Ausstehender Scan',
      email: '' // Add email field
    });
  };
  
  const generateScanCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  
  // Update the handleSendToCustomer function
  const handleSendToCustomer = () => {
    // Update customer status
    setCustomerScans(prevScans => 
      prevScans.map(scan => 
        scan.id === selectedScan?.id 
          ? { ...scan, status: 'Angebot gesendet' }
          : scan
      )
    );

    setChatMessages([
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
            <p>Sehr geehrte ${customerInfo.name},</p>
            <p>ich habe Ihnen soeben ein Angebot zugesendet.</p>
            <a href="/quote/${selectedScan?.id}" class="quote-link">
              <div class="quote-preview">
                <img src="/quote-preview.jpg" alt="Angebot Vorschau" class="quote-image" />
                <div class="quote-details">
                  <span class="quote-title">Angebot #${selectedScan?.id}</span>
                  <span class="quote-price">${(quotationItems.reduce((sum, item) => sum + item.price, 0) * 1.19).toLocaleString()} €</span>
                </div>
              </div>
            </a>
            <p>Bitte schauen Sie sich das Angebot in Ruhe an. Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>
            <p>Mit freundlichen Grüßen,<br/>Finn Stürenburg</p>
          </div>
        `,
        timestamp: new Date(),
        isHtml: true
      }
    ]);
    setShowSentSuccessScreen(true);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Grid className="text-blue-600" size={24} />
            <span className="text-xl font-bold">Raum<span className="text-blue-600">Blick</span></span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600">Documentation</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Support</a>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              SR
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-auto">
        {/* Dashboard View */}
        {currentStep === 'dashboard' && (
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Customer Scans</h1>
                <div className="flex space-x-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search scans..."
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                  <select 
                    className="border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={handleStatusFilter}
                  >
                    <option>All status</option>
                    <option>Ausstehender Scan</option>
                    <option>Scan abgeschlossen</option>
                    <option>Angebot gesendet</option>
                  </select>
                  <button 
                    onClick={handleNewProject}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
                  >
                    + Neues Projekt
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                      <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Date</th>
                      <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                      <th className="w-1/6 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerScans.map((scan) => (
                      <tr 
                        key={scan.id} 
                        className={`hover:bg-gray-50 ${
                          statusFilter === 'All status' || scan.status === statusFilter 
                            ? ''
                            : 'hidden'
                        }`}
                      >
                        <td className="w-1/4 px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{scan.customerName}</div>
                          <div className="text-sm text-gray-500">{scan.customerId}</div>
                        </td>
                        <td className="w-1/6 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {scan.roomType}
                        </td>
                        <td className="w-1/6 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {scan.scanDate}
                        </td>
                        <td className="w-1/6 px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            scan.status === 'Ausstehender Scan' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : scan.status === 'Scan abgeschlossen' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {scan.status}
                          </span>
                        </td>
                        <td className="w-1/6 px-6 py-4 whitespace-nowrap">
                          <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                            <Home className="h-6 w-6" />
                          </div>
                        </td>
                        <td className="w-1/6 px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleSelectScan(scan)}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Pending Scan View */}
        {currentStep === 'ausstehender-scan' && selectedScan && (
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex items-center">
                <button 
                  onClick={handleReturnToDashboard}
                  className="text-gray-400 hover:text-gray-600 mr-4"
                >
                  <ChevronRight className="rotate-180" size={20} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedScan.customerName}'s {selectedScan.roomType}
                </h2>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="mb-6">
                  <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Raumscan erforderlich
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Um mit dem Entwurfs- und Angebot-Prozess fortzufahren, benötigen wir eine 3D-Raumscan des Raums. 
                    Bitte stellen Sie sicher, dass der Kunde den Raumscan-Prozess abschließt.
                  </p>
                </div>

                <div className="mt-8">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Kunden kontaktieren
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Room Analysis View */}
        {currentStep === 'analysis' && selectedScan && (
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleReturnToDashboard}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="rotate-180" size={20} />
                </button>
                <h2 className="text-lg font-medium">
                  {selectedScan.customerName}'s {selectedScan.roomType}
                </h2>
                <span className={`px-2 py-1 text-xs leading-none font-medium rounded-full ${
                  selectedScan.status === 'Ausstehender Scan' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : selectedScan.status === 'Scan abgeschlossen' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedScan.status}
                </span>
              </div>
              
              <button
                onClick={handleAdvanceToProposal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Weiter zu Planung
              </button>
            </div>
            
            <div className="flex-1 flex">
              {/* 3D Viewer */}
              <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-2 flex space-x-2">
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
                  <div className="border-l border-gray-200 mx-1"></div>
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <ZoomIn size={20} />
                  </button>
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <ZoomOut size={20} />
                  </button>
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <Maximize size={20} />
                  </button>
                </div>
                
                <div className="flex-1 relative bg-gray-100" style={{ maxHeight: '400px' }}>
                  <ThreeJSErrorBoundary>
                    <div
                      ref={containerRef}
                      className="w-full h-full"
                      style={{ 
                        minHeight: '400px',
                        cursor: 'grab',
                        touchAction: 'none' // Prevent default touch actions
                      }}
                    />
                  </ThreeJSErrorBoundary>
                  
                  <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md p-2 text-xs text-gray-600">
                    {viewMode === '3d' ? '3D Ansicht' : 'Top Ansicht'} | Raumabmessungen: 400 × 300 cm
                  </div>
                </div>
                
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleQuerySubmit} className="flex items-center">
                    <input
                      type="text"
                      value={naturalLanguageQuery}
                      onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                      ref={queryInputRef}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Stellen Sie eine Frage zu diesem Raum (z.B., 'Wo ist der Stromanschluss?')"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                      <MessageCircle size={20} />
                    </button>
                  </form>
                  
                  {queryResults && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="flex">
                        <AlertCircle size={20} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{queryResults.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Room Information Sidebar */}
              <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">Raumanalyse</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Raumabmessungen</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Raumbreite:</span>
                        <span className="font-medium text-gray-800">{measurements.roomDimensions?.width} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Raumtiefe:</span>
                        <span className="font-medium text-gray-800">{measurements.roomDimensions?.depth} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Decke Höhe:</span>
                        <span className="font-medium text-gray-800">{measurements.ceilingHeight} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bodenart:</span>
                        <span className="font-medium text-gray-800">{measurements.floorType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-500">Erkannte Objekte</h4>
                      {selectedObjects.length > 0 && (
                        <button 
                          onClick={handleRemoveObjects}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" /> Ausgewählte Objekte entfernen
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {roomObjects.map(obj => (
                        <div 
                          key={obj.id}
                          onClick={() => handleObjectSelect(obj)}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${
                            selectedObjects.some(selected => selected.id === obj.id)
                              ? 'bg-orange-100'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Circle 
                            size={8} 
                            className={`mr-2 ${
                              selectedObjects.some(selected => selected.id === obj.id)
                                ? 'text-orange-500'
                                : 'text-blue-500'
                            }`} 
                          />
                          <span className="text-sm text-gray-700">{obj.name}</span>
                          {obj.removable ? (
                            <div className="ml-auto text-xs text-gray-400">Removable</div>
                          ) : (
                            <div className="ml-auto text-xs text-gray-400">Fixed</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Spatial Constraints</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                        <p className="text-yellow-800">
                          <strong>Wasserleitungszugang:</strong> Eingeschränkt auf die Nordwand nahe dem vorhandenen Sinken.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                        <p className="text-yellow-800">
                          <strong>Elektrische Steckdosen:</strong> Nur auf Ost- und Nordwand verfügbar.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                        <p className="text-yellow-800">
                          <strong>Fenster:</strong> Nordorientiert,考虑自然光线用于工作空间。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Proposal Creation View */}
        {currentStep === 'proposal' && selectedScan && (
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentStep('analysis')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="rotate-180" size={20} />
                </button>
                <h2 className="text-lg font-medium">
                  Planning for {selectedScan.customerName}'s {selectedScan.roomType}
                </h2>
              </div>
              
              <button
                onClick={handleGenerateQuotation}
                disabled={quotationItems.length === 0}
                className={`px-4 py-2 rounded-md ${
                  quotationItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Generate Quotation
              </button>
            </div>
            
            <div className="flex-1 flex">
              {/* 3D Viewer */}
              <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-2 flex space-x-2">
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
                  <div className="border-l border-gray-200 mx-1"></div>
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <ZoomIn size={20} />
                  </button>
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <ZoomOut size={20} />
                  </button>
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                    <Maximize size={20} />
                  </button>
                </div>
                
                <div className="flex-1 relative bg-gray-100" style={{ maxHeight: '400px' }}>
                  <ThreeJSErrorBoundary>
                    <div
                      ref={containerRef}
                      className="w-full h-full"
                      style={{ 
                        minHeight: '400px',
                        cursor: 'grab',
                        touchAction: 'none' // Prevent default touch actions
                      }}
                    />
                  </ThreeJSErrorBoundary>
                  
                  <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md p-2 text-xs text-gray-600">
                    {viewMode === '3d' ? '3D Ansicht' : 'Top Ansicht'} | Raumabmessungen: 400 × 300 cm
                  </div>
                </div>
                
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleQuerySubmit} className="flex items-center">
                    <input
                      type="text"
                      value={naturalLanguageQuery}
                      onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                      ref={queryInputRef}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Use commands like 'Move the cabinet 20cm to the left'"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                      <MessageCircle size={20} />
                    </button>
                  </form>
                  
                  {queryResults && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="flex">
                        <AlertCircle size={20} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{queryResults.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Catalog */}
              <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">Produktkatalog</h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {productCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          activeCategory === category
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {productCatalog
                    .filter(product => activeCategory === 'All' || product.category === activeCategory)
                    .map(product => (
                      <div 
                        key={product.id}
                        className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition"
                      >
                        <div className="p-3">
                          <div className="flex">
                            <div className="w-16 h-16 rounded-md bg-blue-50 flex items-center justify-center mr-3">
                              {React.createElement(product.icon, { 
                                size: 32, 
                                className: "text-blue-600" 
                              })}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{product.name}</h4>
                              <p className="text-xs text-gray-500">{product.category}</p>
                              <div className="text-blue-600 font-medium mt-1">
                                {product.price.toLocaleString()} €
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>Color: {product.color}</div>
                              <div>Material: {product.material}</div>
                              <div colSpan={2}>Dimensions: {product.dimensions}</div>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleAddToQuotation(product)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                            >
                              Add to Quotation
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {quotationItems.length > 0 && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">Selected Products</h4>
                      <span className="text-xs text-gray-500">{quotationItems.length} items</span>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {quotationItems.map(item => (
                        <div key={item.id} className="py-2 flex justify-between items-center">
                          <div className="text-sm text-gray-800">{item.name}</div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">{item.price.toLocaleString()} €</span>
                            <button 
                              onClick={() => handleRemoveFromQuotation(item.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-medium text-gray-800">Total:</span>
                      <span className="font-medium text-gray-800">
                        {quotationItems
                          .reduce((total, item) => total + item.price, 0)
                          .toLocaleString()} €
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Quotation View */}
        {currentStep === 'quotation' && (
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Quotation</h2>
                    <p className="text-gray-500">Created on {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setCurrentStep('proposal')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                    >
                      Edit Proposal
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                      Download PDF
                    </button>
                    <button 
                      onClick={handleSendToCustomer}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send to Customer
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Provider</h3>
                    <p className="text-gray-800">RaumBlick Solutions GmbH</p>
                    <p className="text-gray-800">Musterstraße 123</p>
                    <p className="text-gray-800">80333 München</p>
                    <p className="text-gray-800">contact@raumblick.de</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
                    <p className="text-gray-800">{customerInfo.name}</p>
                    <p className="text-gray-800">{customerInfo.address}</p>
                    <p className="text-gray-800">{customerInfo.email}</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Project Visualization</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <div
                        ref={containerRef}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <span className="block mb-2">Additional visualization</span>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md">
                          Generate HD Render
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Quotation Details</h3>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Specifications
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quotationItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{item.color} | {item.material}</div>
                              <div className="text-sm text-gray-500">{item.dimensions}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              1
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.price.toLocaleString()} €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Subtotal
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {quotationItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()} €
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            VAT (19%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {(quotationItems.reduce((sum, item) => sum + item.price, 0) * 0.19).toLocaleString()} €
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <strong>Total</strong>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            {(quotationItems.reduce((sum, item) => sum + item.price, 0) * 1.19).toLocaleString()} €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Notes</h3>
                  <div className="border border-gray-200 rounded-md p-4">
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Add any additional notes or terms for the customer..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-8">
                  <div className="flex">
                    <AlertCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Terms and Conditions</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        This quotation is valid for 30 days from the date of issue. Delivery time will be confirmed upon order confirmation.
                        Installation services are included in the price. A 50% deposit is required to begin the project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Neues Projekt erstellen</h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kundenname
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectForm.customerName}
                    onChange={(e) => setNewProjectForm({
                      ...newProjectForm,
                      customerName: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newProjectForm.email}
                    onChange={(e) => setNewProjectForm({
                      ...newProjectForm,
                      email: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kunden-ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={newProjectForm.customerId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raumtyp
                  </label>
                  <select
                    value={newProjectForm.roomType}
                    onChange={(e) => setNewProjectForm({
                      ...newProjectForm,
                      roomType: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Küche</option>
                    <option>Wohnzimmer</option>
                    <option>Badezimmer</option>
                    <option>Büro</option>
                    <option>Schlafzimmer</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Projekt erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Screen */}
      {showProjectSuccessScreen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-1">
                Projekt erfolgreich erstellt
              </h3>
              <p className="text-gray-600">
                Teilen Sie die folgenden Informationen mit Ihrem Kunden, um den Scan-Prozess zu starten.
              </p>
            </div>

            {/* Scan Code Section */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Raumscan-Code</h4>
                  <p className="text-sm text-gray-600">Gültig für 48 Stunden</p>
                </div>
                <div className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
                  {scanCode}
                </div>
              </div>
            </div>

            {/* Message Template Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-gray-900">Mit Kunden teilen</h4>
              </div>

              <div className="bg-white border border-gray-200 rounded-md p-3 mb-3">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Raumscan-Anleitung</h5>
                    <p className="text-sm text-gray-600">
                      Scan-Code: <span className="font-mono font-bold text-blue-600">{scanCode}</span>
                      <br />
                      Scan-Link: <span className="text-blue-600">raumblick.com/scan/{scanCode}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <p>Laden Sie unsere Scan-App aus dem App Store oder Play Store herunter</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <p>Geben Sie den Scan-Code ein oder verwenden Sie den obigen Link</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <p>Räumen Sie den Raum auf und sorgen Sie für gute Beleuchtung vor dem Scannen</p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Der Scan-Vorgang dauert etwa 10-15 Minuten. Der Code läuft in 48 Stunden ab.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => copyToClipboard(`Raumscan-Code: ${scanCode}\n\nLaden Sie unsere App herunter und geben Sie diesen Code ein, um mit dem Scannen Ihres Raums zu beginnen: raumblick.com/scan/${scanCode}`)}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 space-x-2"
                >
                  <Copy size={16} />
                  <span className="text-sm">Nachricht kopieren</span>
                </button>
                <button
                  onClick={() => copyToClipboard(`https://raumblick.com/scan/${scanCode}`)}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 space-x-2"
                >
                  <Link size={16} />
                  <span className="text-sm">Link kopieren</span>
                </button>
                <button
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 space-x-2"
                >
                  <Mail size={16} />
                  <span className="text-sm">E-Mail</span>
                </button>
                <button
                  className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 space-x-2"
                >
                  <MessageCircle size={16} />
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowProjectSuccessScreen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Zurück zum Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add this new Success Screen with Chat */}
      {showSentSuccessScreen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      Angebot erfolgreich gesendet
                    </h3>
                    <p className="text-sm text-gray-600">
                      Das Angebot wurde an {customerInfo.email} gesendet
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSentSuccessScreen(false);
                    setCurrentStep('dashboard');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex">
              {/* Chat Section */}
              <div className="flex-1 flex flex-col p-6 overflow-hidden"> {/* Added overflow-hidden */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {customerInfo.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{customerInfo.name}</h4>
                      <p className="text-xs text-gray-500">{customerInfo.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Online
                  </span>
                </div>

                <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto min-h-0"> {/* Added min-h-0 */}
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === 'system' 
                            ? 'justify-center' 
                            : msg.sender === 'sales' 
                              ? 'justify-end' 
                              : 'justify-start'
                        }`}
                      >
                        {msg.sender === 'system' ? (
                          <div className="bg-blue-50 text-blue-800 text-sm py-2 px-4 rounded-full">
                            {msg.message}
                          </div>
                        ) : msg.sender === 'sales' ? (
                          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-sm max-w-[80%]">
                            <div className="flex items-start">
                              <div className="mr-3 w-full min-w-0">
                                {msg.isHtml ? (
                                  <div 
                                    dangerouslySetInnerHTML={{ __html: msg.message }}
                                    className="text-sm break-words [&_.quote-message]:space-y-3 [&_.quote-link]:block [&_.quote-link]:mt-4 [&_.quote-link]:mb-4 
                                      [&_.quote-preview]:bg-blue-500 [&_.quote-preview]:rounded-lg [&_.quote-preview]:overflow-hidden 
                                      [&_.quote-image]:w-full [&_.quote-image]:h-32 [&_.quote-image]:object-cover
                                      [&_.quote-details]:p-3 [&_.quote-details]:flex [&_.quote-details]:flex-col [&_.quote-details]:gap-1
                                      [&_.quote-title]:text-sm [&_.quote-title]:font-medium
                                      [&_.quote-price]:text-sm [&_.quote-price]:font-bold
                                      [&_p]:break-words [&_a]:break-words"
                                  />
                                ) : (
                                  <p className="text-sm break-words">{msg.message}</p>
                                )}
                                <span className="text-xs text-blue-100 block mt-1">
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">SR</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm max-w-[80%]">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {customerInfo.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3 min-w-0">
                                <p className="text-sm text-gray-900 break-words">{msg.message}</p>
                                <span className="text-xs text-gray-500 block mt-1">
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
                  <form className="flex space-x-2" onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.elements.message;
                    if (input.value.trim()) {
                      setChatMessages([...chatMessages, {
                        id: Date.now(),
                        sender: 'sales',
                        message: input.value,
                        timestamp: new Date()
                      }]);
                      input.value = '';
                    }
                  }}>
                    <input
                      type="text"
                      name="message"
                      placeholder="Nachricht eingeben..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Senden
                    </button>
                  </form>
                </div>
              </div>

              {/* Quotation Preview */}
              <div className="w-96 border-l border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Angebot Übersicht</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500">Gesamtbetrag</span>
                      <div className="text-2xl font-bold text-gray-900">
                        {(quotationItems.reduce((sum, item) => sum + item.price, 0) * 1.19).toLocaleString()} €
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <span className="text-sm text-gray-500">Status</span>
                      <div className="flex items-center mt-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                        <span className="text-sm font-medium text-gray-900">Warten auf Antwort</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <span className="text-sm text-gray-500">Produkte</span>
                      <div className="mt-2 space-y-2">
                        {quotationItems.map((item) => (
                          <div key={item.id} className="text-sm text-gray-900">
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesRepresentativeFlow;