import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importar los íconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar los íconos por defecto
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ onLocationSelect, initialLocation }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Inicializar el mapa
        mapInstanceRef.current = L.map(mapRef.current).setView(
            initialLocation || [14.6349, -90.5069], // Coordenadas de Guatemala City
            13
        );

        // Agregar el tile layer de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Agregar el marcador inicial si hay una ubicación inicial
        if (initialLocation) {
            markerRef.current = L.marker(initialLocation).addTo(mapInstanceRef.current);
        }

        // Manejar el clic en el mapa
        mapInstanceRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            // Actualizar o crear el marcador
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
            }

            // Llamar al callback con las coordenadas
            if (onLocationSelect) {
                onLocationSelect({ lat, lng });
            }
        });

        // Limpiar al desmontar
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, [initialLocation, onLocationSelect]);

    return (
        <div 
            ref={mapRef} 
            style={{ 
                height: '400px', 
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        />
    );
};

export default Map; 