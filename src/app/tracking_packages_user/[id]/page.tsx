"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Header from '@/components/Header';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Shop {
  id: string;
  fullName: string;
  email: string;
}

interface Package {
  id: string;
  trackingNumber: string;
  status: string;
  shopId: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  User: Shop;
  customs: number | null;
  customs_payment: number | null;
  paymentStatus: string | null;
}

const STATUS_STEPS = [
  { key: "AWAITING_PAYMENT", label: "تم الدفع", icon: "/images/payment_hex_icon.png" },
  { key: "CUSTOMS", label: "جمارك", icon: "/images/customs_hex_icon.png" },
  { key: "DELIVERING_TO_SHOP", label: "قيد التوصيل", icon: "/images/delivery_hex_icon.png" },
];

// Status text mapping
function getStatusText(status: string) {
  switch (status) {
    case 'AWAITING_PAYMENT':
      return 'في انتظار الدفع';
    case 'PREPARING':
      return 'قيد التحضير';
    case 'DELIVERING_TO_SHOP':
      return 'قيد التوصيل للمتجر';
    case 'IN_SHOP':
      return 'في المتجر';
    case 'RECEIVED':
      return 'تم الاستلام';
    case 'PENDING':
      return 'قيد الانتظار';
    case 'IN_TRANSIT':
      return 'قيد الشحن';
    case 'DELIVERED':
      return 'تم التسليم';
    case 'CANCELLED':
      return 'ملغي';
    case 'RETURNED':
      return 'تم الإرجاع';
    default:
      return status;
  }
}

