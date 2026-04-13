"use client";
// Used in the item detail page to display a QR code for the item ID, allowing users to easily print it for labeling equipment.
import { QRCodeSVG } from "qrcode.react";

interface QrCodeDisplayProps { // Expects the item ID to generate the QR code.
  itemId: string;
}

export default function QrCodeDisplay({ itemId }: QrCodeDisplayProps) { // Generates a QR code for the given item ID and provides a print button.
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/90 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-[#132540]">QR Code</h3>

      <div className="flex items-center justify-center rounded-lg bg-gray-50 p-4">
        <QRCodeSVG
          value={itemId}
          size={200}
          level="H"
          marginSize={4}
        />
      </div>

      <p className="text-xs text-gray-600">ID: {itemId}</p>

      <button
        onClick={handlePrint}
        className="mt-2 rounded-lg bg-teal-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-600 active:bg-teal-700"
      >
        Print QR Code
      </button>
    </div>
  );
}
