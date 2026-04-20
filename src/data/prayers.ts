export interface Chunk {
  id: string;
  hebrew: string;
  transliteration: string;
  srsDifficulty: number;
  commonErrors: string[];
}

export interface Prayer {
  id: string;
  level: number;
  nameEnglish: string;
  nameHebrew: string;
  status: "locked" | "in-progress" | "complete";
  unit: number;
  totalUnits: number;
  bossBestScore?: number;
  badgeTier?: "bronze" | "silver" | "gold";
  chunks: Chunk[];
  fullText: string;
}

export type PrayerStatus = Prayer["status"];
export type BadgeTier = "bronze" | "silver" | "gold";

export const prayers: Prayer[] = [
  {
    id: "modeh-ani",
    level: 1,
    nameEnglish: "Modeh Ani",
    nameHebrew: "מוֹדֶה אֲנִי",
    status: "in-progress",
    unit: 1,
    totalUnits: 5,
    fullText: "מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה רַבָּה אֱמוּנָתֶךָ",
    chunks: [
      { id: "ma-01", hebrew: "מוֹדֶה אֲנִי", transliteration: "mo-DEH ah-NEE", srsDifficulty: 2, commonErrors: ["dropping final hey", "flat holam vav"] },
      { id: "ma-02", hebrew: "לְפָנֶיךָ", transliteration: "leh-fah-NEH-cha", srsDifficulty: 4, commonErrors: ["merging with preceding word", "dropping final aleph sound"] },
      { id: "ma-03", hebrew: "מֶלֶךְ חַי וְקַיָּם", transliteration: "MEH-lech chai veh-ka-YAM", srsDifficulty: 3, commonErrors: ["flattening the tzere", "rushing vav"] },
      { id: "ma-04", hebrew: "שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי", transliteration: "sheh-HEH-che-ZAR-ta bee nish-mah-TEE", srsDifficulty: 5, commonErrors: ["collapsing syllables", "stress on wrong syllable"] },
      { id: "ma-05", hebrew: "בְּחֶמְלָה רַבָּה אֱמוּנָתֶךָ", transliteration: "beh-CHEM-lah ra-BAH emoo-nah-TEH-cha", srsDifficulty: 4, commonErrors: ["rushing emunah", "weak final syllable"] },
    ],
  },
  {
    id: "asher-yatzar",
    level: 2,
    nameEnglish: "Asher Yatzar",
    nameHebrew: "אֲשֶׁר יָצַר",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "אֲשֶׁר יָצַר אֶת הָאָדָם בְּחָכְמָה וּבָרָא בוֹ נְקָבִים נְקָבִים חֲלוּלִים חֲלוּלִים",
    chunks: [
      { id: "ay-01", hebrew: "אֲשֶׁר יָצַר אֶת הָאָדָם", transliteration: "ah-SHER yah-TZAR et ha-ah-DAM", srsDifficulty: 2, commonErrors: ["flat tzere in yatzar"] },
      { id: "ay-02", hebrew: "בְּחָכְמָה", transliteration: "beh-CHACH-mah", srsDifficulty: 3, commonErrors: ["dropping bet shva", "softening chet"] },
      { id: "ay-03", hebrew: "וּבָרָא בוֹ", transliteration: "oo-va-RA bo", srsDifficulty: 2, commonErrors: ["rushing the vav conjunctive"] },
      { id: "ay-04", hebrew: "נְקָבִים נְקָבִים", transliteration: "neh-ka-VEEM neh-ka-VEEM", srsDifficulty: 3, commonErrors: ["ignoring the repetition rhythm"] },
      { id: "ay-05", hebrew: "חֲלוּלִים חֲלוּלִים", transliteration: "cha-loo-LEEM cha-loo-LEEM", srsDifficulty: 3, commonErrors: ["swallowing the chet"] },
    ],
  },
  {
    id: "elohai-neshama",
    level: 3,
    nameEnglish: "Elohai Neshama",
    nameHebrew: "אֱלֹהַי נְשָׁמָה",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "אֱלֹהַי נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא",
    chunks: [
      { id: "en-01", hebrew: "אֱלֹהַי נְשָׁמָה", transliteration: "eh-lo-HAI neh-sha-MAH", srsDifficulty: 3, commonErrors: [] },
      { id: "en-02", hebrew: "שֶׁנָּתַתָּ בִּי", transliteration: "sheh-na-TA-ta bee", srsDifficulty: 4, commonErrors: [] },
      { id: "en-03", hebrew: "טְהוֹרָה הִיא", transliteration: "teh-ho-RAH hee", srsDifficulty: 2, commonErrors: [] },
    ],
  },
  {
    id: "birkot-hashachar",
    level: 4,
    nameEnglish: "Birkot HaShachar",
    nameHebrew: "בִּרְכוֹת הַשַּׁחַר",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם",
    chunks: [],
  },
  {
    id: "barchu",
    level: 5,
    nameEnglish: "Barchu",
    nameHebrew: "בָּרְכוּ",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "בָּרְכוּ אֶת יְהֹוָה הַמְבֹרָךְ",
    chunks: [],
  },
  {
    id: "shema",
    level: 6,
    nameEnglish: "Shema",
    nameHebrew: "שְׁמַע יִשְׂרָאֵל",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "שְׁמַע יִשְׂרָאֵל יְהֹוָה אֱלֹהֵינוּ יְהֹוָה אֶחָד",
    chunks: [],
  },
  {
    id: "veahavta",
    level: 7,
    nameEnglish: "VeAhavta",
    nameHebrew: "וְאָהַבְתָּ",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "וְאָהַבְתָּ אֵת יְהֹוָה אֱלֹהֶיךָ",
    chunks: [],
  },
  {
    id: "emet-veyatziv",
    level: 8,
    nameEnglish: "Emet VeYatziv",
    nameHebrew: "אֱמֶת וְיַצִּיב",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "אֱמֶת וְיַצִּיב וְנָכוֹן",
    chunks: [],
  },
  {
    id: "amidah",
    level: 9,
    nameEnglish: "Amidah",
    nameHebrew: "עֲמִידָה",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "אֲדֹנָי שְׂפָתַי תִּפְתָּח וּפִי יַגִּיד תְּהִלָּתֶךָ",
    chunks: [],
  },
  {
    id: "aleinu",
    level: 10,
    nameEnglish: "Aleinu",
    nameHebrew: "עָלֵינוּ",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל",
    chunks: [],
  },
  {
    id: "adon-olam",
    level: 11,
    nameEnglish: "Adon Olam",
    nameHebrew: "אֲדוֹן עוֹלָם",
    status: "locked",
    unit: 0,
    totalUnits: 5,
    fullText: "אֲדוֹן עוֹלָם אֲשֶׁר מָלַךְ בְּטֶרֶם כָּל יְצִיר נִבְרָא",
    chunks: [],
  },
];

