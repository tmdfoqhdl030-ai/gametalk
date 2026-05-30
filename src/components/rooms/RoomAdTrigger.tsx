"use client";

import { useState } from "react";
import GoogleAdModal from "@/components/ui/GoogleAdModal";

export default function RoomAdTrigger() {
  const [showAd, setShowAd] = useState(true);

  if (!showAd) return null;

  return (
    <GoogleAdModal 
      triggerDelay={800} 
      onClose={() => setShowAd(false)} 
    />
  );
}
