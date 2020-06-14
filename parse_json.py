

import json 
  
# Opening JSON file 
f = open('resumes/yenatfanta_cv-extracted.json', 'r') 
  
# returns JSON object as  
# a dictionary 
data = json.load(f) 
  
# Iterating through the json 
# list 
print(data['name'])

  
# Closing file 
f.close() 


