import { useState, useEffect, useCallback } from 'react';
import { subscriptionManager, SUBSCRIPTION_TIERS, UserSubscription } from '../lib/revenuecat';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user } = useAuth();

  // Load user subscription on mount
  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userSubscription = await subscriptionManager.getUserSubscription(user.id);
      setSubscription(userSubscription);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      // Don't show error toast, just use default subscription
      const defaultSubscription: UserSubscription = {
        userId: user.id,
        tierId: user.plan || 'free',
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
      setSubscription(defaultSubscription);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const upgrade = useCallback(async (newTierId: string) => {
    if (!user || !subscription) return;

    setIsUpgrading(true);
    try {
      const upgradedSubscription = await subscriptionManager.upgradeSubscription(user.id, newTierId);
      setSubscription(upgradedSubscription);
      
      const tier = SUBSCRIPTION_TIERS.find(t => t.id === newTierId);
      toast.success(`Successfully upgraded to ${tier?.name} plan!`);
      
      return upgradedSubscription;
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error('Failed to upgrade subscription');
      throw error;
    } finally {
      setIsUpgrading(false);
    }
  }, [user, subscription]);

  const cancel = useCallback(async () => {
    if (!user || !subscription) return;

    try {
      const canceledSubscription = await subscriptionManager.cancelSubscription(user.id);
      setSubscription(canceledSubscription);
      toast.success('Subscription canceled. Access will continue until the end of your billing period.');
      
      return canceledSubscription;
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel subscription');
      throw error;
    }
  }, [user, subscription]);

  const checkUsageLimit = useCallback(async (usageType: keyof UserSubscription['usage']): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await subscriptionManager.checkUsageLimit(user.id, usageType);
    } catch (error) {
      console.error('Usage check failed:', error);
      // Default to allowing usage if check fails
      return true;
    }
  }, [user]);

  const trackUsage = useCallback(async (usageType: keyof UserSubscription['usage'], amount: number = 1) => {
    if (!user) return;
    
    try {
      await subscriptionManager.trackUsage(user.id, usageType, amount);
      // Reload subscription to get updated usage
      await loadSubscription();
    } catch (error) {
      console.error('Usage tracking failed:', error);
      // Don't show error to user, just continue
    }
  }, [user, loadSubscription]);

  const getCurrentTier = useCallback(() => {
    if (!subscription) {
      // Fallback to user plan or free
      const tierFromUser = user?.plan || 'free';
      return SUBSCRIPTION_TIERS.find(t => t.id === tierFromUser) || SUBSCRIPTION_TIERS[0];
    }
    return SUBSCRIPTION_TIERS.find(t => t.id === subscription.tierId) || SUBSCRIPTION_TIERS[0];
  }, [subscription, user]);

  const getUsagePercentage = useCallback((usageType: keyof UserSubscription['usage']): number => {
    if (!subscription) return 0;
    
    const tier = getCurrentTier();
    const limit = tier.limits[usageType];
    
    if (limit === 'unlimited') return 0; // No limit
    
    const usage = subscription.usage[usageType];
    return Math.min(100, (usage / (limit as number)) * 100);
  }, [subscription, getCurrentTier]);

  const isFeatureAvailable = useCallback((feature: string): boolean => {
    const tier = getCurrentTier();
    return tier.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }, [getCurrentTier]);

  const getDaysUntilRenewal = useCallback((): number => {
    if (!subscription) return 0;
    
    const endDate = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [subscription]);

  return {
    subscription,
    currentTier: getCurrentTier(),
    isLoading,
    isUpgrading,
    upgrade,
    cancel,
    checkUsageLimit,
    trackUsage,
    getUsagePercentage,
    isFeatureAvailable,
    getDaysUntilRenewal,
    refresh: loadSubscription
  };
};