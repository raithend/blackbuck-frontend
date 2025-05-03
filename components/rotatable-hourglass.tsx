'use client';

import { Hourglass } from "lucide-react";
import { useState, useEffect, useRef } from 'react';

export function RotatableHourglass() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const hourglassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (hourglassRef.current) {
      const rect = hourglassRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      setStartAngle(angle - (rotation * Math.PI) / 180);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !hourglassRef.current) return;

    const rect = hourglassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const newRotation = ((angle - startAngle) * 180) / Math.PI;
    setRotation(newRotation);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startAngle]);

  return (
    <div
      ref={hourglassRef}
      className="cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <Hourglass className={`h-16 w-16 ${isMounted ? 'transition-transform' : ''}`} />
    </div>
  );
} 