"use client";

interface VoteProps {
  itineraireId: string;
  votesUp: number;
  votesDown: number;
  monVote: "up" | "down" | null;
  userId: string | null;
  onVote: (vote: "up" | "down") => void;
}

export default function VoteButtons({
  votesUp,
  votesDown,
  monVote,
  userId,
  onVote,
}: VoteProps) {
  const total = votesUp + votesDown;
  const ratio = total > 0 ? votesUp / total : 0;
  const pct = Math.round(ratio * 100);

  return (
    <div className="space-y-2">
      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-600 shrink-0 w-10 text-right">
          {pct}%
        </span>
      </div>

      {/* Boutons — uniquement si connecté */}
      {userId && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onVote("up")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              monVote === "up"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>👍</span>
            <span>{votesUp}</span>
          </button>
          <button
            type="button"
            onClick={() => onVote("down")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              monVote === "down"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>👎</span>
            <span>{votesDown}</span>
          </button>
        </div>
      )}
    </div>
  );
}
