
from csv import reader, writer
from posixpath import split
import random
import os
import json

# SCRIPT INPUT PARAMS
INPUT_FILE = 'contact-scraper-v2/dataset/dataset.csv'

path = "contact-scraper-v2/storage/datasets/default"
dir_list = os.listdir(path)

# remove all addresses
CLEAN_DATASET = []


def is_only_address(row):
    all(elem == '' or idx in [0, 1, 2, 5, 11] for elem, idx in enumerate(row))


def text_to_list(text):
    return text.split(';')


def list_union(list1, list2):
    return list1 + list2


def list_intersection(lst1, lst2):
    lst3 = [value for value in lst1 if value in lst2]
    return lst3


def jaccard_index(obj1, obj2):
    union_size = 0
    intersections = 0
    for key in obj1.keys():
        if key != 'phonesUncertain':
            union_size += len(list_union(obj1[key], obj2[key]))
            intersections += len(list_intersection(obj1[key], obj2[key]))
    return intersections / union_size


def row_to_social(row):
    return {
        # "contact_type": row[1],
        # "name": row[2],
        'emails': text_to_list(row[3]),
        'phones': text_to_list(row[4]),
        'address': row[5],
        'linkedIns': row[6],
        'facebooks': row[7],
        'instagrams': row[8],
        'twitters': row[9],
        # TODO: sub objects not ready yet
    }


def get_correct_objects_for_url(url):
    result = []
    for row in CLEAN_DATASET:
        if row[0] == url:
            result.append(row_to_social(row))
    return result


# STATISTICS
LENGTH_DIFFERENCES = []
GROUPINGS = []
with open(INPUT_FILE, 'r') as read_obj:
    csv_reader = reader(read_obj)
    for row in csv_reader:
        if not is_only_address(row):
            CLEAN_DATASET.append(row)


for dataset_path in dir_list:
    json_raw = open(path+'/'+dataset_path)
    json_data = json.load(json_raw)
    correct_objects = get_correct_objects_for_url(json_data['url'])
    computed_objects = json_data['contactObjects']
    LENGTH_DIFFERENCES.append(abs(len(correct_objects)-len(computed_objects)))
    GROUPINGS.append(len(correct_objects)-len(computed_objects))

LENGTH_DIFFERENCES.sort()
GROUPINGS.sort()
print(
    f'MEDIAN DIFFERENCE: {LENGTH_DIFFERENCES[int(len(LENGTH_DIFFERENCES)/2)]}')
print(f'MEDIAN GRPUPING INDEX: {GROUPINGS[int(len(GROUPINGS)/2)]}')
# TODO compute best Jaccard avg index
