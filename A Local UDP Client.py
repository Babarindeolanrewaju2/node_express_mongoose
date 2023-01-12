import socket

# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Set the server address and port
server_address = ('127.0.0.1', 10805)

# Send messages to the server
messages = ["Hello World!", "Hello 1234", "Hello World!123"]
for message in messages:
    print(f'sending {message}')
    sent = sock.sendto(message.encode(), server_address)
    data, _ = sock.recvfrom(4096)
    print(f'received {data.decode()}')
