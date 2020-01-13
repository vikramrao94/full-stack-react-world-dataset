import psycopg2

from flask import Flask,request,json
from graphene import ObjectType, String, Int, Schema, Mutation
from flask_graphql import GraphQLView
from flask_cors import CORS, cross_origin


DATABASE = "postgres"
USER =  "postgres"
PASSWORD = "pass123"
HOST = "127.0.0.1"
PORT = "5432"

app = Flask(__name__)
CORS(app)

conn = psycopg2.connect(database = DATABASE, user = USER, password = PASSWORD, host = HOST, port = PORT)
print ("Opened database successfully")
##############DATABASE QUERIES###########################
def get_continents():
    curr = conn.cursor()
    curr.execute('''
    SELECT continent FROM public.country GROUP BY continent;
    ''')
    data = curr.fetchall()
    result = []
    for d in data:
        result.append({
        "name":d[0]
        })
    return result;

def get_regions(query):
    curr = conn.cursor()
    curr.execute('''
    SELECT region FROM public.country WHERE continent = %(continent)s GROUP BY region LIMIT %(limit)s OFFSET %(offset)s;
    ''', {
    'continent':query['continent'],
    'limit':str(query['limit']),
    'offset':str(query['limit'] * query['offset'])
    })
    data = curr.fetchall()
    result = []
    for d in data:
        result.append({
        "name":d[0]
        })
    return result;

def get_countries(query):
    curr = conn.cursor()
    curr.execute('''
    SELECT name,code FROM public.country WHERE region = %(region)s LIMIT %(limit)s OFFSET %(offset)s;
    ''', {
    'region':query['region'],
    'limit':str(query['limit']),
    'offset':str(query['limit'] * query['offset'])
    })
    data = curr.fetchall()
    result = []
    for d in data:
        result.append({
        'name':d[0],
        'code':d[1]
        })
    return result;

def get_country_information(query):
    curr = conn.cursor()
    curr.execute('''
    SELECT * FROM public.countrylanguage WHERE countrycode = %(country)s;
    ''',{
    'country':query['code']
    })
    data = curr.fetchall()
    result = {}
    language = []
    for d in data:
        language.append({
        'code':d[0],
        'language':d[1],
        'is_official':d[2],
        'percentage':d[3]
        })
    curr.execute('''
    SELECT count.name, count.surfacearea, count.population, count.lifeexpectancy, count.gnp, count.governmentform, count.headofstate, cit.name
    FROM
    public.country count
    LEFT JOIN public.city cit
    ON count.capital = cit.id
    WHERE code = %(code)s;
    ''',{
    "code":query['code']
    })
    data = curr.fetchall()
    result = {
    "country":data[0][0],
    "surfacearea":data[0][1],
    "population":data[0][2],
    "lifeexpectancy":data[0][3],
    "gnp":int(data[0][4]) if data[0][4] != None else data[0][4],
    "governmentform":data[0][5],
    "headofstate":data[0][6],
    "capital":data[0][7],
    "language":language
    }
    return result;

def get_cities(query):
    curr = conn.cursor()
    curr.execute('''
    SELECT * FROM public.city WHERE countrycode = %(country)s ORDER BY id ASC LIMIT %(limit)s OFFSET %(offset)s;
    ''', {
    'country':query['code'],
    'limit':str(query['limit']),
    'offset':str(query['limit'] * query['offset'])
    })
    data = curr.fetchall()
    result = []
    for d in data:
        result.append({
        'id':d[0],
        'name':d[1],
        'code':d[2],
        'district':d[3],
        'population':d[4]
        })
    return result;

def edit_city(query):
    curr = conn.cursor()
    if "code" not in query.keys():
        curr.execute('''
        UPDATE public.city SET name = %(city)s, district = %(district)s, population = %(population)s WHERE id = %(id)s;
        ''', {
        'city':query['city'],
        'district':query['district'],
        'population':query['population'],
        'id':query['id']
        })
    else:
        curr.execute('''
        SELECT MAX(id) FROM public.city
        ''')
        data = curr.fetchall()
        id = data[0][0] + 1

        curr.execute('''
        INSERT INTO public.city VALUES (%(id)s, %(city)s, %(countrycode)s, %(district)s, %(population)s);
        ''', {
        'id':id,
        'city':query['city'],
        'countrycode':query['code'],
        'district':query['district'],
        'population':query['population']
        })
    conn.commit()
    updated_rows = curr.rowcount
    if updated_rows == 1:
        return True;
    else:
        return False;

def delete_city(query):
    curr = conn.cursor()
    # Check if city to be deleted is not capital
    curr.execute('''
    SELECT COUNT(1)
    FROM public.country
    WHERE capital = %(id)s;
    ''',{
    "id":query["id"]
    })
    data = curr.fetchall()
    if data[0][0] == 1:
        curr.execute('''
        UPDATE public.country
        SET capital = NULL
        WHERE capital = %(id)s;
        ''',{
        "id":query["id"]
        })
        conn.commit()

    curr.execute('''
    DELETE FROM public.city WHERE id = %(id)s;
    ''',{
    "id":query["id"]
    })
    conn.commit()
    updated_rows = curr.rowcount
    if updated_rows == 1:
        return True;
    else:
        return False;

#################GraphQL Query########################################
class Query(ObjectType):
    continents = String()

    regions = String(
        continent = String(),
        limit = Int(),
        offset = Int()
    )

    countries = String(
        region = String(),
        limit = Int(),
        offset = Int()
    )

    cities = String(
        code = String(),
        limit = Int(),
        offset = Int()
    )

    countryInfo = String(
        code = String()
    )

    def resolve_continents(root, info):
        return json.dumps(get_continents());

    def resolve_regions(root, info, continent, limit, offset):
        query = {
        'continent':continent,
        'limit':limit,
        'offset':offset
        }
        return json.dumps(get_regions(query));

    def resolve_countries(root, info, region, limit, offset):
        query = {
        'region':region,
        'limit':limit,
        'offset':offset
        }
        return json.dumps(get_countries(query));

    def resolve_cities(root, info, code, limit, offset):
        query = {
        'code':code,
        'limit':limit,
        'offset':offset
        }
        return json.dumps(get_cities(query));

    def resolve_countryInfo(root, info, code):
        query = {
        'code':code
        }
        return json.dumps(get_country_information(query));

###########GraphQL Mutation##########################################

class EditCity(Mutation):
    status = String()

    class Arguments:
        id = Int()
        city = String()
        district = String()
        population = Int()

    def mutate(self, info, id, city, district, population):
        check = edit_city({
        "id":id,
        "city":city,
        "district":district,
        "population":population
        })

        return EditCity(
        status = "ok" if check else "fail"
        )
        
class DeleteCity(Mutation):
    status = String()

    class Arguments:
        id = Int()

    def mutate(self, info, id):
        check = delete_city({
        "id":id
        })
        return DeleteCity(
        status = "ok" if check else "fail"
        )

class AddCity(Mutation):
    status = String()

    class Arguments:
        code = String()
        city = String()
        district = String()
        population = Int()

    def mutate(self, info, city, district, population, code):
        check = edit_city({
        "city":city,
        "district":district,
        "population":population,
        "code":code
        })

        return AddCity(
        status = "ok" if check else "fail"
        )

class Mutation(ObjectType):
    edit_city = EditCity.Field()
    add_city = AddCity.Field()
    delete_city = DeleteCity.Field()

###################################################################
schema = Schema(query = Query, mutation = Mutation)


app.add_url_rule('/', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

if __name__ == '__main__':
     app.run(debug=True)
