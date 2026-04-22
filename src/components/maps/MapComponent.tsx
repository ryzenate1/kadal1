'use client';

import { GoogleMapComponent } from './GoogleMapComponent';

export interface MapComponentProps {
	center: {
		lat: number;
		lng: number;
	};
	zoom?: number;
	draggable?: boolean;
	onPositionChange?: (lat: number, lng: number, address?: string) => void;
	className?: string;
	apiKey: string;
	markerIcon?: string;
}

export function MapComponent({
	center,
	zoom = 15,
	draggable = true,
	onPositionChange,
	className = '',
	apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
	markerIcon = '/marker-icon.png',
}: MapComponentProps) {
	if (!apiKey) {
		return (
			<div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
				<div className="text-center p-4">
					<div className="text-red-500 font-medium mb-2">Google Maps API Key Required</div>
					<p className="text-sm text-gray-600">
						Please provide a valid Google Maps API key to display the map.
						Add it to your environment variables as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
					</p>
				</div>
			</div>
		);
	}

	return (
		<GoogleMapComponent
			center={center}
			zoom={zoom}
			draggable={draggable}
			onPositionChange={onPositionChange}
			className={className}
			apiKey={apiKey}
			markerIcon={markerIcon}
		/>
	);
}
