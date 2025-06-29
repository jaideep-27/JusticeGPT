import axios from 'axios';

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;
const REVENUECAT_BASE_URL = 'https://api.revenuecat.com/v1';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
  limits: {
    aiConsultations: number | 'unlimited';
    documentAnalysis: number | 'unlimited';
    videoConsultations: number;
    voiceMinutes: number | 'unlimited';
    documentStorage: number; // in GB
  };
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Basic AI consultations',
      'General legal information',
      'Document templates',
      'Community support'
    ],
    limits: {
      aiConsultations: 5,
      documentAnalysis: 2,
      videoConsultations: 0,
      voiceMinutes: 10,
      documentStorage: 0.1
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Unlimited AI consultations',
      'Advanced document analysis',
      'Jurisdiction-specific advice',
      'Voice interactions',
      'Video consultations',
      'Priority support',
      'Document notarization',
      'Export capabilities'
    ],
    limits: {
      aiConsultations: 'unlimited',
      documentAnalysis: 'unlimited',
      videoConsultations: 5,
      voiceMinutes: 'unlimited',
      documentStorage: 5
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Everything in Premium',
      'Custom AI training',
      'Team collaboration',
      'API access',
      'Dedicated support',
      'Advanced analytics',
      'White-label options',
      'Custom integrations'
    ],
    limits: {
      aiConsultations: 'unlimited',
      documentAnalysis: 'unlimited',
      videoConsultations: 'unlimited',
      voiceMinutes: 'unlimited',
      documentStorage: 50
    }
  }
];

export interface UserSubscription {
  userId: string;
  tierId: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    aiConsultations: number;
    documentAnalysis: number;
    videoConsultations: number;
    voiceMinutes: number;
    documentStorage: number;
  };
}

// Mock subscription management for development
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions: Map<string, UserSubscription> = new Map();

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription> {
    // Check if we have a cached subscription
    if (this.subscriptions.has(userId)) {
      return this.subscriptions.get(userId)!;
    }

    // Only try RevenueCat API if properly configured
    if (REVENUECAT_API_KEY && REVENUECAT_API_KEY !== 'your_revenuecat_api_key') {
      try {
        const response = await axios.get(
          `${REVENUECAT_BASE_URL}/subscribers/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 second timeout
          }
        );

        const subscription = this.parseRevenueCatResponse(response.data);
        this.subscriptions.set(userId, subscription);
        return subscription;
      } catch (error) {
        console.warn('RevenueCat API not available, using local subscription management:', error);
        // Continue to local fallback
      }
    }

    // Default to free tier with local management
    const defaultSubscription: UserSubscription = {
      userId,
      tierId: 'free',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      usage: {
        aiConsultations: 0,
        documentAnalysis: 0,
        videoConsultations: 0,
        voiceMinutes: 0,
        documentStorage: 0
      }
    };

    this.subscriptions.set(userId, defaultSubscription);
    return defaultSubscription;
  }

  async upgradeSubscription(userId: string, newTierId: string): Promise<UserSubscription> {
    const currentSubscription = await this.getUserSubscription(userId);
    
    // Only try RevenueCat API if properly configured
    if (REVENUECAT_API_KEY && REVENUECAT_API_KEY !== 'your_revenuecat_api_key') {
      try {
        const response = await axios.post(
          `${REVENUECAT_BASE_URL}/subscribers/${userId}/purchases`,
          {
            product_id: newTierId,
            price: SUBSCRIPTION_TIERS.find(t => t.id === newTierId)?.price || 0
          },
          {
            headers: {
              'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout for purchases
          }
        );

        const upgradedSubscription = this.parseRevenueCatResponse(response.data);
        this.subscriptions.set(userId, upgradedSubscription);
        return upgradedSubscription;
      } catch (error) {
        console.warn('RevenueCat upgrade failed, using local upgrade:', error);
        // Continue to local upgrade
      }
    }

    // Local upgrade for development/fallback
    const upgradedSubscription: UserSubscription = {
      ...currentSubscription,
      tierId: newTierId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.subscriptions.set(userId, upgradedSubscription);
    return upgradedSubscription;
  }

  async cancelSubscription(userId: string): Promise<UserSubscription> {
    const currentSubscription = await this.getUserSubscription(userId);
    
    const canceledSubscription: UserSubscription = {
      ...currentSubscription,
      cancelAtPeriodEnd: true
    };

    this.subscriptions.set(userId, canceledSubscription);
    return canceledSubscription;
  }

  async trackUsage(userId: string, usageType: keyof UserSubscription['usage'], amount: number = 1): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    subscription.usage[usageType] += amount;
    this.subscriptions.set(userId, subscription);
  }

  async checkUsageLimit(userId: string, usageType: keyof UserSubscription['usage']): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === subscription.tierId);
    
    if (!tier) return false;
    
    const limit = tier.limits[usageType];
    if (limit === 'unlimited') return true;
    
    return subscription.usage[usageType] < (limit as number);
  }

  private parseRevenueCatResponse(data: any): UserSubscription {
    // Parse RevenueCat response format
    const entitlements = data.subscriber?.entitlements || {};
    const activeEntitlement = Object.values(entitlements).find((e: any) => e.expires_date === null || new Date(e.expires_date) > new Date());
    
    return {
      userId: data.subscriber?.original_app_user_id || '',
      tierId: activeEntitlement?.product_identifier || 'free',
      status: activeEntitlement ? 'active' : 'expired',
      currentPeriodStart: activeEntitlement?.original_purchase_date || new Date().toISOString(),
      currentPeriodEnd: activeEntitlement?.expires_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      usage: {
        aiConsultations: 0,
        documentAnalysis: 0,
        videoConsultations: 0,
        voiceMinutes: 0,
        documentStorage: 0
      }
    };
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();