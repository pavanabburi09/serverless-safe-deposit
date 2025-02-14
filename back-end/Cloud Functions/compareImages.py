#Importing all the modules required
from google.cloud import vision
from google.cloud import storage

#Initializing storage client object
storage_client = storage.Client()
path = 'gs://box1test1/'

#Main driver function which will handle the Machine Learning module of the project
def hello_world(request):
    print(request.method)

    #Specifying the bucket name
    bucketName = 'box1test1'
    body = str(request)

    #Get the box number from the request
    boxNumber = body.split("?")[1].split("=")[1].split("'")[0]
    pre = boxNumber + "/"
    print(boxNumber)

    #Check if number of files in that folder of bucket is minimum 2, else return bad request
    if checkNumberOfFiles(bucketName, pre):
        return getLatestItems(bucketName, pre)
    else:
        print('Insufficient images')
        return {
            "body": "failed",
            "statusCode": 400
        }


#Helper function to check number of files in that folder of bucket to check if there are minimum 2 files/images
def checkNumberOfFiles(bucketName, pre):
    count = 0;

    #List all the files in the bucket with the folder mentioned as prefix
    blobs = storage_client.list_blobs(bucketName, prefix=pre)
    for blob in blobs:
        print(blob.name)
        count = count + 1
    if count >= 2:
        print(count)
        print('printing true')
        return True
    else:
        print(count)
        print('printing false')
        return False


#Helper function to get the last and second last items in folder of the bucket
def getLatestItems(bucketName, pre):

    #List all files in the folder of the bucket
    blobs = [(blob, blob.updated) for blob in storage_client.list_blobs(bucketName, prefix=pre)]

    #Select the last file in that folder
    latest = sorted(blobs, key=lambda tup: tup[1])[-1][0]
    print(latest.name)

    #Set the URI path of the last file/image
    first_uri = path + latest.name
    print(first_uri)

    #Get the labels and store in a dictionary
    dic1 = detect_labels_uri(first_uri)

    #Select the second last file in that folder
    second_latest = sorted(blobs, key=lambda tup: tup[1])[-2][0]
    print(second_latest.name)

    #Set the URI path of the second last file/image
    second_uri = path + second_latest.name

    #Get the labels and store in a dictionary
    dic2 = detect_labels_uri(second_uri)
    print(second_uri)

    #Get the keys of both dictionaries and get the common keys
    d1_keys = set(dic1.keys())
    d2_keys = set(dic2.keys())
    shared_keys = d1_keys.intersection(d2_keys)

    #if files have similar labels more than 4 then return success else return bad request
    if len(shared_keys) > 4:
        print('Image success')
        return {
        "body": "success",
        "statusCode": 200
        }

    else:
        print('Image failed')
        return {
        "body": "failed",
        "statusCode": 400
        }

#Helper function to get the labels of an image using VISION API which has score more than 50%
def detect_labels_uri(uri):
    client = vision.ImageAnnotatorClient()
    image = vision.Image()
    image.source.image_uri = uri

    response = client.label_detection(image=image)
    labels = response.label_annotations
    dic = {}

    for label in labels:
        if label.score > 0.5:
            dic[label.description] = label.score
    return dic
