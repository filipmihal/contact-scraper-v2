import json
  
f_urls = open('mihal_filip/Scraper_unique_urls/unique_url.json')
f_objects = open('mihal_filip/Scraper_unique_urls/unique_objects.json')


def get_url_utility(contact_object):
    # must have at least two contacts
    # not many max kazdy 10
    # aspon nejaka diverzita 
    result = 0
    # email + 10, phone + 8, ostatne +1
    for key in contact_object:
        if key == 'emails':
            if len(contact_object[key]) <= 15:
                result += len(contact_object[key])*10

        elif key == 'phones':
            if len(contact_object[key]) <= 15:
                result += len(contact_object[key])*5

        elif key == 'phonesUncertain':
            if len(contact_object[key]) <= 10:
                result += len(contact_object[key])*0.5
        
        else:
            if len(contact_object[key]) <= 10:
                result += len(contact_object[key])

    return result
        
url_data = json.load(f_urls)
object_data = json.load(f_objects)

maxim = 0
maxim_url = ""

for i in object_data:
    for url,contact_object in zip(url_data[i], object_data[i]):
        utility = get_url_utility(contact_object)
        if maxim < utility:
            maxim = utility
            maxim_url = url
        if utility > 10:
            print(f"{url}  /// {utility}")


print(f"{maxim}   /// {maxim_url}")
f_objects.close()
f_urls.close()