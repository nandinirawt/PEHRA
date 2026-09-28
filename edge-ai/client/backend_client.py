import requests


BACKEND_URL = "http://127.0.0.1:8000/api/pose"


def send_pose_data(pose_data):
    """
    Sends one POSE_DATA record to the backend.
    """

    if BACKEND_URL is None:
        print("\nBackend URL is not configured yet.")
        print("POSE_DATA is ready to send:")
        print(pose_data)
        return None

    try:
        response = requests.post(
            BACKEND_URL,
            json=pose_data,
            timeout=5
        )

        print(f"\nBackend response: {response.status_code}")
        print(response.text)

        return response

    except requests.exceptions.RequestException as error:
        print(f"\nError sending data to backend: {error}")
        return None