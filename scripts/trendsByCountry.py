##################################################
#                                                #
#                                                #
##################################################

import pandas as pd
from pytrends.request import TrendReq

OUTPUT_PATH = "interest_by_country.csv"
KEYWORDS 	= ["Coronavirus"]
START_DATE 	= '01/01/2020' 					# format %m/%d/%Y
END_DATE 	= pd.datetime.now().date()		

pytrends = TrendReq(hl='en-US', tz=360)
dates = pd.date_range(start=START_DATE, end=END_DATE)

interest_by_country = pd.DataFrame(columns=['date', 'geoName', 'geoCode', 'Coronavirus'])

for date in dates:
    date_formated = date.date().strftime('%Y-%m-%d')
    pytrends.build_payload(KEYWORDS, timeframe=date_formated + ' ' + date_formated)
    
    timeoutOccured = True
    while timeoutOccured:
        try:
            interest = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True, inc_geo_code=True)
            timeoutOccured = False
            
    interest = interest.reset_index()
    interest['date'] = date
    
    if(interest.Coronavirus.max() != 100):
        continue
    
    print("date: ", date.date(),", max: ", interest.Coronavirus.max(),'\r', end="") 
    interest_by_country = interest_by_country.append(interest)

interest_by_country.to_csv(OUTPUT_PATH, index=False)