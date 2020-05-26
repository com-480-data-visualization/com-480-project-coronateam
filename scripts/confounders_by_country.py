#confounders_by_country.py

import pandas as pd
import geopandas as gpd
import numpy as np

START_DATE='2020-01-22'
END_DATE='2020-03-17'

## DEMOGRAPHY PER COUNTRY

#Population groups
#https://ec.europa.eu/eurostat/web/population-demography-migration-projections/data/database
pop = pd.read_csv('docs/data/population_by_country.tsv', sep='\t', usecols=[0,1])

#Import geojson file with european countries
countries=gpd.read_file('docs/data/europe_countries.geojson')

pop[['unit','sex','age','geo']] = pop[pop.columns[0]].str.split(',',expand=True)
pop.columns=['init','pop','unit','sex','age','geo']
pop=pop[['geo','age','sex','pop']]

pop['sex'].replace(to_replace='F',value='female',inplace=True)
pop['sex'].replace(to_replace='M',value='male',inplace=True)
pop['sex'].replace(to_replace='T',value='total',inplace=True)

#Merge with countries
pop=pop.merge(countries[['id']], how='inner', left_on='geo', right_on='id')
pop.drop('id',axis=1,inplace=True)

#Replace weird characters (e,p)
pop['pop'] = pop['pop'].str.replace('e','')
pop['pop'] = pop['pop'].str.replace('p','')

pop.to_csv('docs/data/pop_toreshape.csv',index=False)
#reshape with reshape_demographics.R
pop=pd.read_csv('docs/data/demography_by_country.csv')

#Only keep %female
pop.drop(['male'],axis=1,inplace=True)


## NUMBER OF NEIGHBORING COUNTRIES

for idx, row in countries.iterrows():
    countries.loc[idx,'neighbors']=countries[countries.geometry.touches(row['geometry'])].shape[0]


## GROSS DOMESTIC PRODUCT

#Country codes
#https://geotargetly.com/geo-data/country-codes
iso = pd.read_csv('docs/data/iso_3166_country_codes.csv',encoding='iso-8859-1',header=None, names=['country','code2','code3','null'])
iso.loc[iso['code2']=='GR','code2']='EL'
iso.loc[iso['code2']=='GB','code2']='UK'

#GDP by country
#https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?view=map
gdp = pd.read_csv('docs/data/gdp_by_country.csv',skiprows=4)
#Use 2016 data for Liechtenstein (because unavailable for 2018)
gdp.loc[gdp['Country Code']=='LIE','2018']=gdp.loc[gdp['Country Code']=='LIE','2016']
gdp=gdp[['Country Code','2018']]

#Add iso3 to country
countries=countries.merge(iso[['code2','code3','country']], how='left',left_on='id',right_on='code2')

#Merge GDP with countries (miss two countries)
gdp=gdp.merge(countries[['id','code3']], how='right', left_on='Country Code', right_on='code3')
gdp=gdp[['id','2018']]
gdp.columns=['country','GDP']


## HEALTH EXPENDITURES PER GDP

#https://data.worldbank.org/indicator/SH.XPD.CHEX.GD.ZS
health_exp = pd.read_csv('docs/data/europe_health_expenditures.csv',skiprows=4)
#Merge health exp. with countries (miss two countries)
health_exp=health_exp.merge(countries[['id','code3']], how='right', left_on='Country Code', right_on='code3')
#Use 2017 data
health_exp=health_exp[['id','2017']]
health_exp.columns=['country','health_exp']


## INTERNET USERS (% POP)

#https://data.worldbank.org/indicator/IT.NET.USER.ZS
internet = pd.read_csv('docs/data/europe_internet_users.csv',skiprows=4)
internet=internet.merge(countries[['id','code3']], how='right', left_on='Country Code', right_on='code3')
#Use 2017 data
internet=internet[['id','2017']]
internet.columns=['country','internet']


## COVID CASES

covid=pd.read_csv('docs/data/geocoded_covid_cases.csv')
covid['date'] = pd.to_datetime(covid['date'])
#Filter by date
covid=covid[(covid.date>=START_DATE) & (covid.date<=END_DATE)]
#Count by countries
covid=covid.groupby(by='country_id')['covid_confirmed','covid_deaths'].sum().reset_index()


## TRENDS

trends=pd.read_csv('docs/data/geocoded_trends_bycountry.csv')
trends['date'] = pd.to_datetime(trends['date'])
trends=trends[(trends.date>=START_DATE) & (trends.date<=END_DATE)]
#Mean by countries
trends=trends.groupby(by='country_id')['trends_covid'].mean().reset_index()


## TWEETS

tweets=pd.read_csv('docs/data/geocoded_tweets.csv')
tweets['date'] = pd.to_datetime(tweets['date'])
tweets=tweets[(tweets.date>=START_DATE) & (tweets.date<=END_DATE)]
#Sum by countries
tweets=tweets.groupby(by='country_id')['covid_tweets'].sum().reset_index()


## QUARANTINE MEASURES

#From https://www.ouest-france.fr/sante/virus/coronavirus/carte-coronavirus-quels-pays-ont-adopte-le-confinement-general-6784490
# Classification: 1='Etat d'urgence, 2='Confinement partiel', 3='Confinement général', NA='No data'
# Update: 18/03/2020

measures=pd.Series([np.nan,3,3,2,2,3,3,2,3,3,2,1,2,3,1,3,np.nan,2,2,2,2,2,3,2,2,3,3,np.nan,np.nan,np.nan,2,2,np.nan,np.nan,3,np.nan,3],name='measures')

#Fill missing values with mean
measures.fillna(measures.mean(),inplace=True)

#Append to countries
countries=pd.concat([countries, measures], axis=1)


#Merge all covariates
covariates=covid.merge(countries[['id','neighbors','measures']],how='inner',left_on='country_id',right_on='id').merge(trends,how='inner',on='country_id').merge(tweets,how='left',on='country_id').merge(pop,how='left',left_on='country_id',right_on='geo').merge(gdp,how='left',left_on='country_id',right_on='country').merge(health_exp,how='left',left_on='country_id',right_on='country').merge(internet,how='left',left_on='country_id',right_on='country')
covariates.drop(['id','country','geo','country_x','country_y'],axis=1,inplace=True)
#Fill NA with 0 for tweets
covariates['covid_tweets'] = covariates['covid_tweets'].fillna(value=0)
#Fill NA with mean for health_exp
covariates['health_exp'] = covariates['health_exp'].fillna(covariates.health_exp.mean())


#Spatial covariates
cov_gdf=countries[['id','geometry']].merge(covariates,how='inner',left_on='id',right_on='country_id')

#Drop country id for solar correlation plot
covariates.drop(['country_id'],axis=1,inplace=True)

#Export to CSV
covariates.to_csv('docs/data/covariates_by_country.csv',index=False)
cov_gdf.to_file('docs/data/covariates_by_country.geojson',driver='GeoJSON')
