import banner1 from "@/assets/banner1.jpg";
import banner2 from "@/assets/banner2.jpg";
import ice from "@/assets/ice-bg.jpg";
import room from "@/assets/room-bg.jpg";
import mascot from "@/assets/mascot.jpg";
import a1 from "@/assets/avatars/a1.webp";
import a2 from "@/assets/avatars/a2.webp";
import a3 from "@/assets/avatars/a3.webp";
import a4 from "@/assets/avatars/a4.webp";
import a5 from "@/assets/avatars/a5.webp";
import a6 from "@/assets/avatars/a6.webp";
import a7 from "@/assets/avatars/a7.webp";
import a8 from "@/assets/avatars/a8.webp";
import cHoney from "@/assets/covers/honey.webp";
import cWolf from "@/assets/covers/wolf.webp";
import cDesert from "@/assets/covers/desert.webp";
import cEagle from "@/assets/covers/eagle.webp";
import cCafe from "@/assets/covers/cafe.webp";
import cParis from "@/assets/covers/paris.webp";
import gRose from "@/assets/gifts/rose.webp";
import gDiamond from "@/assets/gifts/diamond.webp";
import gCrown from "@/assets/gifts/crown.webp";
import gFalcon from "@/assets/gifts/falcon.webp";
import gCastle from "@/assets/gifts/castle.webp";
import gRocket from "@/assets/gifts/rocket.webp";
import gChoco from "@/assets/gifts/chocolate.webp";
import gRing from "@/assets/gifts/ring.webp";
import iWallet from "@/assets/icons/wallet.webp";
import iHost from "@/assets/icons/host.webp";
import iTask from "@/assets/icons/task.webp";
import iRewards from "@/assets/icons/rewards.webp";
import iShop from "@/assets/icons/shop.webp";
import iLevel from "@/assets/icons/level.webp";
import iBadge from "@/assets/icons/badge.webp";
import iId from "@/assets/icons/idcard.webp";
import uCoin from "@/assets/ui/coin.webp";
import uGem from "@/assets/ui/gem.webp";
import uSeat from "@/assets/ui/seat.webp";
import uCastle from "@/assets/ui/castle.webp";
import uMail from "@/assets/ui/mail.webp";
import uWealth from "@/assets/ui/wealth.webp";
import uRoom from "@/assets/ui/room.webp";
import uCharm from "@/assets/ui/charm.webp";
import sFrameGold from "@/assets/store/frame-gold.webp";
import sFrameIce from "@/assets/store/frame-ice.webp";
import sCar from "@/assets/store/car.webp";
import sPegasus from "@/assets/store/pegasus.webp";
import sBubbleGold from "@/assets/store/bubble-gold.webp";
import sBubbleIce from "@/assets/store/bubble-ice.webp";
import sThrone from "@/assets/store/throne.webp";
import sTrophy from "@/assets/store/trophy.webp";

export const images = { banner1, banner2, ice, room, mascot };
export const avatars = [a1, a2, a3, a4, a5, a6, a7, a8];
export const avatarAt = (i: number) => avatars[((i % 8) + 8) % 8]!;
export const ui = { coin: uCoin, gem: uGem, seat: uSeat, castle: uCastle, mail: uMail, wealth: uWealth, room: uRoom, charm: uCharm };
export const icons = { wallet: iWallet, host: iHost, task: iTask, rewards: iRewards, shop: iShop, level: iLevel, badge: iBadge, id: iId };

export type Room = { id: string; name: string; flag: string; vip: number; online: number; img: string; host: string; badges: string[]; tag: string };

export const rooms: Room[] = [
  { id: "1", name: "عسل بالشحن ومحلي", flag: "🇪🇬", vip: 7, online: 24, img: cHoney, host: a2, badges: [gCrown, iBadge, gDiamond], tag: "حفلة" },
  { id: "2", name: "وكر كل العرب", flag: "🇪🇬", vip: 5, online: 21, img: cWolf, host: a1, badges: [gDiamond, sTrophy], tag: "دردشة" },
  { id: "3", name: "ليالي الصحراء", flag: "🇸🇦", vip: 6, online: 18, img: cDesert, host: a3, badges: [gCrown], tag: "سهرة" },
  { id: "4", name: "سهرة الملوك", flag: "🇯🇴", vip: 8, online: 33, img: cEagle, host: a8, badges: [gCrown, sTrophy, iBadge], tag: "ملكي" },
  { id: "5", name: "قعدة صحاب وقهوة", flag: "🇦🇪", vip: 3, online: 12, img: cCafe, host: a5, badges: [gDiamond], tag: "صحاب" },
  { id: "6", name: "Paris Night", flag: "🇲🇦", vip: 4, online: 9, img: cParis, host: a4, badges: [iBadge], tag: "موسيقى" },
];

export const me = { name: "H·A·M·O", id: "1031437", img: a6, following: 1, fans: 1, charm: 0, coins: 12500, diamonds: 340, level: 12 };

export const events = [
  { img: banner1, title: "مكافأة الشحن الملكية", from: "2026-11-16", to: "2026-11-21", tag: "شحن" },
  { img: banner2, title: "وكالة SUPER ADMIN", from: "2026-11-13", to: "2026-12-30", tag: "وكالة" },
  { img: ice, title: "مهرجان القصر الجليدي", from: "2026-11-07", to: "2026-12-30", tag: "فعالية" },
  { img: room, title: "ليالي الشتاء الرمضانية", from: "2026-11-04", to: "2027-01-30", tag: "موسم" },
];

export type Gift = { img: string; n: string; p: number };
export const gifts: Gift[] = [
  { img: gRose, n: "وردة", p: 1 }, { img: gChoco, n: "شوكولا", p: 10 }, { img: gDiamond, n: "ألماسة", p: 99 },
  { img: gCrown, n: "تاج", p: 520 }, { img: gFalcon, n: "صقر", p: 999 }, { img: gRing, n: "خاتم", p: 1314 },
  { img: gCastle, n: "قصر جليد", p: 5000 }, { img: gRocket, n: "صاروخ", p: 9999 },
];

export type StoreItem = { img: string; n: string; cat: "إطارات" | "مركبات" | "فقاعات" | "مقاعد"; p: number; days: number; frame?: boolean };
export const storeItems: StoreItem[] = [
  { img: sFrameGold, n: "أجنحة الذهب", cat: "إطارات", p: 15000, days: 7, frame: true },
  { img: sFrameIce, n: "تاج الجليد", cat: "إطارات", p: 12000, days: 7, frame: true },
  { img: sCar, n: "فيراري حمراء", cat: "مركبات", p: 30000, days: 7 },
  { img: sPegasus, n: "الحصان المجنح", cat: "مركبات", p: 45000, days: 7 },
  { img: sBubbleGold, n: "فقاعة ذهبية", cat: "فقاعات", p: 8000, days: 7 },
  { img: sBubbleIce, n: "فقاعة الجليد", cat: "فقاعات", p: 6000, days: 7 },
  { img: sThrone, n: "عرش الجليد", cat: "مقاعد", p: 25000, days: 7 },
  { img: sTrophy, n: "كأس الأبطال", cat: "مقاعد", p: 20000, days: 7 },
];
