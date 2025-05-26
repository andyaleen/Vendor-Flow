import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface GoogleAddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void;
  initialValues?: Partial<AddressComponents>;
}

export function GoogleAddressAutocomplete({ 
  onAddressSelect, 
  initialValues = {} 
}: GoogleAddressAutocompleteProps) {
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [addressComponents, setAddressComponents] = useState<AddressComponents>({
    street: initialValues.street || '',
    city: initialValues.city || '',
    state: initialValues.state || '',
    postalCode: initialValues.postalCode || '',
    country: initialValues.country || '',
  });

  // Load Google Maps script dynamically
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isGoogleLoaded || !autocompleteRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: ['us', 'ca'] }, // Restrict to US and Canada
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      const components: AddressComponents = {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      };

      // Parse address components
      place.address_components.forEach((component: any) => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          components.street = component.long_name + ' ';
        }
        if (types.includes('route')) {
          components.street += component.long_name;
        }
        if (types.includes('locality')) {
          components.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          components.state = component.short_name;
        }
        if (types.includes('postal_code')) {
          components.postalCode = component.long_name;
        }
        if (types.includes('country')) {
          components.country = component.long_name;
        }
      });

      // Clean up street address
      components.street = components.street.trim();

      setAddressComponents(components);
      onAddressSelect(components);
      setSearchValue(place.formatted_address || '');
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [isGoogleLoaded, onAddressSelect]);

  const handleManualChange = (field: keyof AddressComponents, value: string) => {
    const updated = { ...addressComponents, [field]: value };
    setAddressComponents(updated);
    onAddressSelect(updated);
  };

  return (
    <div className="space-y-4">
      {/* Address Search */}
      <div className="relative">
        <Label htmlFor="address-search" className="text-sm font-medium text-gray-700">
          Search Address
        </Label>
        <div className="relative mt-1">
          <Input
            ref={autocompleteRef}
            id="address-search"
            type="text"
            placeholder="Search Address"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 h-12 border-gray-300 rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Billing Street */}
      <div>
        <Label htmlFor="billing-street" className="text-sm font-medium text-gray-700">
          Billing Street
        </Label>
        <textarea
          id="billing-street"
          placeholder="363 Burma Road"
          value={addressComponents.street}
          onChange={(e) => handleManualChange('street', e.target.value)}
          className="mt-1 w-full px-3 py-2 h-20 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* City and State Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="billing-city" className="text-sm font-medium text-gray-700">
            Billing City
          </Label>
          <Input
            id="billing-city"
            type="text"
            placeholder="Memphis"
            value={addressComponents.city}
            onChange={(e) => handleManualChange('city', e.target.value)}
            className="mt-1 h-12 border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="billing-state" className="text-sm font-medium text-gray-700">
            Billing State/Province
          </Label>
          <Input
            id="billing-state"
            type="text"
            placeholder="TN"
            value={addressComponents.state}
            onChange={(e) => handleManualChange('state', e.target.value)}
            className="mt-1 h-12 border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Postal Code and Country Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="billing-postal" className="text-sm font-medium text-gray-700">
            Billing Zip/Postal Code
          </Label>
          <Input
            id="billing-postal"
            type="text"
            placeholder="38106"
            value={addressComponents.postalCode}
            onChange={(e) => handleManualChange('postalCode', e.target.value)}
            className="mt-1 h-12 border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="billing-country" className="text-sm font-medium text-gray-700">
            Billing Country
          </Label>
          <Input
            id="billing-country"
            type="text"
            placeholder="United States"
            value={addressComponents.country}
            onChange={(e) => handleManualChange('country', e.target.value)}
            className="mt-1 h-12 border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}