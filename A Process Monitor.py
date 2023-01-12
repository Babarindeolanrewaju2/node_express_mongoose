import psutil
import time

# Keep track of the number of processes from the previous check
prev_num_processes = 0
prev_cpu_usage = 0

while True:
    # Get the number of processes and CPU usage
    num_processes = len(psutil.process_iter())
    cpu_usage = psutil.cpu_percent()

    # Print the number of processes compared to the previous check
    if num_processes > prev_num_processes:
        print(f'There are {num_processes - prev_num_processes} more processes running than before')
    elif num_processes < prev_num_processes:
        print(f'There are {prev_num_processes - num_processes} fewer processes running than before')
    else:
        print('The number of processes running has not changed')
    
    if cpu_usage-prev_cpu_usage >=10:
        for proc in psutil.process_iter(attrs=['pid', 'name', 'cpu_percent']):
            if proc.info['cpu_percent'] > 1.0:
                print(f"Process {proc.info['name']} is using {proc.info['cpu_percent']}% of the CPU")
                break
        else:
            print("No process using over 1% of the CPU")

    prev_num_processes = num_processes
    prev_cpu_usage = cpu_usage
    # Wait for 20 seconds before checking again
    time.sleep(20)

