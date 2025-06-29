import axios from 'axios';

const REDDIT_CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = import.meta.env.VITE_REDDIT_CLIENT_SECRET;
const REDDIT_BASE_URL = 'https://www.reddit.com';

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  url: string;
  subreddit: string;
  permalink: string;
}

export interface LegalAnalysisOfPost {
  post: RedditPost;
  legalIssues: string[];
  potentialClaims: string[];
  jurisdiction: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  disclaimer: string;
  entertainmentValue: number; // 1-10 scale
}

// Get Reddit access token
const getRedditAccessToken = async (): Promise<string> => {
  try {
    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
      throw new Error('Reddit API credentials not configured');
    }

    const auth = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`);
    
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'JusticeGPT/1.0'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Reddit Auth Error:', error);
    throw new Error('Failed to authenticate with Reddit API');
  }
};

// Fetch trending relationship drama posts
export const fetchRelationshipDrama = async (limit: number = 10): Promise<RedditPost[]> => {
  try {
    // For demo purposes, return mock data if API not configured
    if (!REDDIT_CLIENT_ID) {
      return getMockRelationshipPosts();
    }

    const accessToken = await getRedditAccessToken();
    
    const subreddits = [
      'relationship_advice',
      'AmItheAsshole',
      'relationships',
      'legaladvice',
      'pettyrevenge',
      'ProRevenge'
    ];

    const allPosts: RedditPost[] = [];

    for (const subreddit of subreddits) {
      try {
        const response = await axios.get(
          `${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=${Math.ceil(limit / subreddits.length)}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'User-Agent': 'JusticeGPT/1.0'
            }
          }
        );

        const posts = response.data.data.children.map((child: any) => ({
          id: child.data.id,
          title: child.data.title,
          selftext: child.data.selftext,
          author: child.data.author,
          created_utc: child.data.created_utc,
          score: child.data.score,
          num_comments: child.data.num_comments,
          url: child.data.url,
          subreddit: child.data.subreddit,
          permalink: child.data.permalink
        }));

        allPosts.push(...posts);
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error);
      }
    }

    // Sort by score and return top posts
    return allPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error('Reddit Fetch Error:', error);
    return getMockRelationshipPosts();
  }
};

// Mock data for development
const getMockRelationshipPosts = (): RedditPost[] => [
  {
    id: 'mock1',
    title: 'My ex is refusing to return my belongings after breakup',
    selftext: 'We broke up 3 months ago and my ex still has my laptop, some clothes, and my grandmother\'s ring. They keep making excuses and won\'t meet up. What are my legal options?',
    author: 'throwaway123',
    created_utc: Date.now() / 1000 - 3600,
    score: 245,
    num_comments: 67,
    url: 'https://reddit.com/mock1',
    subreddit: 'legaladvice',
    permalink: '/r/legaladvice/comments/mock1'
  },
  {
    id: 'mock2',
    title: 'Ex-boyfriend won\'t stop contacting me despite blocking',
    selftext: 'My ex keeps creating new social media accounts to message me. He shows up at my work and follows me. I\'ve told him to stop but he won\'t listen. Is this harassment?',
    author: 'scared_user',
    created_utc: Date.now() / 1000 - 7200,
    score: 189,
    num_comments: 43,
    url: 'https://reddit.com/mock2',
    subreddit: 'relationship_advice',
    permalink: '/r/relationship_advice/comments/mock2'
  },
  {
    id: 'mock3',
    title: 'Ex is spreading lies about me to mutual friends',
    selftext: 'After our breakup, my ex has been telling everyone that I cheated (I didn\'t) and sharing private information about our relationship. This is affecting my reputation and mental health.',
    author: 'defamed_person',
    created_utc: Date.now() / 1000 - 10800,
    score: 156,
    num_comments: 89,
    url: 'https://reddit.com/mock3',
    subreddit: 'AmItheAsshole',
    permalink: '/r/AmItheAsshole/comments/mock3'
  }
];

// Analyze post for legal issues (this would integrate with OpenAI)
export const analyzeLegalIssues = async (
  post: RedditPost,
  jurisdiction: string = 'United States'
): Promise<LegalAnalysisOfPost> => {
  // This is a simplified analysis - in production, this would use OpenAI
  const legalKeywords = {
    harassment: ['harass', 'stalk', 'follow', 'won\'t stop', 'blocking'],
    defamation: ['lies', 'spreading', 'reputation', 'false', 'slander'],
    property: ['belongings', 'stuff', 'return', 'won\'t give back', 'stole'],
    privacy: ['private', 'sharing', 'photos', 'personal information'],
    threats: ['threat', 'violence', 'hurt', 'harm', 'kill']
  };

  const text = (post.title + ' ' + post.selftext).toLowerCase();
  const detectedIssues: string[] = [];
  const potentialClaims: string[] = [];

  // Simple keyword matching (in production, use NLP/AI)
  Object.entries(legalKeywords).forEach(([issue, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      detectedIssues.push(issue);
      
      switch (issue) {
        case 'harassment':
          potentialClaims.push('Restraining Order', 'Harassment Charges');
          break;
        case 'defamation':
          potentialClaims.push('Defamation Lawsuit', 'Cease and Desist');
          break;
        case 'property':
          potentialClaims.push('Property Recovery', 'Conversion Claim');
          break;
        case 'privacy':
          potentialClaims.push('Privacy Violation', 'Revenge Porn (if applicable)');
          break;
        case 'threats':
          potentialClaims.push('Criminal Charges', 'Protective Order');
          break;
      }
    }
  });

  // Calculate severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (detectedIssues.includes('threats') || detectedIssues.includes('harassment')) {
    severity = 'high';
  } else if (detectedIssues.length > 1) {
    severity = 'medium';
  }

  // Entertainment value based on drama level
  const entertainmentValue = Math.min(10, Math.max(1, 
    post.score / 50 + post.num_comments / 20 + detectedIssues.length * 2
  ));

  return {
    post,
    legalIssues: detectedIssues,
    potentialClaims,
    jurisdiction,
    severity,
    recommendation: generateRecommendation(detectedIssues, severity),
    disclaimer: 'This analysis is for entertainment purposes only and does not constitute legal advice. Consult with a qualified attorney for actual legal matters.',
    entertainmentValue: Math.round(entertainmentValue)
  };
};

const generateRecommendation = (issues: string[], severity: 'low' | 'medium' | 'high'): string => {
  if (severity === 'high') {
    return 'Seek immediate legal counsel and consider contacting law enforcement if you feel unsafe.';
  } else if (severity === 'medium') {
    return 'Document all incidents and consult with an attorney to understand your options.';
  } else {
    return 'Keep records of any concerning behavior and consider mediation or direct communication first.';
  }
};

// Generate shareable content for social media
export const generateShareableContent = (analysis: LegalAnalysisOfPost): {
  title: string;
  description: string;
  hashtags: string[];
  image?: string;
} => {
  const dramaMeter = '🔥'.repeat(Math.ceil(analysis.entertainmentValue / 2));
  
  return {
    title: `Legal Drama Alert! ${dramaMeter}`,
    description: `JusticeGPT analyzed this relationship drama and found potential ${analysis.legalIssues.join(', ')} issues. Entertainment value: ${analysis.entertainmentValue}/10`,
    hashtags: [
      '#JusticeGPT',
      '#LegalDrama',
      '#RelationshipAdvice',
      '#SueYourEx',
      ...analysis.legalIssues.map(issue => `#${issue.charAt(0).toUpperCase() + issue.slice(1)}`)
    ],
    image: `https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`
  };
};