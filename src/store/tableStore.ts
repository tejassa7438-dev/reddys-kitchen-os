import { create } from "zustand";


// =========================================
// TABLE SESSION
// =========================================
//
// IMPORTANT:
//
// The table number itself is NOT a security
// credential.
//
// The real table identity comes from the
// session token embedded in the QR URL.
//
// Example:
//
// /menu?table=1&session=TABLE_SECRET
//
// A customer changing only:
//
// /menu?table=2
//
// will NOT be allowed to silently become
// Table 2.
//
// =========================================


// =========================================
// CREATE RANDOM SESSION ID
// =========================================

function createTableSessionId(): string {

  const cryptoObject =
    globalThis.crypto;


  // ---------------------------------------
  // Preferred method
  // ---------------------------------------

  if (
    cryptoObject &&
    typeof cryptoObject.randomUUID ===
      "function"
  ) {

    return (
      `${Date.now()}-${cryptoObject.randomUUID()}`
    );

  }


  // ---------------------------------------
  // Fallback
  // ---------------------------------------

  const randomPart =
    Math.random()
      .toString(36)
      .substring(2, 15);


  const timePart =
    Date.now()
      .toString(36);


  return (
    `${timePart}-${randomPart}`
  );
}


// =========================================
// URL SESSION
// =========================================

function getUrlTableData(): {
  table: number | null;
  session: string | null;
} {

  if (
    typeof window ===
    "undefined"
  ) {

    return {
      table: null,
      session: null,
    };

  }


  const params =
    new URLSearchParams(
      window.location.search
    );


  const tableParam =
    params.get("table");


  const sessionParam =
    params.get("session");


  const parsedTable =
    tableParam
      ? Number(tableParam)
      : null;


  const validTable =
    parsedTable !== null &&
    Number.isInteger(
      parsedTable
    ) &&
    parsedTable >= 1 &&
    parsedTable <= 12;


  const validSession =
    typeof sessionParam ===
      "string" &&
    sessionParam.length >= 20;


  return {

    table:
      validTable
        ? parsedTable
        : null,

    session:
      validSession
        ? sessionParam
        : null,

  };

}


// =========================================
// STORED SESSION
// =========================================
//
// Used only as a temporary browser-side
// memory for the SAME QR/table session.
//
// The URL session remains the source of truth.
//
// =========================================

function getStoredSessionId(
  table: number
): string | null {

  const key =
    `restaurant-table-session-${table}`;


  return localStorage.getItem(
    key
  );
}


// =========================================
// SAVE SESSION
// =========================================

function saveStoredSessionId(
  table: number,
  sessionId: string
): void {

  const key =
    `restaurant-table-session-${table}`;


  localStorage.setItem(
    key,
    sessionId
  );

}


// =========================================
// TABLE STORE
// =========================================

type TableStore = {

  table: number;

  tableSessionId: string;

  tableSessionLocked: boolean;

  setTable: (
    table: number
  ) => void;

};


export const useTableStore =
  create<TableStore>(
    (set) => {

      // =====================================
      // READ QR DATA
      // =====================================

      const urlData =
        getUrlTableData();


      // =====================================
      // INITIAL TABLE
      // =====================================

      const initialTable =
        urlData.table ??
        1;


      // =====================================
      // INITIAL SESSION
      // =====================================
      //
      // If the QR URL provides a session,
      // ALWAYS use that session.
      //
      // This prevents:
      //
      // Table 1 QR
      //      ↓
      // user changes URL to table=2
      //      ↓
      // old/local session being trusted
      //
      // =====================================

      let initialSession =
        urlData.session;


      // -------------------------------------
      // Existing URL-less development session
      // -------------------------------------
      //
      // This fallback is only useful for the
      // existing development environment.
      //
      // Production QR codes should ALWAYS
      // contain ?table=X&session=...
      //
      // -------------------------------------

      if (
        !initialSession
      ) {

        initialSession =
          getStoredSessionId(
            initialTable
          );

      }


      // -------------------------------------
      // Last-resort development session
      // -------------------------------------

      if (
        !initialSession
      ) {

        initialSession =
          createTableSessionId();

      }


      // -------------------------------------
      // Remember current session
      // -------------------------------------

      saveStoredSessionId(
        initialTable,
        initialSession
      );


      // =====================================
      // STORE
      // =====================================

      return {

        table:
          initialTable,

        tableSessionId:
          initialSession,

        tableSessionLocked:
          Boolean(
            urlData.session
          ),


        // ===================================
        // SET TABLE
        // ===================================

        setTable: (
          table: number
        ) => {

          // ---------------------------------
          // Validate table
          // ---------------------------------

          if (
            !Number.isInteger(
              table
            ) ||
            table < 1 ||
            table > 12
          ) {

            return;

          }


          // ---------------------------------
          // If current QR session is locked,
          // the table cannot be changed by
          // simply changing the number.
          // ---------------------------------

          const currentState =
            useTableStore.getState();


          if (
            currentState.tableSessionLocked &&
            table !==
              currentState.table
          ) {

            console.warn(
              "Table change rejected: QR table session is locked."
            );

            return;

          }


          // ---------------------------------
          // If changing table during
          // development/unlocked mode,
          // use that table's stored session.
          // ---------------------------------

          let sessionId =
            getStoredSessionId(
              table
            );


          if (
            !sessionId
          ) {

            sessionId =
              createTableSessionId();


            saveStoredSessionId(
              table,
              sessionId
            );

          }


          set({

            table,

            tableSessionId:
              sessionId,

          });

        },

      };

    }
  );