#geocoding_trends_countries.py

import pandas as pd
import geopandas as gpd
import numpy as np

#Import Google Trends data
data = pd.read_csv('docs/data/interest_by_country.csv')

#Import geojson file with european countries
countries=gpd.read_file('docs/data/europe_countries.geojson')

#Keep only countries from geojson
data=data[data.geoCode.isin(countries.id)]

#Rename columns
data.rename(columns={'Unnamed: 0':'date','geoCode':'country_id','Coronavirus':'trends_covid'},inplace=True)

#Save to CSV
data.to_csv('docs/data/geocoded_trends_bycountry.csv',index=False)
