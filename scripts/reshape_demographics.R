#Covariates.R

library(tidyverse)

#Import dataset
pop=read_csv('../docs/data/pop_toreshape.csv')

#Convert data types
pop$age<-as.factor(pop$age)
pop$sex<-as.factor(pop$sex)
pop$pop<-as.numeric(pop$pop)

#Add categorie Y10_35 and reshape dataframe
pop <- pop %>% spread(key='age', value='pop') %>% mutate(Y10_35=`Y10-14`+`Y15-19`+`Y20-24`+`Y25-29`+`Y30-34`) %>% select(c('geo','sex','TOTAL','Y10_35'))
pop <- pop %>% pivot_wider(id_cols='geo', names_from='sex',values_from =c('TOTAL','Y10_35'))

#Convert female / male / Y10_35 to proportion [%]
pop <- pop %>% mutate(pop=TOTAL_total, female=(TOTAL_female*100)/TOTAL_total, male=(TOTAL_male*100)/TOTAL_total, Y10_35=(Y10_35_total*100)/TOTAL_total) %>% select(c('geo','pop','female','male','Y10_35'))

#Save results
write_csv(pop,'../docs/data/demography_by_country.csv')