"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo, useEffect } from "react";

const correctIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Answer {
    authorName?: string;
    value: string;
}

interface MapQuestionResultsProps {
    correctAnswerString?: string;
    liveAnswers: Answer[];
    showCorrectAnswer: boolean;
}

const COLORS = [
    "#ef4444", "#3b82f6", "#eab308", "#f97316", "#8b5cf6",
    "#ec4899", "#14b8a6", "#6366f1", "#06b6d4"
];

function getColorForName(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

export default function MapQuestionResults({ correctAnswerString, liveAnswers, showCorrectAnswer }: MapQuestionResultsProps) {
    useEffect(() => {
        const timer1 = setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        const timer2 = setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    const correctAnswer = useMemo(() => {
        if (!correctAnswerString) return null;
        try {
            return JSON.parse(correctAnswerString) as { lat: number; lng: number };
        } catch {
            return null;
        }
    }, [correctAnswerString]);

    const studentPins = useMemo(() => {
        return liveAnswers.map(ans => {
            try {
                const parsed = JSON.parse(ans.value);
                if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
                    return {
                        name: ans.authorName || "Anônimo",
                        pos: parsed,
                        color: getColorForName(ans.authorName || "Anônimo")
                    };
                }
            } catch (e) {
                console.error(e);
            }
            return null;
        }).filter(Boolean) as { name: string, pos: { lat: number, lng: number }, color: string }[];
    }, [liveAnswers]);

    const mapCenter: [number, number] = correctAnswer ? [correctAnswer.lat, correctAnswer.lng] : [-15.793889, -47.882778];

    return (
        <div className="w-full h-[50vh] min-h-[400px] rounded-3xl overflow-hidden border-2 border-slate-200 relative shadow-inner">
            <MapContainer
                center={mapCenter}
                zoom={studentPins.length > 0 || showCorrectAnswer ? 3 : 2}
                style={{ height: "100%", width: "100%", zIndex: 10 }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Render Student Pins */}
                {studentPins.map((pin, i) => (
                    <CircleMarker
                        key={i}
                        center={[pin.pos.lat, pin.pos.lng]}
                        radius={8}
                        pathOptions={{
                            fillColor: pin.color,
                            color: "white",
                            weight: 2,
                            fillOpacity: 0.9
                        }}
                    >
                        <Popup>
                            <span className="font-bold text-slate-700">{pin.name}</span>
                        </Popup>
                    </CircleMarker>
                ))}

                {/* Render Correct Answer if revealed */}
                {showCorrectAnswer && correctAnswer && (
                    <Marker position={[correctAnswer.lat, correctAnswer.lng]} icon={correctIcon}>
                        <Popup>
                            <span className="font-bold text-green-700">Resposta Correta</span>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {showCorrectAnswer && correctAnswer && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl font-bold text-green-600 shadow-md border-2 border-green-500 flex items-center gap-2 z-[1000] animate-in fade-in slide-in-from-top-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Local Correto Revelado
                </div>
            )}
        </div>
    );
}
