
import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { ArrowLeft, Share2, Bookmark, CheckCircle2, TrendingUp, ExternalLink, Globe, Tag, ScanEye, ArrowRight, Image as ImageIcon, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface ArticleDetailProps {
  article: NewsArticle;
  onBack: () => void;
  onWellbeingCheck?: () => void;
  mentalWellbeingMode: boolean;
  onFeedback?: (articleId: string, feedback: 'ok' | 'not-ok') => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, onWellbeingCheck, mentalWellbeingMode, onFeedback }) => {
  const [showSensitive, setShowSensitive] = useState(mentalWellbeingMode && article.isHarmful);
  const [feedbackGiven, setFeedbackGiven] = useState(!!article.userFeedback);
  const [isNeutralized, setIsNeutralized] = useState(article.neutralized);
  const [confirmNeutralization, setConfirmNeutralization] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = `https://placehold.co/1200x600/1e293b/cbd5e1?text=${encodeURIComponent(article.category + ' News')}`;
  };

  const handleGalleryError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = `https://placehold.co/800x600/f1f5f9/94a3b8?text=Context`;
  };

  if (showSensitive) {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-red-100 p-8 md:p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Sensitive Content Warning</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
                This article contains content that may be distressing or impact your mental wellbeing. 
                <br />
                <span className="font-bold text-red-600 mt-2 block">Reason: {article.harmfulReason || 'Potentially distressing content'}</span>
            </p>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-brand-600" />
                    Our Detox Recommendation
                </h4>
                <p className="text-sm text-slate-600">
                    Based on your detox preferences, we recommend skipping this story if you're feeling overwhelmed. 
                    We can provide a neutral summary instead if you prefer.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => {
                        setShowSensitive(false);
                        if (onWellbeingCheck) onWellbeingCheck();
                    }}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                    I understand, show me the article
                </button>
                <button 
                    onClick={onBack}
                    className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                    Skip this story
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
      {/* Header Image Area */}
      <div className="relative h-[400px] w-full group bg-slate-900">
        <img 
            src={article.imageUrl} 
            alt={article.title} 
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
        
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 rounded-full transition-colors border border-white/10"
        >
            <ArrowLeft size={24} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
                 <span className="bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-emerald-900/20">
                    <CheckCircle2 size={14}/> Verified
                 </span>
                 {mentalWellbeingMode && article.sentiment === 'neutral' && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-lg">
                        <Sparkles size={14}/> Neutral News
                    </span>
                 )}
                 {mentalWellbeingMode && (article.sentiment === 'positive' || article.userFeedback === 'ok') && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-lg">
                        <Sparkles size={14}/> Positive News
                    </span>
                 )}
                 {mentalWellbeingMode && article.sentiment === 'negative' && article.userFeedback !== 'ok' && (
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-lg">
                        <AlertTriangle size={14}/> Negative News
                    </span>
                 )}
                 <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-white/10">
                    <Globe size={14} /> {article.country}
                 </span>
                 <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-white/10">
                    <Tag size={14} /> {article.category}
                 </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight font-serif mb-4 shadow-sm max-w-4xl animate-fade-in" style={{animationDelay: '0.2s'}}>
                {article.title}
            </h1>
            <div className="flex items-center gap-3 text-slate-300 text-sm font-medium animate-fade-in" style={{animationDelay: '0.3s'}}>
                <span className="text-brand-200">{article.source}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <span>{new Date(article.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 md:p-10">
        {/* Main Content - Spans 8 cols */}
        <div className="lg:col-span-8 space-y-10">
            
            {/* Summary Section */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-10 relative overflow-hidden">
                {mentalWellbeingMode && article.sentiment === 'negative' && !isNeutralized && !confirmNeutralization && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Negative News Detected</h4>
                        <p className="text-slate-600 mb-6 max-w-md">
                            This story has a negative sentiment. Would you like to see a neutral, objective summary instead?
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setIsNeutralized(true);
                                    setConfirmNeutralization(true);
                                }}
                                className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                            >
                                Yes, Show Neutral
                            </button>
                            <button 
                                onClick={() => setConfirmNeutralization(true)}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                            >
                                Show Original
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                        <ScanEye size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                        {isNeutralized ? 'Neutral Summary' : 'Original Summary'}
                    </h3>
                    {isNeutralized && (
                        <span className="ml-auto bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck size={12} /> Detox Active
                        </span>
                    )}
                </div>
                <p className="text-slate-700 leading-relaxed text-lg font-serif italic">
                    {isNeutralized ? article.summary : (article.originalSummary || article.summary)}
                </p>
            </div>

            {/* Key Insights */}
            <div>
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-6 font-serif">
                    <ScanEye className="text-brand-600" size={24} />
                    Key Insights
                </h3>
                <div className="bg-slate-50/50 rounded-3xl p-2 border border-slate-100 shadow-sm">
                    {article.keyPoints && article.keyPoints.length > 0 ? (
                        article.keyPoints.map((point, idx) => (
                            <div key={idx} className="flex gap-6 p-5 border-b border-slate-200/60 last:border-0 hover:bg-white rounded-2xl transition-all group">
                                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                    <span className="w-12 text-[10px] font-black text-brand-600/40 group-hover:text-brand-600 uppercase tracking-widest text-center transition-colors">
                                        {`0${idx+1}`}
                                    </span>
                                    <div className="h-full w-px bg-brand-600/10 group-hover:bg-brand-600/30 transition-colors my-1"></div>
                                </div>
                                <p className="text-slate-800 font-medium leading-relaxed text-lg">
                                    {point}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-700 leading-relaxed p-6 text-lg">
                            {article.summary}
                        </p>
                    )}
                </div>
            </div>

            {/* Visual Gallery */}
            {article.relatedImages && article.relatedImages.length > 0 && (
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-6 font-serif">
                        <ImageIcon className="text-brand-600" size={24} />
                        Visual Context
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {article.relatedImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group bg-slate-100">
                                <img 
                                    src={img} 
                                    alt={`Context ${idx}`} 
                                    onError={handleGalleryError}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="pt-8 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 font-serif">
                    <TrendingUp className="text-brand-600" size={24} />
                    Development Timeline
                </h3>
                <div className="space-y-0 relative border-l-2 border-brand-100 ml-3">
                    {article.timeline.map((event, idx) => (
                        <div key={idx} className="relative pl-8 pb-10 last:pb-0 group">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 border-brand-200 group-hover:border-brand-500 rounded-full transition-colors"></div>
                            <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1.5 bg-brand-50 inline-block px-2 py-0.5 rounded">
                                {event.date}
                            </div>
                            <p className="text-slate-700 text-lg leading-relaxed group-hover:text-slate-900 transition-colors">
                                {event.event}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Sidebar Info - Spans 4 cols */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* Verification Box */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 size={100} className="text-emerald-600" />
                </div>
                <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2 text-lg">
                    <CheckCircle2 size={24} className="text-emerald-600"/> 
                    Verified Source
                </h4>
                <ul className="space-y-4 text-sm text-emerald-800 relative z-10">
                    <li className="flex gap-3 items-start bg-white/60 p-3 rounded-xl">
                        <span className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                        <span>Verified by cross-referencing multiple major outlets including <strong>{article.source}</strong>.</span>
                    </li>
                    <li className="flex gap-3 items-start bg-white/60 p-3 rounded-xl">
                        <span className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                        <span>Contextual bias check: <span className="font-bold">{article.biasScore > 60 ? 'Right-leaning' : article.biasScore < 40 ? 'Left-leaning' : 'Neutral'}</span>.</span>
                    </li>
                </ul>
            </div>

             {/* External Link */}
             {article.sourceUrl && (
                <a 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-1 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all group"
                >
                    <div className="bg-slate-900 rounded-[20px] p-6 flex flex-col items-center text-center">
                         <div className="bg-white/10 p-3 rounded-full text-white mb-3 group-hover:bg-brand-500 transition-colors">
                            <ExternalLink size={24} />
                         </div>
                        <p className="text-lg font-bold text-white mb-1">
                            Read Original Article
                        </p>
                        <p className="text-slate-400 text-sm mb-4">
                            on {article.source}
                        </p>
                        <div className="w-full py-2 bg-white text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-brand-50 transition-colors">
                            Visit Source <ArrowRight size={16} />
                        </div>
                    </div>
                </a>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-600 hover:text-brand-700 py-4 rounded-2xl font-medium transition-all">
                    <Bookmark size={20} /> 
                    <span className="text-xs font-bold uppercase tracking-wide">Save</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-600 hover:text-brand-700 py-4 rounded-2xl font-medium transition-all">
                    <Share2 size={20} /> 
                    <span className="text-xs font-bold uppercase tracking-wide">Share</span>
                </button>
            </div>

        </div>
      </div>

      {/* Feedback Section - Only if Mental Wellbeing Mode is ON */}
      {mentalWellbeingMode && (
        <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="max-w-2xl mx-auto text-center">
                <h4 className="text-lg font-bold text-slate-800 mb-2">How are you feeling about this news?</h4>
                <p className="text-slate-600 text-sm mb-6">Your feedback helps us refine your detox experience and filter future content.</p>
                
                {feedbackGiven ? (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl font-medium animate-fade-in">
                        Thank you for your feedback! We'll use this to improve your feed.
                    </div>
                ) : (
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => {
                                setFeedbackGiven(true);
                                if (onFeedback) onFeedback(article.id, 'ok');
                            }}
                            className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center gap-2"
                        >
                            <span className="text-xl">😊</span> I'm OK with this
                        </button>
                        <button 
                            onClick={() => {
                                setFeedbackGiven(true);
                                if (onFeedback) onFeedback(article.id, 'not-ok');
                            }}
                            className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all flex items-center gap-2"
                        >
                            <span className="text-xl">😟</span> Not OK
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
