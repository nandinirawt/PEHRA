import json
import uuid
from pathlib import Path

from web3 import Web3

from ledger.chain.local_chain import NODES
from ledger.crypto.hashing import sha256_text


ARTIFACT_PATH = (
    Path(__file__).resolve().parent.parent
    / "ledger"
    / "artifacts"
    / "contracts"
    / "IntegrityLedger.sol"
    / "IntegrityLedger.json"
)


def load_artifact():
    with open(ARTIFACT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def make_bytes32(value: str) -> bytes:
    return Web3.keccak(text=value)


def test_same_record_is_consistent_across_three_nodes():
    artifact = load_artifact()

    exam_id = f"EXAM-3NODE-{uuid.uuid4().hex[:8]}"
    record_id = f"EVT-3NODE-{uuid.uuid4().hex[:8]}"

    record = {
        "event_id": record_id,
        "exam_id": exam_id,
        "seat_id": "B-04",
        "decision": "confirmed_incident",
        "timestamp": "2026-09-27T13:00:00Z",
    }

    canonical_record = json.dumps(
        record,
        sort_keys=True,
        separators=(",", ":"),
    )

    content_hash = sha256_text(canonical_record)
    hash_bytes = bytes.fromhex(content_hash)

    observed_hashes = []

    for node_key, node in NODES.items():
        w3 = Web3(Web3.HTTPProvider(node["rpc_url"]))

        assert w3.is_connected(), f"{node_key} is not connected"

        contract = w3.eth.contract(
            address=Web3.to_checksum_address(
                node["contract_address"]
            ),
            abi=artifact["abi"],
        )

        account = w3.eth.accounts[0]

        # Create exam on this node.
        contract.functions.createExam(
            make_bytes32(exam_id)
        ).transact({
            "from": account,
        })

        # Store the same record on this node.
        contract.functions.recordReview(
            make_bytes32(exam_id),
            make_bytes32(record_id),
            hash_bytes,
            b"test-signature",
        ).transact({
            "from": account,
        })

        # Read the stored record back.
        stored_record = contract.functions.records(
            make_bytes32(record_id)
        ).call()

        stored_hash = stored_record[1].hex()

        observed_hashes.append(stored_hash)

        print(
            f"{node['name']}: "
            f"connected={w3.is_connected()} "
            f"hash={stored_hash}"
        )

    assert len(observed_hashes) == 3
    assert all(
        stored_hash == content_hash
        for stored_hash in observed_hashes
    )

    assert len(set(observed_hashes)) == 1
