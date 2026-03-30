import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, UserProfile, FilterScope } from "../types";

// ------------------------------------------------------------------
// Initialize with environment variable as required
// ------------------------------------------------------------------
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const fetchCuratedNews = async (
    profile: UserProfile, 
    scope: FilterScope = 'top10', 
    searchQuery: string = '',
    regionFilter: string = '',
    excludeTitles: string[] = []
): Promise<NewsArticle[]> => {
  try {
    const isIndiaContext = profile.country.toLowerCase() === 'india' || regionFilter === 'India';
    
    let sourceInstruction = "";
    let scopeInstruction = "";
    let countInstruction = "Find 10-12 significant news stories.";

    if (isIndiaContext && (scope === 'domestic' || scope === 'state' || scope === 'top10' || (scope === 'world' && regionFilter === 'India'))) {
        const sourcesList = "'The Hindu', 'The Indian Express', 'NDTV', 'Hindustan Times', 'News18', 'Scroll.in', 'India Today', 'The Wire', 'Press Trust of India (PTI)', 'Deccan Herald', 'Livemint', 'Firstpost'";
        sourceInstruction = `Use these trusted and accessible sources: ${sourcesList}.`;
    } else {
        const globalSourcesList = "'Reuters', 'Associated Press (AP)', 'BBC News', 'The New York Times', 'The Guardian', 'Bloomberg', 'Al Jazeera', 'NPR', 'The Wall Street Journal', 'Financial Times', 'ABC News', 'CBS News', 'NBC News'";
        sourceInstruction = `Use globally accessible and verified news outlets like: ${globalSourcesList}. AVOID obscure regional sites that may have access restrictions.`;
    }

    switch (scope) {
        case 'domestic':
            scopeInstruction = `Focus EXCLUSIVELY on major national news within ${profile.country}.`;
            break;
        case 'world':
            if (regionFilter) {
                scopeInstruction = `Focus EXCLUSIVELY on major news and events happening in ${regionFilter}. DO NOT show news from other regions.`;
            } else {
                scopeInstruction = `Focus on major global events from around the world.`;
            }
            break;
        case 'state':
            scopeInstruction = `Focus EXCLUSIVELY on news from the state/region of "${regionFilter}" in ${profile.country}.`;
            break;
        case 'search':
            scopeInstruction = `Search for: "${searchQuery}".`;
            break;
        case 'top10':
        default:
            if (profile.prioritizeLocal) {
                scopeInstruction = `Find the most critical news stories, with a strong priority for news from ${profile.country}.`;
            } else {
                scopeInstruction = `Find the most critical news stories for ${profile.country}.`;
            }
            break;
    }

    const topicInstruction = (scope === 'top10' && profile.topics.length > 0)
        ? `Prioritize: ${profile.topics.slice(0, 3).join(', ')}.` 
        : "";
    
    const excludeInstruction = excludeTitles.length > 0 
        ? `DO NOT include these stories: ${JSON.stringify(excludeTitles.slice(-10))}. Find different/newer ones.` 
        : "";

    // STEP 1: Search / Retrieval
    const searchPrompt = `
      You are a professional news researcher.
      Your task is to: ${countInstruction}
      Geographic Scope: ${scopeInstruction}
      Allowed Sources: ${sourceInstruction}
      ${topicInstruction}
      ${excludeInstruction}
      
      CRITICAL REQUIREMENT: 
      1. ONLY return news that strictly matches the Geographic Scope. 
      2. If the scope is a specific country or region, DO NOT include international news unless it directly impacts that region.
      3. Ensure all links are from major, globally accessible, and verifiable news organizations.
    `;

    let rawNewsText = "";
    let verifiedLinksList = "";

    try {
        // Attempt 1: Try with Search Tool (Grounding)
        // Using gemini-2.5-flash as it is optimized for speed and tool use
        const searchResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
          contents: searchPrompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        rawNewsText = searchResponse.text || "";
        const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        if (groundingChunks.length > 0) {
            verifiedLinksList = groundingChunks
                .map((chunk: any, index: number) => {
                    if (chunk.web) {
                        return `[${index}] URL: ${chunk.web.uri} (Title: "${chunk.web.title}")`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join("\n");
        }
    } catch (searchError) {
        console.warn("Search tool failed. Falling back to standard generation.", searchError);
        
        // Attempt 2: Fallback to standard generation (Internal Knowledge)
        // This ensures the app doesn't show "Offline" just because Grounding failed
        try {
            const fallbackResponse = await ai.models.generateContent({
                 model: "gemini-2.5-flash",
                 contents: `You are a news aggregator. ${searchPrompt}. List recent stories based on your knowledge.`
            });
            rawNewsText = fallbackResponse.text || "";
        } catch (innerError) {
             throw new Error("Both search and fallback generation failed.");
        }
    }
    
      // Step 2: Structure the raw information
    const structuredResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Convert this news data into JSON. Include ALL stories found in the input.
      
      INPUT: ${rawNewsText}
      
      VERIFIED LINKS (Use these if available):
      ${verifiedLinksList}
      
      SOURCE RULES:
      1. Ensure 'url' is from a major, globally accessible, and verifiable news organization.
      2. AVOID obscure regional sites that may have access restrictions.
      
      DETOX RULES:
      1. 'isHarmful': Set to true if the content contains graphic violence, drone attacks, bombings, killings, deaths, fatal accidents, severe injuries, extreme trauma, or highly distressing language that could impact mental health.
      2. 'harmfulReason': Short explanation if isHarmful is true.
      3. 'neutralized': Set to true if 'isHarmful' is true AND (the topic matches any of these user-defined sensitive topics: ${JSON.stringify(profile.sensitiveTopics)} OR 'neutralizeNegativeNews' is true).
      4. 'summary': If 'neutralized' is true, rewrite the negative/sensational summary into neutral, objective, and constructive language (milder wordings to reduce stress).
      5. 'originalSummary': Always store the original, un-neutralized summary here.
      6. 'sentiment': 
         - 'positive': if the news is clearly positive, constructive, or uplifting.
         - 'negative': if 'isHarmful' is true AND 'neutralized' is false.
         - 'neutral': if 'neutralized' is true OR the news is standard neutral information.
      
      User Context: ${profile.country}.
      Region Filter: ${regionFilter}.
      Detox Level: ${profile.detoxLevel}.
      Neutralize: ${profile.neutralizeNegativeNews}.
      Sensitive Topics: ${JSON.stringify(profile.sensitiveTopics)}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              source: { type: Type.STRING },
              sourceUrl: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              category: { type: Type.STRING },
              country: { type: Type.STRING },
              newsType: { type: Type.STRING },
              bias: { type: Type.STRING, enum: ["Left", "Center", "Right"] },
              biasScore: { type: Type.NUMBER },
              importanceScore: { type: Type.NUMBER },
              sentiment: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
              isHarmful: { type: Type.BOOLEAN },
              harmfulReason: { type: Type.STRING },
              neutralized: { type: Type.BOOLEAN },
              originalSummary: { type: Type.STRING },
              timeline: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        event: { type: Type.STRING }
                    }
                }
              }
            },
            required: ["title", "summary", "source", "bias", "importanceScore", "keyPoints", "timeline", "category", "country", "newsType"],
          },
        },
      },
    });

    let jsonStr = structuredResponse.text || "[]";
    // Sanitize markdown if present
    jsonStr = jsonStr.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();

    const rawData = JSON.parse(jsonStr);

    if (!rawData || rawData.length === 0) {
        throw new Error("AI returned empty dataset");
    }
    
    return rawData.map((item: any, index: number) => {
      let finalUrl = item.sourceUrl;
      
      // Clean up bad URLs
      const isInvalid = !finalUrl || 
                        finalUrl === 'undefined' || 
                        finalUrl.split('/').length < 3 || 
                        finalUrl.includes('vertexaisearch') ||
                        finalUrl.includes('google.com/search');

      if (isInvalid) {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + " " + item.source + " news")}`;
      }
      
      // Image Handling
      let mainImage = item.imageUrl;
      const getRealImage = (query: string, width: number, height: number) => {
          const cleanQuery = query.replace(/[^\w\s]/gi, '').split(' ').slice(0, 8).join(' ');
          return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(cleanQuery + " news")}&w=${width}&h=${height}&c=7&rs=1&p=0`;
      };

      if (!mainImage || mainImage.length < 10 || mainImage.includes('pollinations')) {
          mainImage = getRealImage(item.title, 800, 450);
      }

      const relatedImages = (item.keyPoints || []).slice(0, 3).map((point: string) => {
          const cleanPoint = point.replace(/[^\w\s]/gi, '').split(' ').slice(0, 6).join(' ');
          return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(cleanPoint + " context")}&w=500&h=300&c=7&rs=1&p=0`;
      });

      // Normalize Importance Score (fix 90/10 bug)
      let impact = item.importanceScore || 5;
      if (impact > 10) {
          impact = Math.round(impact / 10);
          if (impact === 0) impact = 1;
      }

      return {
        ...item,
        id: `news-${index}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        verified: true,
        imageUrl: mainImage,
        relatedImages: relatedImages,
        sourceUrl: finalUrl,
        importanceScore: impact
      };
    });

  } catch (error) {
    console.error("Failed to fetch news. Full Error:", error);
    return [
        {
            id: "mock-1",
            title: "System Update: Feed Refresh Required",
            summary: "We encountered a temporary issue fetching the latest live news. This might be due to high traffic or connection limits. Please try refreshing in a moment.",
            keyPoints: ["Check internet connection.", "Retry refreshing the feed.", "API quota might be exhausted."],
            source: "Clarity System",
            sourceUrl: "#",
            timestamp: new Date().toISOString(),
            imageUrl: "https://placehold.co/800x450?text=Feed+Unavailable",
            relatedImages: [],
            bias: "Center",
            biasScore: 50,
            importanceScore: 5,
            verified: true,
            timeline: [],
            category: "System",
            country: "Global",
            newsType: "Alert",
            sentiment: 'neutral'
        }
    ];
  }
};

export const analyzeDetoxProgress = async (readHistoryCount: number, userName: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User ${userName} read ${readHistoryCount} articles. Give 1 short encouraging detox tip.`,
            config: { maxOutputTokens: 30 }
        });
        return response.text || "Stay mindful.";
    } catch (e) {
        return "Balance is key.";
    }
}