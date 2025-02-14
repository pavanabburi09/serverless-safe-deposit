#importing all the required modules 
import json
import google.cloud
from google.cloud import storage

#Initializing storage client object
storage_client = storage.Client()

#Main driver function to create a folder with name same as that of bucket number
def hello_world(request):

  #convert the http request body to json for parsing
  body = request.get_json()

  #enabling CORS headers to return the headers to the request
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

  #store all the required details from the request  
  folder_name = body['boxID']
  bucket_name = 'box1test1'

  #get bucket name
  bucket = storage_client.get_bucket(bucket_name)

  #set the folder name
  blob = bucket.blob(folder_name+'/')

  #upload the same as a folder
  blob.upload_from_string('', content_type='application/x-www-form-urlencoded;charset=UTF-8')

  #return success message once folder is created
  return json.dumps({'body' : 'success'}), 200, headers
