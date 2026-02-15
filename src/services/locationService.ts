
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export interface PlaceResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    name?: string; // OSM often returns a 'name' field
    address?: {
        [key: string]: string | undefined; // Generic index signature to catch all address fields
        amenity?: string;
        house_number?: string;
        road?: string;
        neighbourhood?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        state?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
    };
}

export const searchPlaces = async (query: string): Promise<PlaceResult[]> => {
    if (!query || query.length < 3) return [];

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '5',
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
            headers: {
                'Accept-Language': 'it-IT',
                'User-Agent': 'Trippando App (matte@example.com)'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data: PlaceResult[] = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error searching places:", error);
        return [];
    }
};
