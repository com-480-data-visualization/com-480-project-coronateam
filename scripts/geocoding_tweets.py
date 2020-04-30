#geocoding_tweets.py

import pandas as pd
import geopandas as gpd

#Import Covid-19 cases data
data = pd.read_csv('docs/data/geo_tweets_by_day.csv')

#Import geojson file with european regions
regions=gpd.read_file('docs/data/europe_regions_1m.geojson')

#Convert data to GeoDataframe
data=gpd.GeoDataFrame(data, geometry=gpd.points_from_xy(data.lon, data.lat), crs={'init': 'epsg:4326'})


#Spatial join with regions
geocoded=gpd.sjoin(regions[['id','CNTR_CODE','geometry']],data,how='right',op='intersects')

#Manual fixes
geocoded.drop(geocoded[geocoded.geo_country.isin(['SJ','VA','GG','GI','FO','GC','JE','IM','MC','SM','MD','AD','BY','BA','UA','RU'])].index, inplace=True) #Remove countries not in europe_regions.geojson
geocoded.loc[geocoded.geo_city.isin(['Skerries','Baldoyle','Moville','Rosslare']),['id','CNTR_CODE']]=['IE0','IE'] #Fix Ireland
geocoded.loc[geocoded.geo_city=='Funchal',['id','CNTR_CODE']]=['PT3','PT'] #Fix Portugal
geocoded.loc[geocoded.geo_city=='Novigrad',['id','CNTR_CODE']]=['HR0','HR'] #Fix Croatia
geocoded.loc[geocoded.geo_city.isin(['Peníscola',"Caldes d'Estrac",'Sant Carles de la Ràpita','Orpesa/Oropesa del Mar']),['id','CNTR_CODE']]=['ES5','ES'] #Fix Spain
geocoded.loc[geocoded.geo_city.isin(['Dunoon','Kilcreggan','Wemyss Bay','Findhorn']),['id','CNTR_CODE']]=['UKM','UK'] #Fix Great Britain
geocoded.loc[geocoded.geo_city.isin(['Sanxenxo','Vilanova de Arousa']),['id','CNTR_CODE']]=['ES1','ES']
geocoded.loc[geocoded.geo_city=='Audierne',['id','CNTR_CODE']]=['FRH','FR']
geocoded.loc[geocoded.geo_city=='Dieppe',['id','CNTR_CODE']]=['FRD','FR']
geocoded.loc[geocoded.geo_city.isin(['Vólos','Argostólion']),['id','CNTR_CODE']]=['EL6','EL']
geocoded.loc[geocoded.geo_city=='Askam in Furness',['id','CNTR_CODE']]=['UKD','UK']
geocoded.loc[geocoded.geo_city=='Knokke-Heist',['id','CNTR_CODE']]=['BE2','BE']
geocoded.loc[geocoded.geo_city=='Ponta Delgada',['id','CNTR_CODE']]=['PT2','PT']
geocoded.loc[geocoded.geo_city=='Rørvik',['id','CNTR_CODE']]=['NO0','NO']
geocoded.loc[geocoded.geo_city=='Mangalia',['id','CNTR_CODE']]=['RO2','RO']

#Final wrangling
geocoded=geocoded[['date','id','CNTR_CODE','lat','lon','count']].reset_index(drop=True)
geocoded.columns=['date','region_id','country_id','lat','lon','covid_tweets']

#Save to CSV
geocoded.to_csv('docs/data/geocoded_tweets.csv',index=False)
