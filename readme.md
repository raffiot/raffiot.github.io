Wikipedia Activity Analysis:
This project is a tool to observe Wikipedia articles activity.
The algorithmic part is in python and the visualization part is in javascript.
The result is available at https://raffiot.github.io/


Algorithmic part:
The jupyter notebook would work in an archive with the following setup


|
|--diseases_deep_graph.ipynb
|--diseases_graph.ipynb
|--wikispedia_graph.ipynb
|--XX_century_graph.ipynb
|
+--Data
|+--diseases
|||--diseases_edges.csv
|||--diseases_edges_big.csv
||
|+--normal_pages
|||--normal_pages.pkle
||
|+--wikispeedia_paths-and-graph
|||--articles.tsv
|||--links.tsv
|||--categories.tsv
||
|+--XX_century
|||--edges_20c.csv

The format for the different edges file (diseases_edges.csv, diseases_edges_big, edges_20c) is "p1.id"	"rel"	"p2.id"
with p1.id is link source page id, rel is the relation (LINKS_TO or BELONGS_TO) and p2.id is link target page id.

The format for normal_pages.pkle is index=id, columns=[article,isRedirect,isNew]. In .ipynb files there is also the code to import it from csv files.

The format for articles.tsv is "article_name"
The format for links.tsv is "linkSource" "linkTarget"
The format for categories is "article_name" "category"

The code takes about ten minutes to run depending on your internet connection 
