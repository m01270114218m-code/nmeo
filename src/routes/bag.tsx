import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, X, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAsset } from "@/lib/media";
import { AdminAssetMedia } from "@/components/AdminAssetMedia";
import { toast } from "sonner";
import { errMsg } from "@/lib/vox";

export const Route = createFileRoute("/bag")({ component: () => <AppShell><BagPage/></AppShell> });

type Item={id:string;item_id:string;acquired_at:string;store_items:{name:string;kind:string;asset_key:string}|null};
type Badge={id:string;badge_key:string;badge_name:string;badge_asset_key:string|null;badge_color:string;is_equipped:boolean};

const TABS = [
  { id: "frame", label: "إطار الصورة" },
  { id: "entry", label: "تأثيرات المدخل" },
  { id: "vehicle", label: "مركبات الدخول" },
  { id: "bubble", label: "فقاعة الدردشة" },
  { id: "badge", label: "الاوسمة" },
  { id: "sound_wave", label: "موجات الصوت" },
] as const;

function Asset({item,equipped,onToggle}:{item:Item;equipped:boolean;onToggle:()=>void}) {
  const src=useAdminAsset(item.store_items?.asset_key ?? undefined);
  const name=item.store_items?.name ?? "عنصر";
  return <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Clock className="h-3 w-3" /> {new Date(item.acquired_at).toISOString().slice(0,10)}
      </span>
      <span className="text-sm font-bold text-emerald-600">{name}</span>
    </div>
    <div className="flex h-28 items-center justify-center">
      {src&&<AdminAssetMedia src={src} className="h-full w-full object-contain"/>}
    </div>
    <button onClick={onToggle} className={`mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white ${equipped?"bg-gray-400":"bg-emerald-500"}`}>
      {equipped?"قيد الارتداء":"ارتداء"}
    </button>
  </div>;
}

function BagPage(){
 const nav = useNavigate();
 const {user}=useAuth();
 const [items,setItems]=useState<Item[]>([]);
 const [badges,setBadges]=useState<Badge[]>([]);
 const [activeTab, setActiveTab] = useState<string>("frame");
 const [p,setP]=useState<{equipped_frame:string|null;equipped_entry:string|null;chat_bubble_asset_key:string|null;sound_wave_asset_key:string|null;profile_card_asset_key:string|null}>({equipped_frame:null,equipped_entry:null,chat_bubble_asset_key:null,sound_wave_asset_key:null,profile_card_asset_key:null});
 async function load(){if(!user)return; const [{data:i},{data:b},{data:pr}]=await Promise.all([supabase.from("user_items").select("id,item_id,acquired_at,store_items(name,kind,asset_key)").eq("user_id",user.id).order("acquired_at",{ascending:false}),supabase.from("user_badges").select("id,badge_key,badge_name,badge_asset_key,badge_color,is_equipped").eq("user_id",user.id),supabase.from("profiles").select("equipped_frame,equipped_entry,chat_bubble_asset_key,sound_wave_asset_key,profile_card_asset_key").eq("id",user.id).single()]); setItems((i??[]) as unknown as Item[]);setBadges((b??[]) as Badge[]);if(pr)setP(pr);}
 useEffect(()=>{void load()},[user]);
 async function toggle(item:Item){if(!item.store_items)return; const equipped=item.store_items.kind==="frame"?p.equipped_frame===item.store_items.asset_key:item.store_items.kind==="entry"?p.equipped_entry===item.store_items.asset_key:item.store_items.kind==="bubble"?p.chat_bubble_asset_key===item.store_items.asset_key:item.store_items.kind==="sound_wave"?p.sound_wave_asset_key===item.store_items.asset_key:item.store_items.kind==="profile_card"?p.profile_card_asset_key===item.store_items.asset_key:false;if(equipped && !["frame","entry"].includes(item.store_items.kind)){return;} const {error}=await supabase.rpc("equip_item",{_item_id:item.item_id,_equip:!equipped});if(error){toast.error(errMsg(error));return;}await load();toast.success(!equipped?"تم التفعيل":"تم الإيقاف");}
 async function badgeToggle(b:Badge){const {error}=await supabase.rpc("equip_badge",{_badge:b.id,_equip:!b.is_equipped});if(error){toast.error(errMsg(error));return;}await load();}

 const filteredItems = activeTab === "badge" ? [] : items.filter((i) => i.store_items?.kind === activeTab);

 return <div dir="rtl" className="min-h-screen pb-8" style={{ background: "#f0fdf4" }}>
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
      <button onClick={() => nav({ to: "/profile" })} className="rounded-full p-1">
        <ChevronLeft className="h-7 w-7 text-gray-700" />
      </button>
      <h1 className="text-xl font-bold text-gray-900">حقيبة</h1>
      <button onClick={() => nav({ to: "/" })} className="rounded-full p-1">
        <X className="h-7 w-7 text-gray-700" />
      </button>
    </header>

    {/* Featured avatar */}
    <div className="mx-3 mt-3 flex h-40 items-center justify-center overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #4ade80, #22d3ee)" }}>
      <div className="h-24 w-24 rounded-full border-4 border-white bg-white/30" />
    </div>

    {/* Tabs */}
    <div className="sticky top-[65px] z-20 flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`whitespace-nowrap px-4 py-3 text-sm font-bold ${activeTab === tab.id ? "border-b-2 border-emerald-500 text-emerald-600" : "text-gray-500"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* Items grid */}
    <div className="mx-3 mt-4 grid grid-cols-2 gap-3">
      {activeTab === "badge" ? (
        badges.length === 0 ? (
          <div className="col-span-2 rounded-2xl bg-white p-8 text-center text-gray-400">لا توجد شارات</div>
        ) : (
          badges.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="mx-auto mb-2 h-20 w-20 rounded-full" style={{ background: b.badge_color || "#e5e7eb" }} />
              <div className="font-bold text-gray-900">{b.badge_name}</div>
              <button onClick={() => void badgeToggle(b)} className={`mt-2 w-full rounded-xl py-2 text-sm font-bold text-white ${b.is_equipped ? "bg-gray-400" : "bg-emerald-500"}`}>
                {b.is_equipped ? "قيد الارتداء" : "ارتداء"}
              </button>
            </div>
          ))
        )
      ) : filteredItems.length === 0 ? (
        <div className="col-span-2 rounded-2xl bg-white p-8 text-center text-gray-400">لا توجد عناصر في هذا القسم</div>
      ) : (
        filteredItems.map((i) => (
          <Asset key={i.id} item={i} equipped={i.store_items?.kind==="frame"?p.equipped_frame===i.store_items.asset_key:i.store_items?.kind==="entry"?p.equipped_entry===i.store_items.asset_key:i.store_items?.kind==="bubble"?p.chat_bubble_asset_key===i.store_items.asset_key:i.store_items?.kind==="sound_wave"?p.sound_wave_asset_key===i.store_items.asset_key:i.store_items?.kind==="profile_card"?p.profile_card_asset_key===i.store_items.asset_key:false} onToggle={()=>void toggle(i)}/>
        ))
      )}
    </div>
  </div>;
}
