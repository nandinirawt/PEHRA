from datetime import datetime, timezone
from typing import Any, Dict

from ledger.chain.web3_client import LedgerClient


class LedgerBridge:
    """
    P4 -> P6 ledger integration boundary.

    P4 provides:
        - canonicalized record
        - content hash
        - session signature

    P6 provides:
        - blockchain anchoring
        - transaction metadata
        - ledger verification
    """

    @staticmethod
    def _normalize_tx_id(tx_id: str) -> str:
        """
        Ensure transaction hashes use the standard 0x-prefixed format.
        """
        tx_id = str(tx_id)

        if tx_id.startswith("0x"):
            return tx_id

        return f"0x{tx_id}"

    @staticmethod
    def _get_chain_timestamp(
        client: LedgerClient,
        block_number: int,
    ) -> str:
        block = client.w3.eth.get_block(
            block_number
        )

        timestamp = int(
            block["timestamp"]
        )

        return (
            datetime.fromtimestamp(
                timestamp,
                tz=timezone.utc,
            )
            .isoformat()
            .replace("+00:00", "Z")
        )

    @staticmethod
    def anchor(
        record_id: str,
        exam_id: str,
        content_hash: str,
        signature: str,
        record_type: str = "review_decision",
    ) -> Dict[str, Any]:
        """
        Anchor a confirmed record on the local Hardhat ledger.

        Supported record types:
            review_decision -> recordReview()
            behavior_event  -> recordEvent()
            session_summary -> closeExam()
        """

        client = LedgerClient()

        if record_type == "review_decision":

            tx_id = client.record_review(
                exam_id=exam_id,
                record_id=record_id,
                content_hash=content_hash,
                signature=signature,
            )

        elif record_type == "behavior_event":

            tx_id = client.record_event(
                exam_id=exam_id,
                record_id=record_id,
                content_hash=content_hash,
                signature=signature,
            )

        elif record_type == "session_summary":

            tx_id = client.close_exam(
                exam_id=exam_id,
                record_id=record_id,
                content_hash=content_hash,
                signature=signature,
            )

        else:

            raise ValueError(
                f"Unsupported record_type: {record_type}"
            )

        normalized_tx_id = (
            LedgerBridge._normalize_tx_id(
                tx_id
            )
        )

        receipt = client.w3.eth.get_transaction_receipt(
            tx_id
        )

        block_number = int(
            receipt["blockNumber"]
        )

        latest_block = client.w3.eth.block_number

        node_confirmations = (
            latest_block
            - block_number
            + 1
        )

        status = (
            "confirmed"
            if int(receipt["status"]) == 1
            else "failed"
        )

        chain_timestamp = (
            LedgerBridge._get_chain_timestamp(
                client,
                block_number,
            )
        )

        return {
            "tx_id": normalized_tx_id,
            "block_ref": f"block-{block_number}",
            "node_confirmations": node_confirmations,
            "chain_timestamp": chain_timestamp,
            "status": status,
        }

    @staticmethod
    def verify(
        record_id: str,
        computed_hash: str,
    ) -> Dict[str, Any]:
        """
        Compare the locally computed hash with the hash
        stored on the blockchain.
        """

        client = LedgerClient()

        match = client.verify_event(
            record_id=record_id,
            expected_hash=computed_hash,
        )

        return {
            "record_id": record_id,
            "computed_hash": computed_hash,
            "match": bool(match),
        }