export default function PackageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopEdit, setShopEdit] = useState("");
  const [savingShop, setSavingShop] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (params?.id) {
      fetchPackage(params.id as string);
      fetchShops();
    }
  }, [params, sessionStatus]);

  const fetchPackage = async (id: string) => {
    if (!params?.id) return;
    setLoading(true);
    setErrorMsg(null);
    fetch(`/api/packages/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
          setPkg(null);
        } else {
          setPkg({
            ...data,
            User: data.shop || { fullName: "غير محدد", email: "" },
            customs: data.customs ?? 0,
            customs_payment: data.customs_payment ?? 0,
            paymentStatus: data.paymentStatus ?? "",
          });
          setShopEdit(data.shopId);
        }
      })
      .catch(err => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  const fetchShops = async () => {
    const response = await fetch("/api/users/shops");
    if (!response.ok) return;
    const data = await response.json();
    setShops(data);
  };

  const handleShopChange = async () => {
    if (!pkg) return;
    setSavingShop(true);
    const response = await fetch("/api/packages/update-shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: pkg.id, newShopId: shopEdit }),
    });
    if (!response.ok) {
      toast.error("فشل تحديث المتجر");
      setSavingShop(false);
      return;
    }
    const selectedShop = shops.find((s) => s.id === shopEdit);
    setPkg({ ...pkg, shopId: shopEdit, User: selectedShop || pkg.User });
    toast.success("تم تحديث المتجر");
    setSavingShop(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
            {errorMsg && (
              <div className="mt-8 text-center text-red-600 font-bold">{errorMsg}</div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-600 font-bold">{errorMsg || 'تعذر جلب بيانات الطرد'}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dynamic status/progress logic
  const progressSteps = [
    {
      icon: "/images/payment_hex_icon.png",
      label: "تم الدفع",
      active: pkg.status === "PAID" || pkg.status === "RECEIVED" || pkg.status === "DELIVERING_TO_SHOP" || pkg.status === "IN_SHOP",
    },
    {
      icon: "/images/customs_hex_icon.png",
      label: `${pkg.customs ?? 0}﷼ جمرك`,
      active: !!pkg.customs && pkg.customs > 0,
    },
    {
      icon: "/images/delivery_hex_icon.png",
      label: "قيد التوصيل",
      active: pkg.status === "DELIVERING_TO_SHOP" || pkg.status === "IN_SHOP" || pkg.status === "RECEIVED",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Title and underline */}
        <h1 className="text-3xl font-bold text-center mb-2">تفاصيل الطرد</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
        {/* Top Row: Icon | Vertical Line | Info (perfectly centered) */}
        <div className="flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 mb-8 gap-4 mx-auto w-full sm:w-fit">
          {/* Right: Package Icon */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center mb-4 sm:mb-0">
            <img src="/images/package_icon.png" alt="Package Icon" className="w-16 sm:w-20 h-16 sm:h-20" />
          </div>
          {/* Middle: Vertical Line - Hidden on mobile */}
          <div className="hidden sm:block h-24 w-px bg-black mx-4" />
          {/* Left: Info */}
          <div className="flex flex-col items-center sm:items-start justify-center">
            <div className="flex flex-col sm:flex-row items-center text-lg sm:text-xl font-bold mb-1">
              <div className="flex flex-col sm:flex-row items-center">
                <span>طرد</span>
                <span className="hidden sm:inline mx-2">|</span>
                <span className="sm:hidden w-full h-[1px] bg-black my-1"></span>
              </div>
              <span className="font-mono text-sm sm:text-base break-all text-center sm:text-left">{pkg.trackingNumber}</span>
            </div>
            <div className="text-black font-mono text-sm sm:text-base mt-2 flex items-center gap-2">
              <span>{new Date(pkg.createdAt).toLocaleDateString('en-GB')}</span>
              <img src="/images/calendar_icon.png" alt="Calendar Icon" className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
          </div>
        </div>
        {/* Green Divider */}
        <div className="w-full h-0.5 bg-green-500 mb-8" />
        {/* Status Row: Truck | Receipt | Price Tag (aligned bottoms) */}
        <div className="flex flex-row items-end justify-between mb-8 gap-1 sm:gap-4">
          {/* Right: Truck Icon + Status */}
          <div className="flex flex-col items-center justify-end flex-1 min-w-[80px]">
            <img src="/images/truck_icon.png" alt="Truck Icon" className="w-8 sm:w-16 h-8 sm:h-16 mb-1 sm:mb-2" />
            <div className="text-black text-[10px] sm:text-lg font-bold mt-1 text-center whitespace-nowrap">{getStatusText(pkg.status)}</div>
          </div>
          {/* Middle: Receipt Icon + Customs Payment */}
          <div className="flex flex-col items-center justify-end flex-1 min-w-[80px]">
            <img src="/images/receipt_icon.png" alt="Receipt Icon" className="w-8 sm:w-16 h-8 sm:h-16 mb-1 sm:mb-2" />
            <div className="text-black text-[10px] sm:text-lg font-bold mt-1 text-center whitespace-nowrap">{(pkg.customs_payment ?? 0).toFixed(2)}₪ جمرك</div>
          </div>
          {/* Left: Price Tag Hexagon Icon */}
          <div className="flex flex-col items-center justify-end flex-1 min-w-[80px]">
            <img src="/images/price_tag_hexagon.png" alt="Price Tag Hexagon" className="w-8 sm:w-16 h-8 sm:h-16 mb-1 sm:mb-2" />
            <div className="text-black text-[10px] sm:text-lg font-bold mt-1 text-center whitespace-nowrap">{(pkg.customs ?? 0).toFixed(2)}₪</div>
          </div>
        </div>
        {/* Green Divider */}
        <div className="w-full h-0.5 bg-green-500 mb-8" />
        {/* Shop Section: Market Icon, Dropdown, Save Button */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/images/market_icon.png" alt="Market Icon" className="w-20 h-20 mb-4" />
          <div className="w-full max-w-xs">
            <select
              className="w-full p-2 border rounded text-right mb-2"
              value={shopEdit}
              onChange={e => setShopEdit(e.target.value)}
              disabled={savingShop}
            >
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.fullName}</option>
              ))}
            </select>
            <Button
              className={`w-full ${
                savingShop || shopEdit === pkg.shopId
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
              onClick={handleShopChange}
              disabled={savingShop || shopEdit === pkg.shopId}
            >
              {savingShop ? "...جارٍ الحفظ" : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 