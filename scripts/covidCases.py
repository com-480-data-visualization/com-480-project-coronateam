import pandas as pd

DATE=pd.Timestamp.now().date()
OUTPUT_PATH = "docs/data/covid_cases_"+str(DATE)+".csv"

def import_Hopkins(url,value_name):
    dataset=pd.read_csv(url)

    dataset=pd.melt(dataset, id_vars=list(dataset.columns[0:4]),
        value_vars=list(dataset.columns[4:]),
        var_name='Date',
        value_name=value_name)

    dataset.set_index(['Date', 'Country/Region','Province/State'], inplace=True)
    dataset.reset_index(inplace=True)

    return dataset

#Extract covid confirmed cases
confirmed_url="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
confirmed=import_Hopkins(confirmed_url, 'Confirmed')

#Extract covid deaths
deaths_url="https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
deaths=import_Hopkins(deaths_url, 'Deaths')

if confirmed.shape!=deaths.shape:
    raise('Error with the dataset structure.')

#Merge datasets
covid=confirmed.merge(deaths[['Date','Country/Region','Province/State','Deaths']], how='inner', on=['Date','Country/Region','Province/State'])

if covid.shape[0]!=confirmed.shape[0]:
    raise Exception('Error during the merge between Confirmed and Deaths datasets.')

#Save to CSV
covid.to_csv(OUTPUT_PATH, sep=';', index=False)
