
from posixpath import split
import random
import os
import json

path = "contact-scraper-v2/storage/datasets/default"
dir_list = os.listdir(path)

# remove all addresses
CLEAN_DATASET = []


def get_correct_objects_for_url(url):
    result = []
    for row in CLEAN_DATASET:
        if row[0] == url:
            result.append(row_to_social(row))
    return result


# STATISTICS
LENGTH_DIFFERENCES = []
GROUPINGS = []


def create_jaccard_dictionary():


for dataset_path in dir_list:
    json_raw = open(path+'/'+dataset_path)
    json_data = json.load(json_raw)
    correct_objects = get_correct_objects_for_url(json_data['url'])
    computed_objects = json_data['contactObjects']
    print(f'{len(computed_objects)} ?= {len(correct_objects)}')
    LENGTH_DIFFERENCES.append(abs(len(correct_objects)-len(computed_objects)))
    GROUPINGS.append(len(correct_objects)-len(computed_objects))

LENGTH_DIFFERENCES.sort()
GROUPINGS.sort()
print(
    f'MEDIAN DIFFERENCE: {LENGTH_DIFFERENCES[int(len(LENGTH_DIFFERENCES)/2)]}')
print(f'MEDIAN GRPUPING INDEX: {GROUPINGS[int(len(GROUPINGS)/2)]}')
# TODO compute best Jaccard avg index
