"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface MapQuestionFormProps {
    value: { lat: number; lng: number } | null;
    onChange: (pos: { lat: number; lng: number }) => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={icon}>
            <Popup>Resposta Correta</Popup>
        </Marker>
    );
}

export default function MapQuestionForm({ value, onChange }: MapQuestionFormProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        value ? new L.LatLng(value.lat, value.lng) : null
    );

    useEffect(() => {
        const timer1 = setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        const timer2 = setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    useEffect(() => {
        if (position) {
            onChange({ lat: position.lat, lng: position.lng });
        }
    }, [position]);

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-slate-200 relative z-0">
            <MapContainer
                center={position || [-15.793889, -47.882778]}
                zoom={position ? 4 : 3}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>

            {!position && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-slate-700 shadow-md border border-slate-200 z-[1000] pointer-events-none text-sm whitespace-nowrap">
                    Clique no mapa para definir a resposta correta
                </div>
            )}
        </div>
    );
}
