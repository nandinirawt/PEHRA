NODE_COUNT = 3

NODES = {
    "university": {
        "name": "University",
        "rpc_url": "http://127.0.0.1:8545",
        "contract_address": "0x9A676e781A523b5d0C0e43731313A708CB607508",
    },
    "authority": {
        "name": "Authority",
        "rpc_url": "http://127.0.0.1:8546",
        "contract_address": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    },
    "institution": {
        "name": "Institution",
        "rpc_url": "http://127.0.0.1:8547",
        "contract_address": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    },
}

NODE_RPC_PORTS = [8545, 8546, 8547]