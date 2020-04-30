#pca.R

library(corrplot)
library(tidyverse)
library(FactoMineR)
library(factoextra)

#Import dataset
data <- read_csv('../docs/data/covariates_by_country.csv')

#Replace missign values (in GDP) by median
data <- data %>% mutate_all(~ifelse(is.na(.x), median(.x, na.rm = TRUE), .x))  
data <- data %>% column_to_rownames(var = "country_id")

data <- data %>% filter(rownames(data)=='FR')

pca.data.cor<-data %>% scale() %>% cor(method='pearson')
corrplot::corrplot(pca.data.cor, tl.col='black', tl.cex = 0.5, col=colorRampPalette(c("blue","red"))(200))

#Run PCA with FactoMineR
ncp=3 #number of PC displayed in the results
pca.res <- data %>% scale() %>% PCA(ncp=ncp,graph=FALSE)

#Summary 
summary(pca.res)
#Scree plot (keep eigenvalues >1)
fviz_eig(pca.res, choice = "eigenvalue", addlabels=TRUE, barfill='black', barcolor='black')

#Graph of variables
fviz_pca_var(pca.res, axes=c(1,2))
fviz_pca_var(pca.res, axes=c(1,3))

fviz_pca_biplot(pca.res)
