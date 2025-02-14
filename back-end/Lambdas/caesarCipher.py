import json

def cipher_encrypt(text, key):

    encrypted = ""
    

    for character in text:

        if character.isupper(): #check if it's an uppercase character

            character_index = ord(character) - ord('A')

            # shift the current character by key positions
            character_shifted = (character_index + key) % 26 + ord('A')

            character_new = chr(character_shifted)

            encrypted += character_new

        elif character.islower(): #check if its a lowecase character

            # subtract the unicode of 'a' to get index in [0-25) range
            character_index = ord(character) - ord('a') 

            character_shifted = (character_index + key) % 26 + ord('a')

            character_new = chr(character_shifted)

            encrypted += character_new

        elif character.isdigit():

            # if it's a number,shift its actual value 
            character_new = (int(character) + key) % 10

            encrypted += str(character_new)

        else:

            # if its neither alphabetical nor a number, just leave it like that
            encrypted += character

    return encrypted
    
def cipher_decrypt(ciphertext, key):

    decrypted = ""

    for character in ciphertext:

        if character.isupper(): 

            character_index = ord(character) - ord('A')

            # shift the current character to left by key positions to get its original position
            characterOriginalPosition = (character_index - key) % 26 + ord('A')

            characterOriginal = chr(characterOriginalPosition)

            decrypted += characterOriginal

        elif character.islower(): 

            c_index = ord(character) - ord('a') 

            characterOriginalPosition = (c_index - key) % 26 + ord('a')

            characterOriginal = chr(characterOriginalPosition)

            decrypted += characterOriginal

        elif character.isdigit():

            # if it's a number,shift its actual value 
            characterOriginal = (int(character) - key) % 10

            decrypted += str(characterOriginal)

        else:

            # if its neither alphabetical nor a number, just leave it like that
            decrypted += character

    return decrypted


def lambda_handler(event, context):
    print(event)
    message = json.loads(event['body'])
    answer = message['securityAnswer']
    typeOfMessage = message['type']
    key = message['shiftKey']
    encrypt = 'encrypt'
    decrypt = 'decrypt'
    if typeOfMessage == encrypt:
        c = cipher_encrypt(answer, int(key))
    else:
        c = cipher_decrypt(answer, int(key))
    
    res = {'answer' : c }
    
    return {'body': json.dumps(res), 'headers': { "Access-Control-Allow-Origin": "*" } }
