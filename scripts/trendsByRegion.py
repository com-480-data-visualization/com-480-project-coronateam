import pandas as pd
from pytrends.request import TrendReq
import time
import sys

APPEND_MODE = True
OUTPUT_PATH = "interest_by_region.csv"
KEYWORDS    = ["Coronavirus"]
START_DATE  = '03/24/2020'                  # format %m/%d/%Y
END_DATE    = pd.datetime.now().date()      

pytrends = TrendReq(hl='en-US', tz=360, retries=10, backoff_factor=0.5)
dates = pd.date_range(start=START_DATE, end=END_DATE)

# Get Europe countries iso-code
all_countries = pd.read_csv("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv")
europe_countries = all_countries[all_countries.region == "Europe"]
europe_countries = europe_countries['alpha-2'].values

interest_by_region = pd.DataFrame(columns=['Coronavirus', 'country', 'date', 'geoCode', 'geoName'])

for date in dates:
    date_formated = date.date().strftime('%Y-%m-%d')
    for country in europe_countries: 
        timeoutOccured = True
        while timeoutOccured:
            try:  
                pytrends.build_payload(kw_list, timeframe=date_formated + ' ' + date_formated, geo=country)
                interest = pytrends.interest_by_region(resolution='REGION', inc_low_vol=True, inc_geo_code=True)
                timeoutOccured = False
            except KeyError:
                print("KeyError for ", date, country)
                break
            except: 
                print(sys.exc_info()[0])
                print(sys.exc_info()[1])
                time.sleep(5)
                
        
        if len(interest) == 0:
            print("No data for date: ", date.date(), " country: ", country)
            continue
            
        interest = interest.reset_index()
        interest['date'] = date
        interest['country'] = country
        
        if(interest.Coronavirus.max() != 100):
            print("Data incomplete for: ", date.date(), " country: ", country)
            continue

        print("date: ", date.date(),", country: ", country,'\r', end="") 
        interest_by_region = interest_by_region.append(interest)

interest_by_region = interest_by_region.drop_duplicates
interest_by_region = interest_by_region[['date', 'country', 'geoCode', 'geoName', 'Coronavirus']]

if APPEND_MODE:
    interest_by_region.to_csv(OUTPUT_PATH, index=False, mode='a', header=False)
else:
    interest_by_region.to_csv(OUTPUT_PATH, index=False)



