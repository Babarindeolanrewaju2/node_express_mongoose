import requests
from bs4 import BeautifulSoup
import csv

# list of websites to scrape
websites = ['https://www.amazon.com', 'https://www.walmart.com', 'https://www.bestbuy.com']

# product to search for
product = 'iphone 13'

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'}
# create a csv file to store the data
with open('prices.csv', 'w', newline='') as csvfile:
    fieldnames = ['website', 'product', 'price']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

# loop through the websites
    for website in websites:
        # send an HTTP request to the website
        response = requests.get(website + '/search?q=' + product, headers=headers)
        # parse the HTML or XML response
        soup = BeautifulSoup(response.text, 'html.parser')
        # extract the relevant information
        try:
            price = soup.find('span', class_='a-price').get_text()
            product_title = soup.find('span', class_='a-size-large product-title-word-break').get_text()
            # write the data to the csv file
            writer.writerow({'website': website, 'product': product_title, 'price': price})
        except AttributeError:
            print(f"{product} not found on {website}")


import csv
from selenium import webdriver

# list of websites to scrape
websites = ['https://www.amazon.com', 'https://www.walmart.com', 'https://www.bestbuy.com']

# product to search for
product = 'iPhone 13'

# create a csv file to store the data
with open('prices.csv', 'w', newline='') as csvfile:
    fieldnames = ['website', 'product', 'price']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

# loop through the websites
    for website in websites:
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        browser = webdriver.Chrome(chrome_options=options)
        browser.get(website + '/search?q=' + product)
        try:
            price = browser.find_element_by_class_name('a-price').text
            product_title = browser.find_element_by_class_name('a-size-large product-title-word-break').text
            writer.writerow({'website': website, 'product': product_title, 'price': price})
        except:
            print(f"{product} not found on {website}")
        browser.quit()
