#Covariates.R

library(tidyverse)

#Import dataset
pop=read_csv('../docs/data/pop_toreshape.csv')

#Convert data types
pop$age<-as.factor(pop$age)
pop$sex<-as.factor(pop$sex)
pop$pop<-as.numeric(pop$pop)

#Add categorie young and reshape dataframe
pop <- pop %>% spread(key='age', value='pop') %>% mutate(young=`Y_LT5`+`Y5-9`+`Y10-14`, elderly=`Y65-69`+`Y70-74`+`Y_GE75`) %>% select(c('geo','sex','TOTAL','young','elderly'))
pop <- pop %>% pivot_wider(id_cols='geo', names_from='sex',values_from =c('TOTAL','young','elderly'))

#Convert female / male / young to proportion [%]
pop <- pop %>% mutate(pop=TOTAL_total, female=(TOTAL_female*100)/TOTAL_total, male=(TOTAL_male*100)/TOTAL_total, young=(young_total*100)/TOTAL_total, elderly=(elderly_total*100)/TOTAL_total) %>% select(c('geo','pop','female','male','young','elderly'))

#Save results
write_csv(pop,'../docs/data/demography_by_country.csv')
