from csv import reader, writer
import random

data = []
with open('urls_for_annotation.csv', 'r') as read_obj:
    csv_reader = reader(read_obj)
    header = next(csv_reader)
    if header != None:
        for row in csv_reader:
            data.append(row[0])

# with open('urls_cleaned.csv', 'w') as f:
#     write = writer(f)
#     write.writerow(['url', 'name'])
#     write.writerows(data)


new_data = random.sample(data, 450)
print(len(new_data))

with open('final_sampled.csv', 'w') as f:
    write = writer(f)
    write.writerow(['url'])
    write.writerow(new_data)