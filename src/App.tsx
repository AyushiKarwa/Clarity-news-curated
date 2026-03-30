
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import DetoxDashboard from './components/DetoxDashboard';
import ArticleDetail from './components/ArticleDetail';
import Onboarding from './components/Onboarding';
import ProfileSettings from './components/ProfileSettings';
import { fetchCuratedNews } from './services/geminiService';
import { NewsArticle, ViewState, DetoxStats, UserProfile, FilterScope } from './types';
import { RefreshCw, Loader2, Search, Globe, MapPin, Zap, ArrowLeft, Clock } from 'lucide-react';

// Mock data for stats
const INITIAL_STATS: DetoxStats = {
  dailyTimeSpent: 45,
  storiesRead: 12,
  anxietyScore: 2,
  topicsAvoided: ['Celebrity Gossip', 'Violent Crime', 'Partisan Outrage'],
  moodTrend: [
    { day: 'M', mood: 6 },
    { day: 'T', mood: 7 },
    { day: 'W', mood: 6 },
    { day: 'T', mood: 8 },
    { day: 'F', mood: 9 },
  ],
  articlesNeutralized: 8,
  harmfulContentBlocked: 3,
  wellbeingCheckIns: 5,
  qualityFilter: 98,
  timeSaved: 45,
  mentalLoad: 'Low',
  userRejectedArticles: 2,
  recentEvents: [
    {
      id: '1',
      type: 'blocked',
      title: 'Major Highway Accident in City Center',
      reason: 'Graphic details of injury and distress',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: '2',
      type: 'neutralized',
      title: 'Political Tension Rises in Neighboring Region',
      reason: 'Sensationalist language neutralized for objective reading',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    }
  ]
};

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
];

const MAJOR_COUNTRIES = [
    "India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "China", "Russia", "Ukraine", "Israel", "Palestine"
];

