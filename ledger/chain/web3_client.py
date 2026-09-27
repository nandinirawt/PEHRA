import base64
import json
from pathlib import Path

from web3 import Web3

from ledger.chain.local_chain import NODES


RPC_URL = NODES["university"]["rpc_url"]

ARTIFACT_PATH = (
    Path(__file__).resolve().parent.parent
    / "artifacts"
    / "contracts"
    / "IntegrityLedger.sol"
    / "IntegrityLedger.json"
)


class LedgerClient:

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(RPC_URL))

        if not self.w3.is_connected():
            raise RuntimeError(
                f"Cannot connect to Hardhat at {RPC_URL}"
            )

        with open(ARTIFACT_PATH, "r", encoding="utf-8") as f:
            artifact = json.load(f)

        contract_address = NODES["university"]["contract_address"]

        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=artifact["abi"],
        )

        self.account = self.w3.eth.accounts[0]

    @staticmethod
    def _id_to_bytes32(value: str) -> bytes:
        return Web3.keccak(text=value)

    @staticmethod
    def _hash_to_bytes32(content_hash: str) -> bytes:
        if content_hash.startswith("0x"):
            content_hash = content_hash[2:]

        if len(content_hash) != 64:
            raise ValueError(
                "content_hash must be a 64-character SHA-256 hex string"
            )

        return bytes.fromhex(content_hash)

    @staticmethod
    def _signature_to_bytes(signature: str) -> bytes:
        return base64.b64decode(signature)

    def create_exam(self, exam_id: str) -> str:
        exam_id_bytes = self._id_to_bytes32(exam_id)

        tx_hash = self.contract.functions.createExam(
            exam_id_bytes
        ).transact({
            "from": self.account,
        })

        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return receipt.transactionHash.hex()

    def record_event(
        self,
        exam_id: str,
        record_id: str,
        content_hash: str,
        signature: str,
    ) -> str:
        exam_id_bytes = self._id_to_bytes32(exam_id)
        record_id_bytes = self._id_to_bytes32(record_id)
        hash_bytes = self._hash_to_bytes32(content_hash)
        signature_bytes = self._signature_to_bytes(signature)

        tx_hash = self.contract.functions.recordEvent(
            exam_id_bytes,
            record_id_bytes,
            hash_bytes,
            signature_bytes,
        ).transact({
            "from": self.account,
        })

        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return receipt.transactionHash.hex()

    def record_review(
        self,
        exam_id: str,
        record_id: str,
        content_hash: str,
        signature: str,
    ) -> str:
        exam_id_bytes = self._id_to_bytes32(exam_id)
        record_id_bytes = self._id_to_bytes32(record_id)
        hash_bytes = self._hash_to_bytes32(content_hash)
        signature_bytes = self._signature_to_bytes(signature)

        tx_hash = self.contract.functions.recordReview(
            exam_id_bytes,
            record_id_bytes,
            hash_bytes,
            signature_bytes,
        ).transact({
            "from": self.account,
        })

        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return receipt.transactionHash.hex()

    def close_exam(
        self,
        exam_id: str,
        record_id: str,
        content_hash: str,
        signature: str,
    ) -> str:
        exam_id_bytes = self._id_to_bytes32(exam_id)
        record_id_bytes = self._id_to_bytes32(record_id)
        hash_bytes = self._hash_to_bytes32(content_hash)
        signature_bytes = self._signature_to_bytes(signature)

        tx_hash = self.contract.functions.closeExam(
            exam_id_bytes,
            record_id_bytes,
            hash_bytes,
            signature_bytes,
        ).transact({
            "from": self.account,
        })

        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return receipt.transactionHash.hex()

    def verify_event(
        self,
        record_id: str,
        expected_hash: str,
    ) -> bool:
        record_id_bytes = self._id_to_bytes32(record_id)
        hash_bytes = self._hash_to_bytes32(expected_hash)

        return self.contract.functions.verifyEvent(
            record_id_bytes,
            hash_bytes,
        ).call()


def get_ledger_client() -> LedgerClient:
    return LedgerClient()