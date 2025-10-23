import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SearchHero } from '../components/home/SearchHero';
import { JobList } from '../components/home/JobList';
import { JobFilters } from '../components/home/JobFilters';
import { FavoriteJobs } from '../components/home/FavoriteJobs';
import { SEOJobContent } from '../components/job/SEOJobContent';
import { useJobs } from '../hooks/useJobs';
import { useJobFilters } from '../hooks/useJobFilters';
import { jobCategories } from '../data/jobCategories';
import { useAuthContext } from '../contexts/AuthContext';
import { generateMetaTags } from '../utils/seoUtils';
import { generateJobUrl } from '../utils/seoUtils';
import { checkJobDates } from '../utils/dateUtils';
import { Heart, Filter, X, Search, MapPin, Briefcase, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export function HomePage() {
  const { user } = useAuthContext();
  const { pageNumber } = useParams();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Optimized hook kullanımı
  const { 
    jobs, 
    categories, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    loadMoreJobs,
    refetchJobs 
  } = useJobs({
    categoryFilter: undefined, 
    searchTerm, 
    limit: 20
  });

  const { 
    filters, 
    updateFilters, 
    filteredJobs, 
    clearFilters, 
    hasActiveFilters, 
    isShowingSimilar 
  } = useJobFilters(jobs);

  useEffect(() => {
    const jobCount = jobs.length > 0 ? Math.ceil(jobs.length / 10) * 10 : 100;
    
    generateMetaTags({
      title: 'İstanbul Ankara İzmir İş İlanları | Şoför Garson Kasiyer',
      description: `${jobCount}+ güncel iş ilanı. İstanbul şoför, Ankara garson, İzmir kasiyer pozisyonları. Ücretsiz başvuru, hızlı işe giriş.`,
      keywords: [
        'istanbul şoför iş ilanları', 'ankara garson iş ilanları', 'izmir kasiyer iş ilanları',
        'istanbul transfer şoförü', 'ankara restoran elemanı', 'izmir market kasiyer',
        'kadıköy garson ilanları', 'çankaya iş ilanları', 'konak iş fırsatları',
        'beşiktaş kurye iş', 'keçiören çağrı merkezi', 'bornova part time',
        'şoför iş ilanları 2025', 'garson iş ilanları güncel', 'kasiyer iş başvurusu',
        'kurye iş ilanları', 'çağrı merkezi elemanı', 'satış danışmanı ilanları',
        'restoran personeli aranıyor', 'market çalışanı iş', 'otel personeli',
        'istanbul avrupa yakası şoför', 'ankara yenimahalle iş ilanları', 
        'izmir alsancak garson', 'kendi aracıyla şoför işi', 'part time garson',
        'tam zamanlı kasiyer istanbul', 'esnek çalışma saatleri iş',
        'iş ilanları', 'iş ara', 'iş bul', 'güncel iş ilanları',
        'istanbul iş ilanları', 'ankara iş ilanları', 'izmir iş ilanları',
        'iş başvurusu', 'eleman ilanları', 'kariyer fırsatları'
      ],
      url: window.location.pathname
    });

    // ✅ DÜZELTILMIŞ: ItemList Schema - Google Search Console hatalarını giderir
    const jobListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Güncel İş İlanları 2025",
      "description": "Türkiye'nin en güncel iş ilanları listesi",
      "url": "https://isilanlarim.org",
      "numberOfItems": filteredJobs.length,
      "itemListElement": filteredJobs.slice(0, 10).map((job, index) => {
        // ✅ Lokasyon parse - addressLocality garantisi
        const locationParts = (job.location || 'İzmir').split(/[,\-]/).map(p => p.trim()).filter(p => p);
        const city = locationParts[0] || 'İzmir';
        const district = locationParts[1] || locationParts[0] || 'İzmir';

        // ✅ ISO 8601 tarih formatı (YYYY-MM-DD)
        const datePosted = job.createdAt 
          ? new Date(job.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        // ✅ validThrough - ISO 8601 formatı
        const validThrough = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

        // ✅ employmentType mapping
        const getEmploymentType = (type: string): string => {
          const typeMap: Record<string, string> = {
            'Tam Zamanlı': 'FULL_TIME',
            'Yarı Zamanlı': 'PART_TIME',
            'Freelance': 'CONTRACTOR',
            'Staj': 'INTERN',
            'Stajyer': 'INTERN',
            'Uzaktan': 'CONTRACTOR'
          };
          return typeMap[type] || 'FULL_TIME';
        };

        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "JobPosting",
            
            // ✅ ZORUNLU: title - String garantisi
            "title": String(job.title || "İş İlanı").trim(),
            
            // ✅ ZORUNLU: description
            "description": String(job.description || "İş tanımı").substring(0, 150) + "...",
            
            // ✅ ZORUNLU: datePosted - ISO 8601 (YYYY-MM-DD)
            "datePosted": datePosted,
            
            // ✅ ÖNERİLEN: validThrough
            "validThrough": validThrough,
            
            // ✅ ZORUNLU: employmentType
            "employmentType": getEmploymentType(job.type),
            
            // ✅ ZORUNLU: hiringOrganization
            "hiringOrganization": {
              "@type": "Organization",
              "name": String(job.company || "İşveren").trim(),
              "sameAs": "https://isilanlarim.org",
              "logo": "https://isilanlarim.org/logo.png"
            },
            
            // ✅ ZORUNLU: jobLocation - Tam adres yapısı
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                // ✅ ZORUNLU: addressLocality (ilçe/mahalle)
                "addressLocality": district,
                // ✅ ZORUNLU: addressRegion (il)
                "addressRegion": city,
                // ✅ ZORUNLU: addressCountry
                "addressCountry": "TR",
                // ✅ ÖNERİLEN: streetAddress - SEO için önemli
                "streetAddress": city + " Merkez",
                // ✅ ÖNERİLEN: postalCode - SEO için önemli
                "postalCode": "35000"
              }
            },
            
            // ✅ URL
            "url": `https://isilanlarim.org${generateJobUrl(job)}`,
            
            // ✅ identifier
            "identifier": {
              "@type": "PropertyValue",
              "name": "job-id",
              "value": String(job.id || Date.now())
            },
            
            // ✅ ÖNERİLEN: baseSalary (varsa)
            ...(job.salary && job.salary !== "Belirtilmemiş" && {
              "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "TRY",
                "value": {
                  "@type": "QuantitativeValue",
                  "value": parseSalary(job.salary),
                  "unitText": "MONTH"
                }
              }
            })
          }
        };
      })
    };

    const existingSchema = document.getElementById('job-list-schema');
    if (existingSchema) {
      existingSchema.textContent = JSON.stringify(jobListSchema);
    } else {
      const script = document.createElement('script');
      script.id = 'job-list-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jobListSchema);
      document.head.appendChild(script);
    }

    if (location.state?.newJobCreated) {
      toast.success('🎉 İlanınız başarıyla yayınlandı ve en üstte görünüyor!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '500',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
        },
        icon: '🚀'
      });
      window.history.replaceState({}, document.title);
    }

    const scrollPosition = sessionStorage.getItem('scrollPosition');
    const previousPath = sessionStorage.getItem('previousPath');
    
    if (scrollPosition && previousPath && previousPath.includes(window.location.pathname)) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPosition));
        sessionStorage.removeItem('scrollPosition');
        sessionStorage.removeItem('previousPath');
      }, 100);
    } else if (location.state?.scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (jobs.length > 0) {
      checkJobDates(jobs);
    }
  }, [pageNumber, location.state, jobs, filteredJobs]);

  // ✅ YENİ: Maaş parse helper fonksiyonu
  const parseSalary = (salary: string): number => {
    const numbers = salary.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 0;
    
    if (numbers.length >= 2) {
      const min = parseInt(numbers[0]);
      const max = parseInt(numbers[1]);
      return (min + max) / 2;
    }
    
    return parseInt(numbers[0]);
  };

  useEffect(() => {
    if (location.state?.restoreScroll) {
      const scrollPosition = sessionStorage.getItem('scrollPosition');
      
      if (scrollPosition) {
        const timeoutId = setTimeout(() => {
          const position = parseInt(scrollPosition, 10);
          window.scrollTo({
            top: position,
            behavior: 'instant'
          });
          console.log('📍 HomePage scroll restored to:', position);
          
          sessionStorage.removeItem('scrollPosition');
          sessionStorage.removeItem('previousPath');
          window.history.replaceState({}, document.title);
        }, 150);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [location.state?.restoreScroll]);

  const getCategoryName = (categoryId: string) => {
    const category = jobCategories.find(c => c.id === categoryId);
    return category ? `${category.name} İlanları` : 'Tüm İlanlar';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchJobs();
    setIsRefreshing(false);
    toast.success('📊 İlanlar güncellendi!', {
      duration: 2000,
      position: 'bottom-center'
    });
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
    document.body.style.overflow = !showMobileFilters ? 'hidden' : 'auto';
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Search Hero */}
      <div className="bg-white">
        <SearchHero
          onSearch={handleSearchChange}
          onLocationChange={(city) => updateFilters({ city })}
          onCategorySelect={(category) => updateFilters({ category, subCategory: '' })}
          availableCategories={categories}
          updateFilters={updateFilters}
        />
      </div>

      {/* Compact Sticky Search Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="İş ara... (Örn: Yazılım Geliştirici, Satış Temsilci)"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={toggleMobileFilters}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filtre</span>
              {hasActiveFilters && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  !
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              <Briefcase className="w-4 h-4 mr-1" />
              {filteredJobs.length} ilan
              {isShowingSimilar && (
                <span className="ml-1 text-yellow-600">*</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {filters.category ? getCategoryName(filters.category) : 'Tüm İlanlar'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredJobs.length} aktif ilan gösteriliyor
                  {isShowingSimilar && filters.city && (
                    <span className="text-yellow-600 ml-1">
                      ({filters.city} benzeri)
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="İlanları Yenile"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">İstatistikler</h3>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Yenile"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam İlan</span>
                    <span className="font-semibold text-blue-600">{jobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Filtrelenmiş</span>
                    <span className="font-semibold text-green-600">{filteredJobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kategori</span>
                    <span className="font-semibold text-purple-600">{categories.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <JobFilters
                  filters={filters}
                  onFilterChange={updateFilters}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  availableCategories={categories}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <MainContent 
              loading={loading}
              error={error}
              filteredJobs={filteredJobs}
              filters={filters}
              getCategoryName={getCategoryName}
              refetchJobs={refetchJobs}
              hasMore={hasMore}
              loadMoreJobs={loadMoreJobs}
              loadingMore={loadingMore}
              isShowingSimilar={isShowingSimilar}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <MainContent 
            loading={loading}
            error={error}
            filteredJobs={filteredJobs}
            filters={filters}
            getCategoryName={getCategoryName}
            refetchJobs={refetchJobs}
            hasMore={hasMore}
            loadMoreJobs={loadMoreJobs}
            loadingMore={loadingMore}
            isShowingSimilar={isShowingSimilar}
            onClearFilters={clearFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileFilters}
          />
          
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
              <button
                onClick={toggleMobileFilters}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto h-full pb-20">
              <JobFilters
                filters={filters}
                onFilterChange={(newFilters) => {
                  updateFilters(newFilters);
                  setShowMobileFilters(false);
                }}
                onClearFilters={() => {
                  clearFilters();
                  setShowMobileFilters(false);
                }}
                hasActiveFilters={hasActiveFilters}
                availableCategories={categories}
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SEOJobContent />
      </div>
    </div>
  );
}

// Main Content Component
const MainContent: React.FC<{
  loading: boolean;
  error: string | null;
  filteredJobs: any[];
  filters: any;
  getCategoryName: (categoryId: string) => string;
  refetchJobs: () => void;
  hasMore: boolean;
  loadMoreJobs: () => void;
  loadingMore: boolean;
  isShowingSimilar?: boolean;
  onClearFilters?: () => void;
}> = ({
  loading,
  error,
  filteredJobs,
  filters,
  getCategoryName,
  refetchJobs,
  hasMore,
  loadMoreJobs,
  loadingMore,
  isShowingSimilar,
  onClearFilters
}) => {
  if (loading && filteredJobs.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">İlanlar Yükleniyor</h3>
          <p className="text-gray-600">En güncel iş fırsatları getiriliyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Bir Hata Oluştu</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">İlan Bulunamadı</h3>
        <p className="text-gray-600 mb-6">Arama kriterlerinizi değiştirmeyi deneyin.</p>
        <div className="space-y-3">
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filters.category ? getCategoryName(filters.category) : 'Tüm İlanlar'}
            </h2>
            <p className="text-gray-600 mt-1">{filteredJobs.length} ilan listeleniyor</p>
          </div>
        </div>
      </div>

      <JobList 
        jobs={filteredJobs} 
        onJobDeleted={refetchJobs}
        hasMore={hasMore}
        loadMoreJobs={loadMoreJobs}
        loadingMore={loadingMore}
        isShowingSimilar={isShowingSimilar}
        selectedCity={filters.city}
        onClearFilters={onClearFilters}
      />
    </div>
  );
};