export const avatarTitles = [
  { title: "Aleph Apprentice", hebrew: "תַּלְמִיד אָלֶף", xpThreshold: 0 },
  { title: "Bet Brawler", hebrew: "לוֹחֵם בֵּית", xpThreshold: 500 },
  { title: "Gimmel Guardian", hebrew: "שׁוֹמֵר גִּימֶל", xpThreshold: 1500 },
  { title: "Dalet Decoder", hebrew: "מְפַעֵן דָּלֶת", xpThreshold: 3000 },
  { title: "Hey Hero", hebrew: "גִּיבּוֹר הֵא", xpThreshold: 6000 },
  { title: "Vav Virtuoso", hebrew: "וִירְטוּאוֹז וָו", xpThreshold: 12000 },
];

export function getAvatarTitle(xp: number) {
  let current = avatarTitles[0];
  let next = avatarTitles[1];
  for (let i = avatarTitles.length - 1; i >= 0; i--) {
    if (xp >= avatarTitles[i].xpThreshold) {
      current = avatarTitles[i];
      next = avatarTitles[i + 1] ?? avatarTitles[avatarTitles.length - 1];
      break;
    }
  }
  return { current, next };
}

export function getPrayerOrderIndex(prayerId: string): number {
  return prayers.findIndex((p) => p.id === prayerId);
}

export function getNextPrayerId(prayerId: string): string | null {
  const idx = getPrayerOrderIndex(prayerId);
  if (idx < 0 || idx + 1 >= prayers.length) return null;
  return prayers[idx + 1].id;
}

export function orderChunksForPractice(
  chunks: Chunk[],
  chunkConfidence: Record<string, number>,
): Chunk[] {
  return [...chunks].sort((a, b) => {
    const aScore = chunkConfidence[a.id] ?? 50;
    const bScore = chunkConfidence[b.id] ?? 50;
    if (aScore !== bScore) return aScore - bScore;
    return b.srsDifficulty - a.srsDifficulty;
  });
}

export function getBossBadgeTier(score: number | undefined): BadgeTier | null {
  if (score === undefined) return null;
  if (score >= 90) return "gold";
  if (score >= 80) return "silver";
  if (score >= 60) return "bronze";
  return null;
}
