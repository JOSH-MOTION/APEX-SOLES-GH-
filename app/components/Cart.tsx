"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, Search } from "lucide-react";
import { TradeCartItem } from "@/types";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: TradeCartItem[];
  onRemove: (saleId: string) => void;
  onCheckoutComplete: () => void;
}

export const Cart = ({ isOpen, onClose, items, onRemove, onCheckoutComplete }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&accept-language=en`
            );
            const data = await response.json();

            if (data && data.address) {
              const address = data.address;
              let detectedRegion = "";
              let detectedAddress = "";

              if (address.state || address.region) {
                detectedRegion = (address.state || address.region).includes("Region")
                  ? (address.state || address.region)
                  : `${address.state || address.region} Region`;
              }

              const addressParts = [];
              if (address.house_number) addressParts.push(address.house_number);
              if (address.road) addressParts.push(address.road);
              if (address.suburb) addressParts.push(address.suburb);
              if (address.city || address.town || address.village) {
                addressParts.push(address.city || address.town || address.village);
              }
              if (address.postcode) addressParts.push(address.postcode);

              detectedAddress = addressParts.join(", ");

              if (!detectedRegion) {
                detectedRegion = "Greater Accra Region";
                detectedAddress = detectedAddress || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
              }

              setSelectedLocation(detectedRegion);
              setCustomAddress(detectedAddress);
            } else {
              setSelectedLocation("Greater Accra Region");
              setCustomAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            setSelectedLocation("Greater Accra Region");
            setCustomAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
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
          setSelectedLocation("Greater Accra Region");
          setCustomAddress("Location detection failed - please select manually");
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  };

  const ghanaLocations: readonly string[] = [
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

  const majorCities: Record<string, string[]> = {
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

  const handleCheckout = () => {
    if (items.length === 0) return;

    if (!selectedLocation) {
      alert("Please select your location before checkout");
      return;
    }

    let message = "🔥 *NEW ORDER - APEX SOLES*\n\n";
    message += "*ORDER DETAILS:*\n";
    message += "----------------------\n\n";

    items.forEach((item, index) => {
      message += `*Item ${index + 1}:*\n`;
      message += `👟 *Name:* ${item.name}\n`;
      message += `📏 *Size:* ${item.size}\n`;
      message += `🏷️ *Condition:* ${item.condition === "new" ? "Deadstock / New" : "Used"}\n`;
      message += `💰 *Matched Price:* GH¢ ${item.price.toLocaleString()}\n`;
      message += `🧾 *Order Ref:* ${item.saleId}\n`;
      message += "----------------------\n\n";
    });

    message += `*TOTAL AMOUNT:* GH¢ ${total.toLocaleString()}\n\n`;
    message += "*DELIVERY INFORMATION:*\n";
    message += `📍 *Region:* ${selectedLocation}\n`;
    if (customAddress) {
      message += `🏠 *Detailed Address:* ${customAddress}\n`;
    }
    message += `📞 Please provide your phone number\n\n`;
    message += "*QUESTION:* How much is the delivery fee to " + selectedLocation + (customAddress ? ` (${customAddress})` : "") + "?\n\n";
    message += "*Thank you for trading with APEX SOLES!* 🙌";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/233549920071?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    onCheckoutComplete();
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0f0f0f] z-[70] shadow-2xl flex flex-col border-l border-white/10"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Checkout</h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Matched trades ready to finalize</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">No matched trades yet</p>
                    <p className="text-[10px] text-gray-600 mt-2 text-center max-w-[220px]">Buy Now or an accepted bid will land here, ready to check out.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.saleId} className="flex gap-4 group">
                      <div className="w-24 h-24 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1 gap-2">
                          <h4 className="font-black italic uppercase tracking-tighter text-white text-sm leading-tight">{item.name}</h4>
                          <p className="font-mono font-black text-[#c6ff00] text-sm flex-shrink-0">GH¢ {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <span className="text-[9px] font-black text-black bg-[#c6ff00] px-1.5 py-0.5 rounded uppercase tracking-widest">{item.size}</span>
                          <span className="text-[9px] font-black text-gray-400 border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.condition}</span>
                        </div>
                        <button
                          onClick={() => onRemove(item.saleId)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-white/10 space-y-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Total</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter text-white">GH¢ {total.toLocaleString()}</span>
                </div>

                {items.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Region *</label>
                      <button
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
                    <div className="space-y-2">
                      <select
                        value={selectedLocation}
                        onChange={(e) => {
                          setSelectedLocation(e.target.value);
                          setCustomAddress("");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30"
                      >
                        <option value="" className="bg-[#0f0f0f]">Choose your region...</option>
                        {ghanaLocations.map((location) => (
                          <option key={location} value={location} className="bg-[#0f0f0f]">{location}</option>
                        ))}
                      </select>
                    </div>
                    {selectedLocation && majorCities[selectedLocation] && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select City/Area (Optional)</label>
                        <select
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30"
                        >
                          <option value="" className="bg-[#0f0f0f]">Choose city/area...</option>
                          {majorCities[selectedLocation]?.map((city: string) => (
                            <option key={city} value={city} className="bg-[#0f0f0f]">{city}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Detailed Address (Optional)</label>
                      <input
                        type="text"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="House number, street name, landmark..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || !selectedLocation}
                  className="w-full bg-[#c6ff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#d4ff33] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Finalize via WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
