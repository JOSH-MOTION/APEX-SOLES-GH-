"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, Search } from "lucide-react";
import { CartItem } from "@/types";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string | number, size: string, color: string, delta: number) => void;
}

export const Cart = ({ isOpen, onClose, items, onUpdateQuantity }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
          switch(error.code) {
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
          maximumAge: 0
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
    "Western North Region"
  ] as const;

  const majorCities: Record<string, string[]> = {
    "Greater Accra Region": [
      "Accra Central", "Tema", "Ashaiman", "Madina", "Teshie", "Labone", "Osu", 
      "Spintex", "Aburi", "Dawhenya", "Adenta", "Dansoman", "Kaneshie", 
      "Abossey Okai", "Mallam", "Weija", "Tema Community 1", "Tema Community 2", 
      "Tema Community 3", "Tema Community 4", "Tema Community 5", "Tema Community 6", 
      "Tema Community 7", "Tema Community 8", "Tema Community 9", "Tema Community 10", 
      "Tema Community 11", "Tema Community 12", "Tema Community 13", "Tema Community 14", 
      "Tema Community 15", "Tema Community 16", "Tema Community 17", "Tema Community 18", 
      "Tema Community 19", "Tema Community 20", "Tema Community 21", "Tema Community 22", 
      "Tema Community 23", "Tema Community 24", "Tema Community 25", "Tema Community 26", 
      "Tema Community 27", "Prampram", "Nungua", "Teshie-Nungua", "Bortianor", 
      "Pokuase", "Amasaman", "Kasoa", "Oblogo", "Afienya", "Oyibi", "Ashongman"
    ],
    "Ashanti Region": [
      "Kumasi", "Obuasi", "Mampong", "Ejisu", "Bekwai", "Konongo", "Offinso",
      "Tafo", "Efiduase", "Asokore-Mampong", "Agona", "Bompata", "Juaben", 
      "Mankranso", "Afrancho", "Kwadaso", "Santasi", "Adum", "Asawasi", 
      "Aboabo", "Kumasi Airport", "Ahwiaa", "Kenyasi", "Ntonso", "Fomena", 
      "Barekese", "Ejisu-Juaben", "Bekwai", "Jacobu", "Nsuta", "Manso Nkwanta", 
      "Adansi Fomena", "Obogu", "Akrofuom", "Dominase", "Wiamoase", "Asankarengwa"
    ],
    "Western Region": [
      "Sekondi-Takoradi", "Tarkwa", "Prestea", "Elubo", "Axim", "Shama",
      "Sefwi Wiawso", "Sefwi Bekwai", "Sefwi Juaboso", "Bogoso", "Wassa Akropong",
      "Wassa Dunkwa", "Prestea Huni Valley", "Huni Valley", "Aboso", "Banso", "Inchaban",
      "Mpohor", "Shama Junction", "Takoradi Market Circle", "Kojokrom", "Aiyinasi",
      "Nkroful", "Sefwi Ankwaso", "Sefwi Debiso", "Jukwa", "Manso Amenfi"
    ],
    "Eastern Region": [
      "Koforidua", "Nsawam", "Suhum", "Akim Oda", "Begoro", "Aburi",
      "Kibi", "Tafo", "Mamfe", "Nkawkaw", "Asamankese", "Oda", "Kade",
      "Akyem Oda", "Kibi", "New Tafo", "Suhum", "Kibi", "Mampong", "Akim Swedru",
      "Asamankese", "Nkawkaw", "Ofoase", "Begoro", "Kwahu", "Mpraeso", "Abetifi",
      "Nkwatia", "Asesewa", "Oda", "Kade", "Amanokrom", "Bunso", "Konongo"
    ],
    "Central Region": [
      "Cape Coast", "Elmina", "Mankessim", "Winneba", "Kasoa", "Saltpond",
      "Agona Swedru", "Agona Nkwanta", "Mankessim", "Apam", "Mumford", "Moree",
      "Gomoa Fetteh", "Gomoa Assin", "Assin Fosu", "Assin Manso", "Assin Akropong",
      "Dunkwa-on-Offin", "Twifo Praso", "Breman Asikuma", "Jukwa", "Mankoadze",
      "Yamoransa", "Potsin", "Anomabo", "Abura", "Komenda", "Elubo"
    ],
    "Northern Region": [
      "Tamale", "Yendi", "Savelugu", "Bimbilla", "Gushiegu", "Karaga",
      "Sagnarigu", "Tolon", "Kumbungu", "Salaga", "Buipe", "Walewale",
      "Nalerigu", "Gambaga", "Wulugu", "Yendi", "Bimbilla", "Savelugu", "Karaga",
      "Tolon", "Kumbungu", "Sagnerigu", "Gushiegu", "Zabzugu", "Tatale",
      "Saboba", "Chereponi", "Kpandai", "Mion", "Nanton"
    ],
    "Upper East Region": [
      "Bolgatanga", "Navrongo", "Bawku", "Sandema", "Zebilla",
      "Bongo", "Tongo", "Paga", "Navrongo", "Bolgatanga", "Bawku", "Sandema",
      "Zebilla", "Bawku West", "Bawku East", "Bongo", "Tongo", "Paga", "Kandiga",
      "Walewale", "Garu", "Tempane", "Zuarungu", "Mognori", "Kulungugu", "Kajelo"
    ],
    "Upper West Region": [
      "Wa", "Tumu", "Jirapa", "Lawra", "Nandom",
      "Lambussie", "Kaleo", "Funsi", "Gwollu", "Sissala", "Tumu",
      "Jirapa", "Lawra", "Nandom", "Wechiau", "Han", "Gwollu", "Kaleo",
      "Lambussie", "Funsi", "Daffiama Bussie", "Issa", "Kong", "Sakai"
    ],
    "Volta Region": [
      "Ho", "Hohoe", "Keta", "Anloga", "Sogakope", "Kpando",
      "Denu", "Aflao", "Dzodze", "Keta", "Anlo", "Tegbi", "Woe", "Anyako",
      "Adaklu", "Kpando", "Jasikan", "Kadjebi", "Nkwanta", "Dambai", "Kete Krachi",
      "Kpasa", "Torkor", "Battor", "Mepe", "Avedzi", "Adidome", "Tsito", "Vume",
      "Sogakofe", "Tanyigbe", "New Ayoma", "Weta", "Akatsi", "Dzemeni", "Dekpor"
    ],
    "Bono Region": [
      "Sunyani", "Techiman", "Berekum", "Dormaa Ahenkro", "Nkoranza",
      "Mim", "Atebubu", "Wenchi", "Sampa", "Banda", "Seikwa", "Kintampo",
      "Nkoranza", "Prang", "Yamfo", "Bamboi", "Fiaso", "Ameyaw", "Kwame Danso",
      "Akumadan", "Kenyasi", "Manso", "Nsuatre", "Badu", "Subin", "Bechem"
    ],
    "Bono East Region": [
      "Techiman", "Kintampo", "Nkoranza", "Atebubu", "Tuobodom",
      "Forifori", "Fawoman", "Wamfie", "Kwame Danso", "Amantin", "Kumawu",
      "Abransie", "Konkoma", "Afrancho", "Kwadwuma", "Bamboi", "Nsuta", "Prang",
      "Yamfo", "Bamboi", "Fiaso", "Akumadan", "Kenyasi", "Manso", "Nsuatre"
    ],
    "Ahafo Region": [
      "Goaso", "Mim", "Kenyasi", "Hwidiem", "Bechem",
      "Sankore", "Subin", "Kukuom", "Tepa", "Mim", "Ahafo Kenyasi",
      "Goaso", "Hwidiem", "Wamfie", "Kwaku", "Manso", "Ntotroso", "Akrodie",
      "Betom", "Dadieso", "Kenyasi", "Mim", "Sankore", "Subin", "Tepa"
    ],
    "North East Region": [
      "Nalerigu", "Walewale", "Bunkpurugu", "Gambaga", "Yunyoo",
      "Bawku", "Bolgatanga", "Navrongo", "Sandema", "Zebilla", "Bongo",
      "Tongo", "Paga", "Garu", "Tempane", "Zuarungu", "Mognori", "Kulungugu",
      "Kajelo", "Walewale", "Nalerigu", "Gambaga", "Yunyoo", "Bunkpurugu", "Nasuan"
    ],
    "Savannah Region": [
      "Damongo", "Buipe", "Salaga", "Bole", "Mankarigu",
      "Bui", "Yapei", "Buipe", "Mpaha", "Kpandai", "Salaga", "Buipe",
      "Damongo", "Bole", "Mankarigu", "Saru", "Yapei", "Banda", "Kusawgu",
      "Tuna", "Yagaba", "Gbenfu", "Janga", "Gbanjong", "Kparibeyiri", "Gbanjong"
    ],
    "Oti Region": [
      "Dambai", "Jasikan", "Kete Krachi", "Nkwanta", "Kadjebi",
      "Nkwanta", "Kete Krachi", "Dambai", "Jasikan", "Kadjebi", "Nkwanta South",
      "Nkwanta North", "Krachi East", "Krachi West", "Dambai", "Jasikan", "Kadjebi",
      "Guaman", "Kete Krachi", "Nkwanta", "Brewaniase", "Kpassa", "Oti Damanko"
    ],
    "Western North Region": [
      "Sefwi Wiawso", "Bibiani", "Sefwi Bekwai", "Asawinso", "Juaboso",
      "Sefwi Anhwiaso", "Sefwi Akontombra", "Sefwi Asawinso", "Sefwi Bekwai",
      "Sefwi Wiawso", "Bibiani", "Awaso", "Sefwi Anhwiaso", "Sefwi Akontombra",
      "Sefwi Juabeso", "Sefwi Sui", "Sefwi Dumasua", "Sefwi Debiso", "Sefwi Bodi"
    ]
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    if (!selectedLocation) {
      alert("Please select your location before checkout");
      return;
    }
    
    let message = "?? *NEW ORDER - APEX SOLES*\n\n";
    message += "*ORDER DETAILS:*\n";
    message += "??????????????????????\n\n";
    
    items.forEach((item, index) => {
      message += `*Item ${index + 1}:*\n`;
      message += `?? *Product ID:* ${item.id}\n`;
      message += `?? *Name:* ${item.name}\n`;
      message += `?? *Color:* ${item.selectedColor}\n`;
      message += `?? *Size:* ${item.selectedSize}\n`;
      message += `?? *Quantity:* ${item.quantity}\n`;
      message += `?? *Price:* GH? ${item.price.toLocaleString()}\n`;
      message += `?? *Subtotal:* GH? ${(item.price * item.quantity).toLocaleString()}\n`;
      message += "??????????????????????\n\n";
    });
    
    message += `*TOTAL AMOUNT:* GH? ${total.toLocaleString()}\n\n`;
    message += "*DELIVERY INFORMATION:*\n";
    message += `?? *Region:* ${selectedLocation}\n`;
    if (customAddress) {
      message += `?? *Detailed Address:* ${customAddress}\n`;
    }
    message += `?? Please provide your phone number\n\n`;
    message += "*QUESTION:* How much is the delivery fee to " + selectedLocation + (customAddress ? ` (${customAddress})` : "") + "?\n\n";
    message += "*Thank you for shopping with APEX SOLES!* ??";
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/233549920071?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" 
              onClick={onClose} 
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col border-l border-black/5"
            >
              <div className="p-6 flex justify-between items-center border-b border-black/5 bg-[#f8f8f8]">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-black">Shopping Bag</h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">Your bag is empty</p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="flex gap-4 group">
                      <div className="w-24 h-24 bg-[#f8f8f8] rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-black italic uppercase tracking-tighter text-black">{item.name}</h4>
                          <p className="font-mono font-black text-black text-sm">GH? {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <span className="text-[9px] font-black text-white bg-black px-1.5 py-0.5 rounded uppercase tracking-widest">{item.selectedSize}</span>
                          <span className="text-[9px] font-black text-gray-400 border border-black/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.selectedColor}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                            className="w-7 h-7 rounded-md border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black text-black">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                            className="w-7 h-7 rounded-md border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-black/5 bg-[#f8f8f8] space-y-6">
                <div className="flex justify-between mb-6">
                  <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter text-black">GH? {total.toLocaleString()}</span>
                </div>
                
                {items.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Region *</label>
                      <button
                        onClick={getCurrentLocation}
                        disabled={isLoadingLocation}
                        className="text-[10px] font-black text-black bg-black/5 border border-black/10 px-3 py-1.5 rounded-lg hover:bg-black/10 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isLoadingLocation ? (
                          <>
                            <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" />
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
                        className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 ring-black/10"
                      >
                        <option value="">Choose your region...</option>
                        {ghanaLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    {selectedLocation && majorCities[selectedLocation] && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select City/Area (Optional)</label>
                        <select 
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 ring-black/10"
                        >
                          <option value="">Choose city/area...</option>
                          {majorCities[selectedLocation]?.map((city: string) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detailed Address (Optional)</label>
                      <input 
                        type="text"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="House number, street name, landmark..."
                        className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 ring-black/10"
                      />
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={items.length === 0 || !selectedLocation}
                  className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout via WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
