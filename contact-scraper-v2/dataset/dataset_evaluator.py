from dataset_parser import *
from scraped_data_parser import *
from dataset_beautifier import standardize_dataset
from score_helpers import jaccard_index


def median_jaccard_index(annotators_data, scraper_data, skip_list):
    jaccards = []
    found = 0
    not_found = 0
    for annotator_url in annotators_data.keys():
        if not scraper_data.get(annotator_url):
            not_found += 1
            # print(f'URL NOT FOUND IN SCRAPER DATASET: {annotator_url}')
        else:
            found += 1
            idx = jaccard_index(
                annotators_data[annotator_url], scraper_data[annotator_url], skip_list)
            jaccards.append(idx)
            # if idx == 0:
            #     print(annotators_data[annotator_url])
            #     print(scraper_data[annotator_url])
            #     print('----------')

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
std_annotators_dataset = standardize_dataset(compact_annotators_dataset)


scraper_dataset = get_scraped_dataset()
std_scraped_dataset = standardize_dataset(scraper_dataset)

print(median_jaccard_index(std_annotators_dataset,
      std_scraped_dataset, ['phones', 'emails']))
print(median_jaccard_index(std_annotators_dataset,
      std_scraped_dataset, ['phones']))
print(median_jaccard_index(std_annotators_dataset,
      std_scraped_dataset, ['email']))
