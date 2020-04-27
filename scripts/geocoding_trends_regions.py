#geocoding_trends_regions.py

import pandas as pd
import geopandas as gpd
import geocoder
from shapely.geometry import shape
import json
import time
import numpy as np

#Import Google Trends data
data = pd.read_csv('docs/data/interest_by_region.csv')

#Import geojson file with european regions
regions=gpd.read_file('docs/data/europe_regions_1m.geojson')

#Extract only unique values
to_geocode=data[['country','geoName']].drop_duplicates(keep='first')

#Function to geocode with OSM
def geocode(df,request):
    geo=geocoder.osm(request)
    try:
        df.loc[idx,'Lat']=geo.lat
    except:
        df.loc[idx,'Lat']=np.nan
    try:
        df.loc[idx,'Lon']=geo.lng
    except:
        df.loc[idx,'Lon']=np.nan


for idx,row in to_geocode.iterrows():
    request=row.country + ',' + row.geoName
    geocode(to_geocode,request)
    time.sleep(1)

nf=to_geocode[to_geocode.Lat.isna()]
nf.replace(to_replace=['Region','Municipality','Canton'], value="",regex=True,inplace=True)

for idx,row in nf.iterrows():
    request=row.country + ',' + row.geoName
    geo=geocode(nf,request)
    time.sleep(1)


#Remove rows where countries are not part of Europe (according to europe_regions.geojson)
to_geocode.drop(to_geocode[(to_geocode.Lat.isna()) & (~to_geocode.country.isin(regions.CNTR_CODE))].index, inplace=True)

#Fill manually missing coordinates
#Finland
to_geocode.loc[to_geocode.geoName.isin(['Northern Savonia', 'Southern Ostrobothnia','Southern Savonia','Tavastia Proper']),'Lon']=26.247354
to_geocode.loc[to_geocode.geoName.isin(['Northern Savonia', 'Southern Ostrobothnia','Southern Savonia','Tavastia Proper']),'Lat']=64.488603
#Latvia
to_geocode.loc[to_geocode.geoName.isin(['Beverīna Municipality', 'Liepājas pilsēta','Pārgauja Municipality','Vārkava Municipality']),'Lon']=24.927135
to_geocode.loc[to_geocode.geoName.isin(['Beverīna Municipality', 'Liepājas pilsēta','Pārgauja Municipality','Vārkava Municipality']),'Lat']=56.853983
#Macedonia
to_geocode.loc[to_geocode.geoName.isin(['Brvenitsa', 'Municipality of Rankovtse']),'Lon']=21.702515
to_geocode.loc[to_geocode.geoName.isin(['Brvenitsa', 'Municipality of Rankovtse']),'Lat']=41.600905
#Luxembourg
to_geocode.loc[to_geocode.geoName=='Luxembourg District','Lon']=6.094154
to_geocode.loc[to_geocode.geoName=='Luxembourg District','Lat']=49.774671

#Convert to GeoDataframe
to_geocode=gpd.GeoDataFrame(to_geocode, geometry=gpd.points_from_xy(to_geocode.Lon, to_geocode.Lat), crs={'init': 'epsg:4326'})

#Spatial join with regions
geocoded=gpd.sjoin(regions[['id','geometry']],to_geocode,how='right',op='intersects')

#Manual fixes
geocoded.drop(geocoded[geocoded.country.isin(['SM','MD','AD','BY','BA','UA','RU'])].index, inplace=True) #Remove countries not in europe_regions.geojson
geocoded.loc[geocoded.geoName.isin(['Eastern Region','Northeast']),'id']='IE0' #Fix Ireland
geocoded.loc[geocoded.geoName.isin(['Nordland','Rogaland','Troms']),'id']='NO0' #Fix Norway
geocoded.loc[geocoded.geoName.isin(['Blekinge County','Kalmar County']),'id']='SE2' #Fix Sweden
geocoded.loc[geocoded.geoName=='Stockholm County','id']='SE1' #Fix Sweden
geocoded.loc[geocoded.geoName=='Zeeland','id']='NL3' #Fix Netherlands
geocoded.loc[geocoded.geoName.isin(['Dubrovnik-Neretva County','Split-Dalmatia County']),'id']='HR0' #Fix Croatia
geocoded.loc[geocoded.geoName=='Setubal','id']='PT1' #Fix Portugal
geocoded.loc[geocoded.geoName=='Saare County','id']='EE0' #Fix Estonia
geocoded.loc[geocoded.geoName=='Sofia City Province','id']='BG4' #Fix Bulgaria

geocoded=geocoded[['id','country','geoName']].reset_index(drop=True)
geocoded.rename(columns = {'id':'region_id'}, inplace = True)

#Non spatial merge with data
data=data.merge(geocoded, how='inner', on=['country','geoName'])

#Group by on date + regions_id and sum the number of trends
trends_geocoded=pd.DataFrame(data.groupby(by=['date','region_id']).agg('mean').reset_index())
trends_geocoded.rename(columns = {'Coronavirus':'trends_covid'}, inplace = True)

#Save to CSV
trends_geocoded.to_csv('docs/data/geocoded_trends_byregion.csv',index=False)
