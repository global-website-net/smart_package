"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Shop {
  id: string;
  fullName: string;
  email: string;
}

interface Order {
  id: string;
  userId: string;
  purchaseSite: string;
  purchaseLink: string;
  phoneNumber: string;
  notes: string | null;
  additionalInfo: string | null;
  status: string;
  totalAmount: number;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  shopId?: string;
  Shop?: Shop;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
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
    if (!params?.id) return;
    setLoading(true);
    setErrorMsg(null);
    fetch(`/api/orders/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
          setOrder(null);
        } else {
          setOrder({
            ...data,
            Shop: data.Shop || { fullName: "غير محدد", email: "" },
          });
          setShopEdit(data.shopId || "");
        }
      })
      .catch(err => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [params]);

  const fetchShops = async () => {
    const response = await fetch("/api/users/shops");
    if (!response.ok) return;
    const data = await response.json();
    setShops(data);
  };

  const handleShopChange = async () => {
    if (!order) return;
    setSavingShop(true);
    const response = await fetch("/api/orders/update-shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, newShopId: shopEdit }),
    });
    if (!response.ok) {
      toast.error("فشل تحديث المتجر");
      setSavingShop(false);
      return;
    }
    const selectedShop = shops.find((s) => s.id === shopEdit);
    setOrder({ ...order, shopId: shopEdit, Shop: selectedShop || order.Shop });
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-600 font-bold">{errorMsg || 'تعذر جلب بيانات الطلب'}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dynamic status/progress logic (example, adjust as needed)
  const progressSteps = [
    {
      icon: "/images/payment_hex_icon.png",
      label: "تم الدفع",
      active: order.status === "ORDER_COMPLETED" || order.status === "DELIVERED",
    },
    {
      icon: "/images/delivery_hex_icon.png",
      label: "قيد التوصيل",
      active: order.status === "IN_TRANSIT" || order.status === "DELIVERED",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10 mt-[70px]">
        {/* Title and underline */}
        <h1 className="text-3xl font-bold text-center mb-2 mt-0">تفاصيل الطلب</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
        {/* Card with order info */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex-1 flex flex-col gap-2 items-start md:items-end">
            <div className="flex items-center text-lg font-bold">
              <span>طلبية</span>
              <span className="mx-2">|</span>
              <span className="ltr:font-mono rtl:font-mono">#{order.orderNumber}</span>
            </div>
            <div className="text-gray-700 font-mono">{order.purchaseSite}</div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Image src="/images/calendar_icon.png" alt="تاريخ الإنشاء" width={20} height={20} />
              <span>{new Date(order.createdAt).toLocaleDateString("en-US")}</span>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <Image src="/images/shopping_bag_icon.png" alt="Order Icon" width={100} height={100} />
          </div>
        </div>
        {/* Progress/status section */}
        <div className="flex flex-row justify-between items-center mb-8 px-2">
          {progressSteps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <Image src={step.icon} alt={step.label} width={56} height={56} className={step.active ? "opacity-100" : "opacity-30"} />
              <div className={`mt-2 text-center text-base font-bold ${step.active ? "text-black" : "text-gray-400"}`}>{step.label}</div>
            </div>
          ))}
        </div>
        {/* Shop info and selection */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/images/shop_icon.png" alt="Shop Icon" width={60} height={60} />
          <div className="mt-2 text-lg font-bold">{order.Shop?.fullName || "غير محدد"}</div>
          <div className="mt-4 w-full max-w-xs">
            <label className="block mb-2 text-sm font-medium text-gray-700">اختيار المتجر</label>
            <select
              className="w-full p-2 border rounded text-right"
              value={shopEdit}
              onChange={e => setShopEdit(e.target.value)}
              disabled={savingShop}
            >
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.fullName}</option>
              ))}
            </select>
            <Button
              className="mt-2 w-full"
              onClick={handleShopChange}
              disabled={savingShop || shopEdit === order.shopId}
            >
              {savingShop ? "...جارٍ الحفظ" : "حفظ المتجر"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 