import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

export default function RootLayout() {
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
