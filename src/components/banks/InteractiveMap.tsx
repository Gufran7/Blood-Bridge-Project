import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { VerifiedFacility } from '@/lib/hospitalData';
import { getDirectionsUrl } from '@/lib/hospitalData';

type InteractiveMapProps = {
  facilities: VerifiedFacility[];
  userCoords: { latitude: number; longitude: number } | null;
  selectedFacility: VerifiedFacility | null;
  onSelectFacility: (facility: VerifiedFacility) => void;
};

export function InteractiveMap({
  facilities,
  userCoords,
  selectedFacility,
  onSelectFacility,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center to Solapur
    const defaultCenter: [number, number] = userCoords
      ? [userCoords.latitude, userCoords.longitude]
      : [17.6599, 75.9064];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // High quality OpenStreetMap tiles with dark/modern cartridge styling or standard CartoDB dark/OSM
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userCoords.latitude, userCoords.longitude]);
      } else {
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div style="position:relative; width:24px; height:24px;">
              <div style="position:absolute; width:24px; height:24px; border-radius:50%; background:rgba(59,130,246,0.3); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position:absolute; top:4px; left:4px; width:16px; height:16px; border-radius:50%; background:#3b82f6; border:3px solid #ffffff; box-shadow:0 0 10px rgba(59,130,246,0.8);"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([userCoords.latitude, userCoords.longitude], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        marker.bindPopup(
          '<div style="font-weight:600; color:#1e293b; padding:2px;">📍 Your Current Location</div>'
        );
        userMarkerRef.current = marker;
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  // Update Facility Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing facility markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    facilities.forEach((fac) => {
      const isHospital = fac.kind === 'hospital';
      const bgColor = isHospital ? '#0ea5e9' : '#e0313f'; // Cyan/Blue for Hospital, Ruby for Blood Bank
      const iconSymbol = isHospital ? '🏥' : '🩸';

      const icon = L.divIcon({
        className: 'facility-marker',
        html: `
          <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            width:34px;
            height:34px;
            background:${bgColor};
            color:white;
            border-radius:50% 50% 50% 4px;
            transform:rotate(-45deg);
            border:2px solid #ffffff;
            box-shadow:0 4px 12px rgba(0,0,0,0.4);
            cursor:pointer;
          ">
            <span style="transform:rotate(45deg); font-size:15px; line-height:1;">${iconSymbol}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon }).addTo(map);

      const distanceBadge =
        fac.distanceKm !== undefined
          ? `<span style="display:inline-block; margin-left:6px; background:#f1f5f9; color:#0f172a; padding:2px 6px; border-radius:12px; font-size:11px; font-weight:700;">${fac.distanceKm} km away</span>`
          : '';

      const popupHtml = `
        <div style="min-width:220px; font-family:system-ui,-apple-system,sans-serif; color:#0f172a; padding:4px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:${bgColor};">
              ${isHospital ? 'Hospital' : 'Blood Bank'}
            </span>
            ${distanceBadge}
          </div>
          <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:700; line-height:1.3; color:#0f172a;">${fac.name}</h4>
          <p style="margin:0 0 6px 0; font-size:12px; color:#475569; line-height:1.4;">${fac.address}</p>
          <div style="font-size:12px; font-weight:600; color:#1e293b; margin-bottom:8px;">
            📞 <a href="tel:${fac.phone.replace(/[^+\d]/g, '')}" style="color:#e0313f; text-decoration:none;">${fac.phone}</a>
          </div>
          <div style="display:flex; gap:6px;">
            <a href="tel:${fac.phone.replace(/[^+\d]/g, '')}" style="
              flex:1;
              text-align:center;
              background:#0f172a;
              color:#ffffff;
              padding:6px 10px;
              border-radius:6px;
              font-size:11px;
              font-weight:600;
              text-decoration:none;
            ">Call Now</a>
            <a href="${getDirectionsUrl(fac.latitude, fac.longitude, fac.name)}" target="_blank" rel="noopener noreferrer" style="
              flex:1;
              text-align:center;
              background:${bgColor};
              color:#ffffff;
              padding:6px 10px;
              border-radius:6px;
              font-size:11px;
              font-weight:600;
              text-decoration:none;
            ">Directions ↗</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectFacility(fac);
      });

      markersRef.current[fac.id] = marker;
    });
  }, [facilities, onSelectFacility]);

  // Pan to selected facility if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedFacility) return;

    const marker = markersRef.current[selectedFacility.id];
    if (marker) {
      map.setView([selectedFacility.latitude, selectedFacility.longitude], 15, {
        animate: true,
      });
      marker.openPopup();
    }
  }, [selectedFacility]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-xl bg-ink-950/85 px-3 py-1.5 text-xs text-ink-300 backdrop-blur-md border border-white/10">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-ruby-500 inline-block"></span> Blood Banks
        </span>
        <span className="flex items-center gap-1.5 ml-2">
          <span className="h-3 w-3 rounded-full bg-sky-500 inline-block"></span> Hospitals
        </span>
        {userCoords && (
          <span className="flex items-center gap-1.5 ml-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white inline-block"></span> You
          </span>
        )}
      </div>
    </div>
  );
}
