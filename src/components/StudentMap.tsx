"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface StudentMapProps {
    onSelect: (pos: { lat: number; lng: number }) => void;
}

function LocationMarker({ position, setPosition, onSelect }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void, onSelect: (pos: { lat: number, lng: number }) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={icon}>
            <Popup>Minha Resposta</Popup>
        </Marker>
    );
}

export default function StudentMap({ onSelect }: StudentMapProps) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    return (
        <div className="w-full h-full md:rounded-3xl overflow-hidden relative border-t md:border-2 border-slate-200 shadow-inner z-0">
            <MapContainer
                center={[-15.793889, -47.882778]} // Default to Brazil
                zoom={3}
                style={{ height: "100%", width: "100%", zIndex: 10 }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} onSelect={onSelect} />
            </MapContainer>

            {!position && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full font-bold text-slate-700 shadow-xl border-2 border-slate-200 z-[1000] pointer-events-none text-center whitespace-nowrap animate-bounce">
                    Toque no mapa para marcar sua resposta
                </div>
            )}
        </div>
    );
}
