from dataset_parser import list_union, list_intersection


def jaccard_index(obj1, obj2):
    union_size = 0
    intersections = 0
    for key in obj1.keys():
        if key != 'phonesUncertain':
            union_size += len(list_union(obj1[key], obj2[key]))
            intersections += len(list_intersection(obj1[key], obj2[key]))
    return intersections / union_size
