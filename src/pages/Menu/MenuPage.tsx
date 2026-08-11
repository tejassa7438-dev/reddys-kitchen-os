import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  signInAnonymously,
  signOut,
} from "firebase/auth";

import FoodCard from "../../components/menu/FoodCard";
import SearchBar from "../../components/menu/SearchBar";
import CategoryTabs from "../../components/menu/CategoryTabs";
import CartSummary from "../../components/cart/CartSummary";

import { menuService } from "../../services/menuService";
import { orderService } from "../../services/orderService";

import { auth } from "../../services/firebase";

import type { MenuItem } from "../../types/menu";

import { useTableStore } from "../../store/tableStore";


function MenuPage() {

  const navigate =
    useNavigate();


  const [searchParams] =
    useSearchParams();


  // =========================================
  // TABLE MANAGEMENT
  // =========================================

  const table =
    useTableStore(
      (state) =>
        state.table
    );


  const setTable =
    useTableStore(
      (state) =>
        state.setTable
    );


  // =========================================
  // CUSTOMER AUTH STATE
  // =========================================

  const [
    customerAuthReady,
    setCustomerAuthReady,
  ] =
    useState(false);


  const [
    customerAuthError,
    setCustomerAuthError,
  ] =
    useState("");


  // =========================================
  // MENU STATE
  // =========================================

  const [
    items,
    setItems,
  ] =
    useState<MenuItem[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState("All");


  // =========================================
  // ACTIVE ORDER STATE
  // =========================================

  const [
    activeOrderId,
    setActiveOrderId,
  ] =
    useState<string | null>(
      null
    );


  // =========================================
  // CUSTOMER AUTHENTICATION
  // =========================================

  useEffect(() => {

    let cancelled = false;


    const initializeCustomerAuth =
      async () => {

        try {

          setCustomerAuthError(
            ""
          );


          const currentUser =
            auth.currentUser;


          // -----------------------------------
          // Already anonymous customer
          // -----------------------------------

          if (
            currentUser &&
            currentUser.isAnonymous
          ) {

            if (!cancelled) {

              setCustomerAuthReady(
                true
              );

            }

            return;

          }


          // -----------------------------------
          // Staff account is currently signed in
          // -----------------------------------

          if (
            currentUser &&
            !currentUser.isAnonymous
          ) {

            await signOut(
              auth
            );

          }


          // -----------------------------------
          // Create anonymous customer session
          // -----------------------------------

          await signInAnonymously(
            auth
          );


          if (!cancelled) {

            setCustomerAuthReady(
              true
            );

          }

        } catch (
          error
        ) {

          console.error(
            "Customer authentication error:",
            error
          );


          if (!cancelled) {

            setCustomerAuthReady(
              false
            );


            setCustomerAuthError(
              "Unable to start your customer session. Please reload the menu."
            );

          }

        }

      };


    initializeCustomerAuth();


    return () => {

      cancelled = true;

    };

  }, []);


  // =========================================
  // READ TABLE NUMBER FROM URL
  // =========================================

  useEffect(() => {

    const tableParam =
      searchParams.get(
        "table"
      );


    if (!tableParam) {

      return;

    }


    const parsedTable =
      Number(tableParam);


    if (
      Number.isInteger(
        parsedTable
      ) &&
      parsedTable > 0
    ) {

      setTable(
        parsedTable
      );

    }

  }, [
    searchParams,
    setTable,
  ]);


  // =========================================
  // SUBSCRIBE TO MENU
  // =========================================

  useEffect(() => {

    const unsubscribe =
      menuService.subscribe(
        (data) => {

          setItems(
            data
          );


          setLoading(
            false
          );

        }
      );


    return unsubscribe;

  }, []);


  // =========================================
  // ACTIVE ORDER TRACKING
  // =========================================

  useEffect(() => {

    if (
      !customerAuthReady
    ) {

      return;

    }


    if (!table) {

      setActiveOrderId(
        null
      );

      return;

    }


    const storageKey =
      `activeOrderId_table_${table}`;


    const storedOrderId =
      localStorage.getItem(
        storageKey
      );


    // -----------------------------------------
    // No active order
    // -----------------------------------------

    if (!storedOrderId) {

      setActiveOrderId(
        null
      );

      return;

    }


    // -----------------------------------------
    // Show current order immediately
    // -----------------------------------------

    setActiveOrderId(
      storedOrderId
    );


    // -----------------------------------------
    // Listen to Firestore order
    // -----------------------------------------

    const unsubscribe =
      orderService.subscribeToOrder(
        storedOrderId,

        (order) => {

          // -----------------------------------
          // Order no longer exists
          // -----------------------------------

          if (!order) {

            localStorage.removeItem(
              storageKey
            );


            if (
              localStorage.getItem(
                "activeOrderId"
              ) ===
              storedOrderId
            ) {

              localStorage.removeItem(
                "activeOrderId"
              );

            }


            setActiveOrderId(
              null
            );

            return;

          }


          // -----------------------------------
          // ORDER COMPLETED
          // -----------------------------------

          if (
            order.status ===
            "Completed"
          ) {

            localStorage.removeItem(
              storageKey
            );


            if (
              localStorage.getItem(
                "activeOrderId"
              ) ===
              storedOrderId
            ) {

              localStorage.removeItem(
                "activeOrderId"
              );

            }


            setActiveOrderId(
              null
            );

            return;

          }


          // -----------------------------------
          // ORDER STILL ACTIVE
          // -----------------------------------

          setActiveOrderId(
            storedOrderId
          );

        }
      );


    return unsubscribe;

  }, [
    table,
    customerAuthReady,
  ]);


  // =========================================
  // FILTER MENU
  // =========================================

  const filteredItems =
    useMemo(() => {

      return items.filter(
        (item) => {

          const matchesSearch =
            item.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );


          const matchesCategory =
            selectedCategory ===
              "All" ||
            item.category ===
              selectedCategory;


          return (
            matchesSearch &&
            matchesCategory &&
            item.available
          );

        }
      );

    }, [
      items,
      search,
      selectedCategory,
    ]);


  // =========================================
  // CUSTOMER AUTH ERROR
  // =========================================

  if (
    customerAuthError
  ) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

        <div className="text-center max-w-md">

          <div className="text-5xl mb-5">
            🍽️
          </div>


          <h1 className="text-2xl font-bold text-red-500">
            Customer Session Error
          </h1>


          <p className="text-gray-400 mt-3">
            {customerAuthError}
          </p>


          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition"
          >
            Reload Menu
          </button>

        </div>

      </div>

    );

  }


  // =========================================
  // WAIT FOR CUSTOMER AUTH
  // =========================================

  if (
    !customerAuthReady
  ) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-5">
            🍽️
          </div>


          <h1 className="text-3xl font-bold text-red-600">
            Preparing Your Menu...
          </h1>


          <p className="text-gray-400 mt-3">
            Starting your customer session...
          </p>

        </div>

      </div>

    );

  }


  // =========================================
  // LOADING MENU
  // =========================================

  if (loading) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-5">
            🍽
          </div>


          <h1 className="text-3xl font-bold text-red-600">
            Loading Menu...
          </h1>


          <p className="text-gray-400 mt-3">
            Please wait...
          </p>

        </div>

      </div>

    );

  }


  // =========================================
  // MENU PAGE
  // =========================================

  return (

    <div className="min-h-screen bg-black text-white">

      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div className="sticky top-0 z-20 bg-black border-b border-zinc-800">

        <div className="max-w-6xl mx-auto px-5 py-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h1 className="text-4xl font-extrabold text-red-600">
                🍽 REDDY'S KITCHEN
              </h1>


              <p className="text-gray-400 mt-2">
                Fresh • Hygienic • Delicious
              </p>


              <p className="text-sm text-gray-500 mt-1">
                Table {table}
              </p>

            </div>


            {/* ================================= */}
            {/* CURRENT ORDER BUTTON */}
            {/* ================================= */}

            {activeOrderId && (

              <button
                type="button"
                onClick={() => {

                  navigate(
                    `/track/${activeOrderId}`
                  );

                }}
                className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold transition whitespace-nowrap"
              >
                🛒 View Current Order
              </button>

            )}

          </div>

        </div>

      </div>


      {/* =================================== */}
      {/* MAIN CONTENT */}
      {/* =================================== */}

      <div className="max-w-6xl mx-auto px-5 py-6">

        {/* SEARCH */}

        <div className="mt-8">

          <SearchBar
            value={
              search
            }
            onChange={
              setSearch
            }
          />

        </div>


        {/* CATEGORIES */}

        <div className="mt-6">

          <CategoryTabs
            selected={
              selectedCategory
            }
            onSelect={
              setSelectedCategory
            }
          />

        </div>


        {/* ================================= */}
        {/* MENU ITEMS */}
        {/* ================================= */}

        <div className="mt-8 grid gap-5 pb-32">

          {filteredItems.length >
          0 ? (

            filteredItems.map(
              (item) => (

                <FoodCard
                  key={
                    item.id
                  }
                  id={
                    item.id
                  }
                  name={
                    item.name
                  }
                  description={
                    item.description
                  }
                  price={
                    item.price
                  }
                />

              )
            )

          ) : (

            <div className="text-center py-16">

              <h2 className="text-2xl font-bold text-gray-400">
                😔 No dishes found
              </h2>


              <p className="mt-3 text-gray-500">
                Try another search or category.
              </p>

            </div>

          )}

        </div>

      </div>


      {/* =================================== */}
      {/* FLOATING CART */}
      {/* =================================== */}

      <CartSummary />

    </div>

  );

}


export default MenuPage;