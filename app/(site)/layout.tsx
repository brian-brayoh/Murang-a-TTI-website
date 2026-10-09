import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnersStrip from "@/components/PartnersStrip";
import WelcomeModal from "@/components/WelcomeModal";
import { getPopup } from "@/lib/home";
import { getSite } from "@/lib/site-details";
import AdminBar from "@/components/AdminBar";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ popup, version }, site] = await Promise.all([getPopup(), getSite()]);
  return (
    <>
      <AdminBar />
      {popup.show && <WelcomeModal popup={popup} version={version} whatsapp={site.whatsapp} />}
      <Header site={{ address: site.address, email: site.email, hours: site.hours, whatsapp: site.whatsapp, social: { facebook: site.facebook, instagram: site.instagram, x: site.x, youtube: site.youtube, tiktok: site.tiktok } }} />
      <main>{children}</main>
      <PartnersStrip />
      <Footer site={site} />
    </>
  );
}
