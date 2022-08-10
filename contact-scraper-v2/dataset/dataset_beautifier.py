from hashlib import new
import re
import copy
EMAIL_REGEX_STRING = '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])'

LINKEDIN_REGEX_STRING = '(?<!\\w)(?:(?:http(?:s)?:\\/\\/)?(?:(?:(?:[a-z]+\\.)?linkedin\\.com\\/(?:in|company)\\/)([a-z0-9\\-_%=]{2,60})(?![a-z0-9\\-_%=])))(?:\\/)?'

INSTAGRAM_REGEX_STRING = '(?<!\\w)(?:http(?:s)?:\\/\\/)?(?:(?:www\\.)?(?:instagram\\.com|instagr\\.am)\\/)(?!explore|_n|_u)([a-z0-9_.]{2,30})(?![a-z0-9_.])(?:/)?'

TWITTER_RESERVED_PATHS = 'oauth|account|tos|privacy|signup|home|hashtag|search|login|widgets|i|settings|start|share|intent|oct'
TWITTER_REGEX_STRING = '(?<!\\w)(?: http(?: s)?: \\/\\/)?(?: www.)?(?: twitter.com)\\/ (?!(?: ' + \
    TWITTER_RESERVED_PATHS + \
    ')(?: [\\\'\\\"\\?\\.\\/] |$))([a-z0-9_]{1, 15})(?![a-z0-9_])(?: /)?'
FACEBOOK_RESERVED_PATHS = 'rsrc\\.php|apps|groups|events|l\\.php|friends|images|photo.php|chat|ajax|dyi|common|policies|login|recover|reg|help|security|messages|marketplace|pages|live|bookmarks|games|fundraisers|saved|gaming|salesgroups|jobs|people|ads|ad_campaign|weather|offers|recommendations|crisisresponse|onthisday|developers|settings|connect|business|plugins|intern|sharer'
FACEBOOK_REGEX_STRING = '(?<!\\w)(?: http(?: s)?: \\/\\/)?(?: www.)?(?: facebook.com|fb.com)\\/ (?!(?: ' + FACEBOOK_RESERVED_PATHS + \
    ')(?: [\\\'\\\"\\?\\.\\/ ] |$))(profile\\.php\\?id\\=[0-9]{3, 20}|(?!profile\\.php)[a-z0-9\\.]{5, 51})(?![a-z0-9\\.])(?: /)?'
YOUTUBE_REGEX_STRING = '(?<!\\w)(?:https?:\\/\\/)?(?:youtu\\.be\\/|(?:www\\.|m\\.)?youtube\\.com(?:\\/(?:watch|v|embed|user|c(?:hannel)?)(?:\\.php)?)?(?:\\?[^ ]*v=|\\/))([a-zA-Z0-9\\-_]{2,100})'

TIKTOK_REGEX_STRING = '(?<!\\w)(?:http(?:s)?:\\/\\/)?(?:(?:www|m)\\.)?(?:tiktok\\.com)\\/(((?:(?:v|embed|trending)(?:\\?shareId=|\\/))[0-9]{2,50}(?![0-9]))|(?:@)[a-z0-9\\-_\\.]+((?:\\/video\\/)[0-9]{2,50}(?![0-9]))?)(?:\\/)?'

PINTEREST_REGEX_STRING = '(?<!\\w)(?:http(?:s)?:\\/\\/)?(?:(?:(?:(?:www\\.)?pinterest(?:\\.com|(?:\\.[a-z]{2}){1,2}))|(?:[a-z]{2})\\.pinterest\\.com)(?:\\/))((pin\\/[0-9]{2,50})|((?!pin)[a-z0-9\\-_\\.]+(\\/[a-z0-9\\-_\\.]+)?))(?:\\/)?'

DISCORD_REGEX_STRING = '(?<!\\w)(?:https?:\\/\\/)?(?:www\\.)?((?:(?:(?:canary|ptb).)?(?:discord|discordapp)\\.com\\/channels(?:\\/)[0-9]{2,50}(\\/[0-9]{2,50})*)|(?:(?:(?:canary|ptb).)?(?:discord\\.(?:com|me|li|gg|io)|discordapp\\.com)(?:\\/invite)?)\\/(?!channels)[a-z0-9\\-_]{2,50})(?:\\/)?'


def standardize_email(email):
    return re.sub('(\.+)(?=.*@)', '', email.lower().replace(" ", ""))


def standardize_phone(phone):
    return re.sub('\.|-|\)|\(|\+| ', '', phone)


def is_email(email):
    pattern = re.compile(EMAIL_REGEX_STRING)
    return pattern.match(email) != None


def standardize_social_handle(handle):
    new_handle = copy.deepcopy(handle)
    emails = []
    phones = []
    is_row_mismatched = False
    if new_handle.get('phonesUncertain'):
        new_handle['phones'] = new_handle['phones'] + \
            new_handle['phonesUncertain']
    for email in handle['emails']:
        if standardize_email(email) == '':
            continue
        if not is_email(standardize_email(email)):
            is_row_mismatched = True
        emails.append(standardize_email(email))
    new_handle['emails'] = emails
    for phone in handle['phones']:
        if standardize_phone(phone) == '':
            continue
        phones.append(standardize_phone(phone))
    new_handle['phones'] = phones

    if is_row_mismatched:
        # new_handle['phones'], new_handle['emails'] = new_handle['emails'], new_handle['phones']
        new_handle['phones'] = emails
        new_handle['emails'] = phones
        print(new_handle['emails'])
    return new_handle


def standardize_dataset(dataset):
    new_dataset = {}
    for key in dataset.keys():
        std_row = standardize_social_handle(dataset[key])
        new_dataset[key] = std_row

    return new_dataset


# print(standardize_email(' fio.ff.g@hmail.com '))
# print(standardize_phone('+1 (98.7)-00-999'))
# print(is_email('ahoj@jmil.com'))
