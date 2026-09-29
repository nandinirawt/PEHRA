import json
from pathlib import Path

from web3 import Web3


RPC_URL = "http://127.0.0.1:8545"

ARTIFACT_PATH = (
    Path(__file__).resolve().parent.parent
    / "artifacts"
    / "contracts"
    / "IntegrityLedger.sol"
    / "IntegrityLedger.json"
)


def main():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        raise RuntimeError("Cannot connect to Hardhat at http://127.0.0.1:8545")

    with open(ARTIFACT_PATH, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    abi = artifact["abi"]
    bytecode = artifact["bytecode"]

    account = w3.eth.accounts[0]

    print("Connected:", w3.is_connected())
    print("Chain ID:", w3.eth.chain_id)
    print("Deploying from:", account)

    contract = w3.eth.contract(
        abi=abi,
        bytecode=bytecode,
    )

    tx_hash = contract.constructor().transact({
        "from": account,
    })

    print("Deployment transaction:", tx_hash.hex())

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print("Contract deployed!")
    print("Contract address:", receipt.contractAddress)
    print("Block number:", receipt.blockNumber)


if __name__ == "__main__":
    main()
