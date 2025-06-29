import axios from 'axios';

const IPGEOLOCATION_API_KEY = import.meta.env.VITE_IPGEOLOCATION_API_KEY;

export interface LocationInfo {
  country: string;
  countryCode: string;
  state: string;
  city: string;
  jurisdiction: string;
  legalSystem: string;
  currency: string;
  language: string;
  timezone: string;
}

export interface JurisdictionInfo {
  code: string;
  name: string;
  legalSystem: 'common-law' | 'civil-law' | 'religious-law' | 'mixed';
  primaryLanguage: string;
  currency: string;
  courtSystem: string[];
  specialties: string[];
}

export const SUPPORTED_JURISDICTIONS: JurisdictionInfo[] = [
  {
    code: 'US',
    name: 'United States',
    legalSystem: 'common-law',
    primaryLanguage: 'en',
    currency: 'USD',
    courtSystem: ['Federal Courts', 'State Courts', 'Local Courts'],
    specialties: ['Constitutional Law', 'Corporate Law', 'Criminal Law', 'Civil Rights']
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    legalSystem: 'common-law',
    primaryLanguage: 'en',
    currency: 'GBP',
    courtSystem: ['Supreme Court', 'Court of Appeal', 'High Court'],
    specialties: ['Contract Law', 'Tort Law', 'Property Law', 'Family Law']
  },
  {
    code: 'CA',
    name: 'Canada',
    legalSystem: 'common-law',
    primaryLanguage: 'en',
    currency: 'CAD',
    courtSystem: ['Supreme Court', 'Federal Court', 'Provincial Courts'],
    specialties: ['Charter Rights', 'Indigenous Law', 'Immigration Law']
  },
  {
    code: 'AU',
    name: 'Australia',
    legalSystem: 'common-law',
    primaryLanguage: 'en',
    currency: 'AUD',
    courtSystem: ['High Court', 'Federal Court', 'State Courts'],
    specialties: ['Administrative Law', 'Environmental Law', 'Mining Law']
  },
  {
    code: 'IN',
    name: 'India',
    legalSystem: 'mixed',
    primaryLanguage: 'hi',
    currency: 'INR',
    courtSystem: ['Supreme Court', 'High Courts', 'District Courts'],
    specialties: ['Personal Law', 'Constitutional Law', 'Commercial Law']
  },
  {
    code: 'DE',
    name: 'Germany',
    legalSystem: 'civil-law',
    primaryLanguage: 'de',
    currency: 'EUR',
    courtSystem: ['Federal Constitutional Court', 'Federal Courts', 'State Courts'],
    specialties: ['Civil Code', 'Commercial Law', 'Labor Law']
  },
  {
    code: 'FR',
    name: 'France',
    legalSystem: 'civil-law',
    primaryLanguage: 'fr',
    currency: 'EUR',
    courtSystem: ['Court of Cassation', 'Courts of Appeal', 'First Instance Courts'],
    specialties: ['Civil Code', 'Administrative Law', 'European Law']
  },
  {
    code: 'BR',
    name: 'Brazil',
    legalSystem: 'civil-law',
    primaryLanguage: 'pt',
    currency: 'BRL',
    courtSystem: ['Supreme Federal Court', 'Superior Courts', 'State Courts'],
    specialties: ['Constitutional Law', 'Labor Law', 'Environmental Law']
  },
  {
    code: 'NG',
    name: 'Nigeria',
    legalSystem: 'mixed',
    primaryLanguage: 'en',
    currency: 'NGN',
    courtSystem: ['Supreme Court', 'Court of Appeal', 'High Courts'],
    specialties: ['Customary Law', 'Islamic Law', 'Common Law']
  },
  {
    code: 'ZA',
    name: 'South Africa',
    legalSystem: 'mixed',
    primaryLanguage: 'en',
    currency: 'ZAR',
    courtSystem: ['Constitutional Court', 'Supreme Court of Appeal', 'High Courts'],
    specialties: ['Constitutional Law', 'Human Rights', 'Mining Law']
  }
];