const CACHE_KEY = 'clarity_feed_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.FEED);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mentalWellbeingMode, setMentalWellbeingMode] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  // Filter & Search State
  const [filterScope, setFilterScope] = useState<FilterScope>('top10');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");

  // Background refresh staging
  const [pendingArticles, setPendingArticles] = useState<NewsArticle[]>([]);

  const [stats, setStats] = useState<DetoxStats>(() => {
    const saved = localStorage.getItem('clarity_detox_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem('clarity_detox_stats', JSON.stringify(stats));
  }, [stats]);

  // Wrapper for UI triggered loads (always replaces feed)
  const handleManualLoad = (profile: UserProfile, scope: FilterScope, query: string = '', region: string = '') => {
      setLoading(true);
      setArticles([]); // Clear current
      fetchCuratedNews(profile, scope, query, region, [])
        .then(fetched => {
            // Apply capacity limit with a buffer for harmful content
            const buffer = 5;
            const limited = fetched.slice(0, (profile.capacityLimit || 10) + buffer);
            
            const blockedArticles = limited.filter(a => a.isHarmful);
            const filtered = profile.avoidHarmfulContent 
                ? limited.filter(a => !a.isHarmful)
                : limited;

            // Final slice to respect capacity limit
            const finalArticles = filtered.slice(0, profile.capacityLimit || 10);

            const blockedCount = limited.length - filtered.length;
            
            const neutralizedArticles = filtered.filter(a => a.neutralized);
            const neutralizedCount = neutralizedArticles.length;
            
            setStats(prev => {
                const newHarmfulBlocked = prev.harmfulContentBlocked + blockedCount;
                const newNeutralized = prev.articlesNeutralized + neutralizedCount;
                
                // Create new events
                const newEvents: any[] = [];
                
                if (profile.avoidHarmfulContent) {
                    blockedArticles.forEach(a => {
                        newEvents.push({
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'blocked',
                            title: a.title,
                            reason: a.harmfulReason || 'Contains distressing content',
                            timestamp: new Date().toISOString()
                        });
                    });
                }

                neutralizedArticles.forEach(a => {
                    newEvents.push({
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'neutralized',
                        title: a.title,
                        reason: 'Neutralized sensationalist language',
                        timestamp: new Date().toISOString()
                    });
                });

                // Calculate Quality Filter (percentage of non-harmful articles)
                const totalFetched = limited.length;
                const qualityFilter = totalFetched > 0 
                    ? Math.round(((totalFetched - blockedCount) / totalFetched) * 100)
                    : prev.qualityFilter;

                // Calculate Time Saved (heuristic: 5 mins per blocked, 2 mins per neutralized)
                const timeSaved = (newHarmfulBlocked * 5) + (newNeutralized * 2);

                // Determine Mental Load based on blocked content
                let mentalLoad: 'Low' | 'Medium' | 'High' = 'Low';
                if (blockedCount > 3) mentalLoad = 'High';
                else if (blockedCount > 1) mentalLoad = 'Medium';

                return { 
                    ...prev, 
                    harmfulContentBlocked: newHarmfulBlocked,
                    articlesNeutralized: newNeutralized,
                    qualityFilter,
                    timeSaved,
                    mentalLoad,
                    recentEvents: [...newEvents, ...prev.recentEvents].slice(0, 15) // Keep last 15
                };
            });

            setArticles(finalArticles);
            setLastUpdated(Date.now());
            setLoading(false);
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                articles: finalArticles,
                timestamp: Date.now(),
                scope,
                region,
                query
            }));
        })
        .catch(err => {
            console.error("Load failed", err);
            setLoading(false);
        });
  };

  // Wrapper for "Load More" (appends)
  const handleLoadMore = () => {
      if (!userProfile) return;
      setLoading(true);
      const currentTitles = articles.map(a => a.title);
      fetchCuratedNews(userProfile, filterScope, searchQuery, regionFilter, currentTitles).then(fetched => {
           // Apply capacity limit with a buffer for harmful content
           const buffer = 5;
           const limited = fetched.slice(0, 10 + buffer);
           
           const blockedArticles = limited.filter(a => a.isHarmful);
           const filtered = userProfile.avoidHarmfulContent 
               ? limited.filter(a => !a.isHarmful)
               : limited;

           // Final slice to respect load more limit
           const finalArticles = filtered.slice(0, 10);

           const blockedCount = limited.length - filtered.length;
           
           const neutralizedArticles = filtered.filter(a => a.neutralized);
           const neutralizedCount = neutralizedArticles.length;
           
           setStats(prev => {
               const newHarmfulBlocked = prev.harmfulContentBlocked + blockedCount;
               const newNeutralized = prev.articlesNeutralized + neutralizedCount;
               
               // Create new events
               const newEvents: any[] = [];
               
               if (userProfile.avoidHarmfulContent) {
                   blockedArticles.forEach(a => {
                       newEvents.push({
                           id: Math.random().toString(36).substr(2, 9),
                           type: 'blocked',
                           title: a.title,
                           reason: a.harmfulReason || 'Contains distressing content',
                           timestamp: new Date().toISOString()
                       });
                   });
               }

               neutralizedArticles.forEach(a => {
                   newEvents.push({
                       id: Math.random().toString(36).substr(2, 9),
                       type: 'neutralized',
                       title: a.title,
                       reason: 'Neutralized sensationalist language',
                       timestamp: new Date().toISOString()
                   });
               });

               // Calculate Quality Filter (percentage of non-harmful articles)
               const totalFetched = limited.length;
               const qualityFilter = totalFetched > 0 
                   ? Math.round(((totalFetched - blockedCount) / totalFetched) * 100)
                   : prev.qualityFilter;

               // Calculate Time Saved (heuristic: 5 mins per blocked, 2 mins per neutralized)
               const timeSaved = (newHarmfulBlocked * 5) + (newNeutralized * 2);

               // Determine Mental Load based on blocked content
               let mentalLoad: 'Low' | 'Medium' | 'High' = 'Low';
               if (blockedCount > 3) mentalLoad = 'High';
               else if (blockedCount > 1) mentalLoad = 'Medium';

               return { 
                   ...prev, 
                   harmfulContentBlocked: newHarmfulBlocked,
                   articlesNeutralized: newNeutralized,
                   qualityFilter,
                   timeSaved,
                   mentalLoad,
                   recentEvents: [...newEvents, ...prev.recentEvents].slice(0, 15) // Keep last 15
               };
           });

           setArticles(prev => [...prev, ...finalArticles]);
           setLoading(false);
      }).catch(() => setLoading(false));
  };

  // INITIALIZATION
  useEffect(() => {
    const savedProfile = localStorage.getItem('clarity_user_profile');
    const savedCache = localStorage.getItem(CACHE_KEY);

    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        const profile: UserProfile = {
          ...profileData,
          topics: profileData.topics || [],
          sensitiveTopics: profileData.sensitiveTopics || []
        };
        setUserProfile(profile);

        if (savedCache) {
            try {
                const { articles: cachedArticles, timestamp, scope, region, query } = JSON.parse(savedCache);
                
                if (cachedArticles && cachedArticles.length > 0) {
                    setArticles(cachedArticles);
                    setLastUpdated(timestamp);
                    setFilterScope(scope || 'top10');
                    setRegionFilter(region || '');
                    setSearchQuery(query || '');
                    
                    // Background refresh check
                    const isStale = Date.now() - timestamp > CACHE_DURATION;
                    if (isStale) {
                         // Trigger background refresh
                         fetchCuratedNews(profile, scope, query, region).then(fresh => {
                             if (fresh.length > 0) setPendingArticles(fresh);
                         });
                    }
                } else {
                    handleManualLoad(profile, 'top10');
                }
            } catch (e) {
                handleManualLoad(profile, 'top10');
            }
        } else {
            handleManualLoad(profile, 'top10');
        }

      } catch (e) {
        localStorage.removeItem('clarity_user_profile');
        setCurrentView(ViewState.ONBOARDING);
      }
    } else {
      setCurrentView(ViewState.ONBOARDING);
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('clarity_user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const handleLogout = () => {
      localStorage.removeItem('clarity_user_profile');
      localStorage.removeItem(CACHE_KEY);
      setUserProfile(null);
      setArticles([]);
      setCurrentView(ViewState.ONBOARDING);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
      const countryChanged = userProfile?.country !== updatedProfile.country;
      const newRegionFilter = countryChanged ? '' : regionFilter;
      
      setUserProfile(updatedProfile);
      if (countryChanged) setRegionFilter('');
      
      setCurrentView(ViewState.FEED);
      // Refresh feed with new profile settings
      handleManualLoad(updatedProfile, filterScope, searchQuery, newRegionFilter);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile); 
    setCurrentView(ViewState.FEED);
    handleManualLoad(profile, 'top10');
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!userProfile || !searchQuery.trim()) return;
      setFilterScope('search');
      handleManualLoad(userProfile, 'search', searchQuery);
  };

  const handleFilterChange = (scope: FilterScope) => {
      if(!userProfile) return;
      setFilterScope(scope);
      if (scope === 'state' && !regionFilter) return;
      handleManualLoad(userProfile, scope, '', regionFilter);
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setRegionFilter(val);
      if(userProfile) {
          handleManualLoad(userProfile, filterScope, '', val);
      }
  };

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setCurrentView(ViewState.ARTICLE);
    
    // Update stats for real interaction
    setStats(prev => ({
      ...prev,
      storiesRead: prev.storiesRead + 1,
      dailyTimeSpent: prev.dailyTimeSpent + 3 // Assume 3 mins per article
    }));
  };

  const handleFeedback = (articleId: string, feedback: 'ok' | 'not-ok') => {
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, userFeedback: feedback } : a));
    if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle({ ...selectedArticle, userFeedback: feedback });
    }

    if (feedback === 'not-ok') {
        setStats(prev => ({
            ...prev,
            userRejectedArticles: prev.userRejectedArticles + 1,
            // If they are not ok with it, it adds to their "mental load" in a way that we should track
            mentalLoad: prev.harmfulContentBlocked > 5 ? 'High' : 'Medium'
        }));
        
        // If they are not ok, we might want to remove it from the feed after they go back
        // But for now let's just track it.
    }
  };

  const applyPendingUpdates = () => {
      setArticles(pendingArticles);
      setPendingArticles([]);
      setLastUpdated(Date.now());
  };

  const renderContent = () => {
    if (currentView === ViewState.ONBOARDING) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }
    
    if (currentView === ViewState.PROFILE) {
        return userProfile ? (
            <ProfileSettings 
                profile={userProfile} 
                onUpdate={handleProfileUpdate} 
                onLogout={handleLogout} 
                onBack={() => setCurrentView(ViewState.FEED)}
            />
        ) : null;
    }

    switch (currentView) {
      case ViewState.DASHBOARD:
        return (
          <DetoxDashboard 
            stats={stats} 
            mentalWellbeingMode={mentalWellbeingMode}
            onToggleMentalWellbeing={() => setMentalWellbeingMode(!mentalWellbeingMode)}
          />
        );
      
      case ViewState.ARTICLE:
        if (!selectedArticle) return null;
        return (
          <ArticleDetail 
            article={selectedArticle} 
            onBack={() => setCurrentView(ViewState.FEED)}
            onWellbeingCheck={() => setStats(prev => ({ ...prev, wellbeingCheckIns: prev.wellbeingCheckIns + 1 }))}
            mentalWellbeingMode={mentalWellbeingMode}
            onFeedback={handleFeedback}
          />
        );

      case ViewState.FEED:
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Search Bar Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <form onSubmit={handleSearch} className="relative flex items-center">
                    <Search className="absolute left-4 text-slate-400" size={20} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for specific news, topics, or events..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 px-4 py-1.5 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    <button 
                        onClick={() => handleFilterChange('top10')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${filterScope === 'top10' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Zap size={16} /> Top 10
                    </button>
                    
                    {(filterScope === 'top10' || filterScope === 'domestic' || filterScope === 'state') && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => {
                                    setFilterScope('domestic');
                                    if(userProfile) handleManualLoad(userProfile, 'domestic');
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${filterScope === 'domestic' || filterScope === 'state' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                <MapPin size={16} /> Domestic ({userProfile?.country})
                            </button>
                            
                            {(filterScope === 'domestic' || filterScope === 'state') && userProfile?.country === 'India' && (
                                <select 
                                    value={regionFilter}
                                    onChange={(e) => {
                                        setFilterScope('state');
                                        handleDropdownChange(e);
                                    }}
                                    className="px-4 py-2 rounded-full text-sm border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            )}
                        </div>
                    )}

                    {(filterScope === 'top10' || filterScope === 'world') && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleFilterChange('world')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${filterScope === 'world' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                <Globe size={16} /> World
                            </button>
                            
                            {filterScope === 'world' && (
                                <select 
                                    value={regionFilter}
                                    onChange={handleDropdownChange}
                                    className="px-4 py-2 rounded-full text-sm border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
                                >
                                    <option value="">Select Region</option>
                                    {MAJOR_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )}
                        </div>
                    )}
                    
                    {(filterScope === 'domestic' || filterScope === 'state' || filterScope === 'world' || filterScope === 'search') && (
                        <button 
                            onClick={() => handleFilterChange('top10')}
                            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors ml-auto"
                        >
                            <ArrowLeft size={14} /> Back to Feed
                        </button>
                    )}
                </div>
            </div>
            
            {!loading && articles.length > 0 && (
                <div className="flex items-center justify-end gap-2 text-xs text-slate-400 px-2">
                    <Clock size={12} />
                    <span>
                        Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    </span>
                    <button onClick={() => userProfile && handleManualLoad(userProfile, filterScope, searchQuery, regionFilter)} className="text-brand-600 font-medium hover:underline ml-2 flex items-center gap-1">
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
            )}

            {/* Pending Updates Pill */}
            {pendingArticles.length > 0 && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                    <button 
                        onClick={applyPendingUpdates}
                        className="bg-brand-600 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform animate-bounce"
                    >
                        <RefreshCw size={18} />
                        {pendingArticles.length} New Stories Available
                    </button>
                </div>
            )}

            {loading && articles.length === 0 && (
                 <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 animate-pulse py-12">
                    <Loader2 className="animate-spin mb-4 text-brand-500" size={48} />
                    <p className="text-lg font-medium text-slate-700">Curating your feed...</p>
                    <p className="text-sm">Finding news...</p>
                </div>
            )}
            
            {loading && articles.length > 0 && (
                <div className="flex items-center justify-center gap-2 p-2 bg-brand-50 text-brand-700 rounded-lg text-sm animate-pulse">
                    <RefreshCw className="animate-spin" size={14} />
                    Loading more stories...
                </div>
            )}

            {articles.length > 0 && (
                <div className={`grid grid-cols-1 gap-4 ${loading && articles.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                    {articles.map(article => (
                        <NewsCard 
                        key={article.id} 
                        article={article} 
                        onClick={handleArticleClick} 
                        mentalWellbeingMode={mentalWellbeingMode}
                        />
                    ))}
                    
                    {/* Load More Button */}
                    <button 
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-white border border-slate-200 text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Stories'}
                    </button>
                </div>
            )}
            
            {!loading && articles.length === 0 && (
               <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-100">
                  <p className="text-lg font-medium mb-2">No stories found.</p>
                  <button 
                    onClick={() => userProfile && handleManualLoad(userProfile, 'top10')} 
                    className="text-brand-600 font-bold hover:underline"
                  >
                      Reset to Top 10
                  </button>
               </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-calm-50">
      {currentView !== ViewState.ONBOARDING && (
          <Header 
            view={currentView} 
            setView={setCurrentView} 
            userProfile={userProfile}
            onLogout={handleLogout}
          />
      )}
      
      <main className={`max-w-6xl mx-auto px-4 ${currentView !== ViewState.ONBOARDING ? 'pt-8' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
