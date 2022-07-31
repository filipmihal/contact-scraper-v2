'''
This script sets offset to each number in the subset section of our contact dataset
Offset is usually the last row number in the excel sheet

offset: 10
10;11;12 -->> 20;21;22
'''

from csv import reader, writer
import random
# SCRIPT INPUT PARAMS
OFFSET = 809
INPUT_FILE = 'input_dataset.csv'
OUTPUT_FILE = 'output_dataset.csv'
SUBSET_INDEX = 11

def apply_offset(num_string):
    return str(int(num_string)+OFFSET)


data = []
with open(INPUT_FILE, 'r') as read_obj:
    csv_reader = reader(read_obj)
    for row in csv_reader:
        if(row[SUBSET_INDEX] != ''):
            row[SUBSET_INDEX] = ';'.join(list(map(apply_offset, row[SUBSET_INDEX].split(';'))))
        data.append(row)

with open(OUTPUT_FILE, 'w') as f:
    write = writer(f)
    write.writerows(data)