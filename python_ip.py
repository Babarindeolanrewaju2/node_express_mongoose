import ipinfo
import requests

# Get the public IP address of the system
ip_address = requests.get('https://api.ipify.org').text

# Create an IPInfo client with your access token
access_token = 'YOUR_ACCESS_TOKEN'
handler = ipinfo.getHandler(access_token)

# Get the location information for the IP address
details = handler.getDetails(ip_address)

# Print the location information
print(f"IP address: {ip_address}")
print(f"City: {details.city}")
print(f"Region: {details.region}")
print(f"Country: {details.country_name}")
print(f"Latitude: {details.latitude}")
print(f"Longitude: {details.longitude}")
