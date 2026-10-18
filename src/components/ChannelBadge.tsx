import React from "react";
import { Tv } from "lucide-react";

interface ChannelBadgeProps {
  channel: string;
  className?: string;
}

export function ChannelBadge({ channel, className = "" }: ChannelBadgeProps) {
  const getChannelStyles = (channelName: string) => {
    const channelConfig: Record<string, { bg: string; text: string; logo?: string }> = {
      "Globo": { bg: "bg-blue-600", text: "text-white" },
      "Globoplay": { bg: "bg-orange-600", text: "text-white" },
      "sportv": { bg: "bg-orange-500", text: "text-white" },
      "ESPN": { bg: "bg-red-600", text: "text-white" },
      "SporTV": { bg: "bg-orange-500", text: "text-white" },
      "F1 TV Pro": { bg: "bg-red-500", text: "text-white" },
      "Star+": { bg: "bg-purple-600", text: "text-white" },
      "NBA League Pass": { bg: "bg-blue-700", text: "text-white" },
      "NFL Game Pass": { bg: "bg-indigo-700", text: "text-white" },
      "Band": { bg: "bg-yellow-500", text: "text-black" },
    };

    return channelConfig[channelName] || { bg: "bg-gray-600", text: "text-white" };
  };

  const styles = getChannelStyles(channel);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${styles.bg} ${styles.text} shadow-sm ${className}`}
    >
      <Tv className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{channel}</span>
    </div>
  );
}
