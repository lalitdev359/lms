import { SiteNavbar } from "@/components/landing/SiteNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { RolesSection } from "@/components/landing/RolesSection";
import { FeaturedCourses } from "@/components/landing/FeaturedCourses";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { query } from "@/lib/db";

async function getMarketingStats() {
  const [{ count: courseCount }] = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM courses WHERE published = true"
  );
  const [{ count: studentCount }] = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM users WHERE role = 'STUDENT'"
  );
  return { courseCount: Number(courseCount), studentCount: Number(studentCount) };
}

export default async function LandingPage() {
  const { courseCount, studentCount } = await getMarketingStats();

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">
        <Hero courseCount={courseCount} studentCount={studentCount} />
        <RolesSection />
        <FeaturedCourses />
        <HowItWorks />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
