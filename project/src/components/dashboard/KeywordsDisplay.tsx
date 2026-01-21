import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Hash } from "lucide-react";

interface KeywordsDisplayProps {
  keywords: string[];
  isLoading?: boolean;
}

export function KeywordsDisplay({ keywords, isLoading }: KeywordsDisplayProps) {
  if (isLoading || keywords.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Search Keywords</h3>
        </div>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="h-7 w-24 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Generating keywords...</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-gray-900">Search Keywords</h3>
        <Badge variant="secondary" className="ml-auto">
          {keywords.length}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge 
            key={index} 
            variant="outline"
            className="text-sm px-3 py-1 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-colors"
          >
            <span className="text-xs text-gray-500 mr-1">#{index + 1}</span>
            {keyword}
          </Badge>
        ))}
      </div>
    </Card>
  );
}






