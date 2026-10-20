import string
import sys
import threading

sys.setrecursionlimit(200000) # for more layers of recursion

def parse_word(reader, word_collection, stop_words):
    list_chars = []
    while True:
        char = reader.read(1)
        if char == "": # EOF
            # process last  word if exist\
            if list_chars:
                w = "".join(list_chars)
                if w not in stop_words:
                    word_collection.append(w)
            return word_collection
        elif char.isalpha():
            # char is a valid char
            list_chars.append(char.lower())
        else:
            if list_chars:
                # char is not a valid char
                #   means end of word
                w = "".join(list_chars)
                if w not in stop_words:
                    # word is valid
                    word_collection.append(w)
                # recurse for the rest of the stream
                parse_word(reader, word_collection, stop_words)
            
def main():
    stop_words = set(
        open("../stop_words.txt").read().split(",") + list(string.ascii_lowercase)  # https://docs.python.org/3/library/string.html
    )

    result = [] # for receiving results of a worker thread
    error = [] # for receiving errors of a worker thread

    def run_parse():
        try:
            with open(sys.argv[1], encoding="utf-8") as reader:
                result.append(parse_word(reader, [], stop_words))
        except Exception as e:
            error.append(e)
    
    def print_result(wordsList):
        # count unique words. O(nm) where m is the number of words, worst case is n^2
        unique_words = list(set(wordsList)) 
        unique_words.sort(key=lambda x: wordsList.count(x), reverse=True)
        print("\n".join("%s - %s" % (x, wordsList.count(x)) for x in unique_words[:25]))


    threading.stack_size(16 * 1024 * 1024) # 16MB stack size
    t = threading.Thread(target=run_parse)
    t.start() # start the worker thread
    t.join() # wait for the worker thread to finish
    if error: # error output
        raise error[0]

    for r in result:
        print_result(r)

if __name__ == "__main__":
    main()
