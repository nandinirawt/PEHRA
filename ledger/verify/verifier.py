from ledger.chain.web3_client import LedgerClient
from ledger.crypto.hashing import sha256_text


def verify_record(
    record_id: str,
    canonical_record: str,
) -> bool:
    """
    Re-hash the canonical record and compare the hash
    with the hash stored on the ledger.
    """
    content_hash = sha256_text(canonical_record)

    client = LedgerClient()

    return client.verify_event(
        record_id=record_id,
        expected_hash=content_hash,
    )
