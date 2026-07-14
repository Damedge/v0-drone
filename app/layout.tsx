import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Kestrel Recon | AI-Native Spatial Intelligence",
  description:
    "Kestrel Recon transforms geospatial data into operational intelligence with AI-native analytics built for a changing world.",
  metadataBase: new URL("https://kestrelrecon.com"),
  openGraph: {
    title: "Kestrel Recon | See the world before it changes",
    description: "AI-native spatial intelligence for decisive teams.",
    url: "https://kestrelrecon.com",
    siteName: "Kestrel Recon",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#090b12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
