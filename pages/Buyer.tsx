import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, Listing } from '../types';
import { mlService, ListingRecommendation } from '../services/mlService';

const MaterialTagCard: React.FC<{ material: string }> = ({ material }) => {
  const getFabricStyles = (mat: string) => {
    const m = mat.toLowerCase();
    if (m.includes('cotton')) return 'bg-accent-green text-deep-charcoal border-accent-green/30';
    if (m.includes('silk')) return 'bg-accent-pink text-white border-accent-pink/30';
    if (m.includes('linen')) return 'bg-accent-blue text-white border-accent-blue/30';
    if (m.includes('wool')) return 'bg-orange-500 text-white border-orange-500/30';
    if (m.includes('denim')) return 'bg-blue-600 text-white border-blue-600/30';
    return 'bg-white/10 text-gray-300 border-white/20';
  };

  const styles = getFabricStyles(material);

  return (
    <div className={`absolute -top-3 left-8 px-4 py-2 rounded-t-xl border-t border-x font-black text-[10px] uppercase tracking-[0.2em] transform transition-transform duration-500 group-hover:-translate-y-2 z-0 ${styles}`}>
      {material}
    </div>
  );
};

const Buyer: React.FC = () => {
  const { listings, currentUser, showNotification, getUser, addInterest, interestedListingIds } = useAppContext();
  const navigate = useNavigate();
  // Applied Filter State (what actually filters the list)
  const [appliedFilterType, setAppliedFilterType] = useState<string>('All');
  const [appliedPriceRange, setAppliedPriceRange] = useState<number>(750);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');

  // Draft Filter State (internal to the filter UI until confirmed)
  const [draftFilterType, setDraftFilterType] = useState<string>('All');
  const [draftPriceRange, setDraftPriceRange] = useState<number>(750);
  const [draftSearchTerm, setDraftSearchTerm] = useState('');

  // Local state for UI feedback only (popup modal)
  const [showConfPopup, setShowConfPopup] = useState(false);
  const [contactModalUser, setContactModalUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // ML Recommendations state
  const [recommendations, setRecommendations] = useState<ListingRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Get ML-powered recommendations
  useEffect(() => {
    if (listings.length > 0 && currentUser) {
      const recs = mlService.getRecommendations(currentUser, interestedListingIds, listings, 6);
      setRecommendations(recs);
    }
  }, [listings, interestedListingIds, currentUser]);

  // Derive available materials from actual listings for dynamic filtering
  const availableMaterials = useMemo(() => {
    const materials = new Set(listings.map(l => l.material));
    return ['All', ...Array.from(materials)];
  }, [listings]);

  const filteredListings = listings.filter(l => {
    const matchesType = appliedFilterType === 'All' || l.material === appliedFilterType;
    const matchesPrice = l.pricePerUnit <= appliedPriceRange;
    const matchesSearch = l.location.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      l.title.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      l.material.toLowerCase().includes(appliedSearchTerm.toLowerCase());
    return matchesType && matchesPrice && matchesSearch;
  });

  const handleApplyFilters = () => {
    setAppliedFilterType(draftFilterType);
    setAppliedPriceRange(draftPriceRange);
    setAppliedSearchTerm(draftSearchTerm);
    showNotification("Marketplace filters updated!", "success");
  };

  const handleClearFilters = () => {
    setDraftFilterType('All');
    setDraftPriceRange(750);
    setDraftSearchTerm('');
    setAppliedFilterType('All');
    setAppliedPriceRange(750);
    setAppliedSearchTerm('');
    showNotification("All filters cleared", "info");
  };

  const handleExpressInterest = (listingId: string) => {
    if (!currentUser) {
      showNotification("You must be logged in to express interest.", "error");
      navigate('/login');
      return;
    }

    // Add to global context state
    addInterest(listingId);

    // Show Confirmation Popup
    setShowConfPopup(true);
    setTimeout(() => setShowConfPopup(false), 2500);
  };

  const handleViewContact = (sellerName: string) => {
    // If seller is "You" (simulated legacy), try current user or fallback
    let seller: User | undefined;

    if (sellerName === 'You') {
      if (currentUser) {
        seller = currentUser;
      } else {
        seller = { companyName: 'You', email: 'demo@reweave.com', type: 'Seller', phoneNumber: '555-0199' };
      }
    } else {
      seller = getUser(sellerName);
    }

    if (seller) {
      setContactModalUser(seller);
    } else {
      // Fallback if seller not found in DB
      setContactModalUser({
        companyName: sellerName,
        email: `${sellerName.toLowerCase().replace(/\s/g, '')}@reweave.com`,
        phoneNumber: '+1 (555) 000-0000',
        type: 'Seller'
      });
    }
  };

  return (
    <main className="pt-28 relative">
      {/* Interest Confirmation Popup */}
      {showConfPopup && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-fade-up">
          <div className="bg-accent-green text-deep-charcoal px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
            <div>
              <h4 className="font-black text-lg leading-none">Interest Confirmed!</h4>
              <p className="text-sm font-medium opacity-80">You can now view the seller's contact info.</p>
            </div>
          </div>
        </div>
      )}

      {/* Listing Details Modal */}
      {selectedListing && (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-up"
          onClick={() => setSelectedListing(null)}
        >
          <div
            className="bg-charcoal border border-white/10 rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[90vh] overflow-y-auto">
              <div className="relative min-h-[280px] lg:min-h-full bg-gray-900">
                <img
                  alt={selectedListing.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={selectedListing.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="absolute left-6 top-6 flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-accent-green text-deep-charcoal text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {selectedListing.status}
                  </span>
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                    {selectedListing.material}
                  </span>
                </div>
              </div>

              <div className="relative p-6 sm:p-8 lg:p-10">
                <button
                  aria-label="Close fabric details"
                  onClick={() => setSelectedListing(null)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>

                <div className="pr-10">
                  <p className="text-xs text-accent-green uppercase tracking-[0.25em] font-black mb-3">Fabric Details</p>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                    {selectedListing.title}
                  </h2>
                  <p className="mt-4 text-gray-300 leading-relaxed">{selectedListing.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Material</p>
                    <p className="text-white font-bold mt-1">{selectedListing.material}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Cost</p>
                    <p className="text-accent-green font-black mt-1">
                      Rs. {selectedListing.pricePerUnit}
                      <span className="text-xs text-gray-400 font-bold">/{selectedListing.unit || 'm'}</span>
                    </p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Available</p>
                    <p className="text-white font-bold mt-1">{selectedListing.qty} {selectedListing.unit || 'm'}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Location</p>
                    <p className="text-white font-bold mt-1">{selectedListing.location}</p>
                  </div>
                </div>

                <div className="mt-6 bg-black/30 p-5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Usage</p>
                  <p className="text-gray-200 leading-relaxed">{selectedListing.uses || 'Usage details not provided.'}</p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Seller</p>
                    <p className="text-white font-bold">{selectedListing.sellerName}</p>
                    <p className="text-xs text-gray-500">Listed {selectedListing.dateListed}</p>
                  </div>

                  {interestedListingIds.includes(selectedListing.id) ? (
                    <button
                      onClick={() => handleViewContact(selectedListing.sellerName)}
                      className="bg-accent-blue text-deep-charcoal px-5 py-3 rounded-xl font-black text-xs hover:bg-white transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">contact_phone</span>
                      View Contact
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExpressInterest(selectedListing.id)}
                      className="bg-white text-deep-charcoal px-5 py-3 rounded-xl font-black text-xs hover:bg-accent-green transition-all"
                    >
                      Express Interest
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {contactModalUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
