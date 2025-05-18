"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PaymentModal from "@/app/components/PaymentModal";

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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

  const handlePaymentClick = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    if (order) {
      setOrder({ ...order, status: 'ORDERING' });
    }
    setIsPaymentModalOpen(false);
  };

  // Status text mapping
  function getOrderStatusText(status: string) {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'في انتظار الدفع';
      case 'PENDING_APPROVAL':
        return 'في انتظار الموافقة';
      case 'ORDERING':
        return 'قيد الطلب';
      case 'ORDER_COMPLETED':
        return 'تم الطلب';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10 mt-[70px]">
        {/* Title and underline */}
        <h1 className="text-3xl font-bold text-center mb-2 mt-0">تفاصيل الطلب</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
        {/* Top Row: Icon | Vertical Line | Info (centered) */}
        <div className="flex flex-row items-center justify-center p-6 mb-8 gap-4 mx-auto w-fit">
          {/* Right: Order Icon */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <img src="/images/shopping_bag_icon.png" alt="Order Icon" className="w-20 h-20" />
          </div>
          {/* Middle: Vertical Line */}
          <div className="h-24 w-px bg-black mx-4" />
          {/* Left: Info */}
          <div className="flex flex-col items-start justify-center flex-1">
            <div className="flex items-center text-xl font-bold mb-1">
              <span>طلبية</span>
              <span className="mx-2">|</span>
              <span className="font-mono">{order.orderNumber}</span>
            </div>
            <div className="text-black font-mono text-base mt-2 flex items-center gap-2">
              <span>{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
              <img src="/images/calendar_icon.png" alt="Calendar Icon" className="w-5 h-5" />
            </div>
          </div>
        </div>
        {/* Green Divider */}
        <div className="w-full h-0.5 bg-green-500 mb-8" />
        {/* Status Row: Shopping Bag | Delivery | Payment */}
        <div className="flex flex-row items-end justify-between mb-2 gap-4">
          {/* Right: Truck Icon + Status */}
          <div className="flex flex-col items-center justify-end flex-1">
            <img src="/images/truck_icon.png" alt="Truck Icon" className="w-16 h-16 mb-2" />
            <div className="text-black text-lg font-bold mt-1">{getOrderStatusText(order.status)}</div>
          </div>
          {/* Middle: Market Icon above Shop Name */}
          <div className="flex flex-col items-center justify-end flex-1">
            <img src="/images/market_icon.png" alt="Market Icon" className="w-16 h-16 mb-2" />
            <div className="text-black text-lg font-bold mt-1">{order.purchaseSite}</div>
          </div>
          {/* Left: Price Tag Hexagon above Payment Icon and Amount */}
          <div className="flex flex-col items-center justify-end flex-1">
            <img src="/images/price_tag_hexagon.png" alt="Price Tag Hexagon" className="w-16 h-16 mb-2" />
            <div className="text-black text-lg font-bold mt-1">{order.totalAmount.toFixed(2)}₪</div>
          </div>
        </div>
        {/* Pay Button Row: only show if status is AWAITING_PAYMENT */}
        {order.status === 'AWAITING_PAYMENT' && (
          <div className="flex justify-end mb-8">
            <div className="flex-1 flex justify-center">
              <button
                className="mt-2 px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition"
                onClick={handlePaymentClick}
              >
                دفع
              </button>
            </div>
          </div>
        )}
      </main>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderId={order?.id ?? ''}
        amount={order?.totalAmount ?? 0}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
} 