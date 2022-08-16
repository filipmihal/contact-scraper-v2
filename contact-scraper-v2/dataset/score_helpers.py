from dataset_parser import list_union, list_intersection, levenstein_intersection, levenstein_union


def jaccard_index(obj1, obj2, skip_list, use_lev=False):
    '''
    Jaccard index = intersections/union 
    Computes intersectgions and union for each Social Handle property and returns final index
    '''
    union_size = 0
    intersections = 0
    for key in obj1.keys():
        if not (key in skip_list):
            if use_lev:
                intersections += len(
                    levenstein_intersection(obj1[key], obj2[key]))
                union_size += len(levenstein_union(obj1[key], obj2[key]))
            else:
                union_size += len(list_union(obj1[key], obj2[key]))
                intersections += len(list_intersection(obj1[key], obj2[key]))
    if union_size == 0:
        return 1
    return intersections / union_size
