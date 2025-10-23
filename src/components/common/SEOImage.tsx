// src/components/common/SEOImage.tsx
import React from 'react';

interface SEOImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

/**
 * SEO optimize edilmiş görsel komponenti
 * - Alt text zorunlu
 * - Lazy loading default
 * - Width/height ile CLS önlenir
 */
export function SEOImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false
}: SEOImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      className={className}
      // Modern tarayıcılar için decoding
      decoding="async"
    />
  );
}

/**
 * Önceden tanımlı SEO alt text'leri
 */
export const SEOAltTexts = {
  hero: {
    main: "İstanbul, Ankara, İzmir iş ilanları - Şoför, garson, kasiyer pozisyonları",
    background: "Ofis çalışanları - Türkiye'de iş fırsatları 2025",
    teamwork: "İş başvurusu - Ücretsiz iş ilanları platformu"
  },
  
  jobs: {
    driver: "Şoför iş ilanları - B sınıf ehliyet, transfer şoförü, acil şoför aranıyor",
    waiter: "Garson iş ilanları - Restoran, kafe, otel garson pozisyonları",
    cashier: "Kasiyer iş ilanları - Market, AVM kasiyer işi, part time kasiyer",
    courier: "Kurye iş ilanları - Motor, bisiklet, kendi aracıyla kurye işi",
    security: "Güvenlik iş ilanları - Güvenlik görevlisi, koruma personeli",
    callcenter: "Çağrı merkezi iş ilanları - Müşteri temsilcisi, çağrı merkezi elemanı"
  },
  
  cities: {
    istanbul: "İstanbul iş ilanları - Kadıköy, Şişli, Beşiktaş, Üsküdar",
    ankara: "Ankara iş ilanları - Çankaya, Keçiören, Yenimahalle",
    izmir: "İzmir iş ilanları - Konak, Bornova, Karşıyaka, Alsancak"
  },
  
  icons: {
    search: "İş ara",
    apply: "Başvuru yap",
    success: "Başarılı başvuru",
    clock: "Çalışma saatleri",
    money: "Maaş bilgisi",
    location: "Konum"
  },
  
  company: {
    logo: "İşBuldum - Türkiye iş ilanları platformu logosu",
    placeholder: "Firma logosu"
  }
};

/**
 * Hero section için optimize edilmiş background image
 */
export function HeroBackgroundImage() {
  return (
    <div className="absolute inset-0 z-0">
      <SEOImage
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop&crop=center"
        alt={SEOAltTexts.hero.main}
        className="w-full h-full object-cover"
        loading="eager"
        priority={true}
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/80" />
    </div>
  );
}

/**
 * Kategori iconları için aria-label
 */
export function CategoryIcon({ 
  icon, 
  label 
}: { 
  icon: React.ReactNode; 
  label: string 
}) {
  return (
    <div 
      className="flex items-center justify-center" 
      role="img" 
      aria-label={label}
    >
      {icon}
    </div>
  );
}

/**
 * Örnek kullanım:
 * 
 * import { SEOImage, SEOAltTexts, HeroBackgroundImage } from './SEOImage';
 * 
 * // Hero section
 * <HeroBackgroundImage />
 * 
 * // Kategori görselleri
 * <SEOImage
 *   src="/images/driver.jpg"
 *   alt={SEOAltTexts.jobs.driver}
 *   width={400}
 *   height={300}
 * />
 * 
 * // Company logo
 * <SEOImage
 *   src={job.companyLogo}
 *   alt={`${job.company} - ${SEOAltTexts.company.placeholder}`}
 *   width={80}
 *   height={80}
 * />
 */