"use client";

import { motion } from "framer-motion";
import { toBlob } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FavoriteFortune,
  HistoryState,
  STORAGE_KEYS,
  StreakState,
  createSeed,
  getTodayString,
  getYesterdayString,
  safeStorageGet,
  safeStorageSet
} from "@/lib/storage";
import {
  FortuneMessage,
  formatDisplayDate,
  getDailyFortune,
  getExtraFortune
} from "@/lib/messages";

type AppStage = "idle" | "cracking" | "paper" | "message";
type ActiveMessage = {
  mode: "daily" | "extra";
  drawIndex: number;
  message: FortuneMessage;
  sourceDate: string;
};

const streakMilestones: Record<number, string> = {
  3: "連續 3 天了，你正在養成自己的幸運儀式。",
  7: "滿 7 天，這份穩定感會帶你走得更遠。",
  14: "14 天的堅持很不簡單，今天也值得替自己鼓掌。",
  30: "30 天達成，你已經把溫柔的習慣留在生活裡。"
};

const shareFallbackTitle = "Fortune Cookie Daily";

export default function HomePage() {
  const [seed, setSeed] = useState("");
  const [stage, setStage] = useState<AppStage>("idle");
  const [today, setToday] = useState("");
  const [drawCount, setDrawCount] = useState(0);
  const [activeMessage, setActiveMessage] = useState<ActiveMessage | null>(null);
  const [favorites, setFavorites] = useState<FavoriteFortune[]>([]);
  const [history, setHistory] = useState<HistoryState>({});
  const [streak, setStreak] = useState<StreakState>({
    todayOpened: false,
    lastOpenDate: null,
    streakCount: 0
  });
  const [notice, setNotice] = useState("今天會拆出什麼樣的幸運話語呢？");
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentDate = getTodayString();
    setToday(currentDate);

    const existingSeed = safeStorageGet<string | null>(STORAGE_KEYS.seed, null);
    const nextSeed = existingSeed ?? createSeed();
    if (!existingSeed) {
      safeStorageSet(STORAGE_KEYS.seed, nextSeed);
    }
    setSeed(nextSeed);

    const storedFavorites = safeStorageGet<FavoriteFortune[]>(STORAGE_KEYS.favorites, []);
    setFavorites(storedFavorites);

    const storedHistory = safeStorageGet<HistoryState>(STORAGE_KEYS.history, {});
    setHistory(storedHistory);
    if (storedHistory[currentDate]) {
      setDrawCount(storedHistory[currentDate].extraDrawCount + 1);
    }

    const storedStreak = safeStorageGet<StreakState>(STORAGE_KEYS.streak, {
      todayOpened: false,
      lastOpenDate: null,
      streakCount: 0
    });

    if (storedStreak.lastOpenDate !== currentDate) {
      const resetStreak = {
        ...storedStreak,
        todayOpened: false
      };
      setStreak(resetStreak);
      safeStorageSet(STORAGE_KEYS.streak, resetStreak);
    } else {
      setStreak(storedStreak);
    }
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const streakHint = useMemo(() => {
    if (!streak.streakCount) {
      return "今天拆開第一顆，開始你的幸運連續紀錄。";
    }

    return streakMilestones[streak.streakCount] ?? "每天留一點時間給自己，幸運感會慢慢長出來。";
  }, [streak.streakCount]);

  const dailyLabel = activeMessage?.mode === "daily" ? "今日命定句" : "再抽一張";

  function persistHistory(currentDate: string, messageId: string, extraDrawCount: number) {
    setHistory((previous) => {
      const next = {
        ...previous,
        [currentDate]: {
          date: currentDate,
          dailyMessageId: previous[currentDate]?.dailyMessageId ?? messageId,
          extraDrawCount
        }
      };
      safeStorageSet(STORAGE_KEYS.history, next);
      return next;
    });
  }

  function updateStreak(currentDate: string) {
    setStreak((previous) => {
      if (previous.todayOpened && previous.lastOpenDate === currentDate) {
        return previous;
      }

      const yesterday = getYesterdayString(currentDate);
      const nextCount = previous.lastOpenDate === yesterday ? previous.streakCount + 1 : 1;
      const nextState = {
        todayOpened: true,
        lastOpenDate: currentDate,
        streakCount: nextCount
      };
      safeStorageSet(STORAGE_KEYS.streak, nextState);
      return nextState;
    });
  }

  function handleCookieTap() {
    if (!seed || !today || stage === "cracking" || stage === "paper") {
      return;
    }

    setNotice("餅乾裂開中...");
    setStage("cracking");

    window.setTimeout(() => {
      setStage("paper");
      setNotice("點一下紙條，看看它想對你說什麼。");
    }, 820);
  }

  function revealMessage(nextMessage: ActiveMessage) {
    setActiveMessage(nextMessage);
    setStage("message");
    setNotice(nextMessage.mode === "daily" ? "今天的命定句已經出現了。" : "新的鼓勵紙條來了。");
  }

  function handlePaperTap() {
    if (!seed || !today || stage !== "paper") {
      return;
    }

    const isDailyDraw = drawCount === 0;
    const nextDrawIndex = drawCount + 1;
    const message = isDailyDraw
      ? getDailyFortune(today, seed)
      : getExtraFortune(today, seed, nextDrawIndex);

    revealMessage({
      mode: isDailyDraw ? "daily" : "extra",
      drawIndex: nextDrawIndex,
      message,
      sourceDate: today
    });

    setDrawCount(nextDrawIndex);
    if (isDailyDraw) {
      persistHistory(today, message.id, 0);
      updateStreak(today);
    } else {
      persistHistory(today, history[today]?.dailyMessageId ?? message.id, nextDrawIndex - 1);
    }
  }

  function handleExtraDraw() {
    if (!seed || !today) {
      return;
    }

    setStage("cracking");
    setNotice("再拆一顆新的幸運餅乾...");

    window.setTimeout(() => {
      const nextDrawIndex = drawCount + 1;
      const message = getExtraFortune(today, seed, nextDrawIndex);

      revealMessage({
        mode: "extra",
        drawIndex: nextDrawIndex,
        message,
        sourceDate: today
      });

      setDrawCount(nextDrawIndex);
      persistHistory(today, history[today]?.dailyMessageId ?? message.id, nextDrawIndex - 1);
    }, 700);
  }

  function handleResetScene() {
    if (!activeMessage) {
      return;
    }

    setStage("idle");
    setNotice("想再感受一次拆餅乾的儀式，就再點一次餅乾。");
  }

  function handleFavorite() {
    if (!activeMessage) {
      return;
    }

    const nextFavorite: FavoriteFortune = {
      id: `${activeMessage.sourceDate}-${activeMessage.drawIndex}-${activeMessage.message.id}`,
      text: activeMessage.message.text,
      dateSaved: getTodayString(),
      sourceDate: activeMessage.sourceDate
    };

    setFavorites((previous) => {
      if (previous.some((item) => item.id === nextFavorite.id)) {
        setNotice("這張紙條已經收藏好了。");
        return previous;
      }

      const next = [nextFavorite, ...previous];
      safeStorageSet(STORAGE_KEYS.favorites, next);
      setNotice("已收藏到幸運紙條盒。");
      return next;
    });
  }

  async function handleCopyShare() {
    if (!activeMessage) {
      return;
    }

    const shareText = `今天的幸運餅乾說：\n\n「${activeMessage.message.text}」\n\n— Fortune Cookie Daily`;

    try {
      await navigator.clipboard.writeText(shareText);
      setNotice("文字已複製，可以分享給喜歡的人。");
    } catch {
      setNotice("這次複製失敗了，請再試一次。");
    }
  }

  async function handleShareImage() {
    if (!activeMessage || !shareCardRef.current) {
      return;
    }

    try {
      const blob = await toBlob(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2
      });

      if (!blob) {
        throw new Error("blob-not-created");
      }

      const file = new File([blob], "fortune-cookie-daily.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: shareFallbackTitle,
          text: activeMessage.message.text,
          files: [file]
        });
        setNotice("已打開分享選單。");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fortune-cookie-daily.png";
      link.click();
      URL.revokeObjectURL(url);
      setNotice("圖片已準備好，已為你下載。");
    } catch {
      setNotice("目前無法輸出圖片，請稍後再試。");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-6 text-ink">
      <header className="space-y-3 text-center">
        <p className="font-display text-xl tracking-[0.2em] text-ink/55">Fortune Cookie Daily</p>
        <h1 className="text-balance font-display text-5xl leading-none text-ink">每日幸運餅乾</h1>
        <p className="mx-auto max-w-xs text-sm leading-6 text-ink/70">
          點一下看看今天的幸運餅乾想對你說什麼
        </p>
      </header>

      <section className="mt-6 rounded-[2rem] border border-white/60 bg-white/35 px-4 py-3 shadow-paper backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm text-ink/70">
          <span>已連續開啟 {streak.streakCount} 天</span>
          <span>{today ? formatDisplayDate(today) : "讀取中"}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/80">{streakHint}</p>
      </section>

      <section className="relative mt-8 flex min-h-[370px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/50 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_42%),linear-gradient(180deg,rgba(255,247,232,0.9),rgba(248,220,180,0.92))] px-4 py-8 shadow-cookie">
        <div className="absolute -top-10 h-32 w-32 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-28 w-56 -translate-x-1/2 rounded-full bg-[#c98e4d]/25 blur-3xl" />

        {stage !== "message" && (
          <div className="flex w-full flex-col items-center justify-center gap-6">
            <motion.button
              type="button"
              onClick={handleCookieTap}
              animate={
                stage === "cracking"
                  ? { rotate: [0, -8, 10, -10, 6, 0], scale: [1, 1.03, 1] }
                  : { rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.7 }}
              className="relative flex h-[220px] w-[220px] items-center justify-center"
              aria-label="Open fortune cookie"
            >
              <motion.div
                animate={stage === "paper" ? { x: -34, y: -10, rotate: -20 } : { x: 0, y: 0, rotate: -8 }}
                transition={{ duration: 0.5 }}
                className="absolute h-28 w-36 rounded-[55%_45%_52%_48%/56%_44%_56%_44%] border border-[#d59552]/70 bg-[linear-gradient(180deg,#f5c781,#ce8a43)] shadow-[inset_0_8px_16px_rgba(255,255,255,0.25),0_16px_30px_rgba(139,86,35,0.28)]"
              >
                <span className="absolute left-6 top-4 h-12 w-1 rounded-full bg-white/20" />
              </motion.div>
              <motion.div
                animate={stage === "paper" ? { x: 34, y: 14, rotate: 24 } : { x: 0, y: 0, rotate: 12 }}
                transition={{ duration: 0.5 }}
                className="absolute h-28 w-36 rounded-[45%_55%_46%_54%/48%_52%_48%_52%] border border-[#d59552]/70 bg-[linear-gradient(180deg,#f6cb88,#d89247)] shadow-[inset_0_8px_16px_rgba(255,255,255,0.24),0_16px_30px_rgba(139,86,35,0.28)]"
              >
                <span className="absolute right-6 top-5 h-12 w-1 rounded-full bg-white/20" />
              </motion.div>
            </motion.button>

            <motion.button
              type="button"
              onClick={handlePaperTap}
              initial={false}
              animate={
                stage === "paper"
                  ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
                  : { opacity: 0, y: 12, scale: 0.9, rotate: -2 }
              }
              transition={{ duration: 0.45, delay: 0.15 }}
              className="paper-grain rounded-2xl border border-[var(--paper-edge)] px-6 py-4 text-center shadow-paper"
            >
              <p className="text-xs tracking-[0.3em] text-ink/45">FORTUNE</p>
              <p className="mt-2 text-sm text-ink/75">點一下紙條</p>
            </motion.button>

            <p className="max-w-xs text-center text-sm leading-6 text-ink/70">
              {stage === "idle" ? "先輕點餅乾，讓今天的運氣慢慢裂開。" : "餅乾已經打開，紙條正在等你。"}
            </p>
          </div>
        )}

        {stage === "message" && activeMessage && (
          <motion.article
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="paper-grain relative w-full rounded-[2rem] border border-[var(--paper-edge)] px-6 py-7 shadow-paper"
          >
            <div className="space-y-2 text-center">
              <p className="text-xs tracking-[0.3em] text-ink/45">{dailyLabel}</p>
              <p className="text-sm text-ink/60">{formatDisplayDate(activeMessage.sourceDate)}</p>
              <p className="pt-4 font-display text-4xl leading-tight text-ink">「{activeMessage.message.text}」</p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleFavorite}
                className="rounded-full border border-[#cfa16c] bg-white/70 px-3 py-3 text-sm font-medium text-ink transition hover:bg-white"
              >
                收藏
              </button>
              <button
                type="button"
                onClick={handleCopyShare}
                className="rounded-full border border-[#cfa16c] bg-white/70 px-3 py-3 text-sm font-medium text-ink transition hover:bg-white"
              >
                分享文字
              </button>
              <button
                type="button"
                onClick={handleShareImage}
                className="rounded-full border border-[#cfa16c] bg-[#d4633a] px-3 py-3 text-sm font-medium text-white transition hover:bg-[#bf5730]"
              >
                分享圖片
              </button>
            </div>

            <button
              type="button"
              onClick={handleExtraDraw}
              className="mt-3 w-full rounded-full border border-transparent bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-[#422d1b]"
            >
              再抽一張
            </button>

            <button
              type="button"
              onClick={handleResetScene}
              className="mt-3 w-full rounded-full border border-[#d7b180] bg-transparent px-4 py-3 text-sm font-medium text-ink/75 transition hover:bg-white/40"
            >
              回到餅乾
            </button>

            <p className="mt-6 text-center text-sm leading-6 text-ink/60">
              明天再來拆一顆新的幸運餅乾
            </p>
          </motion.article>
        )}
      </section>

      <div className="mt-4 min-h-6 text-center text-sm text-ink/70">{notice}</div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-3xl text-ink">收藏紙條</h2>
          <span className="text-sm text-ink/60">{favorites.length} 張</span>
        </div>

        {favorites.length === 0 ? (
          <div className="paper-grain rounded-[1.75rem] border border-[var(--paper-edge)] px-5 py-6 text-sm leading-6 text-ink/65 shadow-paper">
            收藏喜歡的句子後，它們會安靜地留在這裡。
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((favorite) => (
              <article
                key={favorite.id}
                className="paper-grain rounded-[1.75rem] border border-[var(--paper-edge)] px-5 py-5 shadow-paper"
              >
                <p className="font-display text-2xl leading-snug text-ink">「{favorite.text}」</p>
                <div className="mt-3 flex items-center justify-between text-sm text-ink/55">
                  <span>收藏於 {favorite.dateSaved.replace(/-/g, "/")}</span>
                  <span>來自 {favorite.sourceDate.replace(/-/g, "/")}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="pointer-events-none fixed left-[-9999px] top-0">
        <div
          ref={shareCardRef}
          className="paper-grain relative flex h-[720px] w-[720px] flex-col justify-between overflow-hidden rounded-[48px] border border-[#dfc9aa] p-16 text-ink"
        >
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#f2c07a]/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 h-64 w-64 rounded-full bg-[#cf8f50]/20 blur-3xl" />
          <div>
            <p className="text-xl tracking-[0.4em] text-ink/45">FORTUNE COOKIE DAILY</p>
            <p className="mt-6 text-lg text-ink/60">{activeMessage ? formatDisplayDate(activeMessage.sourceDate) : ""}</p>
          </div>
          <div className="relative rounded-[40px] border border-white/60 bg-white/55 px-12 py-16">
            <p className="font-display text-[54px] leading-[1.28] text-ink">
              {activeMessage ? `「${activeMessage.message.text}」` : ""}
            </p>
          </div>
          <div className="flex items-center justify-between text-xl text-ink/55">
            <span>今天的幸運餅乾說</span>
            <span className="rounded-full border border-[#d4a777] px-5 py-2">Fortune Seal</span>
          </div>
        </div>
      </div>
    </main>
  );
}
