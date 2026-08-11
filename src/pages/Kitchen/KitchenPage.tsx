import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Order,
  OrderBatch,
  OrderStatus,
} from "../../types/order";

import {
  kitchenService,
} from "../../services/kitchenService";

import {
  orderService,
} from "../../services/orderService";


function KitchenPage() {

  const [
    orders,
    setOrders,
  ] =
    useState<Order[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const notificationAudioRef =
    useRef<HTMLAudioElement | null>(
      null
    );


  const previousOrdersRef =
    useRef<Order[] | null>(
      null
    );


  // =========================================
  // ORDER SOUND
  // =========================================

  const playOrderSound =
    () => {

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
          true;

      }


      const audio =
        notificationAudioRef.current;


      audio.currentTime =
        0;


      audio.play().catch(
        (error) => {

          console.log(
            "Kitchen notification sound could not play:",
            error
          );

        }
      );

    };


  const stopOrderSound =
    () => {

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
  // FIRESTORE ORDER SUBSCRIPTION
  // =========================================

  useEffect(() => {

    const unsubscribe =
      orderService.subscribeToOrders(
        (items) => {

          const previousOrders =
            previousOrdersRef.current;


          // -----------------------------------
          // INITIAL SNAPSHOT
          // -----------------------------------

          if (
            previousOrders ===
            null
          ) {

            previousOrdersRef.current =
              items;

            setOrders(
              items
            );

            setLoading(
              false
            );

            return;

          }


          // -----------------------------------
          // NEW ORDER
          // -----------------------------------

          const newOrderDetected =
            items.length >
            previousOrders.length;


          // -----------------------------------
          // NEW BATCH
          // -----------------------------------

          const newBatchDetected =
            items.some(
              (newOrder) => {

                const oldOrder =
                  previousOrders.find(
                    (oldOrder) =>
                      oldOrder.id ===
                      newOrder.id
                  );


                if (
                  !oldOrder
                ) {

                  return false;

                }


                const oldBatchCount =
                  oldOrder.batches?.length ??
                  0;


                const newBatchCount =
                  newOrder.batches?.length ??
                  0;


                return (
                  newBatchCount >
                  oldBatchCount
                );

              }
            );


          // -----------------------------------
          // PENDING WORK
          // -----------------------------------

          const hasPendingWork =
            items.some(
              (order) => {

                if (
                  order.batches &&
                  order.batches.length >
                    0
                ) {

                  return order.batches.some(
                    (batch) =>
                      batch.status ===
                      "Pending"
                  );

                }


                return (
                  order.status ===
                  "Pending"
                );

              }
            );


          // -----------------------------------
          // PLAY SOUND
          // -----------------------------------

          if (
            newOrderDetected ||
            newBatchDetected
          ) {

            playOrderSound();

          }


          // -----------------------------------
          // STOP SOUND
          // -----------------------------------

          if (
            !hasPendingWork
          ) {

            stopOrderSound();

          }


          previousOrdersRef.current =
            items;


          setOrders(
            items
          );


          setLoading(
            false
          );

        }
      );


    return () => {

      unsubscribe();

      stopOrderSound();

    };

  }, []);


  // =========================================
  // DASHBOARD STATISTICS
  // =========================================

  const pending =
    orders.filter(
      (order) =>
        order.status ===
        "Pending"
    ).length;


  const preparing =
    orders.filter(
      (order) =>
        order.status ===
        "Preparing"
    ).length;


  const ready =
    orders.filter(
      (order) =>
        order.status ===
        "Ready"
    ).length;


  // =========================================
  // UPDATE BATCH STATUS
  // =========================================

  const handleBatchStatusChange =
    async (
      orderId: string,
      batchId: string,
      status: OrderStatus
    ) => {

      try {

        await kitchenService.updateBatchStatus(
          orderId,
          batchId,
          status
        );


        if (
          status ===
          "Preparing"
        ) {

          stopOrderSound();

        }

      } catch (
        error
      ) {

        console.error(
          error
        );


        alert(
          "Failed to update order batch."
        );

      }

    };


  // =========================================
  // LEGACY ORDER STATUS
  // =========================================

  const handleLegacyStatusChange =
    async (
      orderId: string,
      status: OrderStatus
    ) => {

      try {

        await kitchenService.updateStatus(
          orderId,
          status
        );


        if (
          status ===
          "Preparing"
        ) {

          stopOrderSound();

        }

      } catch (
        error
      ) {

        console.error(
          error
        );


        alert(
          "Failed to update order."
        );

      }

    };


  // =========================================
  // LOADING
  // =========================================

  if (
    loading
  ) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <p className="text-xl text-gray-400">
          Loading Kitchen...
        </p>

      </div>

    );

  }


  // =========================================
  // KITCHEN DASHBOARD
  // =========================================

  return (

    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-4xl font-bold text-red-600 mb-8">
        🍳 Kitchen Dashboard
      </h1>


      {/* ================================= */}
      {/* STATS */}
      {/* ================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">

          <p className="text-gray-400">
            Pending
          </p>

          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {pending}
          </p>

        </div>


        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">

          <p className="text-gray-400">
            Preparing
          </p>

          <p className="text-3xl font-bold text-blue-400 mt-2">
            {preparing}
          </p>

        </div>


        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">

          <p className="text-gray-400">
            Ready
          </p>

          <p className="text-3xl font-bold text-green-400 mt-2">
            {ready}
          </p>

        </div>

      </div>


      {/* ================================= */}
      {/* ORDERS */}
      {/* ================================= */}

      {orders.length ===
      0 ? (

        <div className="text-center mt-20">

          <h2 className="text-3xl text-gray-400">
            No Orders Yet
          </h2>


          <p className="text-gray-500 mt-3">
            Waiting for customers...
          </p>

        </div>

      ) : (

        <div className="space-y-6">

          {orders.map(
            (order) => {

              const batches:
                OrderBatch[] =
                order.batches &&
                order.batches.length >
                  0

                  ? order.batches

                  : [
                      {
                        id:
                          "legacy",

                        items:
                          order.items,

                        status:
                          order.status,

                        createdAt:
                          order.createdAt,

                      },
                    ];


              return (

                <div
                  key={
                    order.id
                  }
                  className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
                >

                  {/* ========================= */}
                  {/* ORDER HEADER */}
                  {/* ========================= */}

                  <div className="flex justify-between items-start">

                    <div>

                      <h2 className="text-2xl font-bold">
                        Table {order.table}
                      </h2>


                      <p className="text-gray-400 mt-1">
                        {order.customerName}
                      </p>


                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(
                          order.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>


                    <span
                      className={`px-4 py-2 rounded-full font-semibold ${
                        order.status ===
                        "Pending"

                          ? "bg-yellow-500 text-black"

                          : order.status ===
                            "Preparing"

                          ? "bg-blue-600 text-white"

                          : order.status ===
                            "Ready"

                          ? "bg-green-600 text-white"

                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {order.status}
                    </span>

                  </div>


                  {/* ========================= */}
                  {/* BATCHES */}
                  {/* ========================= */}

                  <div className="mt-6 space-y-4">

                    {batches.map(
                      (
                        batch,
                        index
                      ) => (

                        <div
                          key={
                            batch.id
                          }
                          className="bg-zinc-800 rounded-xl p-5 border border-zinc-700"
                        >

                          <div className="flex justify-between items-center">

                            <div>

                              <h4 className="text-lg font-bold">
                                Batch {index + 1}
                              </h4>


                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(
                                  batch.createdAt
                                ).toLocaleString()}
                              </p>

                            </div>


                            <span
                              className={`px-4 py-2 rounded-full font-semibold ${
                                batch.status ===
                                "Pending"

                                  ? "bg-yellow-500 text-black"

                                  : batch.status ===
                                    "Preparing"

                                  ? "bg-blue-600 text-white"

                                  : batch.status ===
                                    "Ready"

                                  ? "bg-green-600 text-white"

                                  : "bg-gray-700 text-white"
                              }`}
                            >
                              {batch.status}
                            </span>

                          </div>


                          {/* ITEMS */}

                          <div className="mt-5 space-y-2">

                            {batch.items.map(
                              (item) => (

                                <div
                                  key={
                                    item.id
                                  }
                                  className="flex justify-between"
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


                          {/* ===================== */}
                          {/* KITCHEN ACTIONS */}
                          {/* ===================== */}

                          <div className="flex justify-end mt-5">

                            {batch.status ===
                              "Pending" && (

                              <button
                                type="button"
                                onClick={() => {

                                  if (
                                    batch.id ===
                                    "legacy"
                                  ) {

                                    handleLegacyStatusChange(
                                      order.id,
                                      "Preparing"
                                    );

                                  } else {

                                    handleBatchStatusChange(
                                      order.id,
                                      batch.id,
                                      "Preparing"
                                    );

                                  }

                                }}
                                className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold transition"
                              >
                                Accept
                              </button>

                            )}


                            {batch.status ===
                              "Preparing" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleBatchStatusChange(
                                    order.id,
                                    batch.id,
                                    "Ready"
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold transition"
                              >
                                Ready
                              </button>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>


                  {/* ========================= */}
                  {/* INSTRUCTIONS */}
                  {/* ========================= */}

                  {order.instructions && (

                    <div className="mt-6 bg-zinc-800 rounded-xl p-4">

                      <p className="font-bold">
                        Special Instructions
                      </p>


                      <p className="mt-2 text-gray-300">
                        {order.instructions}
                      </p>

                    </div>

                  )}


                  {/* ========================= */}
                  {/* TOTAL */}
                  {/* ========================= */}

                  <div className="border-t border-zinc-700 mt-6 pt-5 flex justify-between items-center">

                    <span className="text-xl font-bold">
                      Total
                    </span>


                    <span className="text-2xl font-bold text-yellow-400">
                      ₹{order.total}
                    </span>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


export default KitchenPage;