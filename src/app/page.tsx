export const dynamic = "force-dynamic";

import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import Features from "@/components/public/Features";
import AppPreview from "@/components/public/AppPreview";
import DownloadSection from "@/components/public/DownloadSection";
import InstallationSteps from "@/components/public/InstallationSteps";
import FAQ from "@/components/public/FAQ";
import Footer from "@/components/public/Footer";
import { getSettings } from "@/lib/db/settings";
import { getCurrentRelease, toPublicRelease } from "@/lib/db/releases";

export default async function Home() {
  const [settings, currentRelease] = await Promise.all([getSettings(), getCurrentRelease()]);
  const release = currentRelease ? toPublicRelease(currentRelease) : null;

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar appName={settings.appName} />
      <main>
        <Hero appName={settings.appName} description={settings.description} platforms={settings.supportedPlatforms} />
        <Features />
        <AppPreview />
        <DownloadSection appName={settings.appName} release={release} />
        <InstallationSteps />
        <FAQ platforms={settings.supportedPlatforms} />
      </main>
      <Footer
        appName={settings.appName}
        description={settings.description}
        socialTwitter={settings.socialTwitter}
        socialGithub={settings.socialGithub}
        socialDiscord={settings.socialDiscord}
      />
    </div>
  );
}
