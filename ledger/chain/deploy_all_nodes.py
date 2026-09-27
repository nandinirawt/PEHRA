import json
from pathlib import Path

from web3 import Web3


ROOT = Path(__file__).resolve().parent.parent

ARTIFACT_PATH = (
    ROOT
    / "artifacts"
    / "contracts"
    / "IntegrityLedger.sol"
    / "IntegrityLedger.json"
)

NODES = {
    "University": "http://127.0.0.1:8545",
    "Authority": "http://127.0.0.1:8546",
    "Institution": "http://127.0.0.1:8547",
}


def deploy(name: str, rpc_url: str):
    w3 = Web3(Web3.HTTPProvider(rpc_url))

    if not w3.is_connected():
        raise RuntimeError(f"{name}: cannot connect to {rpc_url}")

    with open(ARTIFACT_PATH, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    contract = w3.eth.contract(
        abi=artifact["abi"],
        bytecode=artifact["bytecode"],
    )

    account = w3.eth.accounts[0]

    tx_hash = contract.constructor().transact({
        "from": account,
    })

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print(f"\n{name}")
    print(f"RPC:      {rpc_url}")
    print(f"Chain ID: {w3.eth.chain_id}")
    print(f"Address:  {receipt.contractAddress}")
    print(f"Tx:       {receipt.transactionHash.hex()}")
    print(f"Block:    {receipt.blockNumber}")

    return receipt.contractAddress


def main():
    for name, rpc_url in NODES.items():
        deploy(name, rpc_url)


if __name__ == "__main__":
    main()
