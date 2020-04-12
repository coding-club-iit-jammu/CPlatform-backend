import csv, json, sys

if sys.argv[1] is not None and sys.argv[2] is not None:
    fileInput = sys.argv[1]
    fileOutput = sys.argv[2]
    inputFile = open(fileInput) 
    outputFile = open(fileOutput, 'w+') 
    data = eval(inputFile.read()) 
    print(data)
    print(data.keys())
    