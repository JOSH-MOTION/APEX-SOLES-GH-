"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export const GHANA_REGIONS: readonly string[] = [
  "Greater Accra Region",
  "Ashanti Region",
  "Western Region",
  "Eastern Region",
  "Central Region",
  "Northern Region",
  "Upper East Region",
  "Upper West Region",
  "Volta Region",
  "Bono Region",
  "Bono East Region",
  "Ahafo Region",
  "North East Region",
  "Savannah Region",
  "Oti Region",
  "Western North Region",
] as const;

export const GHANA_CITIES: Record<string, string[]> = {
  "Greater Accra Region": [
    "Accra Central", "Tema", "Ashaiman", "Madina", "Teshie", "Labone", "Osu",
    "Spintex", "Aburi", "Dawhenya", "Adenta", "Dansoman", "Kaneshie",
    "Abossey Okai", "Mallam", "Weija", "Tema Community 1", "Tema Community 2",
    "Tema Community 3", "Tema Community 4", "Tema Community 5", "Tema Community 6",
    "Tema Community 7", "Tema Community 8", "Tema Community 9", "Tema Community 10",
    "Prampram", "Nungua", "Teshie-Nungua", "Bortianor",
    "Pokuase", "Amasaman", "Kasoa", "Oblogo", "Afienya", "Oyibi", "Ashongman",
  ],
  "Ashanti Region": [
    "Kumasi", "Obuasi", "Mampong", "Ejisu", "Bekwai", "Konongo", "Offinso",
    "Tafo", "Efiduase", "Asokore-Mampong", "Agona", "Bompata", "Juaben",
    "Mankranso", "Afrancho", "Kwadaso", "Santasi", "Adum", "Asawasi",
  ],
  "Western Region": [
    "Sekondi-Takoradi", "Tarkwa", "Prestea", "Elubo", "Axim", "Shama",
    "Sefwi Wiawso", "Sefwi Bekwai", "Bogoso", "Wassa Akropong",
  ],
  "Eastern Region": [
    "Koforidua", "Nsawam", "Suhum", "Akim Oda", "Begoro", "Aburi",
    "Kibi", "Nkawkaw", "Asamankese", "Kade",
  ],
  "Central Region": [
    "Cape Coast", "Elmina", "Mankessim", "Winneba", "Kasoa", "Saltpond",
    "Agona Swedru", "Apam", "Moree", "Komenda",
  ],
  "Northern Region": ["Tamale", "Yendi", "Savelugu", "Bimbilla", "Gushiegu", "Karaga"],
  "Upper East Region": ["Bolgatanga", "Navrongo", "Bawku", "Sandema", "Zebilla", "Bongo"],
  "Upper West Region": ["Wa", "Tumu", "Jirapa", "Lawra", "Nandom", "Lambussie"],
  "Volta Region": ["Ho", "Hohoe", "Keta", "Anloga", "Sogakope", "Kpando", "Aflao"],
  "Bono Region": ["Sunyani", "Techiman", "Berekum", "Dormaa Ahenkro", "Nkoranza"],
  "Bono East Region": ["Techiman", "Kintampo", "Nkoranza", "Atebubu", "Tuobodom"],
  "Ahafo Region": ["Goaso", "Mim", "Kenyasi", "Hwidiem", "Bechem"],
  "North East Region": ["Nalerigu", "Walewale", "Bunkpurugu", "Gambaga", "Yunyoo"],
  "Savannah Region": ["Damongo", "Buipe", "Salaga", "Bole", "Mankarigu"],
  "Oti Region": ["Dambai", "Jasikan", "Kete Krachi", "Nkwanta", "Kadjebi"],
  "Western North Region": ["Sefwi Wiawso", "Bibiani", "Sefwi Bekwai", "Asawinso", "Juaboso"],
};

interface GhanaLocationPickerProps {
  region: string;
  address: string;
  phone: string;
  onRegionChange: (region: string) => void;
  onAddressChange: (address: string) => void;
  onPhoneChange: (phone: string) => void;
  // WhatsApp already reveals the sender's number, so phone is a backup/record
  // field, not the only way the business learns it — callers can hide it.
  showPhone?: boolean;
}

// Shared between Cart checkout and the pre-order flow so both capture the
// same real delivery details instead of relying on back-and-forth over
// WhatsApp after the fact.
export const GhanaLocationPicker = ({
  region,
  address,
  phone,
  onRegionChange,
  onAddressChange,
  onPhoneChange,
  showPhone = true,
}: GhanaLocationPickerProps) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&accept-language=en`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            let detectedRegion = "";
            let detectedAddress = "";

            if (addr.state || addr.region) {
              detectedRegion = (addr.state || addr.region).includes("Region")
                ? (addr.state || addr.region)
                : `${addr.state || addr.region} Region`;
            }

            const parts = [];
            if (addr.house_number) parts.push(addr.house_number);
            if (addr.road) parts.push(addr.road);
            if (addr.suburb) parts.push(addr.suburb);
            if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
            if (addr.postcode) parts.push(addr.postcode);
            detectedAddress = parts.join(", ");

            if (!detectedRegion) {
              detectedRegion = "Greater Accra Region";
              detectedAddress = detectedAddress || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            }

            onRegionChange(detectedRegion);
            onAddressChange(detectedAddress);
          } else {
            onRegionChange("Greater Accra Region");
            onAddressChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          onRegionChange("Greater Accra Region");
          onAddressChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }
        alert(errorMessage);
        onRegionChange("Greater Accra Region");
        onAddressChange("Location detection failed - please select manually");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Region *</label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoadingLocation ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <Search size={12} />
              Use My Location
            </>
          )}
        </button>
      </div>

      <select
        value={region}
        onChange={(e) => {
          onRegionChange(e.target.value);
          onAddressChange("");
        }}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30"
      >
        <option value="" className="bg-[#0f0f0f]">Choose your region...</option>
        {GHANA_REGIONS.map((r) => (
          <option key={r} value={r} className="bg-[#0f0f0f]">{r}</option>
        ))}
      </select>

      {region && GHANA_CITIES[region] && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select City/Area (Optional)</label>
          <select
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30"
          >
            <option value="" className="bg-[#0f0f0f]">Choose city/area...</option>
            {GHANA_CITIES[region]?.map((city) => (
              <option key={city} value={city} className="bg-[#0f0f0f]">{city}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Detailed Address (Optional)</label>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="House number, street name, landmark..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30"
        />
      </div>

      {showPhone && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone Number *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="e.g. 024 123 4567"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30"
          />
        </div>
      )}
    </div>
  );
};
