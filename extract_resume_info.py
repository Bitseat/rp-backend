# importing all required libraries
import os
import traceback

# importing libraries for computer vision
import numpy as np
import cv2 
import imutils
from imutils import contours
from imutils.perspective import four_point_transform
from skimage.filters import threshold_local

# importing libraries to read text from image
from PIL import Image
import pytesseract

import re
import json

from pyresparser import ResumeParser
import image_text_extractor
from image_text_extractor import image_extract

def main():
    # import resumes from directory
    directory = 'resumes/'
    for filename in os.listdir(directory):

        if filename.endswith(".jpg"):
            full_path = os.path.join(directory, filename)
            x = image_extract()
            extract_info(x)

        elif (filename.endswith(".pdf")) or (filename.endswith(".docx")):
            full_path = os.path.join(directory, filename)
            extract_info(full_path)
        
        else:
            pass


def extract_info(full_path):

    file_dir = os.getcwd()
    data = {}
    with open(full_path, 'r') as f:
        data = ResumeParser(full_path).get_extracted_data()

        json_file_name = str(full_path) + ".json"
        clean_data = re.sub('\u2013', '', str(data))
        clean_data = re.sub('\uf0b7', '', clean_data)
        clean_data = re.sub(r'\\uf0b7', '', clean_data)
        clean_data = re.sub(r'[^\x00-\x7F]+|\x0c',' ', clean_data)
        clean_data = re.sub(r"'", '"', clean_data)
        clean_data = re.sub(r'None', 'null', clean_data)
        
        clean_data = json.loads(clean_data.replace("\'", '"'))
        with open(json_file_name, 'w') as outfile:
            json.dump(clean_data, outfile)
    #to remove the already processed docx and pdf files
    #os.remove(full_path)



if __name__ == '__main__':
    main()







