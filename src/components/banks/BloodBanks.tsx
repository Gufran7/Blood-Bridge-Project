import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Building2,
  Clock,
  Crosshair,
  Droplets,
  MapPin,
  Navigation,
  Phone,
  Search,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import {
  type VerifiedFacility,
  type FacilityKind,
  SOLAPUR_CENTRE_COORDS,
  calculateDistanceKm,
  getDirectionsUrl,
  getStoredFacilities,
  saveStoredFacilities,
  resetFacilitiesToDefault,
} from '@/lib/hospitalData';
import { InteractiveMap } from '@/components/banks/InteractiveMap';
import { AdminFacilityModal } from '@/components/banks/AdminFacilityModal';

type FilterType = 'all' | FacilityKind | '24h';

const SOLAPUR_LANDMARKS = [
  { label: 'Solapur City Centre', lat: 17.6599, lng: 75.9064 },
  { label: 'Civil Hospital Chowk', lat: 17.6695, lng: 75.9042 },
  { label: 'Railway Station (Murarji Peth)', lat: 17.665, lng: 75.9015 },
  { label: 'Ashok Chowk (New Paccha Peth)', lat: 17.6663, lng: 75.9221 },
  { label: 'Old Pune Naka', lat: 17.6795, lng: 75.897 },
  { label: 'North Sadar Bazar', lat: 17.6748, lng: 75.9082 },
];

