#Importing required modules
import json
from google.cloud import firestore

#Initializing firestore client object
db = firestore.Client()

#Main driver function which will get the encrypted security answer stored in firestore database
def hello_world(request):

    #convert the http request body to json for parsing
    body = request.get_json()

    #enabling CORS headers to return the headers to the requst
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }

    #take the username from the request
    username = body['email']

    #get the document of that username
    doc_ref = db.collection("users").document(username)
    doc = doc_ref.get()

    #if document exists, return with success, else return bad request
    if doc.exists:
        print(doc.to_dict())
        return json.dumps({'body' : doc.to_dict()['securityAnswer']}), 200, headers
    else:
        return json.dumps({'body' : 'failed'}), 400, headers

    
