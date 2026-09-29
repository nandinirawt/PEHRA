import React, { useMemo } from "react";
import "./IntegrityExceptions.css";

function StatusBadge({ status }) {
  const normalized =
    String(status || "PENDING").toUpperCase();

  return (
    <span
      className={`exception-status ${normalized.toLowerCase()}`}
    >
      <span>
        {normalized === "TAMPERED"
          ? "!"
          : normalized === "VERIFIED"
            ? "✓"
            : "•"}
      </span>

      {normalized.replace("_", " ")}
    </span>
  );
}


function shortenHash(hash) {
  if (!hash || hash === "Pending") {
    return "Pending";
  }

  if (hash.length <= 24) {
    return hash;
  }

  return `${hash.slice(0, 12)}...${hash.slice(-10)}`;
}


function shortenTransaction(tx) {
  if (!tx || tx === "Pending") {
    return "Pending";
  }

  if (tx.length <= 24) {
    return tx;
  }

  return `${tx.slice(0, 12)}...${tx.slice(-8)}`;
}


export default function IntegrityExceptions({
  examinations = [],
  onInvestigate,
}) {

  const exceptions = useMemo(() => {

    const result = [];

    examinations.forEach((exam) => {

      exam.halls.forEach((hall) => {

        if (hall.status !== "tampered") {
          return;
        }


        let integrity = null;


        /*
         * Demo hall
         */

        if (hall.dataMode === "demo") {

          integrity =
            hall.demoIntegrity || null;

        }


        /*
         * Live hall
         */

        else {

          integrity =
            hall.integrityResults?.find(
              (record) =>
                String(
                  record?.status || ""
                ).toUpperCase() ===
                "TAMPERED"
            ) || null;

        }


        result.push({
          exam,
          hall,
          integrity,
        });

      });

    });


    return result;

  }, [examinations]);


  return (
    <main className="integrity-exceptions-page">

      {/* HEADER */}

      <section className="exceptions-header">

        <div>

          <span className="exceptions-eyebrow">
            CHIEF INVIGILATOR
          </span>

          <h1>
            Integrity Exceptions
          </h1>

          <p>
            Review examination halls requiring
            integrity investigation.
          </p>

        </div>


        <div className="exceptions-count">

          <strong>
            {exceptions.length}
          </strong>

          <span>
            Open Exception
            {exceptions.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

      </section>


      {/* EMPTY STATE */}

      {exceptions.length === 0 ? (

        <section className="exceptions-empty">

          <div className="empty-icon">
            ✓
          </div>

          <h2>
            No Integrity Exceptions
          </h2>

          <p>
            All currently available examination
            halls have passed integrity monitoring.
          </p>

        </section>

      ) : (

        <section className="exceptions-list">

          {exceptions.map(
            ({
              exam,
              hall,
              integrity,
            }) => {

              const storedHash =
                integrity?.storedFingerprint ??
                integrity?.stored_hash ??
                integrity?.content_hash ??
                "Pending";


              const recomputedHash =
                integrity?.recomputedFingerprint ??
                integrity?.recomputed_hash ??
                integrity?.computed_hash ??
                "Pending";


              const transaction =
                integrity?.transaction ??
                integrity?.tx_ref ??
                integrity?.ledger_tx?.tx_id ??
                "Pending";


              const block =
                integrity?.blockReference ??
                integrity?.block_ref ??
                integrity?.ledger_tx?.block_ref ??
                "Pending";


              return (
                <article
                  className="exception-card"
                  key={`${exam.id}-${hall.hallId}`}
                >

                  {/* CARD TOP */}

                  <div className="exception-card-top">

                    <div>

                      <span className="exception-hall-label">
                        EXAMINATION HALL
                      </span>

                      <h2>
                        {hall.hallName}
                      </h2>

                      <p>
                        {exam.name}
                        {" · "}
                        {exam.subject}
                      </p>

                    </div>


                    <StatusBadge
                      status={hall.status}
                    />

                  </div>


                  {/* ISSUE */}

                  <div className="exception-message">

                    <span className="exception-message-icon">
                      !
                    </span>

                    <div>

                      <strong>
                        Ledger integrity mismatch
                      </strong>

                      <p>
                        The stored fingerprint does
                        not match the recomputed
                        fingerprint for this record.
                      </p>

                    </div>

                  </div>


                  {/* HASH COMPARISON */}

                  <div className="exception-hash-section">

                    <div className="hash-column">

                      <span>
                        STORED FINGERPRINT
                      </span>

                      <code>
                        {shortenHash(
                          storedHash
                        )}
                      </code>

                    </div>


                    <div className="hash-symbol">
                      ≠
                    </div>


                    <div className="hash-column">

                      <span>
                        RECOMPUTED FINGERPRINT
                      </span>

                      <code>
                        {shortenHash(
                          recomputedHash
                        )}
                      </code>

                    </div>

                  </div>


                  {/* LEDGER INFO */}

                  <div className="exception-meta-grid">

                    <div>

                      <span>
                        TRANSACTION
                      </span>

                      <strong>
                        {shortenTransaction(
                          transaction
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        BLOCK
                      </span>

                      <strong>
                        {block}
                      </strong>

                    </div>


                    <div>

                      <span>
                        DETECTED
                      </span>

                      <strong>
                        {hall.lastVerified ||
                          "Pending"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        SOURCE
                      </span>

                      <strong>
                        {hall.dataMode ===
                        "demo"
                          ? "Showcase"
                          : "Live Backend"}
                      </strong>

                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="exception-card-footer">

                    <span>
                      Investigation required
                    </span>


                    <button
                      onClick={() =>
                        onInvestigate?.(
                          hall
                        )
                      }
                    >
                      Open Investigation
                      <span>→</span>
                    </button>

                  </div>

                </article>
              );

            }
          )}

        </section>

      )}

    </main>
  );
}