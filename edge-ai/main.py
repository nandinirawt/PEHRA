from mock.pose_generator import (
    generate_normal_sequence,
    generate_head_turn_sequence,
    generate_hand_anomaly_sequence,
    generate_combined_suspicious_sequence
   
)

from client.backend_client import send_pose_data


print("Select a mock scenario:")
print("1. Normal Behavior")
print("2. Head Turn Sequence")
print("3. Hand Anomaly Sequence")
print("4. Combined Suspicious Sequence")

choice = input("Enter your choice (1-4): ")


if choice == "1":
    records = generate_normal_sequence()

elif choice == "2":
    records = generate_head_turn_sequence()

elif choice == "3":
    records = generate_hand_anomaly_sequence()

elif choice == "4":
    records = generate_combined_suspicious_sequence()

else:
    print("Invalid choice. Please enter a number from 1 to 4.")
    records = []


for record in records:
    send_pose_data(record)