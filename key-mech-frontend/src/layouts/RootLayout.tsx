import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-background flex flex-col relative">
        {/* <div className="fixed inset-0 z-0">
          <DotGrid
            dotSize={3}
            gap={15}
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
            baseColor="var(--chart-4)"   // CSS variable
            activeColor="var(--primary)"   // CSS variable
          />
        </div> */}
        <div className="relative z-10 flex flex-col flex-1">
          <NavBar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
