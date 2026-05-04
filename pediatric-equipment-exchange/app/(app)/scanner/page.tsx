
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Html5QrcodeScanner,
    Html5QrcodeScanType,
    Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import Toast from "@/components/popups/toast";

export default function Scanner() { // Implements a QR code and barcode scanner using html5-qrcode. When a code is successfully scanned, it navigates to the corresponding item detail page.
    const router = useRouter();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const hasNavigatedRef = useRef(false);
    const [manualBarcode, setManualBarcode] = useState("");
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("error");
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_128, // current primary barcode format for equipment IDs
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.ITF,
                ],
            },
            false
        );

        scannerRef.current = scanner;
        console.log("[DEBUG][scanner] scanner mounted"); // fires once on mount — if this never shows, the useEffect isn't running

        scanner.render( // When a code is successfully scanned, navigate to the item detail page for that code. ref to ensure we only navigate once per scan session.
            async (decodedText) => {
                // fires on every successful decode; check raw text before any processing
                console.log("[DEBUG][scanner] raw decodedText:", JSON.stringify(decodedText));

                if (hasNavigatedRef.current) {
                    console.log("[DEBUG][scanner] already navigated, ignoring scan");
                    return;
                }

                // strip surrounding whitespace; also strip wrapping quotes e.g. '"0002"' → '0002'
                const normalizedCode = decodedText.trim().replace(/^"(.+)"$/, "$1");
                console.log("[DEBUG][scanner] normalizedCode:", JSON.stringify(normalizedCode));

                if (!normalizedCode) {
                    console.log("[DEBUG][scanner] empty after normalizing — skipping navigation");
                    return; // Ignore empty codes after trimming
                }

                hasNavigatedRef.current = true;

                try {
                    await scanner.clear();
                } catch {
                    // Keep navigation flow even if cleanup throws.
                }

                // Query the API to get the equipment UUID for this barcode
                try {
                    console.log("[DEBUG][scanner] calling API to look up barcode:", normalizedCode);
                    const apiResponse = await fetch(`/api/equipment/by-barcode?barcode=${encodeURIComponent(normalizedCode)}`);
                    console.log("[DEBUG][scanner] API response status:", apiResponse.status);

                    if (!apiResponse.ok) {
                        const errorData = await apiResponse.json();
                        console.error("[DEBUG][scanner] API error:", errorData.error);
                        return;
                    }

                    const { id: equipmentId } = await apiResponse.json();
                    console.log("[DEBUG][scanner] received equipment id:", equipmentId);

                    const targetPath = `/items/${encodeURIComponent(equipmentId)}`;
                    console.log("[DEBUG][scanner] navigating to:", targetPath);
                    router.push(targetPath);
                } catch (err) {
                    console.error("[DEBUG][scanner] lookup failed:", err);
                }
            },
            () => {
                // Expected when no code is detected in a frame — fires many times per second, not logged to avoid spam.
            }
        );

        return () => {
            console.log("[DEBUG][scanner] cleaning up scanner on unmount");
            if (scannerRef.current) {
                void scannerRef.current.clear().catch(() => {
                    // Ignore cleanup errors when unmounting.
                });
            }
        };
    }, [router]);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const normalizedCode = manualBarcode.trim().replace(/^"(.+)"$/, "$1");
        console.log("[DEBUG][scanner] manual submit normalized code:", normalizedCode);

        if (!normalizedCode) {
            console.log("[DEBUG][scanner] manual input empty");
            return;
        }

        setIsLookingUp(true);

        try {
            console.log("[DEBUG][scanner] manual lookup calling API:", normalizedCode);
            const apiResponse = await fetch(`/api/equipment/by-barcode?barcode=${encodeURIComponent(normalizedCode)}`);
            console.log("[DEBUG][scanner] manual lookup API response:", apiResponse.status);

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                console.error("[DEBUG][scanner] manual lookup error:", errorData.error);
                setIsLookingUp(false);
                setToastMessage(errorData.error);
                setToastType("error");
                return;
            }

            const { id: equipmentId } = await apiResponse.json();
            console.log("[DEBUG][scanner] manual lookup received equipment id:", equipmentId);

            const targetPath = `/items/${encodeURIComponent(equipmentId)}`;
            console.log("[DEBUG][scanner] manual lookup navigating to:", targetPath);
            router.push(targetPath);
        } catch (err: any) {
            console.error("[DEBUG][scanner] manual lookup failed:", err);
            setIsLookingUp(false);
            setToastMessage(err.message);
            setToastType("error");
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#FFC94A]">
            {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}

            <main className="flex-1 p-4 md:p-8 w-full">
                <h1 className="text-2xl font-semibold text-[#132540]">Scan Equipment</h1>
                <p className="mt-2 text-sm text-[#132540]">
                    Point your camera at a barcode label to open the attached equipment record.
                </p>

                <section className="mt-6 max-w-xl rounded-2xl bg-white/85 p-4 shadow-lg">
                    <div id="qr-reader" className="w-full" />
                </section>

                <section className="mt-6 max-w-xl rounded-2xl bg-white/85 p-4 shadow-lg">
                    <h2 className="text-lg font-semibold text-[#132540] mb-3">Or enter barcode manually:</h2>
                    <form onSubmit={handleManualSubmit} className="flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            placeholder="Enter barcode (e.g., 0002)"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-[#132540] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLookingUp}
                        />
                        <button
                            type="submit"
                            disabled={isLookingUp}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLookingUp ? "Looking up..." : "Search"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}
