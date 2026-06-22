"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper to extract coordinates from string like "Titik Pertemuan (-7.92130, 112.59680)"
export function parseCoordinates(location: string): [number, number] | null {
  if (!location) return null;
  const match = location.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    return [lat, lng];
  }
  return null;
}

interface LeafletMapProps {
  mode: "interactive" | "readonly";
  locationString?: string; // For readonly mode
  onChange?: (locationName: string, lat: number, lng: number) => void; // For interactive mode
  selectedLocationName?: string; // Current selected location name to sync active state
}

export default function LeafletMap({
  mode,
  locationString = "",
  onChange,
  selectedLocationName = ""
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Custom selection pin creator
  const createCustomPinIcon = (label: string) => {
    return L.divIcon({
      html: `
        <div class="flex flex-col items-center justify-center select-none" style="transform: translate(-50%, -100%)">
          <div class="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md border-2 border-white transition-all scale-110">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1">location_on</span>
          </div>
          <div class="absolute top-[calc(100%+2px)] bg-red-600 text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-bold whitespace-nowrap border border-red-500">
            ${label}
          </div>
        </div>
      `,
      className: "custom-leaflet-marker-custom",
      iconSize: [0, 0],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let initialCenter: [number, number] = [-7.9214, 112.5975]; // UMM Kampus 3 default
    let initialZoom = 16;

    if (mode === "readonly") {
      const coords = parseCoordinates(locationString);
      if (coords) {
        initialCenter = coords;
      }
      initialZoom = 17;
    } else if (selectedLocationName) {
      const coords = parseCoordinates(selectedLocationName);
      if (coords) {
        initialCenter = coords;
      }
    }

    // Instantiate Map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: mode === "interactive",
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true
    });

    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create marker layers group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Event listener for placing custom pins in interactive mode
    if (mode === "interactive") {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        const locationName = `Titik Pertemuan (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        if (onChange) {
          onChange(locationName, lat, lng);
        }
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mode]);

  // Update Markers when coordinates or selection changes
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (mode === "readonly") {
      const coords = parseCoordinates(locationString);
      if (coords) {
        const cleanLabel = locationString.split(" (")[0];
        const markerIcon = createCustomPinIcon(cleanLabel);
        
        L.marker(coords, { icon: markerIcon }).addTo(markersGroup);
        map.setView(coords, 17);
      }
    } else {
      // Interactive Mode
      const parsedCoords = parseCoordinates(selectedLocationName) || [-7.9214, 112.5975];
      
      L.marker(parsedCoords, {
        icon: createCustomPinIcon("Titik COD Pilihan")
      }).addTo(markersGroup);
      
      map.setView(parsedCoords);
    }
  }, [selectedLocationName, locationString, mode]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-100" />
      {mode === "interactive" && (
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded shadow-sm text-[10px] font-bold text-slate-700 pointer-events-none border border-slate-200">
          Klik di mana saja pada peta untuk menentukan titik pertemuan COD
        </div>
      )}
    </div>
  );
}
