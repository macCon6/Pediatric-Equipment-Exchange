"use client";

import { useEffect, useState } from "react";

export default function Tester() {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      setSize({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };

    update(); // run once
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[9999] bg-black text-white text-xs p-2">
      W: {size.w} / H: {size.h}
    </div>
  );
}