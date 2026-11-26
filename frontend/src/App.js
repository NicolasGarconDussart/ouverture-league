import { useEffect } from "react";
import "lenis/dist/lenis.css";
import "@/App.css";
import Lenis from "lenis";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { GameProvider, useGame, useReduce } from "@/state/game";
import { TopBar, Dock } from "@/components/Chrome";
import Accueil from "@/pages/Accueil";
import Ouverture from "@/pages/Ouverture";
import Revelation from "@/pages/Revelation";
import Recap from "@/pages/Recap";
import Classeur from "@/pages/Classeur";
import Marche from "@/pages/Marche";
import Boutique from "@/pages/Boutique";
import Sac from "@/pages/Sac";
import Succes from "@/pages/Succes";
import Classements from "@/pages/Classements";

const Smooth = () => {
  const reduce = useReduce();
  const { pathname } = useLocation();
  useEffect(() => {
    if (reduce) return undefined;
    const lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [reduce]);
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Shell = () => {
  const { state } = useGame();
  const { pathname } = useLocation();
  const home = pathname === "/";
  return (
    <MotionConfig reducedMotion={state.reduced ? "always" : "user"}>
      <Smooth />
      <div className="app-shell">
        {!home && <TopBar />}
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/ouverture" element={<Ouverture />} />
          <Route path="/revelation" element={<Revelation />} />
          <Route path="/recap" element={<Recap />} />
          <Route path="/classeur" element={<Classeur />} />
          <Route path="/marche" element={<Marche />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/sac" element={<Sac />} />
          <Route path="/succes" element={<Succes />} />
          <Route path="/classements" element={<Classements />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!home && pathname !== "/revelation" && <Dock />}
      </div>
      <Toaster theme="dark" position="top-center" />
    </MotionConfig>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Shell />
      </GameProvider>
    </BrowserRouter>
  );
}
