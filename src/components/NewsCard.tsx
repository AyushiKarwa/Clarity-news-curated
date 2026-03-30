
import React from 'react';
import { NewsArticle } from '../types';
import { CheckCircle2, ChevronRight, Scale, Tag, Zap, Sparkles, AlertTriangle } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
  mentalWellbeingMode: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick, mentalWellbeingMode }) => {
  
  const getImportanceColor = (score: number) => {
    if (score >= 8) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (score >= 5) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getBiasLabel = (biasScore: number) => {
     if (biasScore < 40) return { label: 'Left Leaning', color: 'text-blue-500' };
     if (biasScore > 60) return { label: 'Right Leaning', color: 'text-red-500' };
     return { label: 'Neutral', color: 'text-slate-500' };
  };

  const biasInfo = getBiasLabel(article.biasScore);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = `https://placehold.co/800x450/e2e8f0/475569?text=${encodeURIComponent(article.category)}`;
  };

  return (
    <div 
      onClick={() => onClick(article)}
      className="group bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col md:flex-row h-full min-h-[12rem]"
    >
      <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-slate-200">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
           {article.verified && (
             <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
               <CheckCircle2 size={10} /> Verified
             </div>
           )}
           {mentalWellbeingMode && article.sentiment === 'neutral' && (
              <div className="bg-slate-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                <Sparkles size={10} /> Neutral
              </div>
           )}
           {mentalWellbeingMode && (article.sentiment === 'positive' || article.userFeedback === 'ok') && (
              <div className="bg-emerald-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
                <Sparkles size={10} /> Positive
              </div>
           )}
           {mentalWellbeingMode && article.sentiment === 'negative' && article.userFeedback !== 'ok' && (
              <div className="bg-rose-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 shadow-sm">
                <AlertTriangle size={10} /> Negative
              </div>
           )}
           <div className="bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
             {article.country}
           </div>
        </div>
      </div>

      <div className="p-5 md:w-2/3 flex flex-col justify-between">
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getImportanceColor(article.importanceScore)}`}>
                    Impact: {article.importanceScore}/10
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1">
                    <Tag size={10} /> {article.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-orange-50 text-orange-600 border-orange-100 flex items-center gap-1">
                    <Zap size={10} /> {article.newsType}
                </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors">
                {article.title}
            </h3>
            
            <p className="text-slate-600 text-sm line-clamp-2">
                {article.summary}
            </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span className="text-slate-700 font-semibold">{article.source}</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center gap-1" title={`Bias Score: ${article.biasScore}`}>
                   <Scale size={12} />
                   <span className={biasInfo.color}>{biasInfo.label}</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span>{new Date(article.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="text-brand-600 group-hover:translate-x-1 transition-transform">
                <ChevronRight size={18} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
