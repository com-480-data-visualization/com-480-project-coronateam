#geocoding_covid_countries.py

import pandas as pd
import geopandas as gpd

#Import Covid-19 cases data
data = pd.read_csv('docs/data/covid_cases_2020-04-01.csv',sep=';')

#Import geojson file with european countries
countries=gpd.read_file('docs/data/europe_countries.geojson')

#Convert data to GeoDataframe
data=gpd.GeoDataFrame(data, geometry=gpd.points_from_xy(data.Long, data.Lat), crs={'init': 'epsg:4326'})

#Spatial join with europe_countries
geocoded=gpd.sjoin(countries[['id','geometry']],data,how='inner',op='intersects')

#Final wrangling
geocoded['Date'] = pd.to_datetime(geocoded['Date'])
geocoded=geocoded.groupby(by=['id','Date']).sum().reset_index()

geocoded.sort_values(by=['Date'],axis=0,inplace=True)
geocoded=geocoded[['Date','id','Lat','Long','Confirmed','Deaths']]
geocoded.columns=['date','country_id','lat','lon','covid_confirmed','covid_deaths']

#Save to CSV
geocoded.to_csv('docs/data/geocoded_covid_cases.csv',index=False)