export function BloodBanks() {
  const [facilities, setFacilities] = useState<VerifiedFacility[]>(() => getStoredFacilities());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<VerifiedFacility | null>(null);

  // GPS & Location State
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Solapur City Centre');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [manualLandmark, setManualLandmark] = useState('Solapur City Centre');

  // Admin Modal
  const [adminOpen, setAdminOpen] = useState(false);

  // Request GPS Location on click
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        setLocationName('Your Current GPS Location');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Location permission denied. Please choose a nearby landmark below.';
        if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable on your device.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setLocationError(msg);
        // Fallback to default Solapur centre
        setUserCoords({
          latitude: SOLAPUR_CENTRE_COORDS.latitude,
          longitude: SOLAPUR_CENTRE_COORDS.longitude,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle manual landmark change
  const handleLandmarkSelect = (landmarkName: string) => {
    setManualLandmark(landmarkName);
    const landmark = SOLAPUR_LANDMARKS.find((l) => l.label === landmarkName);
    if (landmark) {
      setUserCoords({ latitude: landmark.lat, longitude: landmark.lng });
      setLocationName(landmark.label);
      setLocationError(null);
    }
  };

  // Initial location setup
  useEffect(() => {
    // Default coords to Solapur centre
    setUserCoords({
      latitude: SOLAPUR_CENTRE_COORDS.latitude,
      longitude: SOLAPUR_CENTRE_COORDS.longitude,
    });
  }, []);

  // Compute distances & filter facilities
  const enrichedFacilities = useMemo(() => {
    return facilities.map((fac) => {
      let distanceKm: number | undefined;
      if (userCoords) {
        distanceKm = calculateDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          fac.latitude,
          fac.longitude
        );
      }
      return { ...fac, distanceKm };
    });
  }, [facilities, userCoords]);

  const filteredFacilities = useMemo(() => {
    let list = enrichedFacilities;

    // Filter by type
    if (filterType === 'blood_bank') {
      list = list.filter((f) => f.kind === 'blood_bank');
    } else if (filterType === 'hospital') {
      list = list.filter((f) => f.kind === 'hospital');
    } else if (filterType === '24h') {
      list = list.filter((f) => f.is_24h);
    }

    // Filter by search query (name, area, address, pincode, services)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.area.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.pincode.includes(q) ||
          f.phone.includes(q) ||
          f.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort by distance (nearest first) if available
    list.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [enrichedFacilities, filterType, searchQuery]);

  // Admin Actions
  const handleSaveFacility = (saved: VerifiedFacility) => {
    setFacilities((prev) => {
      const idx = prev.findIndex((f) => f.id === saved.id);
      const updated = idx >= 0 ? [...prev.slice(0, idx), saved, ...prev.slice(idx + 1)] : [saved, ...prev];
      saveStoredFacilities(updated);
      return updated;
    });
  };

  const handleDeleteFacility = (id: string) => {
    setFacilities((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveStoredFacilities(updated);
      return updated;
    });
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all hospital and blood bank listings back to the verified Solapur directory?')) {
      const reset = resetFacilitiesToDefault();
      setFacilities(reset);
    }
  };

  return (
    <section id="blood-banks" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      {/* Heading & Admin Trigger */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Verified Healthcare Directory"
          title="Nearby Hospitals & Blood Banks"
          description="Locate verified 24/7 blood centres and hospitals in Solapur with live GPS distance, verified telephone contacts, and instant turn-by-turn navigation."
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdminOpen(true)}
            className="btn-ghost flex items-center gap-2 px-3 py-2 text-xs font-semibold text-steel-300 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Admin: Manage Directory
          </button>
        </div>
      </div>

      {/* GPS Location Bar & Controls */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* GPS Location State */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={requestGpsLocation}
              disabled={isLocating}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
            >
              <Crosshair className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Detecting GPS...' : 'Use My GPS Location'}
            </button>

            <div className="flex items-center gap-2 text-xs text-ink-300">
              <span className="text-ink-400">Current Reference:</span>
              <span className="font-semibold text-ink-100 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                📍 {locationName}
              </span>
            </div>

            {/* Manual Landmark Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-400 hidden sm:inline">Or choose area:</span>
              <select
                value={manualLandmark}
                onChange={(e) => handleLandmarkSelect(e.target.value)}
                className="input py-1.5 px-3 text-xs text-ink-200 bg-ink-900/80 border-white/10"
              >
                {SOLAPUR_LANDMARKS.map((landmark) => (
                  <option key={landmark.label} value={landmark.label}>
                    {landmark.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-xs font-medium text-ink-400">
            <span className="flex items-center gap-1.5 text-success-300">
              <ShieldCheck className="h-4 w-4 text-success-400" />
              20 Verified Solapur Facilities
            </span>
          </div>
        </div>

        {locationError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Interactive OpenStreetMap */}
      <div className="mt-6">
        <InteractiveMap
          facilities={filteredFacilities}
          userCoords={userCoords}
          selectedFacility={selectedFacility}
          onSelectFacility={(fac) => {
            setSelectedFacility(fac);
            document.getElementById(`facility-${fac.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Solapur hospital, blood bank, area, or PIN (e.g. 413001)..."
            className="input pl-10 text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400 hover:text-ink-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="inline-flex shrink-0 rounded-xl border border-white/10 bg-white/[0.03] p-1 overflow-x-auto">
          {[
            { value: 'all', label: `All (${enrichedFacilities.length})` },
            {
              value: 'blood_bank',
              label: `Blood Banks (${enrichedFacilities.filter((f) => f.kind === 'blood_bank').length})`,
            },
            {
              value: 'hospital',
              label: `Hospitals (${enrichedFacilities.filter((f) => f.kind === 'hospital').length})`,
            },
            {
              value: '24h',
              label: `24/7 Open (${enrichedFacilities.filter((f) => f.is_24h).length})`,
            },
          ].map((tab) => {
            const active = filterType === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilterType(tab.value as FilterType)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition duration-200 ${
                  active
                    ? 'bg-ruby-500 text-white shadow-[0_0_18px_rgba(224,49,63,0.35)]'
                    : 'text-ink-300 hover:text-ink-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facility Grid */}
      <div className="mt-8">
        {filteredFacilities.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center gap-3 p-12 text-center">
            <Building2 className="h-10 w-10 text-ink-500" />
            <h4 className="text-base font-bold text-ink-100">No facilities found</h4>
            <p className="max-w-md text-xs text-ink-400">
              No hospital or blood bank matches your search &quot;{searchQuery}&quot;. Try adjusting your search term or filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="btn-ghost mt-2 px-4 py-2 text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredFacilities.map((fac) => (
              <FacilityCard
                key={fac.id}
                facility={fac}
                isSelected={selectedFacility?.id === fac.id}
                onSelect={() => setSelectedFacility(fac)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin Management Modal */}
      <AdminFacilityModal
        facilities={facilities}
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onSaveFacility={handleSaveFacility}
        onDeleteFacility={handleDeleteFacility}
        onResetDefaults={handleResetDefaults}
      />
    </section>
  );
}

function FacilityCard({
  facility,
  isSelected,
  onSelect,
}: {
  facility: VerifiedFacility;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isHospital = facility.kind === 'hospital';
  const Icon = isHospital ? Building2 : Droplets;
  const directionsUrl = getDirectionsUrl(facility.latitude, facility.longitude, facility.name);

  return (
    <article
      id={`facility-${facility.id}`}
      onClick={onSelect}
      className={`glass group relative flex flex-col justify-between gap-5 p-6 transition duration-300 cursor-pointer ${
        isSelected
          ? 'border-ruby-500/80 shadow-[0_0_24px_rgba(224,49,63,0.2)] bg-ruby-950/20'
          : 'hover:-translate-y-1 hover:border-white/20'
      }`}
    >
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isHospital
                ? 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30'
                : 'bg-ruby-500/15 text-ruby-400 ring-1 ring-ruby-500/30'
            }`}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              {facility.distanceKm !== undefined && (
                <span className="rounded-full bg-ruby-500/20 px-2.5 py-0.5 text-[11px] font-bold text-ruby-300 ring-1 ring-ruby-500/40">
                  {facility.distanceKm} km away
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                  isHospital
                    ? 'bg-sky-500/10 text-sky-300 ring-sky-500/30'
                    : 'bg-ruby-500/10 text-ruby-300 ring-ruby-500/30'
                }`}
              >
                {isHospital ? 'Hospital' : 'Blood Centre'}
              </span>
            </div>

            {facility.is_24h && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-300">
                <Clock className="h-3 w-3" />
                24 Hours Open
              </span>
            )}
          </div>
        </div>

        {/* Name & Address */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-ink-100 group-hover:text-white transition">
            {facility.name}
          </h3>
          <p className="flex items-start gap-1.5 text-xs leading-[1.5] text-ink-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-500" />
            <span>
              {facility.address} {facility.pincode && `· PIN ${facility.pincode}`}
            </span>
          </p>
        </div>

        {/* Services Chips */}
        {facility.services && facility.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {facility.services.slice(0, 3).map((svc) => (
              <span
                key={svc}
                className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-ink-300 border border-white/5"
              >
                {svc}
              </span>
            ))}
            {facility.services.length > 3 && (
              <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-ink-400">
                +{facility.services.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions: Call & Directions */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-300">
          <span className="text-ink-400">Verified Contact:</span>
          <a
            href={`tel:${facility.phone.split('/')[0].replace(/[^+\d]/g, '')}`}
            className="text-ruby-400 hover:text-ruby-300 transition tabular-nums"
            onClick={(e) => e.stopPropagation()}
          >
            📞 {facility.phone}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={`tel:${facility.phone.split('/')[0].replace(/[^+\d]/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="btn-ghost flex items-center justify-center gap-1.5 py-2 text-xs font-bold"
          >
            <Phone className="h-3.5 w-3.5 text-ruby-400" />
            Call Now
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-primary flex items-center justify-center gap-1.5 py-2 text-xs font-bold"
          >
            <Navigation className="h-3.5 w-3.5" />
            Directions
          </a>
        </div>
      </div>
    </article>
  );
}
