import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/hero/Hero";
import Intro from "@/components/sections/Intro";
import Ecosystem from "@/components/sections/Ecosystem";
import Curriculum from "@/components/sections/Curriculum";
import Projects from "@/components/sections/Projects";
import Program from "@/components/sections/Program";
import Apply from "@/components/sections/Apply";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main id="main" className="grain">
        <Hero />
        <Intro />
        <Ecosystem />
        <Curriculum />
        <Projects />
        <Program />
        <Apply />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
