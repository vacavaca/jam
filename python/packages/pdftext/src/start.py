import os
import re
import time
from multiprocessing import Pool
from pdftext.extraction import plain_text_output

def decode_pdf(input_path, output_path):
    text = plain_text_output(input_path, sort=False, hyphens=False)
    with open(output_path, "w+") as f:
        f.write(text)

def process_file(cfg):
    (input_path, output_pdf_path, output_txt_path, error_path) = cfg

    for i in range(4):
        try:
            decode_pdf(input_path, output_txt_path)
            print('file processed "%s"' % output_txt_path)
            os.rename(input_path, output_pdf_path)
            return
        except Exception as err:
            if i == 3:
                print('failed to process "%s", moving file to error path' % input_path, err)
                os.rename(input_path, error_path)
                return
            print('error with "%s", retrying...' % input_path, err)


dirs = [
    (os.environ['INPUT_CV_PDF_DIR'], os.environ['OUTPUT_CV_PDF_DIR'], os.environ['OUTPUT_CV_TXT_DIR']),
    (os.environ['INPUT_JD_PDF_DIR'], os.environ['OUTPUT_JD_PDF_DIR'], os.environ['OUTPUT_JD_TXT_DIR'])
#     ('../../data/input_cv_pdf', '../../data/output_cv_pdf', '../../data/input_cv_txt')
]


error_dir = os.environ['ERROR_DIR']
# error_dir = '../../data/error_pdf'

regex = r"^(\d+)\.pdf$"

def get_file_id(filename):
    matches = re.search(regex, filename)
    if not matches:
        return None

    return int(matches.groups()[0])


if __name__ == "__main__":
    while True:
        files_to_process = []

        # print('scanning directories')

        for dir_cfg in dirs:
            (input_dir, output_pdf_dir, output_txt_dir) = dir_cfg
            files = os.listdir(input_dir) 

            for file in files:
                file_id = get_file_id(file)
                if id is None:
                    continue
                input_path = os.path.join(input_dir, file)
                error_path = os.path.join(error_dir, "convert-failed-%d.pdf" % file_id)
                output_pdf_path = os.path.join(output_pdf_dir, "%d.pdf" % file_id)
                output_txt_path = os.path.join(output_txt_dir, "%d.txt" % file_id)
                files_to_process += [(input_path, output_pdf_path, output_txt_path, error_path)]

        started_at = time.time()

        if len(files_to_process) > 0:
            print('processing %d files' % len(files_to_process))
            with Pool(2) as p:
                p.map(process_file, files_to_process)
        else:
            # print('no new files to process')
            pass

        till = started_at + 0.3
        delta = till - time.time()
        if delta > 0:
            # print('waiting %.2fs' % delta)
            time.sleep(delta)
