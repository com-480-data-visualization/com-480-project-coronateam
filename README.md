# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Lucas Strauss | 272432 |
| Anais Ladoy | 216090 |
| François Quellec | 225118 |

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)

**10% of the final grade**

The COVID-19 has been much talked about, both in the media and on social networks, hundreds of thousands of posts on this subject are published every day around the world.
Many denounce the anxiety that this amount of information about this pandemic creates.

In order to better understand this infodemic we propose in this project to visualize this phenomenon on an interactive map of Europe.

Many dashboards providing information on Covid-19 have recently emerged but none (to our knowledge) deals with the flow of information.

### Dataset

##### Reported cases of COVID-19
The first dataset we will use concerned the geolocalized reported cases of COVID-19 across the world, provided by the John Hopkins University (USA). In December 2019, a research team from the university launched an interactive web-based dashboard to track COVID-19 in real-time (Dong et al., 2020) using data from various sources. They make all the data collected and displayed freely available in Github for researchers and public health authorities.

More specifically, we will use the time series daily summary, which is updated once a day and provides information about the number of confirmed cases, deaths and recoveries related to the Novel Coronavirus. Data are geolocalized using Lat/Lon coordinates at the Country/Region level or if known, the Province/State.

CSSE COVID-19 Dataset repository: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data


##### Tweets
We then decided to represent a part of the spread of the information on the social network Twitter, a certain number of tweet are geolocalized so it could be interesting to compare the evolution of the virus with the number of reactions from the population geographically.

Twitter api: + dataset twitter (https://github.com/echen102/COVID-19-TweetIDs)

This repository is interesting because it already regroup Coronaviruses tweets. We "only" have to hydrate them (i.e. from each tweet ID, get the corresponding tweet from the Twitter API). Because we only care about the location of the tweets we don't know how easy it is.

##### Google searches
Finally the last aspect we want to represent is the number of google searches according to regions. Indeed, combined with the number of tweet this could be a good indicator of the anxiety-provoking climate that reigns in Europe at the moment.

In order to acquire a dataset on the number of google searches by region in Europe we used [pytrends](https://pypi.org/project/pytrends/) a pseudo API for Google Trend website, the scripts we've made to construct the dataset are in the scripts/ folder.

Unfornately Google Trend makes accessible only an index representing the popularity of a search, here "Coronavirus", depending on the day and the country concerned, so we will have to adapt the indexes to have a smaller granularity.

### Problematic

While there are a multitude of interactive maps available on COVID-19, the vast majority only depict the spread of the disease. In our research, we want to relate COVID-19's spatial distribution with the reaction of the population, defined here by the amount of information on both social networks (i.e. Twitter) and search engines (i.e. Google Trend).

Our main hypothesis is that the population response across European countries could be spatially heterogeneous, and not necessarily follow the spread of the pandemic.
Indeed, although all European countries are now affected by the Novel Coronavirus, it can be seen that even neighboring countries have employed different policies to fight the pandemic. Therefore, we could expect different population response too.

The central element of our visualization will be an interactive map, allowing the user to explore the link between the prevalence of the disease and the flow of information on social networks and search engines (i.e. a proxy for the population response in a specific country) as the pandemic spreads. Other visualizations will allow us to complete our analysis, e.g. by allowing the user to have a more detailed analysis for each country.


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
There has already been quite some work on the recent Coronavirus pandemic. The most notable is probably the one on the genetic evolutions of the virus' mutations by the Nextstrain team (https://nextstrain.org/ncov). Some journals have already published some simple infographics such as https://www.ft.com/coronavirus-latest and https://labs.letemps.ch/interactive/2020/carte-coronavirus-monde.

Original approach:Most of the actual vizualizations are on the medical part of the pandemic. Our main focus will be to vizualize the digital impact of the virus, not the number of cases. We may find correlations or decorrelations between our datasets and that's what we want to empathize on.


Inspiration: ![cartogram](https://cdn.radiofrance.fr/s3/cruiser-production/2012/04/a8d2df12-8ef8-11e1-a6ab-842b2b72cd1d/838_cartogramme-lepen.jpg "Cartogram inspiration")
We may add some 3D components to our map, similar to https://pudding.cool/2018/10/city_3d.

#### References  
- Dong, E., Du, H., & Gardner, L. (2020). An interactive web-based dashboard to track COVID-19 in real time. The Lancet Infectious Diseases, S1473309920301201. https://doi.org/10.1016/S1473-3099(20)30120-1


## Milestone 2 (Friday 1st May, 5pm)
**10% of the final grade**



## Milestone 3 (Thursday 28th May, 5pm)
**80% of the final grade**
