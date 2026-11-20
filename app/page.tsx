import About from "./components/About";
import Coaches from "./components/Coaches";
import Contact from "./components/Contact";
import Dudoy from "./components/Dudoy";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Mindset from "./components/Mindset";
import Motion from "./components/Motion";
import Stage from "./components/Stage";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Stage />
      <Header />
      <main className="relative z-10">
        <Hero />
        <About />
        <Coaches />
        <Mindset />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <Dudoy />
      <Motion />
    </>
  );
}
