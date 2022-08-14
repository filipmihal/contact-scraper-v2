from csv import reader
from Levenshtein import distance

# SCRIPT INPUT PARAMS
INPUT_FILE = 'contact-scraper-v2/dataset/dataset.csv'


def levenstein_intersection(list1, list2):
    result = []
    for value in list1:
        for value2 in list2:
            if distance(value, value2) <= 2:
                result.append(value)
    return result


def list_union(list1, list2):
    return list1 + list2


def levenstein_union(list1, list2):
    result = []
    for elem in list1:
        for elem2 in list2:
            if distance(elem, elem2) > 2:
                result.append(elem)
    result += list2

    return result


def list_intersection(lst1, lst2):
    lst3 = [value for value in lst1 if value in lst2]
    return lst3


def is_weak_row(row):
    """For now, we do not need all the data from tha datase. So some rows can be skipped"""
    return all((elem == '' or idx in [0, 1, 2, 5, 11])
               for idx, elem in enumerate(row))


def text_to_list(text):
    if text.replace(' ', '') == '':
        return []
    return text.split(';')


def row_to_social(row):
    return {
        # "contact_type": row[1],
        # "name": row[2],
        'emails': text_to_list(row[3]),
        'phones': text_to_list(row[4]),
        # 'address': row[5],
        'linkedIns': text_to_list(row[6]),
        'facebooks': text_to_list(row[7]),
        'instagrams': text_to_list(row[8]),
        'twitters': text_to_list(row[9]),
        'youtubes': text_to_list(row[10]),
        # 'url': row[0]
        # TODO: sub objects not needed yet
    }


def get_compact_dataset(dataset):
    """Returns a compact version of the dataset. 
    All contact objects for a specific URL are unified into a single object"""
    compact = {}
    for url in dataset.keys():
        final_obj = {}
        for contact in dataset[url]:
            for contact_type in contact.keys():
                if final_obj.get(contact_type):
                    final_obj[contact_type] = contact[contact_type] + \
                        final_obj[contact_type]
                else:
                    final_obj[contact_type] = contact[contact_type]
        compact[url] = final_obj
    return compact


def get_parsed_dataset():
    """Returns the dataset as a dictionary. key is a url and value is a list of contact objects"""
    dataset_dictionary = {}
    with open(INPUT_FILE, 'r') as read_obj:
        csv_reader = reader(read_obj)
        for row in csv_reader:
            if not is_weak_row(row):
                if not dataset_dictionary.get(row[0]):
                    dataset_dictionary[row[0]] = [row_to_social(row)]
                else:
                    dataset_dictionary[row[0]].append(row_to_social(row))

    return dataset_dictionary


# print(levenstein_intersection(
#     ['hello', 'facebook', 'inswrq'], ['helko', 'facebok', 'instag']))
