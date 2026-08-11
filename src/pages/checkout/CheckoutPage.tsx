import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useCartStore,
} from "../../store/cartStore";

import {
  useTableStore,
} from "../../store/tableStore";

import {
  orderService,
} from "../../services/orderService";

import {
  auth,
  ensureCustomerAuth,
} from "../../services/firebase";

import type {
  Order,
  OrderItem,
} from "../../types/order";


function CheckoutPage() {

  const navigate =
    useNavigate();


  const {
    items,
    clearCart,
  } =
    useCartStore();


  const {
    table,
    tableSessionId,
  } =
    useTableStore();


  const [
    customerName,
    setCustomerName,
  ] =
    useState("");


  const [
    phone,
    setPhone,
  ] =
    useState("");


  const [
    instructions,
    setInstructions,
  ] =
    useState("");


  const [
    placingOrder,
    setPlacingOrder,
  ] =
    useState(false);


  // =========================================
  // TOTAL
  // =========================================

  const total =
    useMemo(() => {

      return items.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.price *
            item.quantity,

        0
      );

    }, [items]);


  // =========================================
  // PLACE ORDER
  // =========================================

  const placeOrder =
    async () => {

      if (
        items.length === 0
      ) {

        alert(
          "Your cart is empty."
        );

        return;

      }


      if (
        !customerName.trim()
      ) {

        alert(
          "Please enter your name."
        );

        return;

      }


      if (
        placingOrder
      ) {

        return;

      }


      setPlacingOrder(
        true
      );


      try {

        // =====================================
        // ENSURE CUSTOMER AUTHENTICATION
        // =====================================

        await ensureCustomerAuth();


        // =====================================
        // GET THE CURRENT AUTHENTICATED USER
        // =====================================

        const currentUser =
          auth.currentUser;


        if (
          !currentUser
        ) {

          throw new Error(
            "Customer session could not be found. Please reload the menu."
          );

        }


        // =====================================
        // CUSTOMER MUST BE ANONYMOUS
        // =====================================

        if (
          !currentUser.isAnonymous
        ) {

          throw new Error(
            "Invalid customer session. Please reload the menu."
          );

        }


        // =====================================
        // THIS IS THE ONLY UID USED FOR ORDER
        // =====================================

        const customerUid =
          currentUser.uid;


        console.log(
          "CURRENT CUSTOMER UID:",
          customerUid
        );


        console.log(
          "AUTH ANONYMOUS:",
          currentUser.isAnonymous
        );


        // =====================================
        // CREATE ORDER ITEMS
        // =====================================

        const orderItems:
          OrderItem[] =
          items.map(
            (item) => ({

              id:
                String(item.id),

              name:
                item.name,

              price:
                item.price,

              quantity:
                item.quantity,

            })
          );


        // =====================================
        // CREATE BATCH
        // =====================================

        const createdAt =
          new Date()
            .toISOString();


        const batch = {

          id:
            `${Date.now()}-batch-1`,

          items:
            orderItems,

          status:
            "Pending" as const,

          createdAt,

        };


        // =====================================
        // CREATE ORDER
        // =====================================

        const order:
          Order = {

          id:
            Date.now().toString(),

          table,

          tableSessionId,

          customerUid,

          customerName:
            customerName.trim(),

          phone:
            phone.trim(),

          instructions:
            instructions.trim(),

          items:
            orderItems,

          batches:
            [batch],

          total,

          status:
            "Pending",

          paymentStatus:
            "Unpaid",

          paymentMethod:
            null,

          paidAt:
            null,

          createdAt,

        };


        // =====================================
        // FINAL DEBUG
        // =====================================

        console.log(
          "PLACING ORDER CUSTOMER UID:",
          order.customerUid
        );


        console.log(
          "CURRENT FIREBASE UID:",
          auth.currentUser?.uid
        );


        // =====================================
        // SAFETY CHECK
        // =====================================

        if (
          order.customerUid !==
          auth.currentUser?.uid
        ) {

          throw new Error(
            "Customer authentication changed while placing the order. Please try again."
          );

        }


        // =====================================
        // PLACE ORDER
        // =====================================

        const orderId =
          await orderService.placeOrder(
            order
          );


        // =====================================
        // SAVE ACTIVE ORDER
        // =====================================

        localStorage.setItem(
          "activeOrderId",
          orderId
        );


        localStorage.setItem(
          `activeOrderId_table_${table}`,
          orderId
        );


        // =====================================
        // CLEAR CART
        // =====================================

        clearCart();


        // =====================================
        // OPEN TRACKING
        // =====================================

        navigate(
          `/track/${orderId}`,
          {
            replace: true,
          }
        );


      } catch (
        error
      ) {

        console.error(
          "Firebase Error:",
          error
        );


        if (
          error instanceof Error
        ) {

          alert(
            error.message
          );

        } else {

          alert(
            "Unable to place your order. Please try again."
          );

        }

      } finally {

        setPlacingOrder(
          false
        );

      }

    };


  // =========================================
  // UI
  // =========================================

  return (

    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-3xl mx-auto">

        <button
          type="button"
          onClick={() =>
            navigate("/cart")
          }
          className="text-red-500 hover:text-red-400 mb-6"
        >
          ← Back to Cart
        </button>


        <h1 className="text-4xl font-bold text-red-600">
          Checkout
        </h1>


        <p className="mt-2 text-gray-400">
          Table {table}
        </p>


        {/* CUSTOMER DETAILS */}

        <div className="mt-8 space-y-5">

          <div>

            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Customer Name
            </label>


            <input
              type="text"
              placeholder="Enter your name"
              value={
                customerName
              }
              onChange={(event) =>
                setCustomerName(
                  event.target.value
                )
              }
              disabled={
                placingOrder
              }
              className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500"
            />

          </div>


          <div>

            <label className="block text-sm font-semibold text-gray-300 mb-2">

              Phone Number

              <span className="text-gray-500 ml-2">
                Optional
              </span>

            </label>


            <input
              type="tel"
              placeholder="Enter phone number"
              value={
                phone
              }
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              disabled={
                placingOrder
              }
              className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500"
            />

          </div>


          <div>

            <label className="block text-sm font-semibold text-gray-300 mb-2">

              Special Instructions

              <span className="text-gray-500 ml-2">
                Optional
              </span>

            </label>


            <textarea
              rows={4}
              placeholder="Any special requests for your order?"
              value={
                instructions
              }
              onChange={(event) =>
                setInstructions(
                  event.target.value
                )
              }
              disabled={
                placingOrder
              }
              className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500 resize-none"
            />

          </div>

        </div>


        {/* ORDER SUMMARY */}

        <div className="mt-10 bg-zinc-900 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            Order Summary
          </h2>


          {items.length === 0 ? (

            <p className="text-gray-400">
              Your cart is empty.
            </p>

          ) : (

            <>

              {items.map(
                (item) => (

                  <div
                    key={
                      item.id
                    }
                    className="flex justify-between py-2"
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


              <div className="border-t border-zinc-700 mt-6 pt-6 flex justify-between text-2xl font-bold">

                <span>
                  Total
                </span>


                <span className="text-yellow-400">
                  ₹{total}
                </span>

              </div>

            </>

          )}

        </div>


        {/* PLACE ORDER */}

        <button
          type="button"
          onClick={
            placeOrder
          }
          disabled={
            items.length === 0 ||
            placingOrder
          }
          className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-xl text-xl font-bold transition"
        >

          {placingOrder
            ? "Placing Order..."
            : "Place Order"}

        </button>


        <p className="text-center text-gray-500 text-sm mt-4">
          Payment will be handled after your order is served.
        </p>

      </div>

    </div>

  );

}


export default CheckoutPage;