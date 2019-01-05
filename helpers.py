import datetime
import requests
import wikipedia
import numpy as np
import pandas as pd
import networkx as nx
import json
import random
from dateutil.relativedelta import *
from calendar import monthrange
from datetime import timedelta
import matplotlib.pyplot as plt
import pickle
from fa2 import ForceAtlas2
import urllib

def getArticleName(article,language):
	if len(language) != 2 or type(language) != str:
		raise ValueError('Language code must be 2 letters')

	article_parsed = urllib.parse.quote(article).replace('%5C','') #Remove \ char
	path ="https://en.wikipedia.org/w/api.php?action=query&titles="+article_parsed+"&prop=langlinks&format=json&lllang="+language
	r = requests.get(path)
	j = r.json()
	new_name = ""
	for _,index in j['query']['pages'].items():
		if 'langlinks' in index:
			new_name = index['langlinks'][0]['*']
			new_name = new_name.replace(' ','_')
			new_name = urllib.parse.quote(new_name)
	return new_name        

def getUserActivity(article, granularity, start, end, project ="en.wikipedia.org",
                    access="all-access", agent="user",dateformat="iso"):
    """
    Method to obtain user activity of a given page for a given period of time
    article: name of the wikiipedia article
    granularity: time granularity of activity, either 'monthly' or 'daily'
    start: start date of the research as Datetime.datetime object
    end: end date of the research as Datetime.datetime object
    project: If you want to filter by project, use the domain of any Wikimedia project (by default en.wikipedia.org)
    access: If you want to filter by access method, use one of desktop, mobile-app or mobile-web (by default all-access)
    agent: If you want to filter by agent type, use one of user, bot or spider (by default user).
    dateformat: the dateformat used in result array, can be 'iso','ordinal','datetime'.
    return:
        it return an array of array of the form [ [user_activity_value1, date1], [user_activity_value2, date2]]
    """

    #granularity['monthly','daily']
    #format['iso','ordinal','datetime']
    #Be carefull, for daily granularity left bound date is included, for monthly granularity left bound date is excluded

    dstart = start.strftime("%Y%m%d")
    dend = end.strftime("%Y%m%d")
    path = ("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"+project
            +"/"+access+"/"+agent+"/"+article+"/"+granularity+"/"+dstart+"/"+dend)
    r = requests.get(path)
    res = []
    if 'items' not in r.json():
        return res
    for i in range(len(r.json()['items'])):
        time_label = None
        if granularity == 'daily':
            time_label = (start + datetime.timedelta(days=i))
        else:
            time_label = (start + relativedelta(months=+i))
        if dateformat == 'iso':
            time_label = time_label.isoformat()
        elif dateformat == 'ordinal':
            time_label = time_label.toordinal()

        res.append([r.json()['items'][i]['views'],time_label])
    return res


def filterCategories(categories, top = 1):
    """
    Method to filter categories dataframe based on a certain number of top categories
    arguments:
        categories: The categorie dataframe ith columns ['article','category']
        top: The number of top categories we want to filter by
    return:
        article_filtered: articles with category part of top category
    """

    #Cast category so for example "subject.Science.Biology.Birds" become "subject.Science"
    top_cat = categories.set_index('article')['category'].apply(lambda x: x[0:x.find(".",x.find(".")+1)])
    top_cat_to_filter = top_cat.value_counts().head(top).keys().tolist()

    top_cat = top_cat.to_frame()

    articles_filtered = top_cat.loc[top_cat['category'].isin(top_cat_to_filter)]
    articles_filtered = articles_filtered.sort_values(['category']) #To have same order after groupby
    articles_filtered = articles_filtered.groupby('article')['category'].agg(lambda col: ','.join(col)).to_frame()

    return articles_filtered

def filterScienceCategory(categories,sub_cat=1):
	"""
	Function that keep only articles that are in Science and create a dataframe with the number of subcategories.
	categories: the dataframe to be filtered
	sub_cat: the number of sub categories to keep after subject.Science
	"""
	categories_filtered = categories.loc[categories['category'].str.contains('subject.Science')]
	categories_filtered = categories_filtered.set_index('article')['category'].apply(lambda x: txt_from_ith_to_jth(x,'.',1,sub_cat+2)).to_frame()
	categories_filtered = categories_filtered.reset_index().drop_duplicates(subset='article',keep='first')
	return categories_filtered
	"""
	We drop duplicates, code to see which articles that had multiple categories
	df = categories_filtered.reset_index()
	mask = df.article.duplicated(keep=False)
	df[mask]
	"""
	
def iterative_filter(nodes,edges):
	"""Filter nodes and edges so that in result, every node has at least one edge in edge result 
	and every edge links two nodes that are in node result.
	params:
	Dataframe nodes with column 'article' that represent article name
	Dataframe edges with column 'linkSource' that represent article name that is the source of the edge, 
								'linkTarget' that represent article name that is the destination of the edge
	return:
	res_nodes: Dataframe with filtered articles
	res_edges: Dataframe with filtered links
	"""
	res_nodes = nodes.copy()
	res_edges = edges.copy()
	
	old_size_node = len(nodes)
	old_size_edge = len(edges)
	new_size_node = 0
	new_size_edge = 0
	
	while (new_size_node != old_size_node) or (new_size_edge != old_size_edge):
		old_size_node = len(res_nodes)
		old_size_edge = len(res_edges)
		
		list_article = res_nodes['article'].tolist()
		res_edges = res_edges.loc[res_edges['linkSource'].isin(list_article) & res_edges['linkTarget'].isin(list_article)]
		new_size_edge = len(res_edges)
		list_article = list(res_edges.linkSource.unique()) + list(res_edges.linkTarget.unique())
		res_nodes = res_nodes.loc[res_nodes['article'].isin(list_article) & res_nodes['article'].isin(list_article)]
		new_size_node = len(res_nodes)
	
	return res_nodes,res_edges
	
