export type FortuneMessage = {
  id: string;
  text: string;
};

const baseMessages = [
  "今天也值得被自己喜歡。",
  "慢慢走也會到達。",
  "有些好事正在靠近你。",
  "你比自己想像的更好。",
  "世界正在為你讓路。",
  "今天的你很有光。",
  "安心做自己就很好。",
  "小步也會累積奇蹟。",
  "溫柔不是你的弱點。",
  "你的節奏剛剛好。",
  "新的轉機正在醞釀。",
  "此刻的努力沒有白費。",
  "你已離答案更近一步。",
  "今天適合相信自己。",
  "安靜也能充滿力量。",
  "你正在長成喜歡的樣子。",
  "一點點進步都值得歡喜。",
  "今天會有小驚喜。",
  "疲憊時也別忘了稱讚自己。",
  "你有能力照亮今天。",
  "你的真誠很珍貴。",
  "今天適合把心打開。",
  "好消息正在路上。",
  "你的耐心會開花。",
  "勇敢一次，會有回聲。",
  "今天先對自己好一點。",
  "你已經做得很好了。",
  "把擔心放輕一點。",
  "今天會有人被你溫暖。",
  "你擁有重新開始的能力。",
  "你的努力正被時間收藏。",
  "平凡的一天也會閃閃發亮。",
  "心裡的光不要關掉。",
  "你值得一個好結果。",
  "今天可以慢一點，但不要停下來。",
  "你正在被幸運偷偷照顧。",
  "你會遇見理解你的人。",
  "今天的直覺值得相信。",
  "先照顧自己，再照顧世界。",
  "你不必急著證明什麼。",
  "好日子會被你等到。",
  "把今天活成一份禮物。",
  "你保留的善意會回來。",
  "今天很適合微笑一下。",
  "你正一步步靠近想去的地方。",
  "有些答案會在路上出現。",
  "你的堅持正悄悄發亮。",
  "今天記得為自己鼓掌。",
  "被看見的時刻快到了。",
  "你心中的願望有重量。",
  "今天適合輕裝前進。",
  "別小看你現在的累積。",
  "你散發的溫柔很有力量。",
  "今天會比你想的順利。",
  "你值得安心地期待。",
  "心定下來，好事就更近了。",
  "你會找到舒服的答案。",
  "今天的勇氣很夠用。",
  "你正在變得更自由。",
  "你的存在本身就有意義。",
  "今天先完成一件小事就好。",
  "被喜歡的，不只你的努力。",
  "今天會有新的靈感。",
  "你的慢，不代表落後。",
  "想念的好事也在想你。",
  "今天很適合重新整理心情。",
  "你值得被柔軟對待。",
  "前方有你會喜歡的風景。",
  "今天可以不用那麼用力。",
  "你會撐過，也會更好。",
  "每一次休息都在充電。",
  "今天有機會遇見好消息。",
  "你的今天會留下好看的痕跡。",
  "把眼光放回自己身上。",
  "你有安定自己的能力。",
  "今天的努力會成為明天的底氣。",
  "你正在迎接新的輕盈。",
  "有些緣分正在向你靠近。",
  "今天的心願值得期待。",
  "你有權利慢慢來。",
  "平靜也能帶來改變。",
  "你的細膩會被珍惜。",
  "今天是為自己累積的一天。",
  "溫暖的事會繼續發生。",
  "你會遇見更合適的安排。",
  "今天很適合說出真心話。",
  "你有餘裕面對今天。",
  "把信心借給今天的自己。",
  "你的選擇會帶你去對的地方。",
  "今天先把眉頭放鬆。",
  "你正在養成新的幸運。",
  "你會被善意接住。",
  "今天也有值得期待的小事。",
  "別急，花開都有時間。",
  "你已經在變好的路上。",
  "今天適合好好呼吸。",
  "你值得一場溫柔的相遇。",
  "心裡的願望正在發芽。",
  "今天先照顧情緒再前進。",
  "你能走出自己的節奏。",
  "今天的你很可靠。",
  "你會把今天過得很好。",
  "你的堅強也可以帶著柔軟。",
  "今天很適合原諒自己。",
  "生活會回應你的用心。",
  "你將迎來剛好的安排。",
  "今天先相信一次可能性。",
  "你值得被命運偏愛。",
  "此刻的安靜正在成全你。",
  "你身上的光會被看見。",
  "今天會比昨天更輕鬆。",
  "你會有屬於自己的好時機。",
  "今天的你，剛剛好。"
];

const openings = ["今天", "此刻", "接下來", "很快", "偷偷地", "慢慢地", "就在今天"];
const subjects = [
  "好事",
  "轉機",
  "溫柔",
  "答案",
  "靈感",
  "勇氣",
  "幸運",
  "平靜",
  "光亮",
  "笑容",
  "驚喜",
  "好消息"
];
const motions = ["正在靠近你", "會回到你身邊", "已經在路上", "會找到你", "正悄悄展開", "會替你打開門"];
const affirmations = [
  "你值得被喜歡",
  "你可以放心前進",
  "你已經很棒了",
  "你有能力做到",
  "你會被溫柔接住",
  "你比想像中更有力量",
  "你正在成為更喜歡的自己"
];
const gentleActions = [
  "慢一點也沒關係",
  "先照顧自己就好",
  "記得替自己加油",
  "先完成一件小事",
  "把心放鬆一點",
  "對自己說句好話",
  "安心往前走"
];

function createRuleMessages(): string[] {
  const generated = new Set<string>();

  for (const opening of openings) {
    for (const subject of subjects) {
      for (const motion of motions) {
        generated.add(`${opening}，${subject}${motion}。`);
      }
    }
  }

  for (const affirmation of affirmations) {
    for (const action of gentleActions) {
      generated.add(`${affirmation}，${action}。`);
    }
  }

  return Array.from(generated);
}

const ruleMessages = createRuleMessages();

export const fortuneLibrary: FortuneMessage[] = [...baseMessages, ...ruleMessages].map((text, index) => ({
  id: `fortune-${index + 1}`,
  text
}));

export function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function formatDisplayDate(date: string): string {
  return date.replace(/-/g, ".");
}

export function getDailyFortune(date: string, seed: string): FortuneMessage {
  const hash = hashString(`${date}-${seed}`);
  return fortuneLibrary[hash % fortuneLibrary.length];
}

export function getExtraFortune(date: string, seed: string, drawIndex: number): FortuneMessage {
  const hash = hashString(`${date}-${seed}-extra-${drawIndex}`);
  return fortuneLibrary[hash % fortuneLibrary.length];
}
