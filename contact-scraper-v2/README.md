# Contact Scraper V2

## Project description

Building a contact scraper is pretty straightforward. Using regex, one can get any kind of contact he desires. Contact Scraper V2 matches those contacts to an actual entity. It builds contact objects which represent a company or a person on a given website.

## Progress

## 1. Clarify a new structure of contact objects

We decided to add additional data units to our contact objects like address, contact type and contact name.
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

The design doc is available [HERE](https://catnip-canopy-b4a.notion.site/Dataset-structure-bbcdbccb6a534ce8941fb099c452543c)

## 2. Building a dataset

This is an essential part of the process. We need a labeled dataset to measure the success of our algorithms and potentially train an ML model.

> This turned out to be the most challenging part of the project.

### Finding appropriate websites

We used Google API to find appropriate websites for scraping. Then we selected a random subset.

<b>Scripts:</b>

-   [Jupyter notebook](https://deepnote.com/workspace/student-mihal-ccd3dee8-206e-437e-b277-c8d9ac4179f7/project/APIFY-NextGen-scraper-d95e616e-5351-43d3-a7f5-6b72e11ce7ce/%2Fnotebook.ipynb)
    -   uses Google maps API to collect relevant websites for scraping. Returns more than 2000 URLs. Thanks to Google API we have access to some interesting metadata (contact, name, etc.)
-   [The sampling script](../Scraper_unique_urls/clean_and_sample_data.py)
    -   selects 500 random URLs from a list of Google API URLs

### Filtering websites that contain enough contacts

We used our previous contact scraper to filter websites that would be used for labeling. We set up our custom scoring to decide what website should pass the baseline. We also set an upper bound for the number of contacts on a page, so annotators don't have to annotate websites that would take them too much time and won't be very helpful.

> Learning: The baseline that was used, turned out to be too weak and most of the labeled websites contained only a single contact object.

> Learning: In order to speed up the scraping process, I decreased the limit of enqued links. That was a huge mistake because most of the websites have a large amount of links and our scraper could not reach contact pages.

The final URL count was 500

<b>Scripts</b>

-   [Filtering scraper](../Scraper_unique_urls/main.js)
    -   filters URLs that contain many contact nits, so annotators do not have to waste time
-   [Raw list of filtered URLs](../Scraper_unique_urls/urls_for_annotation.txt)
    -   Final raw list of URLs for scraping
-   [Final URL list](../Scraper_unique_urls/final_sampled.csv)
    -   final sampled list of URLs for annotators

### Annotating data

Our annotators filled out a Google sheet (It has a pretty simple and well-known UI). They were given instructions and prefilled an example sheet.
It was a little bit problematic to join their Google sheets and validate their work. We used custom scripts to fix this issue.

<b>Scripts</b>

-   [merge dataset script](../dataset-merge/set_offset.py)
    -   this script was used when combining multiple google sheets into a single dataset sheet

### Cleaning the annotated dataset

In order to be able to use the dataset, annotated contact units (emails, phone numbers, etc.) must match those that are automatically scraped by a regex script. Hence, we build a dataset validator that uses the Jaccard index to determine the goodness of the dataset.

> Results were pretty dissapointing but revealed many easily fixable bugs.

The median Jaccard index of unaltered data was ~ 0.20

We beautified the annotators' dataset by standardizing contact units and switching misplaced values.

Unfortunately, this did not raise the median that much. There were multiple factors that influenced the Jaccard index. Hence, we decided to use Levenstein distance <=2. More about Levenstein distance can be found [HERE](https://en.wikipedia.org/wiki/Levenshtein_distance)

After the cleanup and Levenstain implementation, our final median index was ~0.5

<b>Scripts</b>

-   [Library that parses the dataset and computes Jaccard indexes](dataset/dataset_evaluator.py)
-   [Beautifier](dataset/dataset_beautifier.py)
    -   Standardizes dataset, so it is easier to match annotated and scraped data
-   [The final dataset](https://docs.google.com/spreadsheets/d/1C_PXrH0N62wx4YcY28FIWbgEa6KOBUD_y65WjfUeh1U/edit#gid=505003787)
    -   Each row contains correct links to its subobjects. Fixed misplaced emails and phone numbers. Removed spaces and wrong email formats.

## 3. Grouping algorithm

Firstly, we decided to use pure HTML to find contact objects and not to use any ML algorithms.

### A greedy algorithm that uses DIVS as contact object separators

<b>Basic idea:</b> We use DIV elements as object identifiers and separators.

<b>Definitions:</b>

-   Empty DIV is a DIV whose content is free of any contact info. (Our regex could not find anything)
-   Leaf DIV is a DIV that contains at least one contact and that does not contain any other DIVs or all of its DIV children are empty DIVs.

All contacts that are inside a single leaf DIV belong to a single contact object. If there is a contact whose position is not in a leaf DIV, then we add it to a "trash" contact object

<b>Example:</b>

```html
<html>
    <div>
        hello@company.com
        <div>ceo@company.com +420919086799</div>
        <div>
            cto@company.com
            <a href="https://linkedin.com/cto">CTO</a>
        </div>
    </div>
    <div>https://youtube.com/company</div>
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

Although the algorithm sounds simple, the Puppeteer API does not allow us to build a simple algorithm. So we had to use a small workaround to simulate the steps mentioned above. Here is a proper description of what the algorithm does:

1. Find all DIVS on a given website
2. Find all contacts in a given DIV. Do that for each DIV
3. Sort DIVS (descending) by the number of contact units they contain
4. Iterate through the list of DIVS
5. check if there is a subset of contacts in the list of DIVS for a given DIV A (currently iterated)
6. If the list does contain a subobject of the DIV currently iterated, then we can delete this DIV. It is not a leaf node. If it contains any contact units that do not occur anywhere else, we will create a trash contact object for them.
7. if the list does not contain a subobject, then this DIV represents one of the final contact objects. We push it to the final array. It is a leaf node.
8. The resulting list is represented by leaf DIVS and one trash DIV.

Perfect real-world example: https://missionlocal.org/about-3/ (algorithm achieved )

### Greedy algorithm upgrade

After running the scoring function on our greedy algorithm, we noticed several heuristics that might help in improving the resulting contact objects:

-   Add new separator tags such as TR, TD, UL, ADDRESS
-   Add weak TAGS (If they contain only a single contact unit we will neglect them) P, LI
-   Do not neglect phonesUncertain
-   Group objects into one if they don't share the same properties

<!-- TODO: explain this a little bit more -->

## 4. Evaluating the algorithm

We need a way to evaluate the correctness of our algorithm.
We deal with multiple objects that contain multiple properties.
There are several discrepancies between annotated dataset and the actual scraped data, so we need to take that into an account.
The most important parameter is the difference between the number of contact objects of scraped and annotated websites. With Jaccard similarity just around 0.5, it seems futile to compare the actual contents of contact objects.

Once we achieve relatively good "object number" similarity, then we can care about the actual content of those objects.

So our first metric was the difference between the number of contact objects.
We computed the median and average.

In many cases, if the number of contact objects matches, then it is highly probable that the contents of those objects will match as well.

<b>Results for 20 URLs dataset (Many contact objects per website [6]):</b>

<table>
  <tr>
    <th>Algorithm</th>
    <th>average difference in the number of objects</th>
    <th>median difference</th>
    <th>weighted difference (determines strength of grouping)</th>

  </tr>
  <tr>
    <td>DIVS</td>
    <td>2</td>
    <td>~4.1</td>
    <td>0</td>
  </tr>
  <tr>
    <td>DIVS, TR, TD</td>
    <td>2</td>
    <td>~3.4</td>
    <td>0</td>
  </tr>
  <tr>
    <td>DIVS, TR, TD and weak P, LI tags</td>
    <td>1</td>
    <td>~2.76</td>
    <td>0 (AVG: 1.6)</td>
  </tr>
   <tr>
    <td>DIVS, TR, TD and weak P, LI tags + Uncertain objects</td>
    <td>1</td>
    <td>~2.51</td>
    <td>0 (AVG: 1.14)</td>
  </tr>
</table>

<b>100 URLs randomly selected</b>

<table>
  <tr>
    <th>Algorithm</th>
    <th>average difference</th>
    <th>median difference</th>
    <th>weighted difference (determines strength of grouping)</th>

  </tr>
  <tr>
    <td>DIVS, TR, TD and weak P, LI tags</td>
    <td>1</td>
    <td>~1.79</td>
    <td>-1 (AVG: -1.4)</td>
  </tr>
   <tr>
    <td>DIVS, TR, TD and weak P, LI tags + uncertain objects</td>
    <td>1</td>
    <td>~2.04</td>
    <td>-1 (AVG: -1.72)</td>
  </tr>
  <tr>
    <td>DIVS, TR, TD and weak P, LI tags + uncertain objects + unit grouping</td>
    <td>0</td>
    <td>~1.53</td>
    <td>0 (AVG: -1.21)</td>
  </tr>
  <tr>
    <td>DIVS, TR, TD and weak P, LI tags + uncertain objects + unit grouping + grouping similar objects</td>
    <td>0</td>
    <td>~1.27</td>
    <td>0 (AVG: -0.95)</td>
  </tr>
</table>

<b>Scripts</b>

-   [Python script that computes the correctness of a given algorithm](./dataset/score_calculator.py)
-   Computes the median and average difference between the number of contact objects (algorithm vs annotated)

## 5. Summary

The first part of the project was to collect a relatively good dataset and create a simple algorithm that does not require AI. We achieved moderate results.

#### Ideas

-   Use the tree structure of an HTML page as a metric. This would provide necessary data for training an ML model (requires better API)
-   Compute actual (visual) distances between contact units and use them as input data for training an ML algorithm. Puppeteer renders a given website so its API allows us to get Euclidian distance between selected HTML objects.
