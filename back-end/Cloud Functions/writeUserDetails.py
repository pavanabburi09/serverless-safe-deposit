#Importing required modules
import google.cloud
import json
from google.cloud import firestore

#Initializing firestore client object
db = firestore.Client()

#Main driver function which will get the registration details from the front end and store it in firestore database
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

    #Store all the details
    answer = body['securityAnswer']
    username = body['email']
    question = body['securityQuestion']

    #Store details in a document
    doc_ref = db.collection("users").document(username)
    doc_ref.set(body)

    res = {"body": {"operation":"success"}}

    #return success message once the insertion into firestore db is done
    return json.dumps({'body' : 'success'}), 200, headers
