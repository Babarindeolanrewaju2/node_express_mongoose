import geocoder
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


ip_address = "your_ip_address"  # replace with your system's IP address
g = geocoder.ip(ip_address)

if g.ok:
    print(f"City: {g.city}")
    print(f"State: {g.state}")
    print(f"Country: {g.country}")
    print(f"Latitude: {g.lat}")
    print(f"Longitude: {g.lng}")
else:
    print("Could not get location information")
