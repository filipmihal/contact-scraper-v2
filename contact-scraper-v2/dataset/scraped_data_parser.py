
import json

OBJECTS_PATH = 'contact-scraper-v2/dataset/unique_objects.json'
URLS_PATH = 'contact-scraper-v2/dataset/unique_url.json'


def get_scraped_dataset():
    """Returns scraped dataset as dictionary"""
    scraped_dict = {}
    objects_file = open(OBJECTS_PATH)
    urls_file = open(URLS_PATH)
    objects_json = json.load(objects_file)
    urls_json = json.load(urls_file)

    for key in urls_json.keys():
        for idx, url in enumerate(urls_json[key]):
            scraped_dict[url] = objects_json[key][idx]

    return scraped_dict


# test = get_scraped_dataset()
# print(test['https://www.kanzlei-steinwachs.de/'])
