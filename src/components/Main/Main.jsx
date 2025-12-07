import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSlidersH, FaHome, FaKey, FaSearch, FaChartLine, FaStar, FaClock, FaHeadset, FaBuilding, FaUsers, FaBriefcase, FaTrophy, FaHandshake, FaNetworkWired, FaShieldAlt, FaCrown, FaBullseye } from "react-icons/fa";
import SearchBar from "../SearchBar";
import AdvancedSearchModal from "../AdvancedSearchModal";
import { RealEstateCard } from "../real-estate";
import { AuthContext } from '../../context/AuthContext';
import styles from './styles.module.css';
import CTA from "../CTA";
import AuthPrompt from "../AuthPrompt";

export default function Main() {
  const [searchResults, setSearchResults] = useState([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeAudience, setActiveAudience] = useState('agencies'); // Default to agencies
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setError(null);
  };

  const handleError = (error) => {
    setError("Došlo je do greške pri pretrazi. Pokušajte ponovo.");
    setSearchResults([]);
  };

  const handleCreateListingClick = () => {
    navigate('/create-listing');
  };

  const handleAudienceClick = (audience) => {
    setActiveAudience(audience);
  };

  // CTA configurations for each audience type
  const ctaConfigs = {
    agencies: {
      title: "Premium platforma za agencije nekretnina",
      description: "Proširite vaše poslovanje i povećajte prodaju sa alatom koji vam pruža ekskluzivan pristup klijentima, napredno upravljanje oglasima i maksimalnu vidljivost. Pridružite se preko 250 partner agencija koje već ostvaruju izuzetne rezultate.",
      primaryButtonText: "Registrujte agenciju",
      secondaryButtonText: "Uslovi saradnje",
      stats: [
        { icon: FaBuilding, number: '250+', label: 'Agencija partnera' },
        { icon: FaChartLine, number: '40%', label: 'Veća prodaja' },
        { icon: FaStar, number: '98%', label: 'Zadovoljstvo klijenata' },
        { icon: FaHeadset, number: '24/7', label: 'Podrška za partnere' }
      ],
      primaryAction: () => navigate('/agency-registration'),
      secondaryAction: () => navigate('/agency-terms'),
      authMessage: "Već imate partner nalog?",
      authRegisterText: "Registrujte agenciju",
      authRegisterPath: '/agency-registration'
    },
    investors: {
      title: "Strateške prilike za investitore",
      description: "Otkrijte ekskluzivne investicione mogućnosti sa detaljnim analizama tržišta, ROI projekcijama i personalizovanim savetima. Prvi pristup novim projektima i mreža od preko 1.500 aktivnih investitora.",
      primaryButtonText: "Postanite investitor",
      secondaryButtonText: "Investicione prilike",
      stats: [
        { icon: FaBriefcase, number: '1.500+', label: 'Aktivnih investitora' },
        { icon: FaBullseye, number: '25%', label: 'Prosečni ROI' },
        { icon: FaTrophy, number: '95%', label: 'Uspešnih investicija' },
        { icon: FaShieldAlt, number: '100%', label: 'Sigurnost podataka' }
      ],
      primaryAction: () => navigate('/investor-registration'),
      secondaryAction: () => navigate('/investment-opportunities'),
      authMessage: "Već investirate sa nama?",
      authRegisterText: "Postanite investitor",
      authRegisterPath: '/investor-registration'
    },
    owners: {
      title: "Prodajte vašu nekretninu brže i po boljoj ceni",
      description: "Obezbeđujemo bržu prodaju po optimalnoj ceni, transparentnost procesa i stručnu podršku od početka do kraja transakcije. Pridružite se 12.000+ zadovoljnih vlasnika koji su postigli maksimalnu vrednost.",
      primaryButtonText: "Kreirajte oglas",
      secondaryButtonText: "Kako funkcioniše",
      stats: [
        { icon: FaHome, number: '12.000+', label: 'Zadovoljnih vlasnika' },
        { icon: FaClock, number: '14 Dana', label: 'Prosječno vreme' },
        { icon: FaStar, number: '97%', label: 'Zadovoljstva klijenata' },
        { icon: FaHandshake, number: '98%', label: 'Uspešnih transakcija' }
      ],
      primaryAction: handleCreateListingClick,
      secondaryAction: () => navigate('/how-it-works'),
      authMessage: "Želite da prodate nekretninu?",
      authRegisterText: "Kreirajte nalog",
      authRegisterPath: '/signup'
    }
  };

  // Get active CTA config
  const activeCTA = ctaConfigs[activeAudience];

  return (
    <div className={styles.container}>
      {/* Hero Section with Background Image */}
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Pronađite nekretninu <span>po svojoj meri</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Otkrijte šta su agencije, vlasnici nekretnina i investitori pripremili za vas.
            </p>
          </div>

          {/* Action Cards Over Background */}
          <div className={styles.actionGrid}>
            {/* Buy Card */}
            <div
              onClick={() => navigate('/buy')}
              className={`${styles.actionCard} ${styles.buyCard}`}
            >
              <div className={`${styles.iconContainer} ${styles.buyIcon}`}>
                <FaHome className="text-white text-xl" />
              </div>
              <h3 className={styles.cardTitle}>Kupite nekretninu</h3>
              <p className={styles.cardDescription}>
                Pronađite savršeni dom za vas i vašu porodicu uz ekskluzivnu ponudu premium nekretnina
              </p>
              <div className={`${styles.cardLink} ${styles.buyLink}`}>
                Sve za prodaju
                <svg className={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Rent Card */}
            <div
              onClick={() => navigate('/rent')}
              className={`${styles.actionCard} ${styles.rentCard}`}
            >
              <div className={`${styles.iconContainer} ${styles.rentIcon}`}>
                <FaKey className="text-white text-xl" />
              </div>
              <h3 className={styles.cardTitle}>Iznajmite nekretninu</h3>
              <p className={styles.cardDescription}>
                Otkrijte savremene prostore za stanovanje koje prilagođavamo vašem stilu života i budžetu
              </p>
              <div className={`${styles.cardLink} ${styles.rentLink}`}>
                Sve za iznajmljivanje
                <svg className={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Browse All Card */}
            <div
              onClick={() => navigate('/real-estates')}
              className={`${styles.actionCard} ${styles.browseCard}`}
            >
              <div className={`${styles.iconContainer} ${styles.browseIcon}`}>
                <FaSearch className="text-gray-900 text-xl" />
              </div>
              <h3 className={styles.cardTitle}>Pregledajte sve</h3>
              <p className={styles.cardDescription}>
                Istražite našu kompletnu kolekciju vrhunskih nekretnina sa detaljnim informacijama i virtuelnim obilascima
              </p>
              <div className={`${styles.cardLink} ${styles.browseLink}`}>
                Kompletan katalog
                <svg className={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className={styles.contentSection}>
        {/* Search Section */}
        <div className={styles.integratedSearchSection}>
          <div className={styles.searchContent}>
            <div className={styles.searchHeader}>
              <h2 className={styles.searchTitle}>Pretražite ponudu</h2>
              <p className={styles.searchSubtitle}>
                Otkrijte sjajne nekretnine svih tipova, po vašem ukusu i za vaše potrebe
              </p>
            </div>

            <div className={styles.searchArea}>
              <SearchBar
                onSearchResults={handleSearchResults}
                onError={handleError}
                setIsLoading={setIsLoading}
              />

              <div className={styles.searchActions}>
                <button
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className={styles.advancedButton}
                >
                  <FaSlidersH className="mr-2" />
                  Svi filteri
                </button>
              </div>
            </div>

            {/* Guidance appears below search when no results */}
            {!isLoading && searchResults.length === 0 && !error && (
              <div className={styles.integratedGuidance}>
                <div className={styles.guidanceSection}>
                  <h3 className={styles.guidanceTitle}>Kako da počnete?</h3>
                  <div className={styles.quickTips}>
                    <div className={styles.tipCard}>
                      <span className={styles.tipIcon}>📍</span>
                      <h4>Pretražite po lokaciji</h4>
                      <p>Unesite grad, opštinu ili ulicu</p>
                    </div>
                    <div className={styles.tipCard}>
                      <span className={styles.tipIcon}>💰</span>
                      <h4>Izdvojite po ceni</h4>
                      <p>Postavite opseg u okviru vašeg budžeta</p>
                    </div>
                    <div className={styles.tipCard}>
                      <span className={styles.tipIcon}>🏠</span>
                      <h4>Pretražite po kategoriji</h4>
                      <p>Stan, kuća, magacin, lokal...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>
              Search Results ({searchResults.length})
            </h2>
            <div className={styles.resultsGrid}>
              {searchResults.map((property) => (
                <RealEstateCard key={property.propertyId} property={property} />
              ))}
            </div>
          </div>
        )}

        {/* Interactive Audience Cards + Dynamic CTA */}
        <div className={styles.ctaAuthSection}>
          {/* New section header */}
          <div className={styles.platformForSection}>
            <h2 className={styles.platformTitle}>Platforma za sve učesnike na tržištu nekretnina</h2>
            <p className={styles.platformSubtitle}>
              Bez obzira da li ste profesionalac ili individualni korisnik, imamo rešenje prilagođeno vašim potrebama
            </p>
          </div>

          <div className={styles.audienceSelector}>
            <h3 className={styles.selectorTitle}>Izaberite vaš profil</h3>
            <p className={styles.selectorSubtitle}>Kliknite na kartu da vidite prednosti prilagođene vama</p>

            <div className={styles.audienceCards}>
              <div
                className={`${styles.audienceCard} ${activeAudience === 'agencies' ? styles.audienceCardActive : ''}`}
                onClick={() => handleAudienceClick('agencies')}
              >
                <div className={styles.audienceIcon}>🏢</div>
                <h4 className={styles.audienceTitle}>Agencije</h4>
                <p className={styles.audienceDesc}>Alati za profesionalce sa povlašćenim uslovima</p>
                <div className={styles.audienceBadge}>Premium</div>
              </div>

              <div
                className={`${styles.audienceCard} ${activeAudience === 'investors' ? styles.audienceCardActive : ''}`}
                onClick={() => handleAudienceClick('investors')}
              >
                <div className={styles.audienceIcon}>📈</div>
                <h4 className={styles.audienceTitle}>Investitori</h4>
                <p className={styles.audienceDesc}>Ekskluzivne prilike i analize tržišta</p>
                <div className={styles.audienceBadge}>Ekskluzivno</div>
              </div>

              <div
                className={`${styles.audienceCard} ${activeAudience === 'owners' ? styles.audienceCardActive : ''}`}
                onClick={() => handleAudienceClick('owners')}
              >
                <div className={styles.audienceIcon}>🏠</div>
                <h4 className={styles.audienceTitle}>Vlasnici</h4>
                <p className={styles.audienceDesc}>Brža prodaja po optimalnoj ceni</p>
                <div className={styles.audienceBadge}>Popularno</div>
              </div>
            </div>
          </div>

          {/* Dynamic CTA based on selected audience - REMOVED extra spacing wrapper */}
          <CTA
            title={activeCTA.title}
            description={activeCTA.description}
            primaryButtonText={activeCTA.primaryButtonText}
            secondaryButtonText={activeCTA.secondaryButtonText}
            onPrimaryClick={activeCTA.primaryAction}
            onSecondaryClick={activeCTA.secondaryAction}
            stats={activeCTA.stats}
            theme="default"
          />

          {!isAuthenticated && !authLoading && (
            <AuthPrompt
              message={activeCTA.authMessage}
              onLogin={() => navigate('/login')}
              onRegister={() => navigate(activeCTA.authRegisterPath)}
              registerText={activeCTA.authRegisterText}
            />
          )}
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearchResults={handleSearchResults}
        onError={handleError}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}