from csv import reader, writer
import random

data = []
with open('mihal_filip/Scraper_unique_urls/urls_cleaned.csv', 'r') as read_obj:
    csv_reader = reader(read_obj)
    header = next(csv_reader)
    if header != None:
        for row in csv_reader:
            if row[1]!='':
                data.append(row[0])

# with open('urls_cleaned.csv', 'w') as f:
#     write = writer(f)
#     write.writerow(['url', 'name'])
#     write.writerows(data)


new_data = random.sample(data, 1540)
print(len(new_data))

with open('mihal_filip/Scraper_unique_urls/urls_sampled.csv', 'w') as f:
    write = writer(f)
    write.writerow(['url'])
    write.writerow(new_data)