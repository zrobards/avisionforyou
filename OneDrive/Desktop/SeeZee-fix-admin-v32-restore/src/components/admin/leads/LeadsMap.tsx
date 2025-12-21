"use client";

import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { getScoreColor, getScoreLabel } from "@/lib/leads/scoring";
import { MapPin, Mail, Phone, ExternalLink, Globe } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  status: string;
  leadScore: number;
  hasWebsite: boolean;
  websiteUrl: string | null;
  websiteQuality: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  lastContactedAt: Date | null;
  createdAt: Date;
  // Additional fields for compatibility with LeadFinderClient
  source: string | null;
  ein: string | null;
  address: string | null;
  zipCode: string | null;
  subcategory: string | null;
  annualRevenue: number | null;
  employeeCount: number | null;
  needsAssessment: any;
  emailsSent: number;
}

interface LeadsMapProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead | null) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
};

// Louisville, KY center
const defaultCenter = {
  lat: 38.2527,
  lng: -85.7585,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

function createMarkerIcon(score: number): google.maps.Symbol | undefined {
  const color = getScoreColor(score);
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.9,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 10,
  };
}

export function LeadsMap({ leads, selectedLead, onSelectLead }: LeadsMapProps) {
  const [infoWindowLead, setInfoWindowLead] = useState<Lead | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const onMapClick = useCallback(() => {
    setInfoWindowLead(null);
  }, []);

  const onMarkerClick = useCallback((lead: Lead) => {
    setInfoWindowLead(lead);
    onSelectLead(lead);
  }, [onSelectLead]);

  // Filter leads with valid coordinates
  const mappableLeads = leads.filter(
    (lead) => lead.latitude && lead.longitude
  );

  if (loadError) {
    return (
      <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load Google Maps</p>
        <p className="text-sm text-gray-500 mt-2">
          Please check your API key configuration
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-8 text-center animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-gray-700 overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={10}
        options={mapOptions}
        onClick={onMapClick}
      >
        {mappableLeads.map((lead) => (
          <Marker
            key={lead.id}
            position={{
              lat: lead.latitude!,
              lng: lead.longitude!,
            }}
            icon={createMarkerIcon(lead.leadScore)}
            onClick={() => onMarkerClick(lead)}
          />
        ))}

        {infoWindowLead && infoWindowLead.latitude && infoWindowLead.longitude && (
          <InfoWindow
            position={{
              lat: infoWindowLead.latitude,
              lng: infoWindowLead.longitude,
            }}
            onCloseClick={() => setInfoWindowLead(null)}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-gray-900">
                {infoWindowLead.company || infoWindowLead.name}
              </h3>
              {infoWindowLead.category && (
                <p className="text-xs text-gray-600 mt-1">
                  {infoWindowLead.category}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getScoreColor(infoWindowLead.leadScore) }}
                >
                  Score: {infoWindowLead.leadScore}
                </span>
                <span className="text-xs text-gray-600">
                  {getScoreLabel(infoWindowLead.leadScore).label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {infoWindowLead.email && (
                  <a
                    href={`mailto:${infoWindowLead.email}`}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 transition"
                    title="Send email"
                  >
                    <Mail className="w-3.5 h-3.5 text-gray-700" />
                  </a>
                )}
                {infoWindowLead.phone && (
                  <a
                    href={`tel:${infoWindowLead.phone}`}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 transition"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-gray-700" />
                  </a>
                )}
                {infoWindowLead.websiteUrl && (
                  <a
                    href={infoWindowLead.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 transition"
                    title="Visit website"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-700" />
                  </a>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="p-4 bg-[#151b2e] border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Hot (80+)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              Warm (60-79)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              Cool (40-59)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              Cold (&lt;40)
            </span>
          </div>
          <span>
            {mappableLeads.length} of {leads.length} leads have coordinates
          </span>
        </div>
      </div>
    </div>
  );
}

export default LeadsMap;

