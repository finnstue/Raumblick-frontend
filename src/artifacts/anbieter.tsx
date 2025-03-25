import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  ChevronRight,
  Circle,
  Edit3,
  FileText,
  Grid,
  Layers,
  Maximize,
  MessageCircle,
  Rotate3D,
  Save,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
  Trash2,
  Move,
  X,
  Home,
  Mail,
  MessageSquare,
  Copy,
  Link,
  Share2,
  Utensils,
  Box,
  TableProperties,
  Refrigerator,
  BookmarkMinus,
  Droplets,
  Lightbulb,
  Monitor,
  ArrowLeft,
  ArrowRight,
  Pencil,
  StickyNote,
  Ruler,
} from 'lucide-react';
import * as THREE from 'three';
import { SpatialView } from './spatial-view';

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
    name: 'Leon Blumenthal',
    email: 'Leon@mail.de',
    address: 'Beispielweg 42, 10115 Berlin',
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
    email: '', // Add email field
  });

  // Add new state near other state declarations
  const [showProjectSuccessScreen, setShowProjectSuccessScreen] =
    useState(false);
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
    },
  ]);

  // Refs
  const canvasRef = useRef(null);
  const queryInputRef = useRef(null);

  // Load sample data on component mount
  useEffect(() => {
    // Sample customer scans
    const sampleScans = [
      {
        id: 1,
        customerId: 'C5317',
        customerName: 'Leon Blumenthal',
        scanDate: '2025-03-20',
        roomType: 'Küche',
        status: 'Scan abgeschlossen',
      },
      {
        id: 2,
        customerId: 'C1002',
        customerName: 'Laura Schmidt',
        scanDate: '2025-03-19',
        roomType: 'Wohnzimmer',
        status: 'Angebot gesendet', // Make sure status is 'Angebot gesendet'
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
      },
    ];

    // Sample product catalog
    const sampleProducts = [
      {
        id: 1,
        name: 'Refrigerator',
        price: 599,
        category: 'Kitchen Furniture',
        color: 'Silver',
        material: 'Stainless Steel',
        dimensions: '230x60x55cm',
        icon: Refrigerator,
      },
      {
        id: 2,
        name: 'Cabinet Set (3 units)',
        price: 899,
        category: 'Kitchen Furniture',
        color: 'Oak',
        material: 'Wood',
        dimensions: '180x35x70cm',
        icon: Box,
      },
      {
        id: 3,
        name: 'Island Kitchen Block',
        price: 749,
        category: 'Kitchen Furniture',
        color: 'Gray',
        material: 'Granite/Wood',
        dimensions: '120x80x90cm',
        icon: TableProperties,
      },
      {
        id: 5,
        name: 'Wall Shelving Unit',
        price: 349,
        category: 'Storage',
        color: 'White',
        material: 'MDF',
        dimensions: '120x25x40cm',
        icon: BookmarkMinus,
      },
      {
        id: 6,
        name: 'Sink & Faucet Combo',
        price: 459,
        category: 'Plumbing',
        color: 'Stainless',
        material: 'Stainless Steel',
        dimensions: '80x50x20cm',
        icon: Droplets,
      },
      {
        id: 7,
        name: 'LED Kitchen Lights Set',
        price: 249,
        category: 'Lighting',
        color: 'Warm White',
        material: 'Aluminum',
        dimensions: '4x sets',
        icon: Lightbulb,
      },
      {
        id: 8,
        name: 'Workstation Desk',
        price: 599,
        category: 'Office Furniture',
        color: 'Black/Walnut',
        material: 'Wood/Metal',
        dimensions: '160x80x75cm',
        icon: Monitor,
      },
    ];

    // Extract unique categories
    const categories = [
      'All',
      ...new Set(sampleProducts.map((product) => product.category)),
    ];

    setCustomerScans(sampleScans);
    setProductCatalog(sampleProducts);
    setProductCategories(categories);
  }, []);

  const resultCounter = useRef(0);

  const [boxes, setBoxes] = useState([]);
  const [notes, setNotes] = useState([]);

  const results = [
    {
      message:
        'Eine Dreifach-Steckdose befindet sich an der linken Wand in Bodennähe, und eine weitere Zweifach-Steckdose ist unter den oberen Küchenschränken an der Rückwand.',
      objects: [
        {
          position: [
            -0.8810466873456969, 0.7242791017579844, -0.9059332374410928,
          ],
          size: [
            0.25346902642171565, 0.022487272828035514, 0.10330435198516795,
          ],
          color: 'blue',
        },
        {
          position: [
            0.9929557536462053, 0.685617461817668, 0.20779852017668488,
          ],
          size: [
            0.10888996942258099, 0.057477178021524064, 0.06930418236266396,
          ],
          color: 'blue',
        },
      ],
    },
    {
      message: 'Die beiden Oberschränke sind markiert und jeweils 60cm breit.',
      objects: [
        {
          position: [
            1.2580810296793057, 0.5408218471088544, 0.6405583210829071,
          ],
          size: [0.6442045286487451, 0.3718225229390045, 0.8326004913815241],
          color: 'brown',
        },
        {
          position: [
            0.06383434706404639, 0.5566495684807564, 0.6506974786150543,
          ],
          size: [0.598527144051044, 0.38106302647714246, 0.806982028362666],
          color: 'brown',
        },
      ],
    },
    {
      message: 'Request 3',
      objects: [],
    },
  ];

  // Handler for natural language queries
  const handleQuerySubmit = (e) => {
    e.preventDefault();

    setQueryResults(results[resultCounter.current]);
    setBoxes(results[resultCounter.current].objects);
    resultCounter.current++;
    // Clear the input after processing
    setNaturalLanguageQuery('');
  };

  // Add this new helper function after the state declarations
  const hasScanData = (scan) => {
    console.log('Checking scan data for:', scan.customerName);
    const hasData = scan.customerName === 'Leon Blumenthal';
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
      email:
        scan.customerId === 'C1004'
          ? 'anna.mueller@example.com'
          : scan.customerId === 'C1002'
          ? 'laura.schmidt@example.com'
          : scan.customerId.startsWith('C5317')
          ? 'Leon@mail.de'
          : `${scan.customerName.toLowerCase().replace(' ', '.')}@example.com`,
      address:
        scan.customerId === 'C1004'
          ? 'Leopoldstraße 87, 80802 München'
          : scan.customerId === 'C1002'
          ? 'Gartenstraße 15, 80539 München'
          : 'Beispielweg 42, 10115 Berlin',
    });

    if (scan.status === 'Angebot gesendet') {
      // Set specific quote items based on customer
      let customerQuotationItems = [];

      if (scan.customerName === 'Anna Müller') {
        customerQuotationItems = [
          {
            id: 201,
            name: 'Executive Desk "Professional Plus"',
            category: 'Office Furniture',
            price: 1299,
            quantity: 4,
            color: 'Natural Oak/Black',
            material: 'Solid Wood/Steel',
            dimensions: '180x80x75cm',
          },
          {
            id: 202,
            name: 'Ergonomic Office Chair "Comfort Pro"',
            category: 'Office Furniture',
            price: 799,
            quantity: 4,
            color: 'Black',
            material: 'Mesh/Aluminum',
            dimensions: 'Adjustable',
          },
          {
            id: 203,
            name: 'Storage Cabinet System',
            category: 'Storage',
            price: 649,
            quantity: 2,
            color: 'Oak/White',
            material: 'MDF/Wood Veneer',
            dimensions: '160x45x120cm',
          },
          {
            id: 204,
            name: 'LED Desk Lamp "Focus"',
            category: 'Lighting',
            price: 129,
            quantity: 4,
            color: 'Silver',
            material: 'Aluminum',
            dimensions: 'Adjustable arm',
          },
          {
            id: 205,
            name: 'Monitor Stand with Drawer',
            category: 'Accessories',
            price: 189,
            quantity: 4,
            color: 'Black',
            material: 'Aluminum/Wood',
            dimensions: '60x30x12cm',
          },
        ];
      } else if (scan.customerName === 'Laura Schmidt') {
        customerQuotationItems = [
          {
            id: 101,
            name: 'Modern Sofa "Comfort Plus"',
            category: 'Living Room',
            price: 1899,
            quantity: 1,
            color: 'Beige',
            material: 'Premium Fabric',
            dimensions: '240x95x85cm',
          },
          {
            id: 102,
            name: 'Coffee Table "Milano"',
            category: 'Living Room',
            price: 549,
            quantity: 1,
            color: 'Walnut/Black',
            material: 'Solid Wood/Metal',
            dimensions: '120x60x45cm',
          },
          {
            id: 103,
            name: 'LED Floor Lamp "Ambience"',
            category: 'Lighting',
            price: 299,
            quantity: 1, // Quantity hinzugefügt
            color: 'Brushed Steel',
            material: 'Metal/Glass',
            dimensions: 'H: 165cm, Ø: 35cm',
          },
          {
            id: 104,
            name: 'Media Console "Entertainment Pro"',
            category: 'Storage',
            price: 899,
            quantity: 1, // Quantity hinzugefügt
            color: 'Walnut',
            material: 'Engineered Wood',
            dimensions: '180x45x55cm',
          },
        ];
      }

      // Calculate the total price for this specific set of items
      const totalPrice = calculateTotal(customerQuotationItems) * 1.19;

      // Update quotation items state
      setQuotationItems(customerQuotationItems);

      // Create chat messages with the frozen price
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
              <p>Sehr geehrte${
                scan.customerName === 'Leon Blumenthal' ? 'r' : ''
              } ${scan.customerName},</p>
              <p>ich habe Ihnen soeben ein Angebot zugesendet.</p>
              <a href="/quote/${scan.id}" class="quote-link">
                <div class="quote-preview">
                  <div class="quote-details">
                    <span class="quote-title">Angebot #1</span>
                    <span class="quote-price">${totalPrice.toLocaleString()} €</span>
                  </div>
                </div>
              </a>
              <p>Bitte schauen Sie sich das Angebot in Ruhe an. Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>
              <p>Mit freundlichen Grüßen,<br/>Finn Stürenburg</p>
            </div>
          `,
          timestamp: new Date(),
          isHtml: true,
          frozenPrice: totalPrice, // Store the price with the message for future reference
        },
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

  // Handler for adding products to quotation
  const handleAddToQuotation = (product) => {
    setQuotationItems([...quotationItems, product]);
    setSelectedProducts([...selectedProducts, product]);
    setTimeout(() => {
      setBoxes([
        ...boxes,
        {
          "position": [
              -0.4975438576492394,
              0.4479938625565003,
              -0.09743544053465603
          ],
          "size": [
              0.5571349074471671,
              0.5945329424895074,
              2.302829477885421
          ],
          "color": "black"
      },
      ]);
    }, 2000);
  };

  // Handler for removing products from quotation
  const handleRemoveFromQuotation = (productId) => {
    setQuotationItems(quotationItems.filter((item) => item.id !== productId));
    setSelectedProducts(
      selectedProducts.filter((item) => item.id !== productId)
    );
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
    // setBoxes([]);
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
      codeExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000),
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
      email: '', // Add email field
    });
  };

  const generateScanCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Update handleSendToCustomer to use the same pattern
  const handleSendToCustomer = () => {
    // Calculate the total price at the moment of sending
    const totalPrice = calculateTotal(quotationItems) * 1.19;

    setNotes([])

    // Update customer status
    setCustomerScans((prevScans) =>
      prevScans.map((scan) =>
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
            <p>Sehr geehrte${
              customerInfo.name === 'Leon Blumenthal' ? 'r' : ''
            } ${customerInfo.name},</p>
            <p>ich habe Ihnen soeben ein Angebot zugesendet.</p>
            <a href="/quote/${selectedScan?.id}" class="quote-link">
              <div class="quote-preview">
                <div class="quote-details">
                  <span class="quote-title">Angebot #1</span>
                  <span class="quote-price">${totalPrice.toLocaleString()} €</span>
                </div>
              </div>
            </a>
            <p>Bitte schauen Sie sich das Angebot in Ruhe an. Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>
            <p>Mit freundlichen Grüßen,<br/>Finn Stürenburg</p>
          </div>
        `,
        timestamp: new Date(),
        isHtml: true,
        frozenPrice: totalPrice, // Store the price with the message
      },
    ]);
    setShowSentSuccessScreen(true);
  };

  // Ändern Sie die Preisberechnungen, um die Mengen zu berücksichtigen
  const calculateTotal = (items) => {
    return items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  };

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm py-4 px-6'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <Grid className='text-blue-600' size={24} />
            <span className='text-xl font-bold'>
              Raum<span className='text-blue-600'>Blick</span>
            </span>
          </div>

          <div className='flex items-center space-x-6'>
            <a href='#' className='text-gray-600 hover:text-blue-600'>
              Documentation
            </a>
            <a href='#' className='text-gray-600 hover:text-blue-600'>
              Support
            </a>
            <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white'>
              SR
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className='flex-1 flex overflow-auto'>
        {/* Dashboard View */}
        {currentStep === 'dashboard' && (
          <div className='flex-1 p-6 overflow-auto'>
            <div className='max-w-6xl mx-auto'>
              <div className='mb-6 flex justify-between items-center'>
                <h1 className='text-2xl font-bold text-gray-800'>
                  Customer Scans
                </h1>
                <div className='flex space-x-3'>
                  <div className='relative'>
                    <input
                      type='text'
                      placeholder='Search scans...'
                      className='pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                    />
                    <Search
                      className='absolute left-3 top-2.5 text-gray-400'
                      size={16}
                    />
                  </div>
                  <select
                    className='border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500'
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
                    className='bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700'
                  >
                    + Neues Projekt
                  </button>
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Customer
                      </th>
                      <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Room Type
                      </th>
                      <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Scan Date
                      </th>
                      <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='w-1/6 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {customerScans.map((scan) => (
                      <tr
                        key={scan.id}
                        className={`hover:bg-gray-50 ${
                          statusFilter === 'All status' ||
                          scan.status === statusFilter
                            ? ''
                            : 'hidden'
                        }`}
                      >
                        <td className='w-1/4 px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {scan.customerName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {scan.customerId}
                          </div>
                        </td>
                        <td className='w-1/6 px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {scan.roomType}
                        </td>
                        <td className='w-1/6 px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {scan.scanDate}
                        </td>
                        <td className='w-1/6 px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              scan.status === 'Ausstehender Scan'
                                ? 'bg-yellow-100 text-yellow-800'
                                : scan.status === 'Scan abgeschlossen'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {scan.status}
                          </span>
                        </td>
                        <td className='w-1/6 px-6 py-4 whitespace-nowrap text-right text-md font-medium'>
                          <button
                            className='text-blue-600 hover:text-blue-900'
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
          <div className='flex-1 p-6 overflow-auto'>
            <div className='max-w-3xl mx-auto'>
              <div className='mb-6 flex items-center'>
                <button
                  onClick={handleReturnToDashboard}
                  className='text-gray-400 hover:text-gray-600 mr-4'
                >
                  <ChevronRight className='rotate-180' size={20} />
                </button>
                <h2 className='text-2xl font-bold text-gray-800'>
                  {selectedScan.customerName}'s {selectedScan.roomType}
                </h2>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                <div className='mb-6'>
                  <Camera className='w-16 h-16 text-blue-600 mx-auto mb-4' />
                  <h3 className='text-xl font-medium text-gray-900 mb-2'>
                    Raumscan erforderlich
                  </h3>
                  <p className='text-gray-600 max-w-md mx-auto'>
                    Um mit dem Entwurfs- und Angebot-Prozess fortzufahren,
                    benötigen wir eine 3D-Raumscan des Raums. Bitte stellen Sie
                    sicher, dass der Kunde den Raumscan-Prozess abschließt.
                  </p>
                </div>

                <div className='mt-8'>
                  <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
                    Kunden kontaktieren
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Analysis View */}
        {currentStep === 'analysis' && selectedScan && (
          <div className='flex-1 flex flex-col overflow-auto'>
            <div className='bg-white border-b border-gray-200 p-4 flex justify-between items-center'>
              <div className='flex items-center space-x-4'>
                <button
                  onClick={handleReturnToDashboard}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <ChevronRight className='rotate-180' size={20} />
                </button>
                <h2 className='text-lg font-medium'>
                  {selectedScan.customerName}'s {selectedScan.roomType}
                </h2>
                <span
                  className={`px-2 py-1 text-xs leading-none font-medium rounded-full ${
                    selectedScan.status === 'Ausstehender Scan'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedScan.status === 'Scan abgeschlossen'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedScan.status}
                </span>
              </div>

              <button
                onClick={handleAdvanceToProposal}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
              >
                Weiter zu Planung
              </button>
            </div>

            <div className='flex-1 flex'>
              {/* 3D Viewer */}
              <div className='flex-1 flex flex-col'>
                <div className='bg-white border-b border-gray-200 p-2 flex space-x-2 justify-center'>
                  
                <button
                    className={`p-2 rounded-md ${
                      viewMode === 'top'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Ruler size={20} />
                  </button>
                  <button
                    className={`p-2 rounded-md ${
                      viewMode === 'top'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <StickyNote size={20} />
                  </button>
                  <div className='border-l border-gray-200 mx-1'></div>
                  <button className='p-2 rounded-md text-gray-500 hover:bg-gray-100'>
                    <ZoomIn size={20} />
                  </button>
                  <button className='p-2 rounded-md text-gray-500 hover:bg-gray-100'>
                    <ZoomOut size={20} />
                  </button>
                  <button className='p-2 rounded-md text-gray-500 hover:bg-gray-100'>
                    <Maximize size={20} />
                  </button>
                </div>

                <div
                  className='flex-1 relative bg-gray-100'
                  style={{ maxHeight: '600px' }}
                >
                  <SpatialView
                    meshPath='mesh.ply'
                    measurements_={
                      [
                        // {
                        //   start: new THREE.Vector3(0, 0, 0),
                        //   end: new THREE.Vector3(1, 1, 1),
                        //   distance: 1,
                        // },
                      ]
                    }
                    boxes={boxes}
                    setBoxes={setBoxes}
                    notes={notes}
                    setNotes={setNotes}
                  />
                </div>

                <div className='p-4 bg-white border-t border-gray-200'>
                  <form
                    onSubmit={handleQuerySubmit}
                    className='flex items-center'
                  >
                    <input
                      type='text'
                      value={naturalLanguageQuery}
                      onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                      ref={queryInputRef}
                      className='flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500'
                      placeholder="Stellen Sie eine Frage zu diesem Raum..."
                    />
                    <button
                      type='submit'
                      className='px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700'
                    >
                      <MessageCircle size={20} />
                    </button>
                  </form>

                  {queryResults && (
                    <div className='mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md'>
                      <div className='flex'>
                        <ArrowRight
                          size={20}
                          className='text-blue-500 mr-2 flex-shrink-0 mt-0.5'
                        />
                        <p className='text-lg text-gray-700'>
                          {queryResults.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proposal Creation View */}
        {currentStep === 'proposal' && selectedScan && (
          <div className='flex-1 flex flex-col overflow-auto'>
            <div className='bg-white border-b border-gray-200 p-4 flex justify-between items-center'>
              <div className='flex items-center space-x-4'>
                <button
                  onClick={() => setCurrentStep('analysis')}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <ChevronRight className='rotate-180' size={20} />
                </button>
                <h2 className='text-lg font-medium'>
                  Planning for {selectedScan.customerName}'s{' '}
                  {selectedScan.roomType}
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

            <div className='flex-1 flex'>
              {/* 3D Viewer */}
              <div className='flex-1 flex flex-col'>
                <div className='bg-white border-b border-gray-200 p-2 flex space-x-2 justify-center'>
                  
                  <button
                      className={`p-2 rounded-md ${
                        viewMode === 'top'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Ruler size={20} />
                    </button>
                    <button
                      className={`p-2 rounded-md ${
                        viewMode === 'top'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <StickyNote size={20} />
                    </button>
                    <div className='border-l border-gray-200 mx-1'></div>
                    <button className='p-2 rounded-md text-gray-500 hover:bg-gray-100'>
                      <ZoomIn size={20} />
                    </button>
                    <button className='p-2 rounded-md text-gray-500 hover:bg-gray-100'>
                      <ZoomOut size={20} />
                    </button>
                    <button className='p-2 rounded-md text-gray-500 hover:bg-gray-100'>
                      <Maximize size={20} />
                    </button>
                  </div>

                <div
                  className='flex-1 relative bg-gray-100'
                  style={{ maxHeight: '600px' }}
                >
                  <SpatialView
                    meshPath='mesh.ply'
                    measurements_={[]}
                    boxes={boxes}
                    setBoxes={setBoxes}
                    notes={notes}
                    setNotes={setNotes}
                  />

                </div>

              </div>

              {/* Product Catalog */}
              <div className='w-80 border-l border-gray-200 bg-white flex flex-col'>
              <h1 className="font-medium text-gray-800 text-lg" style={{margin: "1em", marginBottom: "0px"}}>Produktkatalog</h1>
                <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                  {productCatalog
                    .map((product) => (
                      <div
                        key={product.id}
                        className='border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition'
                      >
                        <div className='p-3'>
                          <div className='flex'>
                            <div className='w-16 h-16 rounded-md bg-blue-50 flex items-center justify-center mr-3'>
                              {React.createElement(product.icon, {
                                size: 32,
                                className: 'text-blue-600',
                              })}
                            </div>
                            <div>
                              <h4 className='font-medium text-gray-800'>
                                {product.name}
                              </h4>
                              <p className='text-xs text-gray-500'>
                                {product.category}
                              </p>
                              <div className='text-blue-600 font-medium mt-1'>
                                {product.price.toLocaleString()} €
                              </div>
                            </div>
                          </div>

                          <div className='mt-3 border-t border-gray-100 pt-3'>
                            <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
                              <div>Color: {product.color}</div>
                              <div>Material: {product.material}</div>
                              <div colSpan={2}>
                                Dimensions: {product.dimensions}
                              </div>
                            </div>
                          </div>

                          <div className='mt-3 flex justify-end'>
                            <button
                              onClick={() => handleAddToQuotation(product)}
                              className='px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700'
                            >
                              Add to Quotation
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {quotationItems.length > 0 && (
                  <div className='border-t border-gray-200 p-4'>
                    <div className='flex justify-between items-center mb-2'>
                      <h4 className='font-medium text-gray-800'>
                        Selected Products
                      </h4>
                      <span className='text-xs text-gray-500'>
                        {quotationItems.length} items
                      </span>
                    </div>

                    <div className='max-h-48 overflow-y-auto divide-y divide-gray-100'>
                      {quotationItems.map((item) => (
                        <div
                          key={item.id}
                          className='py-2 flex justify-between items-center'
                        >
                          <div className='text-sm text-gray-800'>
                            {item.name}
                          </div>
                          <div className='flex items-center'>
                            <span className='text-sm font-medium mr-2'>
                              {item.price.toLocaleString()} €
                            </span>
                            <button
                              onClick={() => handleRemoveFromQuotation(item.id)}
                              className='text-gray-400 hover:text-red-500'
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='mt-3 pt-3 border-t border-gray-200 flex justify-between items-center'>
                      <span className='font-medium text-gray-800'>Total:</span>
                      <span className='font-medium text-gray-800'>
                        {calculateTotal(quotationItems).toLocaleString()} €
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
          <div className='flex-1 p-6 overflow-auto'>
            <div className='max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden'>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-1'>
                      Quotation
                    </h2>
                    <p className='text-gray-500'>
                      Created on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className='flex space-x-3'>
                    <button
                      onClick={() => setCurrentStep('proposal')}
                      className='px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50'
                    >
                      Edit Proposal
                    </button>
                    <button className='px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50'>
                      Download PDF
                    </button>
                    <button
                      onClick={handleSendToCustomer}
                      className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                    >
                      Send to Customer
                    </button>
                  </div>
                </div>
              </div>

              <div className='p-6'>
                <div className='grid grid-cols-2 gap-8 mb-8'>
                  <div>
                    <h3 className='text-sm font-medium text-gray-500 mb-2'>
                      Provider
                    </h3>
                    <p className='text-gray-800'>Küchen 123 GmbH</p>
                    <p className='text-gray-800'>Musterstraße 123</p>
                    <p className='text-gray-800'>80333 München</p>
                    <p className='text-gray-800'>contact@kuenchen123.de</p>
                  </div>
                  <div>
                    <h3 className='text-sm font-medium text-gray-500 mb-2'>
                      Customer
                    </h3>
                    <p className='text-gray-800'>{customerInfo.name}</p>
                    <p className='text-gray-800'>{"Musterstraße 123"}</p>
                    <p className='text-gray-800'>{"80333 München"}</p>
                    <p className='text-gray-800'>{customerInfo.email}</p>
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>
                    Project Visualization
                  </h3>

                  <div className=''>
                    <div className='aspect-video bg-gray-100 rounded-md overflow-hidden'>
                      <SpatialView
                        meshPath='mesh.ply'
                        notes={notes}
                        setNotes={setNotes}
                        measurements_={[]}
                        boxes={boxes}
                        setBoxes={setBoxes}
                      />
                    </div>
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>
                    Quotation Details
                  </h3>

                  <div className='border border-gray-200 rounded-lg overflow-hidden'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Product
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Specifications
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Quantity
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {quotationItems.map((item, index) => (
                          <tr key={index}>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm font-medium text-gray-900'>
                                {item.name}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {item.category}
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm text-gray-500'>
                                {item.color} | {item.material}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {item.dimensions}
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {item.quantity || 1}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                              {(
                                item.price * (item.quantity || 1)
                              ).toLocaleString()}{' '}
                              €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className='bg-gray-50'>
                        <tr>
                          <td
                            colSpan='3'
                            className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'
                          >
                            Subtotal
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right'>
                            {calculateTotal(quotationItems).toLocaleString()} €
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan='3'
                            className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'
                          >
                            VAT (19%)
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right'>
                            {(
                              calculateTotal(quotationItems) * 0.19
                            ).toLocaleString()}{' '}
                            €
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan='3'
                            className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'
                          >
                            <strong>Total</strong>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right'>
                            {(
                              calculateTotal(quotationItems) * 1.19
                            ).toLocaleString()}{' '}
                            €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>
                    Notes
                  </h3>
                  <div className='border border-gray-200 rounded-md p-4'>
                    <textarea
                      className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                      rows='3'
                      placeholder='Add any additional notes or terms for the customer...'
                    ></textarea>
                  </div>
                </div>

                <div className='bg-blue-50 border border-blue-100 rounded-md p-4 mb-8'>
                  <div className='flex'>
                    <AlertCircle
                      size={20}
                      className='text-blue-600 mr-3 flex-shrink-0 mt-0.5'
                    />
                    <div>
                      <h4 className='font-medium text-gray-800'>
                        Terms and Conditions
                      </h4>
                      <p className='text-sm text-gray-600 mt-1'>
                        This quotation is valid for 30 days from the date of
                        issue. Delivery time will be confirmed upon order
                        confirmation. Installation services are included in the
                        price. A 50% deposit is required to begin the project.
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
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
          <div className='relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
            <div className='flex justify-between items-center p-4 border-b'>
              <h3 className='text-lg font-medium text-gray-900'>
                Neues Projekt erstellen
              </h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className='text-gray-400 hover:text-gray-500'
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className='p-4'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Kundenname
                  </label>
                  <input
                    type='text'
                    required
                    value={newProjectForm.customerName}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        customerName: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email
                  </label>
                  <input
                    type='email'
                    required
                    value={newProjectForm.email}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        email: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Kunden-ID
                  </label>
                  <input
                    type='text'
                    disabled
                    value={newProjectForm.customerId}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Raumtyp
                  </label>
                  <select
                    value={newProjectForm.roomType}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        roomType: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option>Küche</option>
                    <option>Wohnzimmer</option>
                    <option>Badezimmer</option>
                    <option>Büro</option>
                    <option>Schlafzimmer</option>
                  </select>
                </div>
              </div>

              <div className='mt-6 flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                >
                  Abbrechen
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
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
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
          <div className='bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4'>
            <div className='text-center mb-4'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Check className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='text-xl font-medium text-gray-900 mb-1'>
                Projekt erfolgreich erstellt
              </h3>
              <p className='text-gray-600'>
                Teilen Sie die folgenden Informationen mit Ihrem Kunden, um den
                Scan-Prozess zu starten.
              </p>
            </div>

            {/* Scan Code Section */}
            <div className='bg-blue-50 rounded-lg p-4 mb-4'>
              <div className='flex justify-between items-center mb-2'>
                <div>
                  <h4 className='text-lg font-medium text-gray-900'>
                    Raumscan-Code
                  </h4>
                  <p className='text-sm text-gray-600'>Gültig für 48 Stunden</p>
                </div>
                <div className='text-3xl font-mono font-bold text-blue-600 tracking-wider'>
                  {scanCode}
                </div>
              </div>
            </div>

            {/* Message Template Section */}
            <div className='bg-gray-50 rounded-lg p-4 mb-4'>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-lg font-medium text-gray-900'>
                  Mit Kunden teilen
                </h4>
              </div>

              <div className='bg-white border border-gray-200 rounded-md p-3 mb-3'>
                <div className='flex items-start space-x-3 mb-3'>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Camera className='w-6 h-6 text-blue-600' />
                  </div>
                  <div>
                    <h5 className='font-medium text-gray-900 mb-1'>
                      Raumscan-Anleitung
                    </h5>
                    <p className='text-sm text-gray-600'>
                      Scan-Code:{' '}
                      <span className='font-mono font-bold text-blue-600'>
                        {scanCode}
                      </span>
                      <br />
                      Scan-Link:{' '}
                      <span className='text-blue-600'>
                        raumblick.example/scan/{scanCode}
                      </span>
                    </p>
                  </div>
                </div>

                <div className='space-y-2 text-sm text-gray-600'>
                  <div className='flex items-start space-x-2'>
                    <div className='w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <span className='text-xs font-medium text-blue-600'>
                        1
                      </span>
                    </div>
                    <p>
                      Geben Sie den Scan-Code ein oder verwenden Sie den obigen
                      Link
                    </p>
                  </div>
                  <div className='flex items-start space-x-2'>
                    <div className='w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <span className='text-xs font-medium text-blue-600'>
                        2
                      </span>
                    </div>
                    <p>
                      Räumen Sie den Raum auf und sorgen Sie für gute
                      Beleuchtung
                    </p>
                  </div>
                  <div className='flex items-start space-x-2'>
                    <div className='w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <span className='text-xs font-medium text-blue-600'>
                        3
                      </span>
                    </div>
                    <p>Scannen Sie den Raum mit ihrem Smartphone</p>
                  </div>
                </div>

                <div className='mt-2 pt-2 border-t border-gray-100'>
                  <p className='text-xs text-gray-500'>
                    Der Scan-Vorgang dauert 1-2 Minuten. Der Code läuft in 48
                    Stunden ab.
                  </p>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2'>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Raumscan-Code: ${scanCode}\n\nLaden Sie unsere App herunter und geben Sie diesen Code ein, um mit dem Scannen Ihres Raums zu beginnen: raumblick.com/scan/${scanCode}`
                    )
                  }
                  className='flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 space-x-2'
                >
                  <Copy size={16} />
                  <span className='text-sm'>Nachricht kopieren</span>
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(`https://raumblick.xyz/scan/${scanCode}`)
                  }
                  className='flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 space-x-2'
                >
                  <Link size={16} />
                  <span className='text-sm'>Link kopieren</span>
                </button>
                <button className='flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 space-x-2'>
                  <Mail size={16} />
                  <span className='text-sm'>E-Mail</span>
                </button>
                <button className='flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 space-x-2'>
                  <MessageCircle size={16} />
                  <span className='text-sm'>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowProjectSuccessScreen(false)}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
              >
                Zurück zum Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add this new Success Screen with Chat */}
      {showSentSuccessScreen && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full my-4 h-[calc(100vh-8rem)] flex flex-col overflow-hidden'>
            {' '}
            {/* Changed from h-[calc(100vh-2rem)] to h-[calc(100vh-8rem)] */}
            {/* Header */}
            <div className='p-6 border-b border-gray-200 flex-shrink-0'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                    <Check className='h-6 w-6 text-green-600' />
                  </div>
                  <div>
                    <h3 className='text-xl font-medium text-gray-900'>
                      Angebot erfolgreich gesendet
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Das Angebot wurde an {customerInfo.email} gesendet
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSentSuccessScreen(false);
                    setCurrentStep('dashboard');
                  }}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* Content container */}
            <div className='flex-1 flex overflow-hidden'>
              {/* Chat Section */}
              <div className='flex-1 flex flex-col overflow-hidden'>
                {/* Chat header */}
                <div className='px-6 py-4 border-b border-gray-200 flex-shrink-0'>
                  <h4 className='text-lg font-medium text-gray-900'>
                    Chat mit {customerInfo.name}
                  </h4>{' '}
                  {/* Updated to include customer name */}
                </div>

                {/* Messages container - make sure this scrolls */}
                <div className='flex-1 px-6 py-4 overflow-y-auto'>
                  <div className='space-y-4'>
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
                          <div className='bg-blue-50 text-blue-800 text-sm py-2 px-4 rounded-full'>
                            {msg.message}
                          </div>
                        ) : msg.sender === 'sales' ? (
                          <div className='bg-blue-600 text-white p-4 rounded-lg shadow-sm max-w-[80%]'>
                            <div className='flex items-start'>
                              <div className='mr-3 w-full min-w-0'>
                                {msg.isHtml ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: msg.message,
                                    }}
                                    className='text-sm break-words [&_.quote-message]:space-y-3 [&_.quote-link]:block [&_.quote-link]:mt-4 [&_.quote-link]:mb-4 
                                      [&_.quote-preview]:bg-blue-500 [&_.quote-preview]:rounded-lg [&_.quote-preview]:overflow-hidden 
                                      [&_.quote-image]:w-full [&_.quote-image]:h-32 [&_.quote-image]:object-cover
                                      [&_.quote-details]:p-3 [&_.quote-details]:flex [&_.quote-details]:flex-col [&_.quote-details]:gap-1
                                      [&_.quote-title]:text-sm [&_.quote-title]:font-medium
                                      [&_.quote-price]:text-sm [&_.quote-price]:font-bold
                                      [&_p]:break-words [&_a]:break-words'
                                  />
                                ) : (
                                  <p className='text-sm break-words'>
                                    {msg.message}
                                  </p>
                                )}
                                <span className='text-xs text-blue-100 block mt-1'>
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <div className='flex-shrink-0'>
                                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                                  <span className='text-sm font-medium text-white'>
                                    SR
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='bg-white border border-gray-200 p-4 rounded-lg shadow-sm max-w-[80%]'>
                            <div className='flex items-start'>
                              <div className='flex-shrink-0'>
                                <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                                  <span className='text-sm font-medium text-gray-600'>
                                    {customerInfo.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </span>
                                </div>
                              </div>
                              <div className='ml-3 min-w-0'>
                                <p className='text-sm text-gray-900 break-words'>
                                  {msg.message}
                                </p>
                                <span className='text-xs text-gray-500 block mt-1'>
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

                {/* Input form - keep at bottom */}
                <div className='px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white'>
                  <form
                    className='flex space-x-2'
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.target.elements.message;
                      if (input.value.trim()) {
                        setChatMessages([
                          ...chatMessages,
                          {
                            id: Date.now(),
                            sender: 'sales',
                            message: input.value,
                            timestamp: new Date(),
                          },
                        ]);
                        input.value = '';
                      }
                    }}
                  >
                    <input
                      type='text'
                      name='message'
                      placeholder='Nachricht eingeben...'
                      className='flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500'
                    />
                    <button
                      type='submit'
                      className='px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center'
                    >
                      <MessageSquare size={16} className='mr-2' />
                      Senden
                    </button>
                  </form>
                </div>
              </div>

              {/* Quotation Preview Sidebar */}
              <div className='w-96 border-l border-gray-200 p-6 overflow-y-auto bg-white'>
                <h4 className='text-lg font-medium text-gray-900 mb-4'>
                  Angebot Übersicht
                </h4>
                <div className='space-y-4'>
                  <div>
                    <span className='text-sm text-gray-500'>Gesamtbetrag</span>
                    <div className='text-2xl font-bold text-gray-900'>
                      {(calculateTotal(quotationItems) * 1.19).toLocaleString()}{' '}
                      €
                    </div>
                  </div>
                  <div className='border-t border-gray-200 pt-4'>
                    <span className='text-sm text-gray-500'>Status</span>
                    <div className='flex items-center mt-1'>
                      <span className='w-2 h-2 bg-yellow-400 rounded-full mr-2'></span>
                      <span className='text-sm font-medium text-gray-900'>
                        Warten auf Antwort
                      </span>
                    </div>
                  </div>
                  <div className='border-t border-gray-200 pt-4'>
                    <span className='text-sm text-gray-500'>Produkte</span>
                    <div className='mt-2 space-y-2'>
                      {quotationItems.map((item) => (
                        <div
                          key={item.id}
                          className='text-sm text-gray-900 flex justify-between items-center'
                        >
                          <span>{item.name}</span>
                          <span className='text-gray-500'>
                            {item.quantity}×
                          </span>
                        </div>
                      ))}
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
