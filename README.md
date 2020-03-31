# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Lucas Strauss | 272432 |
| Anais Ladoy | 216090 |
| François Quellec | 225118 |

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)

**10% of the final grade**

The Covid-19 has been much talked about, both in the media and on social networks, hundreds of thousands of posts on this subject are published every day around the world.
Many denounce the anxiety that this amount of information about this pandemic creates.

In order to better understand this infodemia we propose in this project to visualize this phenomenon on an interactive map of Europe.

Many dashboards providing information on Covid-19 have recently emerged but none (to our knowledge) deals with the flow of information.

### Dataset

##### Coronavirus Informations
To begin with, we decided to represent three different pieces of information about the coronavirus. The first one being obviously the different statistics related to the spread of the virus.

BLABLABLA the dataset is like that, you can find it here BLABLABLA

Hopkins University repository for Coronavirus: https://github.com/CSSEGISandData/COVID-19

##### Tweets
We then decided to represent a part of the spread of the information on the social network Tweeter, a certain number of tweet are geolocalized so it could be interesting to compare the evolution of the virus with the number of reactions from the population geographically.

BLABLABLA

Twitter api: + dataset twitter (https://github.com/echen102/COVID-19-TweetIDs)

##### Google searches
Finally the last aspect we want to represent is the number of google searches according to regions. Indeed, combined with the number of tweet this could be a good indicator of the anxiety-provoking climate that reigns in Europe at the moment.

In order to acquire a dataset on the number of google searches by region in Europe we used [pytrends](https://pypi.org/project/pytrends/) a pseudo API for Google Trend website, the scripts we've made to construct the dataset are in the scripts/ folder.

Unfornately Google Trend makes accessible only an index representing the popularity of a search, here "Coronavirus", depending on the day and the country concerned, so we will have to adapt the indexes to have a smaller granularity.

### Problematic
Frame the general topic of your visualization and the main axis that you want to develop.

 - What am I trying to show with my visualization?
 - Think of an overview for the project, your motivation, and the target audience.


### Exploratory Data Analysis
The main objective of the project is to study the geographical correlation between the Coronavirus and different types of information systems.
In order to see if there is a correlation with the number of tweets talking about it and the number of Google searches, we first plotted these figures
for 4 European countries that were affected early by the coronavirus.

##### Google search index versus Coronavirus
![alt text](imgs/covidVsGtrend.png "Google search index versus Coronavirus")

We can see here that for Italy, the google search spike coincides perfectly with the outbreak of COVID-19 cases in the country it does seem to be correlated. It is also interesting to note that the countries bordering Italy see an increase in the number of searches a few days after Italy, these spikes seem to be related to the spread of the virus in Italy and not only in their respective countries.

##### Number of tweets versus Coronavirus
![alt text](imgs/covidVsTweets.png "Number of tweets versus Coronavirus")

With regard to the number of tweets about COVID-19, although trends and uses are different in each country, the fluctuations still seem to be directly related to the spread of the virus in each country.

The two graphs presented above clearly show a correlation between the population's reactions on Twitter or Google and the geographical evolution of the epidemic. These results comfort us in the desire to visualize these variables on an interactive map.

### Related Work
 - What others have already done with the data?
 - Why is your approach original?
 - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
 - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

There has already been quite some work on the recent Coronavirus pandemic. The most notable is probably the one on the genetic evolutions of the virus' mutations by the Nextstrain team (https://nextstrain.org/ncov). Some journals have already published some simple infographics such as https://www.ft.com/coronavirus-latest and https://labs.letemps.ch/interactive/2020/carte-coronavirus-monde.

Original approach: ???

Inspiration: cartogram ?

 François Quellec has previously worked on an [article](https://github.com/labsletemps/coronavirus-trends) that has been published on the swiss magazine "Le Temps" using the Johns-Hopkins dataset, Google Trends, LinkAlong and the Twitter API. We may reuse the same datasets (especially the Johns-Hopkins) but our visualization will be different and we aim at representing all Europe (and the entire world if the data allows us).

## Milestone 2 (Friday 1st May, 5pm)
**10% of the final grade**



## Milestone 3 (Thursday 28th May, 5pm)
**80% of the final grade**
