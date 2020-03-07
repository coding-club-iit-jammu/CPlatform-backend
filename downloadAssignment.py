import os.path
import urllib.request

folderName = input("Enter folder name: ")
links = open('links.txt', 'r')
for link in links:
    name,url = link.split(" ")
    print('Downloading: ' + name)
    try:
        urllib.request.urlretrieve(link, folderName+"/"+a)
    except Exception as inst:
        print(inst)
        print('  Encountered unknown error. Continuing.')