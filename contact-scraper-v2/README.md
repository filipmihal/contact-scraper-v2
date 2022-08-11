# Contact Scraper V2

## Project description

Building a contact scraper is pretty straight-forward. Using regex, one can get any kind of contact he desires. Contact Scraper V2 mtaches those contacts to an actual entity. It builds contact objects which represent a company or a person on a given website.

## Progress

## 1. Clarify new structure of contact objects

We decided to add additional data units to our contact object like address, contact type and contact name.
We agreed on a nested structure of contact objects.

Structure:

```json
// entity
{
	"entityType" : "Company", // Company, Person, Unknown are the only options here
	"name": "CEST",
	"emails": ["cest@company.com"],
	"phones": ["+421907986338"],
	"address": ["Bela Bartoka 7\nBratislava\nSlovakia"],
	"linkedIns": ["https://www.linkedin.com/company/933371"],
	"twitters": [],
	"instagrams": [
	    "https://www.instagram.com/cest_research",
	    "https://www.instagram.com/cest_the_best/"],
	"facebooks": [],
	"youtubes": ["https://www.youtube.com/channel/UCkxsBw9LORV8cD1KCE4QtPQ"]
	"childEntities" : [] // contains nested entities
}
```

design doc is available [HERE](https://catnip-canopy-b4a.notion.site/Dataset-structure-bbcdbccb6a534ce8941fb099c452543c)

## 2. Building a dataset

This is an essential part of the process. We need labeled dataset to measure success of our algorithms and potentially train an ML model.

> This turned out to be the most challenging part of the project.

### Finding appropriate websites

We used Google API to find appropriate websites for scraping. Then we selected a random subset.

<b>Scripts:</b>

-   [Jupyter notebook](https://deepnote.com/workspace/student-mihal-ccd3dee8-206e-437e-b277-c8d9ac4179f7/project/APIFY-NextGen-scraper-d95e616e-5351-43d3-a7f5-6b72e11ce7ce/%2Fnotebook.ipynb)
-   [Sampling script](../Scraper_unique_urls/clean_and_sample_data.py)

### Filtering websites that contain enough contacts

We used our previous contact scraper to filter websites that would be used for labeling. We set up our custom scoring to decide what website should pass the baseline. We also set a upper bound for the number of contacts on a page, so annotators don't have to annotate websites that would take them too much time and won't be very helpful.

> Learning: The baseline that was used, turned out to be too weak and most of the labeled websites contained only a single contact object.

> Learning: In order to speed up the scraping process, I decreased the limit of enqued links. That was a huge mistake because most of the websites have a large amount of links and our scraper could not reach contact pages.

Final URL count was 500

<b>Scripts</b>

-   [Filtering scraper](../Scraper_unique_urls/main.js)
-   [Raw list of filtered urls](../Scraper_unique_urls/urls_for_annotation.txt)
-   [Final url list](../Scraper_unique_urls/final_sampled.csv)

### Annotating data

Our annotators filled out a Google sheet (It has a pretty simple and well-known UI). They were given instructions and prefilled example sheet.
It was little bit problematic to join their Google sheets and validate their work. We used custom scripts to fix this issue.

<b>Scripts</b>

-   [merge dataset script](../dataset-merge/set_offset.py)

### Cleaning the annotated dataset

In order to be able to use the dataset, annotated contact units (emails, phone numbers, etc.) must match those that are automatically scraped by a regex script. Hence, we build a dataset validator that uses Jaccard index to determines goodness of the dataset.

> Results were pretty dissapointing but revealed many easily fixable bugs.

Median Jaccard index of data not altered in any way was ~ 0.20

We beautified the annotators' dataset by standardazing contact units and switching misplaced values.

<b>Scripts</b>

-   [Library that parses the dataset and computes Jaccard indeces](dataset/dataset_evaluator.py)
-   [Beautifier](dataset/dataset_beautifier.py)

## 3. Grouping algorithm

Firstly, we decided to use pure HTML to find contact objects and not to use any ML algorithms.

### Greedy algorithm that uses DIVS as contact object separators

<b>Basic idea:</b> We use DIV elements as object identifiers and separators.


<b>Definitions:</b>
- Empty DIV is a DIV whose content is free of any contact info. (Our regex could not find anything)
- Leaf DIV is a DIV that contains atleast one contact and that does not contain any other DIVs or all of its DIV children are empty DIVs.


All contacts that are inside a single leaf DIV belong to a single contact object. If there is a contact whose position is not in a leaf DIV, then we add it to a "trash" contact object


<b>Example:</b>
```html
<html>
    <div>
        hello@company.com
        <div>
        ceo@company.com
        +420919086799
        </div>
        <div>
        cto@company.com
        <a href='https://linkedin.com/cto'>CTO</a>
        </div>
    </div>
    <div>
    https://youtube.com/company
    </div>
</html>
```

<b>Resulting objects:</b>

```json
[
    {
        // trash object
        "emails": ["hello@company.com"]
    },
    {
        "emails": ["ceo@company.com"],
        "phones": ["+420919086799"]
    },
    {
        "emails": ["cto@company.com"],  
        "linkedins": ["https://linkedin.com/cto"] 
    },
    {
        "youtubes": ["https://youtube.com/company"]
    }
]
```

Although, the algorithm sounds simple, the Puppeteer API does not allow us to build a simple algorithm. So we had to use small work arounds to simulate the steps mentioned above. Here is a proper description of what the algorithm does:




1. Find all DIVS on a given website
2. Find all contacts in a given DIV. Do that for each DIV
3. Sort DIVS (descending) by the number of contact units they contain
4. Iterate throught the list of DIVS
5. check if there is a subset of contacts in the list of DIVS for a given DIV A (currently iterated)
6. If yes, then we can delete this DIV. If it contains any contact units that do not occur anywhere else, we will create a trash contact object for them.
7. if no (there is no subset in the list) then this DIV represents one of the final contact objects.
8. Resulting list is represented by leaf DIVS and one trash DIV.

<!-- TODO: explain this a little bit more -->