def createGraph(nodes, edges):
    """
    Method to create a networkx directed graph from articles node already filtered in categories_filtered
    articles: the wikipedia articles in dataframe ['article']

    nodes: wikipedia articles with their category ['article','categories_filtered'] where 'article' is the index
    categories_filtered have to contain only the node with category you want to appear on the graph.

    edges: the hyperlinks between wikipedia articles in form ['linkSource', 'linkTarget']

    return newly created networkx.DiGraph
    """

    #Create graph with networkx
    tup = [tuple(x) for x in edges.values]
    G = nx.DiGraph()
    for index, row in nodes.iterrows():
        G.add_node(row['article'])

    G.add_edges_from(tup)
    return G


def create_df_activity(user_activity_dict):
	"""Method that create a dataframe from a dict of user activity"""
	#Create empty dataframe with good columns
	start = True
	dates = []
	indexes = []
	for k,v in user_activity_dict.items():
		if start:
			for activity, date in v:
				dates.append(date)
			start = False
		indexes.append(k)
	
	user_activity_df = pd.DataFrame(columns=dates,index=indexes)
	
	#fill dataframe with rows
	for k,v in user_activity_dict.items():
		for activity,date in v:        
			user_activity_df.loc[k][date] = activity
			
	return user_activity_df
	
def txt_from_ith_to_jth(txt,char,i,j):
    splited = txt.split(char)
    if j > len(splited):
        return
    res = ''
    return '.'.join(splited[i:j])

	
def addUniNoise():
	"""Function to give width to W lines"""
	return random.random()/10 -0.05
	
def w_stye_coordinate():
	"""Function to Generate (x,y) coordinate to generate initial w letter"""
	x = random.random()
	y = 0
	if x < 0.3:
		y = -(x/0.3)+1
	elif x>= 0.3 and x <0.5:
		y = 2.6*x - 0.8
	elif  x>= 0.5 and x < 0.7:
		y = -2.36*x+1.6
	elif x>=0.7:
		y = (x/0.29)-2.44
	x += addUniNoise()
	return x,-y
	
def normalize_activity(activity_df, factor, byColumn):
	"""Function to normalize user activity,
		activity_df: the dataframe to be normalized.
		factor: multiplying factor after normalization.
		byColumn: normalization globally or by column."""
	normalized_df = activity_df.copy()
	if byColumn:
		normalized_df = (normalized_df-normalized_df.min())/(normalized_df.max()-normalized_df.min())*factor
	else:
		normalized_df = (normalized_df-normalized_df.min().min())/(normalized_df.max().max()-normalized_df.min().min())*factor
		
	return normalized_df

	
def save_graph_json(path,graph_data):
	with open(path, 'w') as outfile:
		json.dump(graph_data, outfile)

	
def save_pkle(activity,nodes,edges):
	activity.to_pickle("activity.pkle")
	nodes.to_pickle("nodes.pkle")
	edges.to_pickle("edges.pkle")


def load_pkle():
	activity = pd.read_pickle("activity.pkle")
	nodes = pd.read_pickle("nodes.pkle")
	edges = pd.read_pickle("edges.pkle")
	return activity,nodes,edges

def create_color(nodes,cmap_palette='Dark2'):
	"""Create a color dictionnary giving a color to each node category
		nodes: the nodes that have a category.
		cmap_palette: the cmap to be use from matplotlib library
        return:
        color_dict: a dict that map categories to a color in string format (ex:'rgb(0,0,122)')
        """

	buckets = nodes.category.value_counts()
	cmap=plt.cm.get_cmap(cmap_palette)
	cmaplist = [(int(cmap(i)[0]*255),int(cmap(i)[1]*255),int(cmap(i)[2]*255),cmap(i)[3]) for i in range(cmap.N)]
	color_dict = {}
	for i in range(len(buckets)):
		color_dict[buckets.keys()[i]] = (int(cmap(i)[0]*255),int(cmap(i)[1]*255),int(cmap(i)[2]*255),cmap(i)[3])
		
	return color_dict
	
def layout(G, algorithm, fa=None):
	"""Function that apply a layout on graph and return the new positions of nodes
		G: the networkx graph.
		algorithm: kamada_kawai or ForceAtlas2"""
	
	positions = {}
	if algorithm == 'kamada_kawai':
		positions = nx.kamada_kawai_layout(G)

	elif algorithm == 'ForceAtlas2' and fa != None:
		"""
        Example for fa argument
        forceatlas2 = ForceAtlas2(
                          # Behavior alternatives
                          outboundAttractionDistribution=False,  # Dissuade hubs
                          # Performance
                          jitterTolerance=1.0,  # Tolerance
                          barnesHutOptimize=False,
                          barnesHutTheta=1.2,
                          # Tuning
                          scalingRatio=5.0,
                          strongGravityMode=False,
                          gravity=50.0,
                          # Log
                          verbose=False)"""
		positions = fa.forceatlas2_networkx_layout(G, pos=None, iterations=2000)
	return positions

def monthdelta(d1, d2):
    delta = 0
    while True:
        mdays = monthrange(d1.year, d1.month)[1]
        d1 += timedelta(days=mdays)
        if d1 <= d2:
            delta += 1
        else:
            break
    return delta
	
def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + datetime.timedelta(n)