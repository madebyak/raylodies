import Hero from "@/components/home/Hero";
import HeroVideo from "@/components/home/HeroVideo";
import FeaturedWork from "@/components/home/FeaturedWork";
import { getFeaturedProjects } from "@/actions/projects";

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects(4);

  return (
    <>
      <Hero />
      <HeroVideo />
      <FeaturedWork projects={featuredProjects} />
    </>
  );
}
