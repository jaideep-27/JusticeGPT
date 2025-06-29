import { useState, useCallback } from 'react';
import { fetchRelationshipDrama, analyzeLegalIssues, generateShareableContent } from '../lib/reddit';
import type { RedditPost, LegalAnalysisOfPost } from '../lib/reddit';
import toast from 'react-hot-toast';

export const useSueYourEx = () => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, LegalAnalysisOfPost>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchDrama = useCallback(async (limit: number = 10) => {
    setIsLoading(true);
    try {
      const dramaPosts = await fetchRelationshipDrama(limit);
      setPosts(dramaPosts);
      toast.success(`Found ${dramaPosts.length} juicy drama posts! 🍿`);
    } catch (error) {
      console.error('Failed to fetch drama:', error);
      toast.error('Failed to fetch relationship drama');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeDrama = useCallback(async (post: RedditPost, jurisdiction: string = 'United States') => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeLegalIssues(post, jurisdiction);
      setAnalyses(prev => new Map(prev.set(post.id, analysis)));
      
      const dramaMeter = '🔥'.repeat(Math.ceil(analysis.entertainmentValue / 2));
      toast.success(`Drama analyzed! ${dramaMeter} Entertainment value: ${analysis.entertainmentValue}/10`);
      
      return analysis;
    } catch (error) {
      console.error('Failed to analyze drama:', error);
      toast.error('Failed to analyze legal drama');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateShareContent = useCallback((analysis: LegalAnalysisOfPost) => {
    try {
      const shareContent = generateShareableContent(analysis);
      toast.success('Shareable content generated! Ready to go viral! 🚀');
      return shareContent;
    } catch (error) {
      console.error('Failed to generate share content:', error);
      toast.error('Failed to generate shareable content');
      throw error;
    }
  }, []);

  const getTopDrama = useCallback((count: number = 5) => {
    return posts
      .map(post => ({
        post,
        analysis: analyses.get(post.id)
      }))
      .filter(item => item.analysis)
      .sort((a, b) => (b.analysis?.entertainmentValue || 0) - (a.analysis?.entertainmentValue || 0))
      .slice(0, count);
  }, [posts, analyses]);

  const getDramaByCategory = useCallback((category: string) => {
    return posts
      .map(post => ({
        post,
        analysis: analyses.get(post.id)
      }))
      .filter(item => 
        item.analysis?.legalIssues.includes(category.toLowerCase()) ||
        item.post.subreddit.toLowerCase().includes(category.toLowerCase())
      );
  }, [posts, analyses]);

  const getAnalysisStats = useCallback(() => {
    const analyzedPosts = Array.from(analyses.values());
    
    if (analyzedPosts.length === 0) {
      return {
        totalAnalyzed: 0,
        averageEntertainment: 0,
        topIssues: [],
        severityBreakdown: { low: 0, medium: 0, high: 0 }
      };
    }

    const totalEntertainment = analyzedPosts.reduce((sum, analysis) => sum + analysis.entertainmentValue, 0);
    const averageEntertainment = totalEntertainment / analyzedPosts.length;

    // Count legal issues
    const issueCount: { [key: string]: number } = {};
    analyzedPosts.forEach(analysis => {
      analysis.legalIssues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });

    const topIssues = Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));

    // Severity breakdown
    const severityBreakdown = analyzedPosts.reduce(
      (acc, analysis) => {
        acc[analysis.severity]++;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );

    return {
      totalAnalyzed: analyzedPosts.length,
      averageEntertainment: Math.round(averageEntertainment * 10) / 10,
      topIssues,
      severityBreakdown
    };
  }, [analyses]);

  return {
    posts,
    analyses,
    isLoading,
    isAnalyzing,
    fetchDrama,
    analyzeDrama,
    generateShareContent,
    getTopDrama,
    getDramaByCategory,
    getAnalysisStats
  };
};