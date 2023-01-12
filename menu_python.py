import os
import psutil
import platform
import time

def get_cpu_usage():
    usage = psutil.cpu_percent(interval=10, percpu=True)
    for i, percent in enumerate(usage):
        print(f'Core {i}: {percent}%')

def get_ram_usage():
    usage = psutil.virtual_memory().percent
    print(f'RAM usage: {usage}%')

def get_os_info():
    name = platform.system()
    version = platform.version()
    print(f'Operating system: {name} {version}')

def check_busy():
    cpu_usage = psutil.cpu_percent()
    ram_usage = psutil.virtual_memory().percent
    if cpu_usage > 50 and ram_usage > 50:
        print("Computer is busy.")
    else:
        print("Computer is not busy.")

def main():
    while True:
        print("Select an option:")
        print("1. Get CPU usage")
        print("2. Get RAM usage")
        print("3. Get operating system information")
        print("4. Check if computer is busy")
        print("5. Exit")
        choice = input()
        if choice == '1':
            get_cpu_usage()
        elif choice == '2':
            get_ram_usage()
        elif choice == '3':
            get_os_info()
        elif choice == '4':
            check_busy()
        elif choice == '5':
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == '__main__':
    main()
