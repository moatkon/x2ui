import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/feed", destination: "/", permanent: true },
      { source: "/user/:path*", destination: "/users/:path*", permanent: true },
      { source: "/auth/login", destination: "/login", permanent: true },
      { source: "/auth/register", destination: "/register", permanent: true },
      { source: "/auth/verify", destination: "/verify-email", permanent: true },
      { source: "/auth/forgot", destination: "/forgot-password", permanent: true },
      { source: "/auth/reset", destination: "/reset-password", permanent: true },
    ];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
