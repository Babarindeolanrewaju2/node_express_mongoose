import socket

# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Bind the socket to the local host and port 10805
server_address = ('127.0.0.1', 10805)
print(f'starting up on {server_address}')
sock.bind(server_address)

total_messages = 0

while True:
    print('\nwaiting to receive message')
    data, address = sock.recvfrom(4096)
    
    # Count the number of letters and numbers in the message
    letter_count = 0
    number_count = 0
    for char in data.decode():
        if char.isalpha():
            letter_count += 1
        elif char.isdigit():
            number_count += 1
    
    # Send the count of letters and numbers back to the client
    message = f'letter count: {letter_count}, number count: {number_count}'
    print(f'{message} to {address}')
    sock.sendto(message.encode(), address)
    
    total_messages += 1
    print(f'total messages: {total_messages}')
