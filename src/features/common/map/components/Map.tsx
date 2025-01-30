import React from 'react';
import Map, { Marker } from 'react-map-gl';

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
  }>;
  onMarkerClick?: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  zoom,
  markers,
  onMarkerClick,
}) => {
  return (
    <Map
      initialViewState={{
        latitude,
        longitude,
        zoom,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle='mapbox://styles/mapbox/streets-v11'
    >
      {markers?.map((marker) => (
        <Marker
          key={marker.id}
          latitude={marker.latitude}
          longitude={marker.longitude}
          onClick={() => onMarkerClick?.(marker.id)}
        >
          <div className='text-red-500 cursor-pointer'>
            <span className='material-icons'>place</span>
            <span className='text-sm'>{marker.title}</span>
          </div>
        </Marker>
      ))}
    </Map>
  );
};
