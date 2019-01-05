Wikipedia Activity Analysis:<br />
This project is a tool to observe Wikipedia articles activity.<br />
The algorithmic part is in python and the visualization part is in javascript.<br />
The result is available at https://raffiot.github.io/<br />
<br />

Algorithmic part:<br />
The jupyter notebook would work in an archive with the following setup<br />
<br />
<br />
|<br />
|--diseases_deep_graph.ipynb<br />
|--diseases_graph.ipynb<br />
|--wikispedia_graph.ipynb<br />
|--XX_century_graph.ipynb<br />
|<br />
+--Data<br />
|+--diseases<br />
|||--diseases_edges.csv<br />
|||--diseases_edges_big.csv<br />
||<br />
|+--normal_pages<br />
|||--normal_pages.pkle<br />
||<br />
|+--wikispeedia_paths-and-graph<br />
|||--articles.tsv<br />
|||--links.tsv<br />
|||--categories.tsv<br />
||<br />
|+--XX_century<br />
|||--edges_20c.csv<br />
<br />
The format for the different edges file (diseases_edges.csv, diseases_edges_big, edges_20c) is "p1.id"	"rel"	"p2.id"<br />
with p1.id is link source page id, rel is the relation (LINKS_TO or BELONGS_TO) and p2.id is link target page id.<br />
<br />
The format for normal_pages.pkle is index=id, columns=[article,isRedirect,isNew]. In .ipynb files there is also the code to import it from csv files.<br />
<br />
The format for articles.tsv is "article_name"<br />
The format for links.tsv is "linkSource" "linkTarget"<br />
The format for categories is "article_name" "category"<br />
<br />
The code takes about ten minutes to run depending on your internet connection <br />
