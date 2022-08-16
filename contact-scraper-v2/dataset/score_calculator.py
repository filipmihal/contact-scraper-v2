from posixpath import split
import random
import os
import json
from dataset_parser import get_parsed_dataset
from dataset_beautifier import standardize_social_handle


def average(lst):
    return sum(lst) / len(lst)


path = "contact-scraper-v2/storage/datasets/default"
dir_list = os.listdir(path)

# remove all addresses
CLEAN_DATASET = get_parsed_dataset()


def get_correct_objects_for_url(url):
    '''
    Returns standardized social handles for a specific URL
    Uses Global object CLEAN_DATASET
    '''
    result = []
    if CLEAN_DATASET.get(url):
        for obj in CLEAN_DATASET.get(url):
            std_social = standardize_social_handle(obj)
            result.append(std_social)
    return result


# STATISTICS
LENGTH_DIFFERENCES = []
GROUPINGS = []

for algorithm_dataset_path in dir_list:
    json_raw = open(path+'/'+algorithm_dataset_path)
    json_data = json.load(json_raw)
    correct_objects = get_correct_objects_for_url(json_data['url'])
    computed_objects = json_data['contactObjects']
    LENGTH_DIFFERENCES.append(abs(len(correct_objects)-len(computed_objects)))
    GROUPINGS.append(len(correct_objects)-len(computed_objects))

LENGTH_DIFFERENCES.sort()
GROUPINGS.sort()

print(f'AVERAGE DIFFERENCE: {average(LENGTH_DIFFERENCES)}')
print(f'MEDIAN DIFF: {LENGTH_DIFFERENCES[int(len(LENGTH_DIFFERENCES)/2)]}')
print('Grouping strength of our algorithm:')
print(f'MEDIAN GRPUPING INDEX: {GROUPINGS[int(len(GROUPINGS)/2)]}')
print(f'AVERAGE GROUPING INDEX: {average(GROUPINGS)}')
print('(Positive number means that algorithm\'s grouping is too strong)')