export const detectUserLocation = async (userJurisdiction?: string): Promise<LocationInfo> => {
  try {
    // PRIORITY 1: Use provided user jurisdiction parameter
    if (userJurisdiction) {
      const jurisdiction = SUPPORTED_JURISDICTIONS.find(j => j.name === userJurisdiction);
      if (jurisdiction) {
        return {
          country: jurisdiction.name,
          countryCode: jurisdiction.code,
          state: 'Unknown',
          city: 'Unknown',
          jurisdiction: jurisdiction.name,
          legalSystem: jurisdiction.legalSystem,
          currency: jurisdiction.currency,
          language: jurisdiction.primaryLanguage,
          timezone: 'UTC'
        };
      }
    }

    // PRIORITY 2: Check if user has saved jurisdiction preference in localStorage
    const savedUser = localStorage.getItem('justicegpt_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.jurisdiction) {
          const jurisdiction = SUPPORTED_JURISDICTIONS.find(j => j.name === user.jurisdiction);
          if (jurisdiction) {
            return {
              country: jurisdiction.name,
              countryCode: jurisdiction.code,
              state: 'Unknown',
              city: 'Unknown',
              jurisdiction: jurisdiction.name,
              legalSystem: jurisdiction.legalSystem,
              currency: jurisdiction.currency,
              language: jurisdiction.primaryLanguage,
              timezone: 'UTC'
            };
          }
        }
      } catch (error) {
        console.warn('Error parsing saved user jurisdiction:', error);
      }
    }

    // PRIORITY 3: Try IP-based geolocation (only if no user preference)
    if (IPGEOLOCATION_API_KEY && IPGEOLOCATION_API_KEY !== 'your_ipgeolocation_api_key') {
      try {
        const response = await axios.get(
          `https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}`,
          { timeout: 5000 } // 5 second timeout
        );

        const data = response.data;
        const jurisdiction = SUPPORTED_JURISDICTIONS.find(j => j.code === data.country_code2);

        return {
          country: data.country_name,
          countryCode: data.country_code2,
          state: data.state_prov,
          city: data.city,
          jurisdiction: jurisdiction?.name || data.country_name,
          legalSystem: jurisdiction?.legalSystem || 'common-law',
          currency: data.currency?.code || 'USD',
          language: jurisdiction?.primaryLanguage || 'en',
          timezone: data.time_zone?.name || 'UTC'
        };
      } catch (apiError) {
        console.warn('IP Geolocation API failed, falling back to default location:', apiError);
        // Continue to fallback methods
      }
    }

    // PRIORITY 4: Try browser geolocation as fallback
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false
          });
        });

        // For now, return default US location since we don't have reverse geocoding
        // In a real app, you'd use the coordinates for reverse geocoding
        return {
          country: 'United States',
          countryCode: 'US',
          state: 'Unknown',
          city: 'Unknown',
          jurisdiction: 'United States',
          legalSystem: 'common-law',
          currency: 'USD',
          language: 'en',
          timezone: 'America/New_York'
        };
      } catch (geoError) {
        console.warn('Browser geolocation failed:', geoError);
      }
    }

    // PRIORITY 5: Final fallback to default location
    return getDefaultLocation();
  } catch (error) {
    console.warn('Location detection failed, using default location:', error);
    return getDefaultLocation();
  }
};

const getDefaultLocation = (): LocationInfo => ({
  country: 'United States',
  countryCode: 'US',
  state: 'Unknown',
  city: 'Unknown',
  jurisdiction: 'United States',
  legalSystem: 'common-law',
  currency: 'USD',
  language: 'en',
  timezone: 'America/New_York'
});

export const getJurisdictionInfo = (countryCode: string): JurisdictionInfo | null => {
  return SUPPORTED_JURISDICTIONS.find(j => j.code === countryCode) || null;
};

export const getSupportedJurisdictions = (): JurisdictionInfo[] => {
  return SUPPORTED_JURISDICTIONS;
};