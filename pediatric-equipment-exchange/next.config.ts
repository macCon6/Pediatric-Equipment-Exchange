import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isDev, // only does this in dev environment cause otherwise pics are broken in supabase local dev
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lyvuyttcxedgifjxfvhm.supabase.co",
        port: "",
        pathname: "/**"
      },
      { // for local testing
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ]
  },
  logging: { // so that client side logs show in terminal instead of needing to open devtools
    browserToTerminal: true,
  },
  compiler: {
    // Remove console logs in production (!isDev)
    removeConsole: !isDev
  }
};

console.log("Next.js config: dangerouslyAllowLocalIP =", isDev);

export default nextConfig;
