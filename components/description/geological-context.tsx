'use client';

import React, { useState, createContext, useContext } from 'react';

type MapContextType = [string, React.Dispatch<React.SetStateAction<string>>];
export const MapContext = createContext<MapContextType>(["Map1a_PALEOMAP_PaleoAtlas_000", () => {}]);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMap, setSelectedMap] = useState<string>("Map1a_PALEOMAP_PaleoAtlas_000");
  return (
    <MapContext.Provider value={[selectedMap, setSelectedMap]}>
      {children}
    </MapContext.Provider>
  );
};