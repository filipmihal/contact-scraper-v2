from dataset_parser import *
from scraped_data_parser import *
from score_helpers import jaccard_index


def median_jaccard_index(annotators_data, scraper_data):
    jaccards = []
    for annotator_url in annotators_data.keys():
        if not scraper_data.get(annotator_url):
            print(f'URL NOT FOUND IN SCRAPER DATASET: {annotator_url}')
        else:
            jaccards.append(jaccard_index(
                annotators_data[annotator_url], scraper_data[annotator_url]))
    jaccards.sort()

    return jaccards[int(len(jaccards)/2)]


def count_differences(obj1, obj2):
    diffs = 0
    for key in obj1.keys():
        diffs += len(list_union(obj1[key], obj2[key]))
        diffs -= len(list_intersection(obj1[key], obj2[key]))
    return diffs


annotators_dataset = get_parsed_dataset()
compact_annotators_dataset = get_compact_dataset(annotators_dataset)

scraper_dataset = get_scraped_dataset()


print(median_jaccard_index(compact_annotators_dataset, scraper_dataset))
