from csv import reader
# SCRIPT INPUT PARAMS
INPUT_FILE = 'contact-scraper-v2/dataset/dataset.csv'


def list_union(list1, list2):
    return list1 + list2


def list_intersection(lst1, lst2):
    lst3 = [value for value in lst1 if value in lst2]
    return lst3


def is_weak_row(row):
    """For now, we do not need all the data from tha datase. So some rows can be skipped"""
    all(elem == '' or idx in [0, 1, 2, 5, 11] for elem, idx in enumerate(row))


def text_to_list(text):
    return text.split(';')


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
        # TODO: sub objects not needed yet
    }


def get_parsed_dataset():
    """Returns the datase as a dictionary. key is a url and value is a list of contact objects"""
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
