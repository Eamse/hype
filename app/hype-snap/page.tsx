export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import HeroCarousel from '@/components/hero-carousel';
import ComingSoon from '@/components/coming-soon';
import { withProductNumbers } from '@/lib/product-number';
import ProductSections from '../_components/product-sections';
import HomeFooter from '../_components/home-footer';
const COMING_SOON = true;
export default async function HypeSnapPage() {
    if (COMING_SOON) {
        return <ComingSoon brand="hype-snap"/>;
    }
    const [jejuRaw, seoulRaw, heroRow] = await Promise.all([
        prisma.product.findMany({
            where: { section: 'Casual Photoshoot in Jeju' },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            take: 8,
            select: {
                id: true,
                title: true,
                imageUrl: true,
                section: true,
                directors: { select: { director: { select: { number: true } } } },
            },
        }),
        prisma.product.findMany({
            where: { section: 'Casual Photoshoot in Seoul' },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            take: 8,
            select: {
                id: true,
                title: true,
                imageUrl: true,
                section: true,
                directors: { select: { director: { select: { number: true } } } },
            },
        }),
        prisma.siteConfig.findUnique({
            where: { key: 'images_hero_snap' },
        }),
    ]);
    const jeju = withProductNumbers(jejuRaw);
    const seoul = withProductNumbers(seoulRaw);
    const heroImages: string[] = (() => {
        try {
            const parsed: unknown = JSON.parse(heroRow?.value ?? '[]');
            return Array.isArray(parsed) ? (parsed as string[]) : [];
        }
        catch {
            return [];
        }
    })();
    return (<div style={{
            backgroundColor: '#fff',
            color: '#000',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
      <Header brand="hype-snap"/>

      <main style={{ paddingTop: 56, flex: 1 }}>
        <HeroCarousel images={heroImages}>
          <div className="dday-banner">
            <div className="dday-banner-text">
              <span className="dday-banner-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <span>
                Leave your desired <strong>photoshoot date</strong>
              </span>
            </div>
            <a href="https://forms.gle/3sWqu4NED5ruJEnN9" target="_blank" className="dday-banner-cta">
              Enter photoshoot info
            </a>
          </div>
        </HeroCarousel>

        <ProductSections sections={[
            {
                title: 'Casual Photoshoot in Jeju',
                subtitle: 'With Couple, Friend and Family',
                products: jeju,
            },
            {
                title: 'Casual Photoshoot in Seoul',
                subtitle: 'With Couple, Friend and Family',
                products: seoul,
            },
        ]}/>
      </main>
      <HomeFooter />
    </div>);
}
