import React, { useState } from 'react';
import {
  Check,
  Download,
  ChevronDown,
  MessageSquare,
  Share2,
  ThumbsUp,
  ThumbsDown,
  X,
} from 'lucide-react';
import { SpatialView } from './spatial-view';
import * as THREE from 'three';
interface QuoteItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  color: string;
  material: string;
  dimensions: string;
}

interface CustomerQuoteProps {
  quoteId?: string;
}

const CustomerQuote: React.FC<CustomerQuoteProps> = ({
  quoteId = 'Q2024-001',
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [proposedChanges, setProposedChanges] = useState('');
  const [changesSubmitted, setChangesSubmitted] = useState(false);

  // Sample quote data - in a real app, this would be fetched based on the quoteId
  const quoteData = {
    provider: {
      name: 'RaumBlick Solutions GmbH',
      address: 'Musterstraße 123',
      city: '80333 München',
      email: 'contact@raumblick.de',
      logo: '/raumblick-logo.png',
    },
    customer: {
      name: 'Max Mustermann',
      address: 'Beispielweg 42',
      city: '10115 Berlin',
      email: 'max.mustermann@example.com',
    },
    quote: {
      number: quoteId,
      date: '2024-03-21',
      validUntil: '2024-04-20',
      status: 'Aktiv',
      items: [
        {
          id: 1,
          name: 'Modern Kitchen Counter',
          category: 'Kitchen Furniture',
          price: 1299,
          quantity: 1,
          color: 'White',
          material: 'Laminate',
          dimensions: '240x60x90cm',
        },
        {
          id: 2,
          name: 'Cabinet Set (3 units)',
          price: 899,
          quantity: 1,
          color: 'Oak',
          material: 'Wood',
          dimensions: '180x35x70cm',
          category: 'Kitchen Furniture',
        },
        {
          id: 3,
          name: 'Built-in Refrigerator',
          price: 1499,
          quantity: 1,
          color: 'Silver',
          material: 'Stainless Steel',
          dimensions: '70x65x180cm',
          category: 'Appliances',
        },
      ] as QuoteItem[],
    },
  };

  const calculateSubtotal = (items: QuoteItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal(quoteData.quote.items);
  const vat = subtotal * 0.19;
  const total = subtotal + vat;

  const handleAcceptQuote = () => {
    // Implementation for accepting quote
  };

  const handleFeedbackSubmit = (feedback: 'positive' | 'negative') => {
    // Implementation for submitting feedback
    setFeedbackSubmitted(true);
    setShowFeedbackForm(false);
  };

  const handleChangesSubmit = () => {
    setShowChangesForm(false);
    setChangesSubmitted(true);
    setTimeout(() => setChangesSubmitted(false), 5000);
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      {changesSubmitted ? (
        // Full-page success message
        <div className='max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden p-8 text-center'>
          <div className='mb-6'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Check size={32} className='text-green-500' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Vielen Dank für Ihre Änderungsvorschläge!
            </h1>
            <p className='text-gray-600'>
              Wir haben Ihre Vorschläge erhalten und werden diese sorgfältig
              prüfen.
            </p>
          </div>

          <div className='space-y-4 mb-8'>
            <p className='text-gray-600'>
              Unser Team wird sich innerhalb der nächsten 48 Stunden mit einem
              aktualisierten Angebot bei Ihnen melden.
            </p>
            <p className='text-sm text-gray-500'>
              Angebotsnummer: {quoteData.quote.number}
            </p>
          </div>

          <div className='flex justify-center space-x-4'>
            <button
              onClick={() => setChangesSubmitted(false)}
              className='px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center'
            >
              Zurück zum Angebot
            </button>
          </div>
        </div>
      ) : (
        <div className='max-w-5xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden'>
          {/* Quote Header */}
          <div className='bg-blue-600 text-white px-8 py-6'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-2xl font-bold'>
                  Angebot #{quoteData.quote.number}
                </h1>
                <p className='mt-1 text-blue-100'>
                  Erstellt am{' '}
                  {new Date(quoteData.quote.date).toLocaleDateString()}
                </p>
              </div>
              <div className='flex space-x-4'>
                <button className='flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors'>
                  <Download size={18} className='mr-2' />
                  PDF herunterladen
                </button>
                <button className='flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors'>
                  <Share2 size={18} className='mr-2' />
                  Teilen
                </button>
              </div>
            </div>
          </div>

          {/* Quote Content */}
          <div className='p-8'>
            {/* Provider and Customer Info */}
            <div className='grid grid-cols-2 gap-8 mb-8'>
              <div>
                <h3 className='text-sm font-medium text-gray-500 mb-2'>
                  Anbieter
                </h3>
                <div className='text-gray-800'>
                  <p className='font-medium'>{quoteData.provider.name}</p>
                  <p>{quoteData.provider.address}</p>
                  <p>{quoteData.provider.city}</p>
                  <p>{quoteData.provider.email}</p>
                </div>
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500 mb-2'>
                  Kunde
                </h3>
                <div className='text-gray-800'>
                  <p className='font-medium'>{quoteData.customer.name}</p>
                  <p>{quoteData.customer.address}</p>
                  <p>{quoteData.customer.city}</p>
                  <p>{quoteData.customer.email}</p>
                </div>
              </div>
            </div>

            {/* 3D Preview */}
            <div className='mb-8'>
              <h3 className='text-sm font-medium text-gray-500 mb-3'>
                Visualisierung
              </h3>
              <div className='aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden'>
                {/* 3D viewer would be integrated here */}
                <div className='w-full h-full flex items-center justify-center'>
                  <SpatialView
                    meshPath='mesh.ply'
                    notes_={[]}
                    measurements_={[]}
                    boxes={[]}
                    setBoxes={undefined}
                  />
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className='mb-8'>
              <h3 className='text-sm font-medium text-gray-500 mb-3'>
                Produkte
              </h3>
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Produkt
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Details
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Menge
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Preis
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {quoteData.quote.items
                      .slice(0, showAllProducts ? undefined : 2)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className='px-6 py-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {item.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {item.category}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='text-sm text-gray-500'>
                              {item.color} • {item.material}
                              <br />
                              {item.dimensions}
                            </div>
                          </td>
                          <td className='px-6 py-4 text-center text-sm text-gray-500'>
                            {item.quantity}
                          </td>
                          <td className='px-6 py-4 text-right text-sm text-gray-900'>
                            {item.price.toLocaleString()} €
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className='bg-gray-50'>
                    {!showAllProducts && quoteData.quote.items.length > 2 && (
                      <tr>
                        <td colSpan={4} className='px-6 py-3'>
                          <button
                            onClick={() => setShowAllProducts(true)}
                            className='text-blue-600 hover:text-blue-800 text-sm flex items-center mx-auto'
                          >
                            Alle Produkte anzeigen
                            <ChevronDown size={16} className='ml-1' />
                          </button>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td
                        colSpan={3}
                        className='px-6 py-3 text-sm font-medium text-gray-900 text-right'
                      >
                        Zwischensumme
                      </td>
                      <td className='px-6 py-3 text-right text-sm font-medium text-gray-900'>
                        {subtotal.toLocaleString()} €
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className='px-6 py-3 text-sm font-medium text-gray-900 text-right'
                      >
                        MwSt. (19%)
                      </td>
                      <td className='px-6 py-3 text-right text-sm font-medium text-gray-900'>
                        {vat.toLocaleString()} €
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className='px-6 py-3 text-lg font-bold text-gray-900 text-right'
                      >
                        Gesamtbetrag
                      </td>
                      <td className='px-6 py-3 text-right text-lg font-bold text-gray-900'>
                        {total.toLocaleString()} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Terms and Actions */}
            <div className='space-y-6'>
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <h4 className='font-medium text-gray-900 mb-2'>
                  Geschäftsbedingungen
                </h4>
                <ul className='text-sm text-gray-600 space-y-1'>
                  <li>
                    • Dieses Angebot ist gültig bis zum{' '}
                    {new Date(quoteData.quote.validUntil).toLocaleDateString()}
                  </li>
                  <li>• Lieferzeit: 3-4 Wochen nach Auftragsbestätigung</li>
                  <li>• Montageservice im Preis inbegriffen</li>
                  <li>• 50% Anzahlung bei Auftragserteilung erforderlich</li>
                </ul>
              </div>

              <div className='flex justify-between items-center'>
                <div className='flex space-x-4'>
                  <button className='flex items-center px-4 py-2 text-gray-600 hover:text-gray-800'>
                    <MessageSquare size={20} className='mr-2' />
                    Fragen zum Angebot?
                  </button>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className='flex items-center px-4 py-2 text-gray-600 hover:text-gray-800'
                  >
                    <ThumbsUp size={20} className='mr-2' />
                    Feedback geben
                  </button>
                </div>
                <div className='flex space-x-4'>
                  <button
                    onClick={() => setShowChangesForm(true)}
                    className='px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center'
                  >
                    <MessageSquare size={20} className='mr-2' />
                    Änderungen vorschlagen
                  </button>
                  <button
                    onClick={handleAcceptQuote}
                    className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center'
                  >
                    <Check size={20} className='mr-2' />
                    Angebot annehmen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl max-w-md w-full p-6'>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-xl font-medium text-gray-900'>
                Ihre Meinung ist uns wichtig
              </h3>
              <button
                onClick={() => setShowFeedbackForm(false)}
                className='text-gray-400 hover:text-gray-500'
              >
                <X size={20} />
              </button>
            </div>
            <p className='text-gray-600 mb-6'>
              Wie zufrieden sind Sie mit diesem Angebot?
            </p>
            <div className='flex justify-center space-x-4'>
              <button
                onClick={() => handleFeedbackSubmit('positive')}
                className='flex flex-col items-center p-4 rounded-lg hover:bg-gray-50'
              >
                <ThumbsUp size={32} className='text-green-500 mb-2' />
                <span className='text-sm text-gray-600'>Zufrieden</span>
              </button>
              <button
                onClick={() => handleFeedbackSubmit('negative')}
                className='flex flex-col items-center p-4 rounded-lg hover:bg-gray-50'
              >
                <ThumbsDown size={32} className='text-red-500 mb-2' />
                <span className='text-sm text-gray-600'>Unzufrieden</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangesForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl max-w-lg w-full p-6'>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-xl font-medium text-gray-900'>
                Änderungen vorschlagen
              </h3>
              <button
                onClick={() => setShowChangesForm(false)}
                className='text-gray-400 hover:text-gray-500'
              >
                <X size={20} />
              </button>
            </div>
            <p className='text-gray-600 mb-4'>
              Beschreiben Sie hier Ihre gewünschten Änderungen am Angebot:
            </p>
            <textarea
              value={proposedChanges}
              onChange={(e) => setProposedChanges(e.target.value)}
              className='w-full h-32 p-3 border border-gray-300 rounded-lg mb-4'
              placeholder='z.B. Andere Farbe für die Küchenfronten, zusätzliche Schränke, etc.'
            />
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowChangesForm(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                Abbrechen
              </button>
              <button
                onClick={handleChangesSubmit}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                Änderungen senden
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className='fixed bottom-4 right-4 bg-green-50 border border-green-100 rounded-lg p-4 flex items-start shadow-lg'>
          <Check size={20} className='text-green-500 mr-3 flex-shrink-0' />
          <div>
            <h4 className='text-green-800 font-medium'>
              Vielen Dank für Ihr Feedback!
            </h4>
            <p className='text-green-600 text-sm mt-1'>
              Wir werden uns in Kürze bei Ihnen melden.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerQuote;
