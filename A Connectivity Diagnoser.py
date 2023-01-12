import requests

WEBSITES = ["https://www.google.com", "https://www.facebook.com", "https://www.amazon.com"]

# Try connecting to each website once
for website in WEBSITES:
    try:
        response = requests.get(website, timeout=5)
        response.raise_for_status()
        print(f"Successfully connected to {website}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to connect to {website}: {e}")

# check if all of the website could not be connected
if all(x.startswith("Failed") for x in output):
    print("The computer is probably not connected to the internet.")
else:
    # Try connecting to each website again
    for website in WEBSITES:
        if "Failed" in output:
            for i in range(2):
                try:
                    response = requests.get(website, timeout=5)
                    response.raise_for_status()
                    print(f"Successfully connected to {website}")
                    break
                except requests.exceptions.RequestException as e:
                    if i==1:
                        print(f"{website} is probably offline.")
                    continue
    # checking internet connection based on average of response time
    total_time = 0
    for website in WEBSITES:
        if "Successfully" in output:
            response = requests.get(website)
            total_time += response.elapsed.total_seconds()
    avg_time = total_time/len(WEBSITES)
    if avg_time > 1:
        print("The internet connection seems to be slow")
    else:
        print("The internet connection seems to be good")

