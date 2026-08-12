import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  QRCodeSVG,
} from "qrcode.react";

import {
  orderService,
} from "../../services/orderService";

import type {
  Order,
} from "../../types/order";



// =========================================
// RESTAURANT UPI
// =========================================

const RESTAURANT_UPI_ID =
  "Q119977566@ybl";

const RESTAURANT_NAME =
  "REDDY'S KITCHEN";



// =========================================
// TRACK ORDER PAGE
// =========================================

function TrackOrderPage() {

  const {
    orderId,
  } = useParams();

  const navigate =
    useNavigate();


  const [
    order,
    setOrder,
  ] = useState<Order | null>(null);


  const [
    upiError,
    setUpiError,
  ] = useState("");


  const [
    showQR,
    setShowQR,
  ] = useState(false);



  // =========================================
  // TRACKING
  // =========================================

  const previousTrackingStatusRef =
    useRef<string | null>(null);



  // =========================================
  // READY SOUND
  // =========================================

  const notificationAudioRef =
    useRef<HTMLAudioElement | null>(
      null
    );


  const playReadySound = () => {

    if (
      !notificationAudioRef.current
    ) {

      notificationAudioRef.current =
        new Audio(
          "/sounds/order-received.mp3"
        );


      notificationAudioRef.current.volume =
        1;


      notificationAudioRef.current.loop =
        false;

    }


    const audio =
      notificationAudioRef.current;


    audio.currentTime =
      0;


    audio.play().catch(
      (error) => {

        console.log(
          "Ready notification sound could not play:",
          error
        );

      }
    );

  };


  const stopReadySound = () => {

    if (
      !notificationAudioRef.current
    ) {

      return;

    }


    notificationAudioRef.current.pause();


    notificationAudioRef.current.currentTime =
      0;

  };



  // =========================================
  // LIVE ORDER
  // =========================================

  useEffect(() => {

    if (!orderId) {

      return;

    }


    previousTrackingStatusRef.current =
      null;


    const unsubscribe =
      orderService.subscribeToOrder(
        orderId,
        (data) => {

          setOrder(data);

        }
      );


    return () =>
      unsubscribe();

  }, [orderId]);



  // =========================================
  // IMPORTANT
  // =========================================
  //
  // DO NOT REMOVE THE ACTIVE ORDER WHEN THE
  // KITCHEN MARKS IT COMPLETED.
  //
  // The customer must still be able to return
  // to the order from the Menu page.
  //
  // The active order remains available after:
  //
  // Pending
  // Preparing
  // Ready
  // Completed
  //
  // The Menu page will continue to show:
  //
  // "View Current Order"
  //
  // =========================================



  // =========================================
  // CLEAR ACTIVE ORDER AFTER PAYMENT
  // =========================================
  //
  // Completed by kitchen alone does NOT clear
  // the active order.
  //
  // Only Completed + Paid clears it, so the
  // Menu page keeps "View Current Order" while
  // payment is still pending.
  //
  // =========================================

  useEffect(() => {

    if (!order) {

      return;

    }


    if (
      order.status === "Completed" &&
      order.paymentStatus === "Paid"
    ) {

      localStorage.removeItem(
        "activeOrderId"
      );


      localStorage.removeItem(
        `activeOrderId_table_${order.table}`
      );

    }

  }, [
    order,
  ]);



  // =========================================
  // TRACKING STATUS
  // =========================================

  const trackingStatus =
    !order

      ? null

      : order.status ===
        "Completed"

        ? "Completed"

        : order.batches &&
          order.batches.length > 0

          ? order.batches.some(
              (batch) =>
                batch.status ===
                "Pending"
            )

            ? "Pending"

            : order.batches.some(
                (batch) =>
                  batch.status ===
                  "Preparing"
              )

              ? "Preparing"

              : "Ready"

          : order.status;



  // =========================================
  // READY NOTIFICATION
  // =========================================

  useEffect(() => {

    if (!trackingStatus) {

      return;

    }


    if (
      previousTrackingStatusRef.current !==
        null &&

      previousTrackingStatusRef.current !==
        "Ready" &&

      trackingStatus ===
        "Ready"
    ) {

      playReadySound();

    }


    previousTrackingStatusRef.current =
      trackingStatus;

  }, [trackingStatus]);



  // =========================================
  // STOP AUDIO
  // =========================================

  useEffect(() => {

    return () => {

      stopReadySound();

    };

  }, []);



  // =========================================
  // UPI PAYMENT DATA
  // =========================================

  const getUPIPaymentUrl = () => {

    if (!order) {

      return "";

    }


    const amount =
      Number(order.total);


    const transactionNote =
      `REDDY'S KITCHEN - Table ${order.table} - Order ${order.id}`;


    return (
      `upi://pay` +

      `?pa=${encodeURIComponent(
        RESTAURANT_UPI_ID
      )}` +

      `&pn=${encodeURIComponent(
        RESTAURANT_NAME
      )}` +

      `&am=${encodeURIComponent(
        amount.toFixed(2)
      )}` +

      `&cu=INR` +

      `&tn=${encodeURIComponent(
        transactionNote
      )}`
    );

  };



  // =========================================
  // GOOGLE PAY
  // =========================================

  const handleGooglePay = () => {

    if (!order) {

      return;

    }


    setUpiError("");


    const amount =
      Number(order.total);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      setUpiError(
        "Invalid payment amount."
      );

      return;

    }


    const transactionNote =
      `REDDY'S KITCHEN - Table ${order.table}`;


    const url =
      `gpay://upi/pay` +

      `?pa=${encodeURIComponent(
        RESTAURANT_UPI_ID
      )}` +

      `&pn=${encodeURIComponent(
        RESTAURANT_NAME
      )}` +

      `&am=${encodeURIComponent(
        amount.toFixed(2)
      )}` +

      `&cu=INR` +

      `&tn=${encodeURIComponent(
        transactionNote
      )}`;


    window.location.href =
      url;

  };



  // =========================================
  // PHONEPE
  // =========================================

  const handlePhonePe = () => {

    if (!order) {

      return;

    }


    setUpiError("");


    const amount =
      Number(order.total);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      setUpiError(
        "Invalid payment amount."
      );

      return;

    }


    const transactionNote =
      `REDDY'S KITCHEN - Table ${order.table}`;


    const url =
      `phonepe://pay` +

      `?pa=${encodeURIComponent(
        RESTAURANT_UPI_ID
      )}` +

      `&pn=${encodeURIComponent(
        RESTAURANT_NAME
      )}` +

      `&am=${encodeURIComponent(
        amount.toFixed(2)
      )}` +

      `&cu=INR` +

      `&tn=${encodeURIComponent(
        transactionNote
      )}`;


    window.location.href =
      url;

  };



  // =========================================
  // PAYTM
  // =========================================

  const handlePaytm = () => {

    if (!order) {

      return;

    }


    setUpiError("");


    const amount =
      Number(order.total);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      setUpiError(
        "Invalid payment amount."
      );

      return;

    }


    const transactionNote =
      `REDDY'S KITCHEN - Table ${order.table}`;


    const url =
      `paytmmp://pay` +

      `?pa=${encodeURIComponent(
        RESTAURANT_UPI_ID
      )}` +

      `&pn=${encodeURIComponent(
        RESTAURANT_NAME
      )}` +

      `&am=${encodeURIComponent(
        amount.toFixed(2)
      )}` +

      `&cu=INR` +

      `&tn=${encodeURIComponent(
        transactionNote
      )}`;


    window.location.href =
      url;

  };



  // =========================================
  // SHOW QR
  // =========================================

  const handleShowQR = () => {

    if (!order) {

      return;

    }


    setUpiError("");


    setShowQR(true);

  };



  // =========================================
  // UPI QR VALUE
  // =========================================

  const upiQRValue =
    order
      ? getUPIPaymentUrl()
      : "";



  // =========================================
  // LOADING
  // =========================================

  if (!order) {

    return (

      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-5">
            🍳
          </div>


          <h1 className="text-2xl font-bold">
            Loading Order...
          </h1>


          <p className="text-gray-500 mt-2">
            Please wait while we find your order.
          </p>

        </div>

      </div>

    );

  }



  // =========================================
  // STATUS COLOR
  // =========================================

  const getColor = () => {

    switch (
      trackingStatus
    ) {

      case "Pending":
        return "text-yellow-400";

      case "Preparing":
        return "text-blue-400";

      case "Ready":
        return "text-green-400";

      case "Completed":
        return "text-gray-400";

      default:
        return "text-white";

    }

  };



  // =========================================
  // PAYMENT PENDING
  // =========================================

  const paymentPending =
    order.status ===
      "Completed" &&

    order.paymentStatus !==
      "Paid";



  // =========================================
  // UI
  // =========================================

  return (

    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-5 py-10">


      {/* HEADER */}

      <h1 className="text-5xl font-bold text-red-600 text-center">
        REDDY'S KITCHEN
      </h1>


      <p className="text-gray-400 mt-3 text-center">
        Live Order Tracking
      </p>



      {/* ORDER CARD */}

      <div className="bg-zinc-900 rounded-3xl mt-10 p-8 w-full max-w-2xl border border-zinc-800">


        {/* TABLE */}

        <h2 className="text-3xl font-bold">
          Table {order.table}
        </h2>


        {/* CUSTOMER */}

        <p className="mt-4 text-xl">

          Customer:{" "}

          <span className="text-yellow-400">
            {order.customerName}
          </span>

        </p>



        {/* CURRENT STATUS */}

        <div className="mt-10">

          <h3 className="text-xl text-gray-400">
            Current Status
          </h3>


          <h1
            className={`text-6xl font-bold mt-3 ${getColor()}`}
          >
            {trackingStatus}
          </h1>

        </div>



        {/* PAYMENT PENDING */}

        {paymentPending && (

          <div className="mt-8 bg-yellow-950/30 border border-yellow-700 rounded-xl p-5">

            <p className="text-yellow-400 text-xl font-bold">
              💳 Payment Pending
            </p>


            <p className="text-gray-400 mt-2">
              Your order has been served.
              Please complete your payment.
            </p>


            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">


              {/* Google Pay */}

              <button
                type="button"
                onClick={
                  handleGooglePay
                }
                className="bg-white text-black hover:bg-gray-200 active:bg-gray-300 px-4 py-3 rounded-xl font-bold transition"
              >
                🟢 Google Pay
              </button>



              {/* PhonePe */}

              <button
                type="button"
                onClick={
                  handlePhonePe
                }
                className="bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white px-4 py-3 rounded-xl font-bold transition"
              >
                🟣 PhonePe
              </button>



              {/* Paytm */}

              <button
                type="button"
                onClick={
                  handlePaytm
                }
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-3 rounded-xl font-bold transition"
              >
                🔵 Paytm
              </button>



              {/* QR */}

              <button
                type="button"
                onClick={
                  handleShowQR
                }
                className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 text-white px-4 py-3 rounded-xl font-bold transition"
              >
                📷 Scan UPI QR
              </button>

            </div>



            {/* QR CODE */}

            {showQR && (

              <div className="mt-6 bg-white rounded-2xl p-6 text-center">

                <p className="text-zinc-900 font-bold text-xl">
                  Scan to Pay
                </p>


                <p className="text-zinc-600 text-sm mt-1">
                  ₹{order.total}
                </p>


                <div className="mt-5 flex justify-center">

                  <QRCodeSVG
                    value={
                      upiQRValue
                    }
                    size={240}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                    includeMargin
                  />

                </div>


                <p className="text-zinc-500 text-xs mt-4 break-all">
                  {RESTAURANT_UPI_ID}
                </p>


                <p className="text-zinc-500 text-xs mt-2">
                  Scan this QR with any supported UPI app.
                </p>

              </div>

            )}



            {/* CASH */}

            <div className="mt-4">

              <div className="inline-flex bg-green-600/20 border border-green-700 text-green-400 px-4 py-2 rounded-xl font-semibold">
                💵 Cash available at counter
              </div>

            </div>



            {/* ERROR */}

            {upiError && (

              <div className="mt-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl p-3 text-sm">
                {upiError}
              </div>

            )}



            {/* AMOUNT */}

            <div className="mt-5">

              <p className="text-sm text-gray-500">
                Amount Due
              </p>


              <p className="text-3xl font-bold text-yellow-400">
                ₹{order.total}
              </p>

            </div>

          </div>

        )}



        {/* PAYMENT COMPLETED */}

        {order.paymentStatus ===
          "Paid" && (

          <div className="mt-8 bg-green-900/30 border border-green-700 rounded-xl p-5">

            <p className="text-green-400 text-xl font-bold">
              ✅ Payment Completed
            </p>


            <p className="text-gray-400 mt-2">
              Payment received successfully.
            </p>


            {order.paymentMethod && (

              <p className="text-sm text-gray-500 mt-2">

                Payment method:{" "}

                <span className="text-white font-semibold">
                  {order.paymentMethod}
                </span>

              </p>

            )}

          </div>

        )}



        {/* STATUS PROGRESS */}

        <div className="mt-8">


          {/* Status labels */}

          <div className="grid grid-cols-4 gap-2">


            {/* Pending */}

            <div className="text-center">

              <p
                className={`text-xs sm:text-sm font-bold ${
                  trackingStatus ===
                    "Pending" ||
                  trackingStatus ===
                    "Preparing" ||
                  trackingStatus ===
                    "Ready" ||
                  trackingStatus ===
                    "Completed"

                    ? "text-yellow-400"

                    : "text-gray-600"
                }`}
              >
                Pending
              </p>

            </div>



            {/* Preparing */}

            <div className="text-center">

              <p
                className={`text-xs sm:text-sm font-bold ${
                  trackingStatus ===
                    "Preparing" ||
                  trackingStatus ===
                    "Ready" ||
                  trackingStatus ===
                    "Completed"

                    ? "text-blue-400"

                    : "text-gray-600"
                }`}
              >
                Preparing
              </p>

            </div>



            {/* Ready */}

            <div className="text-center">

              <p
                className={`text-xs sm:text-sm font-bold ${
                  trackingStatus ===
                    "Ready" ||
                  trackingStatus ===
                    "Completed"

                    ? "text-green-400"

                    : "text-gray-600"
                }`}
              >
                Ready
              </p>

            </div>



            {/* Completed */}

            <div className="text-center">

              <p
                className={`text-xs sm:text-sm font-bold ${
                  trackingStatus ===
                    "Completed"

                    ? "text-gray-300"

                    : "text-gray-600"
                }`}
              >
                Completed
              </p>

            </div>

          </div>



          {/* Progressive Bar */}

          <div className="relative mt-3 px-[8%]">

            <div className="h-2 bg-zinc-800 rounded-full w-full" />


            <div
              className="absolute left-[8%] top-0 h-2 rounded-full transition-all duration-700"
              style={{
                width:
                  trackingStatus ===
                    "Pending"

                    ? "0%"

                    : trackingStatus ===
                      "Preparing"

                      ? "28%"

                      : trackingStatus ===
                        "Ready"

                        ? "62%"

                        : trackingStatus ===
                          "Completed"

                          ? "84%"

                          : "0%",
              }}
            />



            {/* Progress dots */}

            <div className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 flex justify-between">

              <div
                className={`w-4 h-4 rounded-full border-2 border-zinc-950 transition-all duration-500 ${
                  trackingStatus ===
                    "Pending" ||
                  trackingStatus ===
                    "Preparing" ||
                  trackingStatus ===
                    "Ready" ||
                  trackingStatus ===
                    "Completed"

                    ? "bg-yellow-400"

                    : "bg-zinc-700"
                }`}
              />


              <div
                className={`w-4 h-4 rounded-full border-2 border-zinc-950 transition-all duration-500 ${
                  trackingStatus ===
                    "Preparing" ||
                  trackingStatus ===
                    "Ready" ||
                  trackingStatus ===
                    "Completed"

                    ? "bg-blue-400"

                    : "bg-zinc-700"
                }`}
              />


              <div
                className={`w-4 h-4 rounded-full border-2 border-zinc-950 transition-all duration-500 ${
                  trackingStatus ===
                    "Ready" ||
                  trackingStatus ===
                    "Completed"

                    ? "bg-green-400"

                    : "bg-zinc-700"
                }`}
              />


              <div
                className={`w-4 h-4 rounded-full border-2 border-zinc-950 transition-all duration-500 ${
                  trackingStatus ===
                    "Completed"

                    ? "bg-gray-300"

                    : "bg-zinc-700"
                }`}
              />

            </div>

          </div>

        </div>



        {/* ORDERED ITEMS */}

        <div className="mt-10">

          <h3 className="text-2xl font-bold mb-5">
            Ordered Items
          </h3>


          <div className="space-y-3">

            {order.items.map(
              (item) => (

                <div
                  key={item.id}
                  className="flex justify-between py-2 border-b border-zinc-800"
                >

                  <span>
                    {item.name} ×{" "}
                    {item.quantity}
                  </span>


                  <span>
                    ₹
                    {item.price *
                      item.quantity}
                  </span>

                </div>

              )
            )}

          </div>

        </div>



        {/* TOTAL */}

        <div className="border-t border-zinc-700 mt-8 pt-6 flex justify-between">

          <span className="text-2xl font-bold">
            Total
          </span>


          <span className="text-2xl font-bold text-yellow-400">
            ₹{order.total}
          </span>

        </div>



        {/* COMPLETED MESSAGE */}

        {trackingStatus ===
          "Completed" && (

          <div className="mt-8 bg-green-900/30 border border-green-700 rounded-xl p-5 text-center">

            <p className="text-green-400 text-xl font-bold">
              🎉 Order Completed!
            </p>


            <p className="text-gray-400 mt-2">
              Thank you for dining with
              REDDY'S KITCHEN.
            </p>

          </div>

        )}

      </div>



      {/* BACK HOME */}

      <button
        type="button"
        onClick={() =>
          navigate("/")
        }
        className="mt-10 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold transition"
      >
        Back Home
      </button>

    </div>

  );
}


export default TrackOrderPage;